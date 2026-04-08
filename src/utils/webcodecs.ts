/* eslint-disable */

import type { VideoSource } from "@/class/VideoTrack";
import { baseFps } from "@/data/trackConfig";
import { MP4Clip, decodeImg, AudioClip } from "@webav/av-cliper";
import { file, write } from "opfs-tools";
import { UnitFrame2μs } from '@/data/trackConfig';

// 定义通用接口
interface IClip {
  ready: Promise<void>;
  tick(time: number): Promise<{ video: VideoFrame }>;
  split(time: number): Promise<[IClip, IClip]>;
  thumbnails(count: number, opts?: { step: number }): Promise<{ img: Blob; ts: number }[]>;
}

/**
 * 自定义 WebMClip 类
 * 使用浏览器的 video 标签进行解码，模拟 MP4Clip 的接口
 */
class WebMClip implements IClip {
  #video: HTMLVideoElement;
  #blob: Blob | null = null;
  #meta = { duration: 0, width: 0, height: 0 };
  ready: Promise<void>;
  
  // 裁剪属性
  #offset: number = 0; // 起始时间偏移 (μs)
  #duration: number = 0; // 当前片段长度 (μs)

  constructor(source: ReadableStream<Uint8Array> | Blob, opts?: { offset: number, duration: number, blob?: Blob }) {
    this.#video = document.createElement('video');
    this.#video.muted = true;
    this.#video.playsInline = true;
    this.#video.crossOrigin = 'anonymous'; 

    this.#offset = opts?.offset ?? 0;
    
    // 如果是克隆出来的实例，直接复用 blob
    if (opts?.blob) {
      this.#blob = opts.blob;
    }

    this.ready = (async () => {
      // 1. 获取 Blob
      if (!this.#blob) {
        if (source instanceof ReadableStream) {
          this.#blob = await new Response(source).blob();
        } else {
          this.#blob = source;
        }
      }

      // 2. 加载 Video
      this.#video.src = URL.createObjectURL(this.#blob);
      
      await new Promise<void>((resolve, reject) => {
        this.#video.onloadedmetadata = () => {
          this.#meta = {
            duration: this.#video.duration * 1e6, // s to μs
            width: this.#video.videoWidth,
            height: this.#video.videoHeight
          };
          // 如果没有指定时长，则使用视频元数据时长
          this.#duration = opts?.duration ?? this.#meta.duration;
          resolve();
        };
        this.#video.onerror = () => reject(new Error("WebM load failed"));
      });
    })();
  }

  async tick(time: number): Promise<{ video: VideoFrame }> {
    // time 是相对于此 Clip 片段的时间 (0 ~ duration)
    // 实际 Video 绝对时间 = (offset + time) / 1e6
    const targetTime = (this.#offset + time) / 1e6;
    
    this.#video.currentTime = targetTime;
    
    await new Promise((resolve) => {
      // 如果已经就在当前帧附近，可能不触发 seeked，这里简化处理，认为 seek 必须触发
      const onSeek = () => {
        this.#video.removeEventListener('seeked', onSeek);
        resolve(null);
      };
      this.#video.addEventListener('seeked', onSeek, { once: true });
    });

    // 创建 VideoFrame (注意：需要管理 VideoFrame 的生命周期，外部使用完需 close)
    return { video: new VideoFrame(this.#video) };
  }

  async split(time: number): Promise<[WebMClip, WebMClip]> {
    if (!this.#blob) throw new Error("Blob restricted");
    
    // 左片段：Offset不变，Duration变为切分点 time
    const left = new WebMClip(this.#blob, { 
      offset: this.#offset, 
      duration: time,
      blob: this.#blob 
    });
    
    // 右片段：Offset增加 time，Duration 减少 time
    const right = new WebMClip(this.#blob, { 
      offset: this.#offset + time, 
      duration: this.#duration - time,
      blob: this.#blob
    });

    await Promise.all([left.ready, right.ready]);
    return [left, right];
  }

  async thumbnails(count: number, opts?: { step: number }) {
    if (!opts) throw new Error("Step option required for thumbnails");
    const result: { img: Blob; ts: number }[] = [];
    const step = opts.step;
    
    // 简单的缩略图生成逻辑
    const canvas = document.createElement('canvas');
    canvas.width = 100; // 缩略图宽度
    canvas.height = 100 * (this.#meta.height / this.#meta.width);
    const ctx = canvas.getContext('2d');

    for (let i = 0; i < count; i++) {
        const time = i * step;
        if (time > this.#duration) break;
        
        this.#video.currentTime = (this.#offset + time) / 1e6;
        await new Promise(r => this.#video.addEventListener('seeked', r, { once: true }));
        
        ctx?.drawImage(this.#video, 0, 0, canvas.width, canvas.height);
        
        const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg'));
        if (blob) {
            result.push({ img: blob, ts: time });
        }
    }
    return result;
  }
}

async function writeFile(id: string, stream?: ReadableStream<Uint8Array>) {
  if (!stream) {
    // 没有数据流，尝试从opfs中获取
    stream = await file(id).stream();

    if (!stream) {
      throw new Error("stream is not ready");
    }
  }

  const start = performance.now()

  // 如果opfs中没有数据则存储
  if (!(await file(id).exists())) {
    await write(id, stream);
    console.log('opfs存储文件耗时', performance.now() - start, 'ms');

    stream = await file(id).stream();

    console.log('opfs读取文件耗时', performance.now() - start, 'ms');
  }

  return stream;
}

class VideoDecoder {
  #decoderMap = new Map<string, IClip>();

  #thumbnailsMap = new Map<string, {
      img: Blob;
      ts: number;
  }[]>();

  async thumbnails(source: VideoSource) {
    if (this.#thumbnailsMap.has(source.id)) {
      return this.#thumbnailsMap.get(source.id);
    }
    let clip: IClip | undefined | null = null;
    if (this.#decoderMap.has(source.id)) {
      clip = this.#decoderMap.get(source.id);
    } else {
      const resp = await fetch(source.url)
      // 传递类型
      clip = await this.decode({ id: source.id, stream: resp.body, type: source.type });
    }

    if (!clip) {
      throw new Error("clip is not ready");
    }
    
    const thumbnails = await clip.thumbnails(50, { step: 1e6 });

    this.#thumbnailsMap.set(source.id, thumbnails);

    return thumbnails;
  }

  async decode({ id, stream, type }: { id: string, stream?: ReadableStream<Uint8Array>, type?: string }) {
    if (this.#decoderMap.has(id)) {
      return this.#decoderMap.get(id);
    }

    stream = await writeFile(id, stream);

    let videoClip: IClip;

    // 简单判断是否为 webm (通过类型或文件ID后缀)
    if (type === 'video/webm' || id.includes('.webm')) {
      videoClip = new WebMClip(stream);
    } else {
      // 默认为 MP4 (使用 av-cliper 的 MP4Clip)
      videoClip = new MP4Clip(stream);
    }

    await videoClip.ready;

    this.#decoderMap.set(id, videoClip);

    return videoClip;
  }
  
  async getFrame(id: string, frameIndex: number, url?: string) {
    let clip = this.#decoderMap.get(id);
    if (!clip && url) {
       // 如果没有缓存，重新创建（需要判断类型）
       const isWebm = url.includes('.webm');
       clip = await this.decode({ id, type: isWebm ? 'video/webm' : 'video/mp4' })
    }

    if (!clip) throw new Error("Clip not found");

    // tick根据时间获取帧，可能存在这一时间帧为空的情况，修改为在范围内寻找帧
    // 前几帧可能为空，所以限定最小时间为5/30秒
    // $time = \max(((frameIndex - 1) / baseFps \times 1e6), 5 / 30 \times 1e6)$
    let time = Math.max(((frameIndex - 1) / baseFps * 1e6), 5 / 30 * 1e6) ;
    
    const frameObj = await clip.tick(time);

    return frameObj.video;
  }
}

class ImageDecoder {
  #decoderMap = new Map<string, VideoFrame[]>();
  async decode({ id, stream, type }: { id: string, stream?: ReadableStream<Uint8Array>, type?: string }) {
    console.log("🚀 ~ ImageDecoder ~ decode ~ id:", id)

    if (this.#decoderMap.has(id)) {
      return this.#decoderMap.get(id);
    }

    stream = await writeFile(id, stream);

    if (!type) {
      throw new Error("type is not ready");
    }

    // 接收的数据可能是远程数据（URL），也可能是本地数据（file）
    // TODO: 使用OPFS解决本地数据问题
    const frames = await decodeImg(
      stream,
      type,
    );

    // 存储解析后的帧
    this.#decoderMap.set(id, frames);

    return frames;
  }
  async getFrame(type: string, url: string, frameIndex: number) {
    let frames = this.#decoderMap.get(url);
    if (!frames) {
      await this.decode({ id: url, type });
      frames = this.#decoderMap.get(url);
    }
    return frames?.[frameIndex % frames.length];
  }
}

class AudioDecoder {
  #decoderMap = new Map<string, AudioClip>();
  async decode({ id, stream, type }: { id: string, stream?: ReadableStream<Uint8Array>, type?: string }) {

    if (this.#decoderMap.has(id)) {
      return this.#decoderMap.get(id);
    }

    stream = await writeFile(id, stream);

    if (!type) {
      throw new Error("type is not ready");
    }

    const clip = new AudioClip(stream);

    if (!clip) {
      // 提示解析视频失败
      throw new Error("解析视频失败");
    }

    await clip.ready;

    this.#decoderMap.set(id, clip)

    return clip;
  }
}

// 确保 source 使用了通用接口 IClip
export const splitClip = async (source: IClip, { offsetL, offsetR, frameCount } : { offsetL: number, offsetR: number, frameCount: number }) => {
  if (offsetL === 0 && offsetR === 0) {
    return source
  }
  const start = offsetL * UnitFrame2μs
  // 使用start裁剪视频
  const clip = offsetL === 0 ? source : (await source.split(start))[1];
  const end = (frameCount - offsetR - offsetL) * UnitFrame2μs;
  return offsetR === 0 ? clip : (await clip.split(end))[0];
}

export const videoDecoder = new VideoDecoder();

export const imageDecoder = new ImageDecoder();

export const audioDecoder = new AudioDecoder();