import { uniqueId } from 'lodash-es';
import type { BaseTractItem, TrackType } from './Base';
import { UnitFrame2μs } from '@/data/trackConfig';
import { audioDecoder, splitClip } from '@/utils/webcodecs';
import { OffscreenSprite } from '@webav/av-cliper';
import { getId } from '@/utils/common';
import z from 'zod';

export interface AudioSource {
  id: string,//===url
  url: string,
  name: string, // use as wasm file path
  duration: number,
  type: string,
  materialInfo: {
    materialId:number,
    iUrlId:number,
  }
}

const zodDescription = z.object({
  controller_key: z.string().describe('The controller key of the clip.'),

  start: z.number().nullable().describe('The start timestamp (in frame) of the clip in its track. For example, 10 means the clip will start showing at 10th frame (include the 10th).'),
  end: z.number().nullable().describe('The end timestamp (in frame) of the clip in its track. For example, 100 means the clip will stop showing at 100th frame (include the 100th).'),

  name: z.string().nullable().describe('The source file path of the clip in wasm FS.'),

  volume: z.number().nullable().describe('The volume of the audio clip. For example, 100 to maintain the original volume, < 100 to reduce the volume(must >= 0, 0 means silence), > 100 to increase the volume'),
  trimStart: z.number().nullable().describe('The timestamp (in frame) where start triming in the origin source.'),
}).describe("Audio clip description.")
export class AudioTrack implements BaseTractItem {
  controller_key: string;
  wasmCB:boolean;
  id: string;
  type: TrackType = 'audio';
  source: AudioSource;
  name: string;
  format: string;
  frameCount: number;
  start: number;
  end: number;
  offsetL: number;
  offsetR: number;
  volume: number;
  trimStart: number;
  materialInfo: {
    materialId:number,
    iUrlId:number,
  };

  constructor(source: AudioSource, curFrame: number) {
    this.controller_key = getId("audio_clip");
    this.wasmCB = false;
    // 设置ID
    this.id = uniqueId();
    // 设置音频信息
    this.source = source;
    // 获取文件名称
    this.name = source.name;
    // 获取文件类型
    this.format = source.format;

    // 获取音频时长，转换为frameCount
    this.frameCount = Math.ceil(source.duration * 30);
    this.start = Math.round(curFrame);
    this.end = Math.ceil(this.start + this.frameCount);

    // 设置裁剪信息
    this.offsetL = 0;
    this.offsetR = 0;

    this.volume = 100;
    this.trimStart = 0;

    this.materialInfo = source.materialInfo
  }

  zodDescribe(){
    // console.log("zodDescribe: ", this)
    const description = zodDescription.parse(this)
    // console.log("zodDescribe result: ", description)
    return description;
  }

  clone(){
    const copiedSource = {...this.source};
    const cloned = new AudioTrack(copiedSource, 0)
    //{wasmCB, controller_key, id} are inited by itself.

    // 获取文件名称
    cloned.name = this.name
    // 获取文件类型
    cloned.format = this.format
    // 设置轨道信息
    cloned.frameCount = this.frameCount
    cloned.start = this.start
    cloned.end = this.end 

    // 设置裁剪信息
    cloned.offsetL = this.offsetL 
    cloned.offsetR = this.offsetR 

    cloned.volume = this.volume
    cloned.trimStart = this.trimStart

    cloned.materialInfo = this.materialInfo

    return cloned;
  }

  syncFromObject(obj:any){
    // if (obj.id) this.id = obj.id;
    // if (obj.controller_key) this.controller_key = obj.controller_key;

    // 获取文件名称
    if (obj.name) this.name = obj.name
    // 获取文件类型
    if (obj.format) this.format = obj.format
    // 设置轨道信息
    if (obj.frameCount) this.frameCount = obj.frameCount
    if (obj.start) this.start = obj.start
    if (obj.end) this.end = obj.end 

    // 设置裁剪信息
    if (obj.offsetL) this.offsetL = obj.offsetL 
    if (obj.offsetR) this.offsetR = obj.offsetR 

    if (obj.volume) this.volume = obj.volume
    if (obj.trimStart) this.trimStart = obj.trimStart

    if (obj.materialInfo) this.materialInfo = obj.materialInfo
  }
}