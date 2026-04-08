# 自定义字体和特效注册指南

## 概述

除了内置的字体和转场特效，你可以通过 API 注册自定义的字体和特效文件。

## 注册自定义字体

### 单个字体注册

```typescript
import { registerFont } from 'your-package-name'

registerFont({
  value: 'MyCustomFont',           // 唯一标识符
  label: 'FontMap.Label.MyCustomFont',  // i18n 翻译 key
  data: {
    path: '/fonts/MyCustomFont.ttf'     // 字体文件路径
  }
})
```

### 批量注册字体

```typescript
import { registerFonts } from 'your-package-name'

registerFonts([
  {
    value: 'CustomFont1',
    label: 'FontMap.Label.CustomFont1',
    data: { path: '/fonts/CustomFont1.ttf' }
  },
  {
    value: 'CustomFont2',
    label: 'FontMap.Label.CustomFont2',
    data: { path: '/fonts/CustomFont2.ttf' }
  }
])
```

### 完整示例

```typescript
// main.ts
import { createApp } from 'vue'
import { configAssetPath, registerFont } from 'your-package-name'
import App from './App.vue'

// 1. 配置资源路径
configAssetPath({
  basePath: 'https://cdn.example.com/assets/'
})

// 2. 注册自定义字体
registerFont({
  value: 'Roboto',
  label: 'FontMap.Label.Roboto',
  data: { path: '/fonts/Roboto-Regular.ttf' }
})

// 3. 创建应用
const app = createApp(App)
app.mount('#app')
```

## 注册自定义转场特效

### 单个特效注册

```typescript
import { registerTransition } from 'your-package-name'

registerTransition({
  value: 'MyCustomTransition',
  label: 'TransitionMap.Label.MyCustomTransition',
  data: {
    name: 'TransitionMap.Label.MyCustomTransition',
    controller_key: 'transition_key_my_custom',
    transition_duration_ts: 15,
    path: '/glsl/video/transition/my_custom.glsl',
    uniforms: []  // 可选的 shader 参数
  }
})
```

### 带参数的特效

```typescript
import { registerTransition } from 'your-package-name'

registerTransition({
  value: 'CustomBlur',
  label: 'TransitionMap.Label.CustomBlur',
  data: {
    name: 'TransitionMap.Label.CustomBlur',
    controller_key: 'transition_key_custom_blur',
    transition_duration_ts: 15,
    path: '/glsl/video/transition/custom_blur.glsl',
    uniforms: [
      {
        name: 'BlurAmount',
        type: 'float',
        value: 5.0,
        min: 0.0,
        max: 20.0,
        step: 0.5,
        label: 'TransitionMap.CustomBlur.Uniforms.BlurAmount.Label',
        description: 'TransitionMap.CustomBlur.Uniforms.BlurAmount.Description'
      }
    ]
  }
})
```

### 批量注册特效

```typescript
import { registerTransitions } from 'your-package-name'

registerTransitions([
  {
    value: 'CustomFade',
    label: 'TransitionMap.Label.CustomFade',
    data: {
      name: 'TransitionMap.Label.CustomFade',
      controller_key: 'transition_key_custom_fade',
      transition_duration_ts: 15,
      path: '/glsl/video/transition/custom_fade.glsl',
      uniforms: []
    }
  },
  {
    value: 'CustomSlide',
    label: 'TransitionMap.Label.CustomSlide',
    data: {
      name: 'TransitionMap.Label.CustomSlide',
      controller_key: 'transition_key_custom_slide',
      transition_duration_ts: 15,
      path: '/glsl/video/transition/custom_slide.glsl',
      uniforms: []
    }
  }
])
```

## TypeScript 类型定义

### FontItem

```typescript
interface FontItem {
  value: string        // 唯一标识符
  label: string        // i18n 翻译 key
  data: {
    path: string       // 字体文件路径
  }
}
```

### TransitionItem

```typescript
interface TransitionItem {
  value: string        // 唯一标识符
  label: string        // i18n 翻译 key
  data: {
    name?: string                      // 特效名称
    controller_key?: string            // 控制器 key
    transition_duration_ts?: number    // 默认持续时间（时间戳）
    path?: string                      // GLSL shader 文件路径
    uniforms?: TransitionUniform[]     // Shader 参数
  }
}

interface TransitionUniform {
  name: string          // 参数名
  type: string          // 参数类型（如 'float'）
  value: number         // 默认值
  min: number           // 最小值
  max: number           // 最大值
  step: number          // 步进值
  label: string         // i18n 翻译 key
  description: string   // i18n 翻译 key
}
```

## 访问内置资源列表

### 查看所有内置字体

```typescript
import { fontMap } from 'your-package-name'

console.log('Available fonts:', fontMap)
// 输出所有可用字体列表
```

### 查看所有内置转场特效

```typescript
import { transitionMap } from 'your-package-name'

console.log('Available transitions:', transitionMap)
// 输出所有可用转场特效列表
```

## 完整集成示例

```typescript
// main.ts
import { createApp } from 'vue'
import { 
  configAssetPath, 
  registerFont, 
  registerTransition,
  fontMap,
  transitionMap
} from 'your-package-name'
import App from './App.vue'

// 1. 配置资源基础路径
configAssetPath({
  basePath: import.meta.env.PROD 
    ? 'https://cdn.example.com/assets/' 
    : '/'
})

// 2. 注册自定义字体
registerFont({
  value: 'CustomFont',
  label: 'My Custom Font',
  data: { path: '/fonts/CustomFont.ttf' }
})

// 3. 注册自定义转场特效
registerTransition({
  value: 'CustomTransition',
  label: 'My Custom Transition',
  data: {
    name: 'My Custom Transition',
    controller_key: 'transition_key_custom',
    transition_duration_ts: 15,
    path: '/glsl/video/transition/custom.glsl',
    uniforms: []
  }
})

// 4. 查看所有可用资源
console.log('Total fonts:', fontMap.length)
console.log('Total transitions:', transitionMap.length)

// 5. 创建应用
const app = createApp(App)
app.mount('#app')
```

## 注意事项

### 1. 注册时机

- 必须在使用组件前注册
- 建议在 `main.ts` 中配置
- 字体可以随时注册
- 转场特效如果在 WASM 初始化后注册，会自动加载资源

### 2. 唯一性检查

- 如果注册的 `value` 已存在，会在控制台输出警告并跳过
- 不会覆盖已有的资源

### 3. 资源路径

- 路径会自动与 `configAssetPath` 配置的 `basePath` 拼接
- 确保资源文件可访问（注意 CORS）

### 4. GLSL Shader 要求

自定义转场特效的 GLSL shader 必须符合以下规范：

```glsl
// 必须包含这些 uniform
uniform sampler2D from;  // 前一帧
uniform sampler2D to;    // 后一帧
uniform float progress;  // 进度 0.0 - 1.0

// 主函数
vec4 transition(vec2 uv) {
  // 你的转场逻辑
  vec4 fromColor = texture2D(from, uv);
  vec4 toColor = texture2D(to, uv);
  return mix(fromColor, toColor, progress);
}
```

### 5. 字体文件格式

- 支持 `.ttf` 格式
- 确保字体文件大小合理（建议 < 5MB）
- 中文字体通常较大，考虑使用字体子集化

## 动态加载示例

如果需要根据用户选择动态加载资源：

```typescript
import { registerFont, registerTransition } from 'your-package-name'

// 从服务器获取自定义资源配置
async function loadCustomAssets() {
  const response = await fetch('/api/custom-assets')
  const { fonts, transitions } = await response.json()

  // 注册字体
  fonts.forEach(font => registerFont(font))

  // 注册转场特效
  transitions.forEach(transition => registerTransition(transition))
}

// 在应用启动时加载
loadCustomAssets().then(() => {
  console.log('Custom assets loaded')
})
```

## 故障排查

### 自定义字体不显示

1. 检查字体文件路径是否正确
2. 确认 `basePath` 配置正确
3. 查看浏览器网络请求，确认字体文件加载成功
4. 检查字体文件格式是否为 `.ttf`

### 自定义转场特效不生效

1. 检查 GLSL 文件路径是否正确
2. 确认 shader 代码符合规范
3. 查看浏览器控制台是否有 WebGL 错误
4. 确认 `controller_key` 唯一且符合命名规范
