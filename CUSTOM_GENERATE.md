# 自定义视频生成回调和资源映射

## 概述

本文档说明如何自定义视频生成回调函数以及如何编辑资源映射表。

## 1. 自定义视频生成回调

### 默认行为

默认情况下，点击"生成"按钮会调用 `glConrtollerPost` 将视频配置发送到后端服务器。

### 自定义回调

你可以通过 `usePageState` store 设置自定义的生成回调函数，完全控制视频生成流程。

#### 基础示例

```typescript
// main.ts 或任何组件中
import { usePageState } from 'aoles-gl-vue'

const pageStore = usePageState()

// 设置自定义生成回调
pageStore.generateCallback = async (controllerJson) => {
  console.log('视频配置:', controllerJson)
  
  // 你的自定义逻辑
  // 例如：发送到不同的 API
  const response = await fetch('/api/custom-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(controllerJson)
  })
  
  const result = await response.json()
  console.log('生成结果:', result)
}
```

#### controllerJson 结构

传递给回调的 `controllerJson` 对象包含：

```typescript
{
  output: {
    muxer: true,        // 是否启用混流
    audio: true,        // 是否输出音频
    video: true,        // 是否输出视频
    video_config: {
      width: number,    // 视频宽度（已缩放）
      height: number,   // 视频高度（已缩放）
      fps: number,      // 帧率
      codec_name: string,
      bps: number
    },
    audio_config: {
      sample_rate: number
    }
  },
  tracks: [...],        // 轨道数据
  // ... 其他配置
}
```

**注意：** 在回调被调用前，以下处理已自动完成：
1. 路径替换：所有 WASM 路径已替换为实际 URL（通过 `uniSourceMap`）
2. 尺寸缩放：宽度、高度、字体大小已按 `outputScale` 缩放
3. 输出配置：`muxer`、`audio`、`video` 已设置为 `true`

#### 完整示例：发送到自定义后端

```typescript
import { usePageState } from 'aoles-gl-vue'
import { ElMessage } from 'element-plus'

const pageStore = usePageState()

pageStore.generateCallback = async (controllerJson) => {
  try {
    // 1. 发送到自定义 API
    const response = await fetch('https://your-api.com/generate-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${yourToken}`
      },
      body: JSON.stringify({
        config: controllerJson,
        userId: yourUserId,
        projectName: 'My Project'
      })
    })

    if (!response.ok) {
      throw new Error('生成失败')
    }

    const result = await response.json()

    // 2. 处理结果
    console.log('任务 ID:', result.taskId)
    console.log('预计完成时间:', result.estimatedTime)

    // 3. 可选：轮询任务状态
    pollTaskStatus(result.taskId)

  } catch (error) {
    console.error('生成错误:', error)
    ElMessage.error('视频生成失败')
    throw error
  }
}

// 轮询任务状态
async function pollTaskStatus(taskId: string) {
  const interval = setInterval(async () => {
    const response = await fetch(`https://your-api.com/task/${taskId}`)
    const status = await response.json()

    if (status.state === 'completed') {
      clearInterval(interval)
      ElMessage.success('视频生成完成！')
      console.log('下载链接:', status.downloadUrl)
    } else if (status.state === 'failed') {
      clearInterval(interval)
      ElMessage.error('视频生成失败')
    }
  }, 3000)
}
```

#### 示例：本地生成（使用 WebCodecs）

```typescript
import { usePageState } from 'aoles-gl-vue'

const pageStore = usePageState()

pageStore.generateCallback = async (controllerJson) => {
  // 使用浏览器 WebCodecs API 本地生成
  const encoder = new VideoEncoder({
    output: (chunk, metadata) => {
      // 处理编码后的视频块
      console.log('编码块:', chunk)
    },
    error: (error) => {
      console.error('编码错误:', error)
    }
  })

  encoder.configure({
    codec: 'vp8',
    width: controllerJson.output.video_config.width,
    height: controllerJson.output.video_config.height,
    bitrate: controllerJson.output.video_config.bps,
    framerate: controllerJson.output.video_config.fps
  })

  // 渲染帧并编码
  // ... 你的渲染逻辑
}
```

#### 移除自定义回调

```typescript
// 恢复默认行为
pageStore.generateCallback = null
```

## 2. 编辑资源映射表 (uniSourceMap)

### 什么是 uniSourceMap？

`uniSourceMap` 是一个数组，存储了所有资源文件（字体、GLSL shader、视频、图片等）的 URL 和 WASM 路径映射关系。

### 数据结构

```typescript
interface UniSource {
  url: string           // 资源的实际 URL
  originUrl?: string    // 原始 URL（可选，如果没有则使用 url）
  wasmPath: string      // WASM 文件系统中的路径
}
```

### 查看资源映射

```typescript
import { uniSourceMap } from 'aoles-gl-vue'

console.log('所有资源:', uniSourceMap)

// 示例输出：
// [
//   {
//     url: 'https://cdn.example.com/fonts/NotoSansSC-Regular.ttf',
//     wasmPath: '/fonts/NotoSansSC-Regular.ttf'
//   },
//   {
//     url: 'https://cdn.example.com/glsl/video/transition/cube.glsl',
//     wasmPath: '/glsl/video/transition/cube.glsl'
//   },
//   ...
// ]
```

### 添加自定义资源映射

```typescript
import { uniSourceMap } from 'aoles-gl-vue'

// 添加自定义视频资源
uniSourceMap.push({
  url: 'https://your-cdn.com/videos/intro.mp4',
  originUrl: 'https://original-source.com/intro.mp4',
  wasmPath: '/videos/intro.mp4'
})

// 添加自定义图片资源
uniSourceMap.push({
  url: 'https://your-cdn.com/images/logo.png',
  wasmPath: '/images/logo.png'
})
```

### 修改现有资源映射

```typescript
import { uniSourceMap } from 'aoles-gl-vue'

// 查找并修改特定资源
const fontIndex = uniSourceMap.findIndex(
  item => item.wasmPath === '/fonts/NotoSansSC-Regular.ttf'
)

if (fontIndex !== -1) {
  // 替换为自定义 CDN
  uniSourceMap[fontIndex].url = 'https://my-cdn.com/fonts/NotoSansSC-Regular.ttf'
  uniSourceMap[fontIndex].originUrl = 'https://original-cdn.com/fonts/NotoSansSC-Regular.ttf'
}
```

### 批量替换 CDN

```typescript
import { uniSourceMap } from 'aoles-gl-vue'

// 将所有资源的 CDN 替换为自定义 CDN
uniSourceMap.forEach(item => {
  if (item.url.startsWith('https://old-cdn.com/')) {
    item.url = item.url.replace('https://old-cdn.com/', 'https://new-cdn.com/')
  }
})
```

### 使用场景

#### 场景 1：用户上传的资源

```typescript
import { uniSourceMap } from 'aoles-gl-vue'

async function handleUserUpload(file: File) {
  // 1. 上传文件到服务器
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  })
  
  const result = await response.json()
  
  // 2. 添加到资源映射
  uniSourceMap.push({
    url: result.cdnUrl,
    originUrl: result.originalUrl,
    wasmPath: `/user-uploads/${file.name}`
  })
  
  console.log('资源已添加:', result.cdnUrl)
}
```

#### 场景 2：动态资源替换

```typescript
import { uniSourceMap } from 'aoles-gl-vue'

// 根据用户权限使用不同的 CDN
function setupCDNByUserTier(userTier: 'free' | 'premium') {
  const cdnMap = {
    free: 'https://free-cdn.example.com/',
    premium: 'https://premium-cdn.example.com/'
  }
  
  const baseCDN = cdnMap[userTier]
  
  uniSourceMap.forEach(item => {
    // 保留原始 URL
    if (!item.originUrl) {
      item.originUrl = item.url
    }
    
    // 替换为对应等级的 CDN
    const path = item.wasmPath.substring(1) // 移除开头的 /
    item.url = baseCDN + path
  })
}
```

#### 场景 3：离线模式

```typescript
import { uniSourceMap } from 'aoles-gl-vue'

// 将所有资源指向本地服务器
function enableOfflineMode() {
  uniSourceMap.forEach(item => {
    if (!item.originUrl) {
      item.originUrl = item.url
    }
    
    // 使用本地路径
    item.url = 'http://localhost:8080' + item.wasmPath
  })
}

// 恢复在线模式
function disableOfflineMode() {
  uniSourceMap.forEach(item => {
    if (item.originUrl) {
      item.url = item.originUrl
    }
  })
}
```

## 3. 完整集成示例

```typescript
// main.ts
import { createApp } from 'vue'
import { 
  configAssetPath, 
  usePageState, 
  uniSourceMap 
} from 'aoles-gl-vue'
import App from './App.vue'

// 1. 配置资源路径
configAssetPath({
  basePath: 'https://cdn.example.com/assets/'
})

// 2. 设置自定义生成回调
const pageStore = usePageState()
pageStore.generateCallback = async (controllerJson) => {
  const response = await fetch('/api/custom-generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(controllerJson)
  })
  
  const result = await response.json()
  console.log('任务已提交:', result.taskId)
}

// 3. 添加自定义资源映射
uniSourceMap.push({
  url: 'https://cdn.example.com/custom/watermark.png',
  wasmPath: '/images/watermark.png'
})

// 4. 创建应用
const app = createApp(App)
app.mount('#app')
```

## 注意事项

1. **回调时机**：自定义回调在所有预处理（路径替换、尺寸缩放）完成后调用
2. **错误处理**：回调中的错误会被捕获，建议在回调内部处理错误
3. **资源映射**：修改 `uniSourceMap` 会立即生效，影响后续的资源加载
4. **CORS**：确保自定义 CDN 配置了正确的 CORS 头
5. **性能**：避免在 `uniSourceMap` 中添加过多资源，影响查找性能

## API 参考

### usePageState().generateCallback

```typescript
type GenerateCallback = (controllerJson: any) => Promise<void>

pageStore.generateCallback = callback | null
```

### uniSourceMap

```typescript
interface UniSource {
  url: string
  originUrl?: string
  wasmPath: string
}

const uniSourceMap: UniSource[]
```

### 相关导出

```typescript
export { uniSourceMap } from 'aoles-gl-vue'
export type { UniSource as UniSourceItem } from 'aoles-gl-vue'
```
