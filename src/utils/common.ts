import { baseFps } from '@/data/trackConfig';
import { ElMessage } from 'element-plus';

export const AIToolMap = {
  "imageLayered": {label: 'Panel.Video.AICapability.ImageLayered.Label', type: 'video' ,description: 'Panel.Video.AICapability.ImageLayered.Description', corver: '/image/cover/logo_250x125.png'},
  "imageToVideo": {label: 'Panel.Video.AICapability.ImageToVideo.Label', type: 'video' ,description: 'Panel.Video.AICapability.ImageToVideo.Description', corver: '/image/cover/i2v_128x.webp'},
  "textToImage": {label: 'Panel.Video.AICapability.TextToImage.Label', type: 'video' ,description: 'Panel.Video.AICapability.TextToImage.Description', corver: '/image/cover/t2i_128x.jpg'},
  "textToVideo": {label: 'Panel.Video.AICapability.TextToVideo.Label', type: 'video' ,description: 'Panel.Video.AICapability.TextToVideo.Description', corver: '/image/cover/t2v_128x.webp'},
  "textToSpeech": {label: 'Panel.Video.AICapability.TextToSpeech.Label', type: 'audio' ,description: 'Panel.Video.AICapability.TextToSpeech.Description', corver: '/image/cover/logo_250x125.png'},
  "imageToImage": {label: 'Panel.Video.AICapability.ImageToImage.Label', type: 'video' ,description: 'Panel.Video.AICapability.ImageToImage.Description', corver: '/image/cover/i2i_128x.webp'},
  "subtitleRecognition": {label: 'Panel.Video.AICapability.SubtitleRecognition.Label', type: 'subtitle' ,description: 'Panel.Video.AICapability.SubtitleRecognition.Description', corver: '/image/cover/logo_250x125.png'},
  "avatar": {label: 'Panel.Video.AICapability.Avatar.Label', type: 'video' ,description: 'Panel.Video.AICapability.Avatar.Description', corver: '/image/cover/avatar_128x.webp'},
  "voiceConversion": {label: 'Panel.Video.AICapability.VoiceConversion.Label', type: 'audio' ,description: 'Panel.Video.AICapability.VoiceConversion.Description', corver: '/image/cover/logo_250x125.png'},
  "splitScene": {label: 'Panel.Video.AICapability.SplitScene.Label', type: 'video' ,description: 'Panel.Video.AICapability.SplitScene.Description', corver: '/image/cover/logo_250x125.png'},
  "VSR": {label: 'Panel.Video.AICapability.VSR.Label', type: 'video' ,description: 'Panel.Video.AICapability.VSR.Description', corver: '/image/cover/logo_250x125.png'},
  "generateShortVideo": {label: 'Panel.Video.AICapability.GenerateShortVideo.Label', type: 'video' ,description: 'Panel.Video.AICapability.GenerateShortVideo.Description', corver: '/image/cover/logo_250x125.png'},

  "formatMedia": {label: 'Panel.Video.AICapability.FormatMedia.Label', type: 'f-video' ,description: '', corver: '/image/cover/logo_250x125.png'},
  "GLController": {label: 'Panel.Video.AICapability.GLController.Label', type: 'video' ,description: ''},
  "costomFont": {label: 'Panel.Video.AICapability.CostomFont.Label', type: 'font' ,description: ''},
  "costomAudio": {label: 'Panel.Video.AICapability.CostomAudio.Label', type: 'audio' ,description: ''},
  "costomSubtitle": {label: 'Panel.Video.AICapability.CostomSubtitle.Label', type: 'subtitle' ,description: ''},
};

export class TaskManager {
    storageKey:string;
    tasks:any;
    constructor(storageKey = 'tasks') {
        this.storageKey = storageKey;
        this.tasks = this.loadTasks();
    }
    
    // 从localStorage加载任务
    loadTasks() {
        const tasksJson = localStorage.getItem(this.storageKey);
        return tasksJson ? JSON.parse(tasksJson) : [];
    }
    
    // 保存任务到localStorage
    saveTasks() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
    }
    
    // 添加新任务
    addTask(taskData) {
        this.tasks.push(taskData);
        this.saveTasks();
        return taskData;
    }
    
    // 删除指定taskId的任务
    deleteTask(taskId) {
        const initialLength = this.tasks.length;
        this.tasks = this.tasks.filter(task => task.taskId !== taskId);
        
        if (this.tasks.length < initialLength) {
            this.saveTasks();
            return true;
        }
        return false;
    }
    
    // 获取所有任务
    getAllTasks() {
        return this.tasks;
    }
    
    // 清空所有任务
    clearAllTasks() {
        this.tasks = [];
        this.saveTasks();
    }
}

export function condWait(condition, errMsg="", timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        function checkCondition() {
            if (condition()) {
                resolve();
            } else if (Date.now() - startTime > timeout) {
                reject(new Error('Timeout: ' + errMsg));
            } else {
                setTimeout(checkCondition, 100);
            }
        }
        
        checkCondition();
    });
}

export function cleanSrtContent(content) {
    // 解决常见SRT格式问题
    return content
      .replace(/\r\n/g, '\n')      // 统一换行符
      .replace(/\n\n\n+/g, '\n\n')  // 减少多余空行
      .replace(/(\d\d:\d\d:\d\d)[.,](\d\d\d)/g, '$1,$2') // 统一分隔符
      .replace(/(\d\d:\d\d:\d\d,\d\d\d) - > (\d\d:\d\d:\d\d,\d\d\d)/g, '$1 --> $2'); // 修正箭头
  }

/**
 * 从原始文件名提取扩展名
 * @param {string} fileName - 原始文件名
 * @returns {string} 包含点号的扩展名（如.jpg）
 */
export function extractFileExtension(fileName) {
    const lastDotIndex = fileName.lastIndexOf('.');
    return lastDotIndex > 0 ? fileName.substring(lastDotIndex) : '';
}

export function isImage(url: string): boolean {
  if (!url) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  return imageExtensions.some(ext => extractFileExtension(url).toLowerCase().includes(ext));
};

export function isVideo (url: string): boolean {
  if (!url) return false;
  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'];
  return videoExtensions.some(ext => extractFileExtension(url).toLowerCase().includes(ext));
};

export function isAudio (url: string): boolean {
  if (!url) return false;
  const audioExtensions = ['.mp3', '.m4a', '.wav', '.flac', '.aac'];
  return audioExtensions.some(ext => extractFileExtension(url).toLowerCase().includes(ext));
};

export function isFont (url: string): boolean {
  if (!url) return false;
  const audioExtensions = ['.ttf',];
  return audioExtensions.some(ext => extractFileExtension(url).toLowerCase().includes(ext));
};
export function isSrtSubtitles (url: string): boolean {
  if (!url) return false;
  const audioExtensions = ['.srt',];
  return audioExtensions.some(ext => extractFileExtension(url).toLowerCase().includes(ext));
};

export const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString();
};


export function cleanJsonString3(str) {
  let result = str;
  
  // 去除开头的 ```json
  if (result.startsWith('```json')) {
    result = result.substring(7);
  }
  
  // 去除末尾的 ```
  if (result.endsWith('```')) {
    result = result.substring(0, result.length - 3);
  }
  
  return result.trim();
}

export function getUrlType(url:string){
    if(isVideo(url)){
        return "video"
    }
    else if(isImage(url)){
        return "image"
    }
    else if(isAudio(url)){
        return "audio"
    }
    else{
        return "";
    }
}

export async function processPaths(data, targetKeys, operation) {
    /**
     * 递归遍历数据结构，对所有键为 targetKey 的字段执行操作
     * @param {Object|Array} data - 要处理的数据（支持对象/数组嵌套结构）
     * @param {string[]} targetKeys - 需要处理的目标键名
     * @param {Function} operation - 处理函数，接收 targetKey 的值作为参数，返回新值
     */
    console.log(`Processing:`, data, 
                `isObject: ${typeof data === 'object' && !Array.isArray(data)}`, 
                `isArray: ${Array.isArray(data)}`);

    if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data)) {
            // 处理数组类型
            for (let item of data) {
                await processPaths(item, targetKeys, operation);
            }
        } else {
            // 处理对象类型
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    if (targetKeys.includes(key)) {
                        // 执行操作并更新值
                        const newVal = await operation(data[key], data);
                        if(newVal){
                            data[key] = await operation(data[key], data);
                            console.log(`Updated data[${key}]:`, data[key]);
                        }
                    } else {
                        // 递归处理嵌套对象
                        await processPaths(data[key], targetKeys, operation);
                    }
                }
            }
        }
    }
}

export function formatString(
  str: string,
  maxDisplayWidth: number = 15,
  {
    preserveExtension = true,     // 是否保留文件后缀
    keepFullExtChain = false      // 是否保留多后缀链（如 .tar.gz）
  }: { preserveExtension?: boolean; keepFullExtChain?: boolean } = {}
) {
  if (typeof str !== 'string' || maxDisplayWidth <= 0) return '';

  const ELLIPSIS = '...';
  const ELLIPSIS_WIDTH = 3;

  // 计算单个字符显示宽度：中日韩/全角记为2，其他记为1
  const charWidth = (cp: number) => {
    const isWide =
      (cp >= 0x1100 && cp <= 0x115F) || // Hangul Jamo
      (cp >= 0x2E80 && cp <= 0xA4CF && cp !== 0x303F) || // CJK 部分符号/假名等（近似）
      (cp >= 0xAC00 && cp <= 0xD7A3) || // Hangul
      (cp >= 0xF900 && cp <= 0xFAFF) || // CJK 兼容表意
      (cp >= 0xFE10 && cp <= 0xFE19) ||
      (cp >= 0xFE30 && cp <= 0xFE6F) ||
      (cp >= 0xFF01 && cp <= 0xFF60) || // 全角
      (cp >= 0xFFE0 && cp <= 0xFFE6) ||
      (cp >= 0x3400 && cp <= 0x4DBF) || // CJK 扩展A
      (cp >= 0x4E00 && cp <= 0x9FFF) || // CJK 统一表意
      (cp >= 0x20000 && cp <= 0x2A6DF); // CJK 扩展B
    return isWide ? 2 : 1;
  };

  const displayWidth = (s: string) => {
    let w = 0;
    for (const ch of s) {
      const cp = ch.codePointAt(0)!;
      w += charWidth(cp);
    }
    return w;
  };

  // 在不超过 limit 的前提下截断，并在被截断时追加 '...'
  const truncateWithEllipsis = (s: string, limit: number) => {
    const total = displayWidth(s);
    if (total <= limit) return s;

    if (limit <= ELLIPSIS_WIDTH) {
      // 连省略号都放不下时：尽可能多放几个点
      return '.'.repeat(Math.max(0, limit));
    }

    const target = limit - ELLIPSIS_WIDTH;
    let w = 0;
    let out = '';
    for (const ch of s) {
      const cp = ch.codePointAt(0)!;
      const next = w + charWidth(cp);
      if (next > target) break;
      out += ch;
      w = next;
    }
    return out + ELLIPSIS;
  };

  if (!preserveExtension) {
    return truncateWithEllipsis(str, maxDisplayWidth);
  }

  // 提取后缀（默认仅最后一段；可选保留多后缀链）
  const lastDot = str.lastIndexOf('.');
  const firstDot = str.indexOf('.');

  // 以 dotfile（如 .gitignore）作为“无后缀”处理：lastDot <= 0 视作无后缀
  let base = str;
  let ext = '';

  if (keepFullExtChain) {
    if (firstDot > 0 && firstDot < str.length - 1) {
      base = str.slice(0, firstDot);
      ext = str.slice(firstDot); // 包含第一个点起的所有内容
    }
  } else {
    if (lastDot > 0 && lastDot < str.length - 1) {
      base = str.slice(0, lastDot);
      ext = str.slice(lastDot); // 仅最后一段后缀，如 .png
    }
  }

  // 无后缀情况，按普通截断
  if (!ext) {
    return truncateWithEllipsis(str, maxDisplayWidth);
  }

  const totalW = displayWidth(str);
  if (totalW <= maxDisplayWidth) return str;

  const extW = displayWidth(ext);
  let avail = maxDisplayWidth - extW; // base + ellipsis 可用宽度

  if (avail <= 0) {
    // base 完全放不下，尽量显示 '...'+ext；若仍放不下，再截断 ext 尾部
    if (ELLIPSIS_WIDTH + extW <= maxDisplayWidth) {
      return ELLIPSIS + ext;
    }
    // 省略号固定保留，截断后缀的左侧，保留后缀结尾（一般为 ASCII，逐字符即可）
    const extTarget = maxDisplayWidth - ELLIPSIS_WIDTH;
    let taken = 0;
    let tail = '';
    // 这里为简化，假设后缀多为 ASCII，按 code unit 逆向累加
    for (let i = ext.length - 1; i >= 0; i--) {
      const next = taken + 1;
      if (next > extTarget) break;
      tail = ext[i] + tail;
      taken = next;
    }
    return ELLIPSIS + tail;
  }

  // 截断 base，并拼接 ext
  const baseTruncated = truncateWithEllipsis(base, avail);
  return baseTruncated + ext;
}


export async function copyText(text){
  try {
    // 处理空值或非字符串
    const content = String(text || '');
    console.log('text: ', content);
    if (!content.trim()) {
      throw new Error("复制内容不能为空");
    }
    await navigator.clipboard.writeText(content);
    ElMessage.success('Copied');
  } catch (err) {
    console.error(err.message);
    ElMessage.error('Copy failed: ' + err.message);
  }
};


export function GetStrideWidth(width: number, pix_size=4, alignment=64){
    if (width <= 0) return 0;
    return Math.floor(((width*pix_size + alignment - 1) & ~(alignment - 1))/pix_size);
}

export function findNamedList(obj: Record<string, any>, find_name: string): any | null {
  // 检查当前对象是否直接匹配
  if (obj.name === find_name) {
    return obj;
  }

  // 递归遍历对象的所有属性
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      const result = findNamedList(obj[key], find_name);
      if (result) return result; // 找到则直接返回结果
    }
  }
  return null; // 未找到
}

// 生成 16 进制指定长度的字符串
function getRandom(len: number) {
    return Math.floor((1 + Math.random()) * (16 ** len))
        .toString(16)
        .substring(1);
}
/**
 *  时间格式化
 * */
export function formatTime(time: number) {
    let second = Math.ceil(time / 1000);
    const s = second % 60;
    second = Math.floor(second / 60);
    const m = second % 60;
    second = Math.floor(second / 60);
    const h = second % 60;
    return {
        s,
        m,
        h,
        str: `${h === 0 ? '' : `${h < 10 ? '0' : ''}${h}:`}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`
    };
}
export function formatPlayerTime(frameCount: number) {
    if(frameCount === Infinity){
        return "-";
    }
    let f = Math.round(frameCount % 30);
    frameCount = Math.floor(frameCount / 30);
    let s = frameCount % 60;
    frameCount = Math.floor(frameCount / 60);
    let m = frameCount % 60;
    frameCount = Math.floor(frameCount / 60);
    let h = frameCount;
    return `${h < 10 ? '0' : ''}${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}:${f < 10 ? '0' : ''}${f}`;
}

export function rgbaToHex(r, g, b, a = 1.0) {
    const to255 = (value) => Math.round(value * 255);
    
    const r255 = to255(r);
    const g255 = to255(g);
    const b255 = to255(b);
    const a255 = to255(a);
    
    const rHex = r255.toString(16).toUpperCase().padStart(2, '0');
    const gHex = g255.toString(16).toUpperCase().padStart(2, '0');
    const bHex = b255.toString(16).toUpperCase().padStart(2, '0');
    const aHex = a255.toString(16).toUpperCase().padStart(2, '0');
    
    return `#${rHex}${gHex}${bHex}${aHex}`;
}

export function parseRGBA(hex) {
    console.log("hex:", hex);
    if(hex.length === 7){
        hex += "ff";
    }
    if (hex.length !== 9 || typeof hex !== 'string' || !/^#([0-9A-Fa-f]{8})$/.test(hex)) {
        throw new Error('Invalid color format. Expected "#RRGGBBAA", ', hex);
    }

    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const a = parseInt(hex.slice(7, 9), 16) / 255;

    console.log("hex:", r, g, b, a);
    return { r, g, b, a };
}

/**
 *  获取随机ID，组件拖到预览视图后就会被设置个ID
 * */
export function getId(prefix = 't') {
    return `${prefix ? `${prefix}-` : ''}${getRandom(5)}${getRandom(3)}-${getRandom(4)}`;
}
/**
 * 下载文件
 * */
export function downloadFileUrl(href: string, fileName: string) {
    const downloadElement = document.createElement('a');
    downloadElement.href = href;
    // 下载后文件名
    downloadElement.download = fileName;
    document.body.appendChild(downloadElement);
    downloadElement.click();
    document.body.removeChild(downloadElement);
    // 释放掉blob对象
    window.URL.revokeObjectURL(href);
    downloadElement.href = '';
}
/**
 * 根据中心点计算左上角顶点位置
 */
export function calcLeftTopByCenter(center: { x: number, y: number }, width: number, height: number) {
    return {
        left: center.x - width / 2,
        top: center.y - height / 2
    };
}

// 获取canvas中文本应该显示的宽高
// export function getTextRect({ text = 'Hello World', fontSize = 40 }) {
//     const canvas = document.createElement('canvas');
//     const ctx = canvas.getContext('2d');
//     if (ctx) {
//         ctx.font = `${fontSize}px -apple-system, ".SFNSText-Regular", "SF UI Text", "PingFang SC", "Hiragino Sans GB", "Helvetica Neue", "WenQuanYi Zen Hei", "Microsoft YaHei", Arial, sans-serif`;
//         const metrics = ctx.measureText(text);
//         return {
//             width: metrics.actualBoundingBoxRight + metrics.actualBoundingBoxLeft,
//             height: fontSize * 1.2
//         };
//     }
//     return null;
// }

export function getTextRect({ text = 'Hello World', fontSize = 40, fontFamily }: { text: string, fontSize: number, fontFamily: string }) {
    const padding = 4;
    const canvas = new OffscreenCanvas(1000, 1000);
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Canvas 2D context is not supported');
    }

    const lines = text.split('\n');
    ctx.font = `${fontSize}px ${fontFamily}`;
    const lineHeight = fontSize * 1.2; // Adjust line height as needed

    // Measure the widest line
    const textWidth = Math.max(...lines.map(line => ctx.measureText(line).width));

    // Calculate total height
    const totalHeight = lines.length * lineHeight;

    return {
        width: textWidth + padding * 2,
        height: totalHeight + padding * 2,
        lineHeight,
        lines
    };
}

export function getSize(resolution: string, ratio: string) {
    if (resolution === '1080p') {
        if (ratio === '16:9') {
            return [1920, 1080];
        } else if (ratio === '4:3') {
            return [1664, 1248];
        } else if (ratio === '1:1') {
            return [1440, 1440];
        } else if (ratio === '3:4') {
            return [1248, 1664];
        } else if (ratio === '9:16') {
            return [1088, 1920];
        } else if (ratio === '21:9') {
            return [2176, 928];
        }
    } else if (resolution === '720p') {
        if (ratio === '16:9') {
            return [1248, 704];
        } else if (ratio === '4:3') {
            return [1120, 832];
        } else if (ratio === '1:1') {
            return [960, 960];
        } else if (ratio === '3:4') {
            return [832, 1120];
        } else if (ratio === '9:16') {
            return [704, 1248];
        } else if (ratio === '21:9') {
            return [1504, 640];
        }
    } else if (resolution === '480p') {
        if (ratio === '16:9') {
            return [864, 480];
        } else if (ratio === '4:3') {
            return [736, 544];
        } else if (ratio === '1:1') {
            return [640, 640];
        } else if (ratio === '3:4') {
            return [544, 736];
        } else if (ratio === '9:16') {
            return [480, 864];
        } else if (ratio === '21:9') {
            return [960, 416];
        }
    } else if (resolution === '2k') {
        if (ratio === '16:9') {
            return [2560, 1440]; // 常见 2K/QHD
        } else if (ratio === '4:3') {
            return [2240, 1680]; // 按比例放大
        } else if (ratio === '1:1') {
            return [2000, 2000]; // 正方形
        } else if (ratio === '3:4') {
            return [1680, 2240]; // 竖屏
        } else if (ratio === '9:16') {
            return [1440, 2560]; // 更长竖屏
        } else if (ratio === '21:9') {
            return [3440, 1440]; // 超宽 21:9，常见 ultrawide 分辨率
        }
    } else if (resolution === '4k') {
        if (ratio === '16:9') {
            return [3840, 2160]; // 标准 4K UHD
        } else if (ratio === '4:3') {
            return [3328, 2496]; // 按比例
        } else if (ratio === '1:1') {
            return [3600, 3600]; // 或 4000x4000，这里取 3600x3600
        } else if (ratio === '3:4') {
            return [2496, 3328]; // 竖屏
        } else if (ratio === '9:16') {
            return [2160, 3840]; // 超长竖屏
        } else if (ratio === '21:9') {
            // return [5120, 2160]; // 4K 21:9 超宽屏，常见于影院显示器
            return [4096, 1728]; // max is 4096
        }
    }

    console.error("unknown resolution or ratio: default return 1080p 9:16", resolution, ratio);
    return [1088, 1920]; // fallback
}

export function calcTrackItemAttr(trackItem: Record<string, any>, canvasSize: { width: number, height: number }, trackAttr: Record<string, any> = {}) {
    const { width: sourceWidth, height: sourceHeight, type, text = '默认文本', fontSize = 40, style } = trackItem;
    const { width: playerW, height: playerH } = canvasSize;
    let defaultW = playerW;
    let defaultH = playerH;
    if (['image', 'video'].includes(type)) {
        const proportionalW = Math.floor(playerH / sourceHeight * sourceWidth); // 等高宽度
        const proportionalH = Math.floor(playerW / sourceWidth * sourceHeight); // 等宽高度
        // 默认渲染位置
        if (proportionalW > playerW) { // 等高场景下宽度溢出，则采用等宽， 高度上下留白
            defaultH = proportionalH;
        } else if (proportionalH > playerH) { // 等宽场景下高度溢出，则采用等高， 宽度左右留白
            defaultW = proportionalW;
        }

        if (sourceHeight < defaultH && sourceWidth < defaultW) {
            defaultW = sourceWidth;
            defaultH = sourceHeight;
        }
    }

    if (type === 'text') {
        const rect = getTextRect({ text, fontSize });
        console.log('🚀 ~ calcTrackItemAttr ~ rect:', rect);
        if (rect) {
            defaultW = rect.width;
            defaultH = rect.height;
        }
    }
    return {
        width: defaultW,
        height: defaultH,
        centerX: 0,
        centerY: 0,
        scale: 100,
        drawWidth: defaultW,
        drawHeight: defaultH,
        text,
        fontSize,
        // color: style.fill,
        style
    };
}

export function computedItemShowArea(trackItem: Record<string, any>, canvasSize: { width: number, height: number }, trackAttr: Record<string, any>) {
    let { left = 0, top = 0, scale = 100, text, fontSize } = trackAttr;
    const { width, height, type } = trackItem;
    const { width: playerW, height: playerH } = canvasSize;
    let defaultW = playerW;
    let defaultH = playerH;
    if (type === 'video') {
        const proportionalW = Math.floor(playerH / height * width); // 等高宽度
        const proportionalH = Math.floor(playerW / width * height); // 等宽高度
        // 默认渲染位置
        if (proportionalW > playerW) { // 等高场景下宽度溢出，则采用等宽， 高度上下留白
            defaultH = proportionalH;
        } else if (proportionalH > playerH) { // 等宽场景下高度溢出，则采用等高， 宽度左右留白
            defaultW = proportionalW;
        }
    }
    if (type === 'image') {
        defaultW = width;
        defaultH = width;
    }
    if (type === 'text') {
        defaultW = text.length * fontSize;
        defaultH = fontSize * 1.2;
    }
    // 由默认位置计算偏移缩放位置
    const scaleW = Math.floor(defaultW * scale / 100);
    const scaleH = Math.floor(defaultH * scale / 100);
    const scaleL = Math.floor(left + (defaultW - scaleW) / 2);
    const scaleT = Math.floor(top + (defaultH - scaleH) / 2);
    const diffW = Math.floor(playerW - scaleW);
    const diffH = Math.floor(playerH - scaleH);
    return {
        drawL: scaleL,
        drawT: scaleT,
        drawW: scaleW,
        drawH: scaleH,
        sourceWidth: width,
        sourceHeight: height,
        defaultW,
        defaultH,
        diffW,
        diffH
    };
}

// 封装json格式化, 避免error
export function getJsonParse(jsonStr: string): any {
    let res = '';
    try {
        res = JSON.parse(jsonStr);
    } catch (e) {
        console.log(e);
        res = '';
    }
    return res;
}

export const file2ArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => {
            resolve(e.target?.result as ArrayBuffer);
        };
        reader.readAsArrayBuffer(file);
    });
};

export const file2Unit8Stream = async(file: File): Promise<ReadableStream<Uint8Array>> => {
    const unit8Array = new Uint8Array(await file2ArrayBuffer(file));
    // 创建一个空的 ReadableStream
    return new ReadableStream({
        start(controller) {
            // 使用 enqueue 方法将 Uint8Array 推送到 ReadableStream
            controller.enqueue(unit8Array);

            // 关闭 ReadableStream，表示没有更多的数据会被推送
            controller.close();
        }
    });
};
/**
 * 获取当前字幕
 * @param asr 
 * @param frame 
 */
export const getCurSubtitle = (asr: { beginTime: number, endTime: number, text: string }[], frame: number) => {
    // 将frame转换为当前时间
    const time = frame * 1000 / baseFps;
    // 当time在beginTime和endTime之间时，返回当前字幕
    for (let i = 0; i < asr.length; i++) {
        const { beginTime, endTime, text } = asr[i];
        if (time >= beginTime && time <= endTime) {
            return text;
        }
    }
    return '';
};