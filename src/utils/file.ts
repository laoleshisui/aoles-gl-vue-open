import { controllerWasmLoader } from "./controllerWasmLoader";

/**
 * 比较文件大小，第一个参数为文件大小，为纯数字，第二个参数为目标大小，是一个数字+单位的字符串，如'1MB'
 * @param size
 * @param target
 */
export const compareSize = (size: number, target: string): boolean => {
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = sizes.findIndex(item => item === target.replace(/\d+/, ''));
  return size > parseInt(target) * k ** i;
};

// interface OSSPolicy {
//   expire: number;
//   policy: string;
//   signature: string;
//   accessid: string;
//   host: string;
//   dir: string;
// }

// let policy: OSSPolicy | undefined;

// (async() => {
//   const response = await fetch('https://zpoftcpzawaz.cloud.sealos.io');
//   policy = await response.json();
// })();

// 上传文件并获取URL
export const uploadFile = (file: File, onProgress?: (percentComplete: string) => any): Promise<string> => {
  if (!policy) {
    console.error('OSS policy is not set');
    throw new Error('OSS policy is not set');
  }
  const formData = new FormData();

  // 'key' : g_object_name,
  // 'policy': policyBase64,
  // 'OSSAccessKeyId': accessid, 
  // 'success_action_status' : '200', //让服务端返回200,不然，默认会返回204
  // 'callback' : callbackbody,
  // 'signature': signature,
  formData.append('policy', policy.policy);
  formData.append('OSSAccessKeyId', policy.accessid);
  formData.append('signature', policy.signature);
  const key = policy.dir + Date.now().toString();
  formData.append('key', key);
  formData.append('success_action_status', '200');
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    // 为请求设置headers
    xhr.open('POST', policy.host);
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(`${policy?.host}/${key}`);
      } else {
        reject(xhr);
      }
    };
    xhr.upload.onprogress = event => {
      if (event.lengthComputable) {
        const percentComplete = ((event.loaded / event.total) * 100).toFixed(0);
        onProgress && onProgress(percentComplete);
      }
    };
    xhr.onerror = () => {
      reject(xhr.statusText);
    };
    xhr.send(formData);
  });
};

interface FileUploadOptions {
  accept?: string
  multiple: boolean
  max?: string
  toWasmFS?: boolean
}

export const selectFile = (options: FileUploadOptions): Promise<File[]> => {
  return new Promise((resolve, reject) => {
    // 创建input[file]元素
    const input = document.createElement('input');
    // 设置相应属性
    input.setAttribute('type', 'file');
    input.setAttribute('accept', options.accept || "");
    if (options.multiple) {
      input.setAttribute('multiple', 'multiple');
    } else {
      input.removeAttribute('multiple');
    }
    // 绑定事件
    input.onchange = function() {
      let files = Array.from(this.files);
      // 获取文件列表
      if (files) {
        const length = files.length;
        files = files.filter(file => {
          if (options.max) {
            return !compareSize(file.size, options.max);
          } else {
            return true;
          }
        });
        if (files && files.length > 0) {
          if (length !== files.length) {
            // message.warning(`已过滤上传文件中大小大于${options.max}的文件`);
          }

          // if(options.toWasmFS){
          //   for(let i = 0; i < files.length; i++){
          //     const reader = new FileReader();
          //     reader.onload = function() {
          //       const content = new Uint8Array(reader.result);
          //       controllerWasmLoader.module["GLController"].FS.writeFile(files[i].name, content);
          //     };
          //     reader.readAsArrayBuffer(files[i]);
          //   }
          // }

          resolve(files);
        } else {
          // message.warning(`上传文件大小不能大于${options.max}`);
          reject(new Error(`上传文件大小不能大于${options.max}`));
        }
      } else {
        reject(new Error('No files selected'));
      }
    };

    input.oncancel = function() {
      reject(new Error('No files selected'));
    };
    input.click();
  });
};

export const fileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(reader.error);
    };
    reader.readAsDataURL(file);
  });
};

export const getVideoCoverUrl = (url: string) => {
  return `${url}?x-oss-process=video/snapshot,t_0,f_png,w_720,m_fast,ar_auto`;
};

// 计算文件大小
export const getFileSize = (size: number): string => {
  if (!size) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(size) / Math.log(k));
  return `${(size / k ** i).toFixed(2)} ${sizes[i]}`;
};

// 将Base64数据转换为Blob对象
export function base64ToBlob(base64Data: string, contentType: string) {
  contentType = contentType || '';
  const sliceSize = 1024;
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

// 将Blob对象转换为File对象
export function blobToFile(blob: Blob, fileName: string) {
  const file = new File([blob], fileName, { type: blob.type });
  return file;
}

// const fontList = fontJson

// // 下载贴图字体
// export function downStickerFont(layers) {
//   return Promise.all(
//     layers.map((item: any) => {
//       if (item.fontFamily && fontList.find((font) => font.name === item.fontFamily)) {
//         const font = new FontFaceObserver(item.fontFamily)
//         return font.load(null, 150000)
//       }
//       return Promise.resolve()
//     }),
//   )
// }

export async function getResourceType4Response(url: string) {
  try {
    const response = await fetch(url);
    const contentType = response.headers.get('Content-Type');
    return contentType || null; // 如果没有 Content-Type 头，返回null
  } catch (error) {
    console.error('Error fetching image type:', error);
    return null;
  }
}

// 定义异步函数加载网络文件
export async function loadNetFileToWasmFS(url, filePath, module="GLController") {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Network error: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const content = new Uint8Array(arrayBuffer);
    
    // 规范化路径（处理开头的斜杠）
    const normalizedPath = filePath.startsWith('/') ? filePath : `/${filePath}`;
    
    // 创建目录路径（如果需要）
    const pathParts = normalizedPath.split('/').slice(1); // 移除空的首元素
    const fileName = pathParts.pop(); // 取出文件名
    
    let currentDir = '';
    for (const dir of pathParts) {
      currentDir += `/${dir}`;
      try {
        // 检查目录是否存在
        controllerWasmLoader.module[module].FS.lookupPath(currentDir);
      } catch (e) {
        // 目录不存在时创建（权限755）
        controllerWasmLoader.module[module].FS.mkdir(currentDir, 0o755);
        console.log(`[OK] 创建目录: ${currentDir}`);
      }
    }

    // 写入文件
    controllerWasmLoader.module[module].FS.writeFile(normalizedPath+".writing", content);
    controllerWasmLoader.module[module].FS.rename(normalizedPath+".writing", normalizedPath);
    console.log(`[OK] 已加载文件: ${normalizedPath} (${content.length} bytes)`);
  } catch (error) {
    console.error(`[失败] 加载 ${url} 到 ${filePath}:`, error);
  }
}

// 原代码修改：支持本地文件和网络文件双模式
export async function loadFilesToWasmFS(files, module = "GLController") {
  const fileLoadPromises = Array.from(files).map(file => {
    return new Promise((resolve, reject) => {
      // 规范化路径
      const normalizedPath = file.name.startsWith('/') ? file.name : `/${file.name}`;
      const pathParts = normalizedPath.split('/').slice(1);
      const fileName = pathParts.pop();
      
      // 创建目录结构
      let currentDir = '';
      for (const dir of pathParts) {
        currentDir += `/${dir}`;
        try {
          controllerWasmLoader.module[module].FS.lookupPath(currentDir);
        } catch (e) {
          controllerWasmLoader.module[module].FS.mkdir(currentDir, 0o755);
        }
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const content = new Uint8Array(reader.result);
          controllerWasmLoader.module[module].FS.writeFile(file.name, content);
          console.log(`[OK] 已加载本地文件: ${file.name}`);
          resolve(file.name);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error(`加载文件失败: ${file.name}`));
      reader.readAsArrayBuffer(file);
    });
  });
  
  // 等待所有文件加载完成
  await Promise.all(fileLoadPromises);
  console.log('[OK] 所有文件加载完成');
  return true;
}

// 使用示例 ==============================================

// 用法1: 加载网络文件
// loadNetFileToWasmFS('https://example.com/data/config.json', 'config.json');

// // 用法2: 加载本地文件（保持原功能）
// const fileInput = document.getElementById('file-input');
// fileInput.addEventListener('change', (e) => {
//   loadFilesToWasmFS(e.target.files); // 原代码功能兼容
// });

// // 用法3: 直接传递File对象
// const file = new File(['文件内容'], 'demo.txt');
// loadFilesToWasmFS([file]);

export async function getVideoInfo(blobOrStream) {
  const video = document.createElement('video');
  
  // 处理不同来源的数据
  let objectUrl;
  if (blobOrStream instanceof MediaStream) {
    video.srcObject = blobOrStream;
  } else {
    objectUrl = URL.createObjectURL(
      blobOrStream instanceof Blob ? blobOrStream : new Blob([blobOrStream])
    );
    video.src = objectUrl;
  }
  
  return new Promise((resolve, reject) => {
    video.onloadedmetadata = () => {
      const format = getVideoFormat(video);
      resolve({
        format,
        width: video.videoWidth,
        height: video.videoHeight
      });
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    
    video.onerror = (e) => reject(`视频加载失败: ${e.target.error}`);
    
    // 触发加载
    video.load();
  });
}

// 检测视频格式的辅助函数
function getVideoFormat(video) {
  const src = video.currentSrc || video.src;
  if (src) {
    const match = src.match(/\.([a-z0-9]+)(?:[?#]|$)/i);
    return match ? match[1].toLowerCase() : 'unknown';
  }
  
  // 通过MIME类型检测
  return video.type.match(/(?:^|\/)(\w+)$/i)?.[1] || 'unknown';
}

export async function getImageInfo(blobOrArrayBuffer) {
  const blob = blobOrArrayBuffer instanceof Blob 
    ? blobOrArrayBuffer 
    : new Blob([blobOrArrayBuffer]);
  
  const img = new Image();
  const objectUrl = URL.createObjectURL(blob);
  
  return new Promise((resolve, reject) => {
    img.onload = () => {
      const format = getImageFormat(blob);
      resolve({
        format,
        width: img.naturalWidth,
        height: img.naturalHeight
      });
      URL.revokeObjectURL(objectUrl);
    };
    
    img.onerror = (e) => reject(`图片加载失败: ${e.target.error}`);
    
    img.src = objectUrl;
  });
}

// 检测图片格式的辅助函数
function getImageFormat(blob) {
  // 优先从Blob类型获取
  if (blob.type) return blob.type.split('/').pop();
  
  // 如果Blob类型未知，根据文件头判断
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const view = new DataView(e.target.result);
      let format = 'unknown';
      
      if (view.getUint32(0) === 0x89504E47) format = 'png';
      else if (view.getUint16(0) === 0xFFD8) format = 'jpg';
      else if (view.getUint32(0) === 0x47494638) format = 'gif';
      else if (view.getUint16(0, true) === 0x4949 || 
               view.getUint16(0, true) === 0x4D4D) format = 'tiff';
      else if (view.getUint32(0) === 0x57454250) format = 'webp';
      else if (view.getUint32(0) === 0x66747970) format = 'mp4'; // 可用于视频帧
      
      resolve(format);
    };
    reader.readAsArrayBuffer(blob.slice(0, 16)); // 只读取前16字节
  });
}

export async function downloadCrossOriginFile(url, fileName=null, options = {}) {
    // 可选：添加自定义请求头（需要服务器支持）
    const headers = {
        ...options.headers,
        // 默认添加必要的 CORS 头部（浏览器会自动处理）
    };

    // 处理取消请求
    const controller = new AbortController();
    const signal = controller.signal;
    if (options.cancelable) {
        window.addEventListener('beforeunload', () => controller.abort());
    }

    fetch(url, {
        method: 'GET',
        mode: 'cors',        // 强制使用 CORS 模式
        credentials: 'omit', // 根据需求设置: omit/same-origin/include
        headers: headers,
        signal: signal
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Network error: ${response.statusText}`);
        }
        return response.blob();
    })
    .then(blob => {
        // 创建可下载的临时链接
        const objectUrl = URL.createObjectURL(blob);
        
        // 创建虚拟链接并触发下载
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName || url.split('/').pop() || 'downloaded-file';
        link.style.display = 'none';
        
        // 添加到DOM
        document.body.appendChild(link);
        link.click();
        
        // 清理资源
        setTimeout(() => {
            URL.revokeObjectURL(objectUrl);
            document.body.removeChild(link);
        }, 100);
    })
    .catch(error => {
        console.error('下载失败:', error);
        if (options.onError) options.onError(error);
    });
}

/**
 * 从任意URL获取文件流并转换为File对象
 * @param {string} url 文件地址
 * @param {Object} [options] 可选配置
 * @param {string} [options.filename] 自定义文件名（默认从URL或Content-Disposition提取）
 * @param {string} [options.fileType] 自定义文件MIME类型（默认从Content-Type获取）
 * @param {function} [options.onProgress] 下载进度回调函数 (loaded, total)
 * @param {AbortSignal} [options.signal] AbortController信号（用于取消下载）
 * @returns {Promise<File>} 解析为File对象的Promise
 */
export async function getFileFromStream(url, options = {}) {
  try {
    // 验证URL格式
    if (!isValidUrl(url)) {
      throw new Error('无效的URL格式');
    }

    // 发起fetch请求
    const response = await fetch(url, {
      signal: options.signal || null,
      credentials: 'same-origin',
      mode: 'cors'
    });

    // 检查响应状态
    if (!response.ok) {
      throw new Error(`文件下载失败：${response.status} ${response.statusText}`);
    }

    // 获取内容类型
    const contentType = response.headers.get('content-type') || '';
    const mimeType = options.fileType || contentType.split(';')[0];
    
    // 确定文件名
    let filename = options.filename;
    if (!filename) {
      const contentDisposition = response.headers.get('content-disposition');
      if (contentDisposition) {
        const match = contentDisposition.match(/filename\*?=["']?(.*?)["']?$/);
        if (match && match[1]) {
          filename = decodeURIComponent(match[1].replace(/UTF-8''/i, ''));
        }
      }
      filename = filename || getFilenameFromUrl(url) || 'downloaded_file';
    }

    // 获取文件大小（如果可用）
    const contentLength = parseInt(response.headers.get('content-length'), 10);
    let total = isNaN(contentLength) ? 0 : contentLength;
    let loaded = 0;
    
    // 流式处理响应（支持进度）
    const reader = response.body.getReader();
    const chunks = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      chunks.push(value);
      loaded += value.length;
      
      // 进度回调
      if (typeof options.onProgress === 'function') {
        options.onProgress(loaded, total);
      }
    }
    
    // 创建Blob
    const blob = new Blob(chunks, { type: mimeType });
    
    // 创建File对象
    const file = new File([blob], filename, {
      type: mimeType,
      lastModified: Date.now()
    });
    
    return file;
    
  } catch (error) {
    // 特殊处理AbortError
    if (error.name === 'AbortError') {
      console.warn('下载已取消');
      throw new Error('下载被用户取消');
    }
    console.error('文件获取失败:', error);
    throw new Error(`文件获取失败: ${error.message}`);
  }
}

// 辅助函数：验证URL格式
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

// 辅助函数：从URL中提取文件名
export function getFilenameFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    return pathname.substring(pathname.lastIndexOf('/') + 1) || null;
  } catch (e) {
    return null;
  }
}

// 使用示例
// 基本使用
// getFileFromStream('https://example.com/path/to/file.pdf')
//   .then(file => console.log('文件对象:', file))
//   .catch(console.error);

// // 带进度监控和取消功能
// const controller = new AbortController();

// // 30秒后自动取消
// setTimeout(() => controller.abort(), 30000);

// getFileFromStream('https://example.com/large-file.zip', {
//   filename: 'custom_name.zip',
//   onProgress: (loaded, total) => {
//     const percent = total ? Math.round((loaded / total) * 100) : '未知';
//     console.log(`下载进度: ${loaded}字节/${total ? total + '字节' : '未知大小'} (${percent}%)`);
//   },
//   signal: controller.signal
// })
// .then(file => console.log('下载完成:', file.name))
// .catch(error => console.error('下载出错:', error));


export function base64ToFile(base64Data, fname=undefined) {
    // 验证Base64格式
    if (!base64Data.startsWith('data:image/')) {
        throw new Error('无效的Base64图片格式');
    }
    
    // 分离Base64头部和数据部分
    const parts = base64Data.split(';base64,');
    if (parts.length !== 2) {
        throw new Error('无效的Base64格式');
    }
    
    // 获取MIME类型
    const mimeType = parts[0].split(':')[1];
    if (!mimeType) {
        throw new Error('无法识别图片类型');
    }
    
    // 解码Base64数据
    const rawData = atob(parts[1]);
    const byteArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; i++) {
        byteArray[i] = rawData.charCodeAt(i);
    }
    
    // 创建Blob
    const blob = new Blob([byteArray], { type: mimeType });
    
    // 根据MIME类型确定文件后缀
    const extension = mimeTypeToExtension(mimeType);
    
    // 生成文件名（带时间戳）
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = fname ? `${fname}${extension}` : `image-${timestamp}${extension}`;
    
    // 创建File对象
    return new File([blob], filename, { type: mimeType });
}

// MIME类型转文件后缀
function mimeTypeToExtension(mimeType) {
    const extensions = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'image/svg+xml': '.svg',
        'image/bmp': '.bmp',
        'image/tiff': '.tiff'
    };
    
    return extensions[mimeType.toLowerCase()] || '.bin';
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    // 验证输入是否为 File 对象
    if (!(file instanceof File)) {
      reject(new Error('输入必须是一个 File 对象'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = () => {
      // reader.result 包含 base64 编码的字符串
      resolve(reader.result);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    // 读取文件内容为 Data URL (base64)
    reader.readAsDataURL(file);
  });
}