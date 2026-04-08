export async function combineImages(files) {
  if (!files || !Array.isArray(files) || files.length === 0) {
    throw new Error('Input must be a non-empty array of File objects.');
  }

  // 加载所有图片
  const images = await Promise.all(
    files.map((file) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url); // 避免内存泄漏
          resolve(img);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error(`Failed to load image: ${file.name}`));
        };
        img.src = url;
      });
    })
  );

  // 计算最大高度和缩放后的宽度
  const maxHeight = Math.max(...images.map((img) => img.height));
  let totalWidth = 0;
  const scaledWidths = images.map((img) => {
    const scale = maxHeight / img.height;
    const scaledWidth = img.width * scale;
    totalWidth += scaledWidth;
    return scaledWidth;
  });

  // 创建canvas元素
  const canvas = document.createElement('canvas');
  canvas.width = totalWidth;
  canvas.height = maxHeight;
  const ctx = canvas.getContext('2d');

  // 绘制图片到canvas
  let currentX = 0;
  images.forEach((img, index) => {
    const scaledWidth = scaledWidths[index];
    ctx.drawImage(img, currentX, 0, scaledWidth, maxHeight);
    currentX += scaledWidth;
  });

  // 将canvas转换为Blob，然后创建File对象
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const outputFile = new File([blob], 'combined.png', { type: 'image/png' });
          resolve(outputFile);
        } else {
          reject(new Error('Failed to convert canvas to blob.'));
        }
      },
      'image/png',
      1.0 // 质量参数，1.0为最高质量
    );
  });
}

//ratio = sw / sh;
// return the rect in canvas 
export function getInterestRect(ratio, cw, ch){
    const dh = ch;
    const dw = dh * ratio;
    const dy = 0;
    const dx = (cw - dw) / 2;
    return {
        x: dx,
        y: dy,
        width: dw,
        height: dh
    };
}

// rect and interestRect are the rects in canvas
// return the rect in uniform size
export function getRectInInterestRect(interestRect, rect){
    const dx = (rect.x - interestRect.x) / interestRect.width;
    const dy = (rect.y - interestRect.y) / interestRect.height;
    const dw = rect.width / interestRect.width;
    const dh = rect.height / interestRect.height;
    return {
        x: dx,
        y: dy,
        width: dw,
        height: dh
    };
}

export function alphaMerge(imageData1, imageData2, width, height, dataType="Blob"){
  const resultCanvas = document.createElement('canvas');
  const resultCtx = resultCanvas.getContext('2d');

  resultCanvas.width = width;
  resultCanvas.height = height;

  const data1 = imageData1.data; // [R1, G1, B1, A1, ...]
  const data2 = imageData2.data; // [R2, G2, B2, A2, ...]
  const resultData = new Uint8ClampedArray(width * height * 4);

  for (let i = 0; i < data1.length; i += 4) {
    const r = data1[i];         // 图片1的 R
    const g = data1[i + 1];     // 图片1的 G
    const b = data1[i + 2];     // 图片1的 B
    const a = data2[i + 0];     // 图片2的 R

    const j = i; // 因为 resultData 也是 4 bytes per pixel
    resultData[j] = r;          // R
    resultData[j + 1] = g;      // G
    resultData[j + 2] = b;      // B
    resultData[j + 3] = a;      // A
  }

  // 创建合成后的图片数据
  const newImageData = new ImageData(resultData, width, height);
  resultCtx.putImageData(newImageData, 0, 0);

  if (dataType === 'Blob'){
    return new Promise((resolve) => {
      resultCanvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png');
    });
  }else{//'ImageData'
    return resultCtx.getImageData(0, 0, width, height);
  }
}


export function imageDataTo(imageData, dataType="DataUrl"){
  const resultCanvas = document.createElement('canvas');
  const resultCtx = resultCanvas.getContext('2d');

  resultCanvas.width = imageData.width;
  resultCanvas.height = imageData.height;

  resultCtx.putImageData(imageData, 0, 0);

  return resultCanvas.toDataURL()
}

/**
 * 获取视频首帧并返回其 Data URL
 * @param {string} videoUrl - 视频的URL，可以是网络地址或Blob URL
 * @param {Object} [options] - 可选参数
 * @param {number} [options.time=0.1] - 要截取的时间点（秒），默认 0.1 秒
 * @param {string} [options.imageFormat='image/jpeg'] - 导出的图片格式，如 'image/jpeg' 或 'image/png'
 * @param {number} [options.quality=0.92] - 图片质量（仅对 JPEG 有效，范围 0~1）
 * @returns {Promise<string>} - 返回一个 Promise，resolve 为首帧的 Data URL
 */
export function getFirstFrameDataURL(videoUrl, options = {}) {
  return new Promise((resolve, reject) => {
    const {
      time = 0.1,
      imageFormat = 'image/jpeg',
      quality = 0.92,
    } = options;

    // 创建 video 元素
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous'; // 处理可能的跨域问题，如果视频源支持CORS
    video.src = videoUrl;
    video.muted = true; // 避免自动播放策略限制
    video.playsInline = true;

    video.addEventListener('loadedmetadata', () => {
      // 设置要截取的时间点（通常是第一帧，可以是 0 或稍大于 0，如 0.1）
      video.currentTime = time;
    });

    video.addEventListener('seeked', () => {
      // 当视频定位到指定时间点后触发

      // 创建 canvas 元素
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // 将当前视频帧绘制到 canvas 上
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 转换为 Data URL
      const dataURL = canvas.toDataURL(imageFormat, quality);
      resolve(dataURL);
    });

    video.addEventListener('error', (e) => {
      reject(new Error(`视频加载失败: ${e.message}`));
    });

    // 若视频因跨域等问题无法加载 metadata，也可能触发 error
    video.addEventListener('abort', () => {
      reject(new Error('视频加载被中止'));
    });

    // 开始加载视频
    video.load();
  });
}

/**
 * 获取视频文件的基本信息，包括宽高、时长等
 * @param {File} videoFile - 用户上传的 video 类型 File 对象
 * @returns {Promise<Object>} 返回一个 Promise，resolve 时包含视频信息对象
 */
export function getVideoFileInfo(videoFile) {
  return new Promise((resolve, reject) => {
    // 1. 基础校验
    if (!videoFile) {
      reject(new Error('未提供视频文件'));
      return;
    }

    if (!videoFile.type.startsWith('video/')) {
      reject(new Error('文件不是视频类型'));
      return;
    }

    // 2. 创建视频 URL
    const videoURL = URL.createObjectURL(videoFile);

    // 3. 创建 video 元素（不插入 DOM）
    const video = document.createElement('video');
    video.src = videoURL;

    // 4. 监听元数据加载完成事件
    video.addEventListener('loadedmetadata', () => {
      // 成功获取视频的元数据：宽高、时长等
      const info = {
        fileName: videoFile.name,
        fileType: videoFile.type,
        fileSizeMB: (videoFile.size / (1024 * 1024)).toFixed(2), // MB
        width: video.videoWidth,   // 视频宽度（像素）
        height: video.videoHeight, // 视频高度（像素）
        duration: video.duration,  // 时长（秒）
      };

      // 释放 URL 对象（可选，但建议）
      // URL.revokeObjectURL(videoURL);

      resolve(info);
    });

    // 5. 监听错误事件
    video.addEventListener('error', () => {
      URL.revokeObjectURL(videoURL); // 出错时也释放资源
      reject(new Error('视频加载失败，可能文件损坏或格式不支持'));
    });

    // 可选：设置超时避免一直等待（比如某些损坏文件不会触发 error）
    setTimeout(() => {
      if (!video.videoWidth || !video.videoHeight) {
        URL.revokeObjectURL(videoURL);
        reject(new Error('视频元数据加载超时，请检查视频文件是否有效'));
      }
    }, 5000); // 5 秒超时
  });
}
/**
 * 获取音频流的基础元数据
 */
interface AudioMetadata {
  duration: number;          // 时长（秒）
  mimeType: string;         // MIME类型
  codec: string;           // 编码格式
  bitRate: number;         // 比特率（bps）
  sampleRate: number;      // 采样率（Hz）
  channels: number;        // 声道数
  container: string;       // 容器格式
  fileSize?: number;      // 文件大小（字节）
  bitDepth?: number;      // 位深度
  channelLayout?: string; // 声道布局
  tags?: AudioTags;       // 标签信息
}

interface AudioTags {
  title?: string;
  artist?: string;
  album?: string;
  year?: number;
  genre?: string;
  track?: number;
  composer?: string;
  copyright?: string;
  encoder?: string;
  [key: string]: any;
}

export async function getBasicAudioMetadata(url: string): Promise<AudioMetadata> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const metadata: Partial<AudioMetadata> = {};
    
    // 设置超时
    const timeout = setTimeout(() => {
      reject(new Error('获取元数据超时'));
    }, 30000);
    
    audio.addEventListener('loadedmetadata', async () => {
      clearTimeout(timeout);
      
      try {
        // 获取基础信息
        metadata.duration = audio.duration;
        metadata.mimeType = audio.currentSrc.includes('.mp3') ? 'audio/mpeg' : 
                           audio.currentSrc.includes('.wav') ? 'audio/wav' : 
                           audio.currentSrc.includes('.ogg') ? 'audio/ogg' : 
                           'audio/' + audio.currentSrc.split('.').pop();
        
        // 通过 fetch 获取更多信息
        const response = await fetch(url, { method: 'HEAD' });
        const headers = response.headers;
        
        if (headers.get('Content-Type')) {
          metadata.mimeType = headers.get('Content-Type')!;
        }
        
        if (headers.get('Content-Length')) {
          metadata.fileSize = parseInt(headers.get('Content-Length')!);
          
          // 估算比特率
          if (metadata.duration && metadata.duration > 0) {
            metadata.bitRate = Math.floor((metadata.fileSize! * 8) / metadata.duration);
          }
        }
        
        // 尝试解码音频以获取更多技术参数
        await getAudioTechnicalInfo(url, metadata as AudioMetadata);
        
        resolve(metadata as AudioMetadata);
      } catch (error) {
        resolve({
          duration: audio.duration,
          mimeType: metadata.mimeType || 'unknown',
          codec: 'unknown',
          bitRate: 0,
          sampleRate: 0,
          channels: 0,
          container: 'unknown'
        } as AudioMetadata);
      }
    });
    
    audio.addEventListener('error', (e) => {
      clearTimeout(timeout);
      reject(new Error(`无法加载音频: ${e.message}`));
    });
    
    audio.src = url;
  });
}