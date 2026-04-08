# 资源路径配置指南

## 概述

本库使用了字体文件（fonts）和 GLSL shader 文件（glsl）等静态资源。为了让使用者能够灵活配置资源路径，我们提供了 `configAssetPath` 配置函数。

## 快速开始

### 1. 安装包后配置资源路径

```typescript
import { configAssetPath } from 'your-package-name'

// 开发环境：使用本地路径
configAssetPath({ 
  basePath: '/' 
})

// 生产环境：使用 CDN
configAssetPath({ 
  basePath: 'https://cdn.example.com/assets/' 
})
```

### 2. 在 Vue 应用中配置

```typescript
// main.ts
import { createApp } from 'vue'
import { configAssetPath } from 'your-package-name'
import App from './App.vue'

// 在创建应用前配置资源路径
configAssetPath({
  basePath: import.meta.env.VITE_ASSET_BASE_PATH || '/'
})

const app = createApp(App)
app.mount('#app')
```

## API 文档

### `configAssetPath(config: Partial<AssetConfig>)`

配置资源路径。

**参数：**

```typescript
interface AssetConfig {
  /** 资源基础路径，例如: '/' 或 'https://cdn.example.com/assets/' */
  basePath: string
  /** 字体文件目录，相对于 basePath */
  fontDir: string
  /** GLSL shader 文件目录，相对于 basePath */
  glslDir: string
}
```

**示例：**

```typescript
// 最简配置：只设置基础路径
configAssetPath({ 
  basePath: 'https://oss.example.com/pixoclip/' 
})

// 完整配置：自定义所有路径
configAssetPath({
  basePath: 'https://cdn.example.com/',
  fontDir: 'custom-fonts',
  glslDir: 'custom-shaders/transitions'
})
```

## 资源文件结构

确保你的资源文件按以下结构部署：

```
basePath/
├── fonts/
│   ├── NotoSansSC-Regular.ttf
│   ├── qiji.ttf
│   ├── LongCang-Regular.ttf
│   └── ... (其他字体文件)
└── glsl/
    └── video/
        └── transition/
            ├── book_flip.glsl
            ├── cube.glsl
            ├── ButterflyWaveScrawler.glsl
            └── ... (其他 shader 文件)
```

## 使用场景

### 场景 1：本地开发

```typescript
configAssetPath({ basePath: '/' })
```

资源文件放在 `public/` 目录下：
```
public/
├── fonts/
└── glsl/
```

### 场景 2：使用 CDN

```typescript
configAssetPath({ 
  basePath: 'https://cdn.jsdelivr.net/npm/your-package@1.0.0/dist/' 
})
```

### 场景 3：使用 OSS（对象存储）

```typescript
configAssetPath({ 
  basePath: 'https://oss.pixoclip.com/pixoclip/' 
})
```

### 场景 4：环境变量配置

```typescript
// .env.development
VITE_ASSET_BASE_PATH=/

// .env.production
VITE_ASSET_BASE_PATH=https://cdn.example.com/assets/

// main.ts
configAssetPath({
  basePath: import.meta.env.VITE_ASSET_BASE_PATH
})
```

## 注意事项

1. **必须在使用组件前配置**：确保在导入和使用任何组件之前调用 `configAssetPath`
2. **路径末尾的斜杠**：`basePath` 可以带或不带末尾斜杠，系统会自动处理
3. **资源文件必须可访问**：确保配置的路径下的资源文件可以被浏览器访问（注意 CORS 配置）
4. **默认值**：如果不调用 `configAssetPath`，默认使用 `basePath: '/'`

## 迁移指南

如果你之前使用的是内部的 `VITE_ASSERT_BASEPATH` 环境变量，现在需要：

1. 移除对 `VITE_ASSERT_BASEPATH` 的依赖
2. 使用 `configAssetPath` 函数配置路径
3. 确保资源文件部署到正确的位置

**之前：**
```typescript
// .env
VITE_ASSERT_BASEPATH=https://cdn.example.com/
```

**现在：**
```typescript
// main.ts
import { configAssetPath } from 'your-package-name'

configAssetPath({ 
  basePath: 'https://cdn.example.com/' 
})
```

## 故障排查

### 资源加载失败

1. 检查浏览器控制台的网络请求，确认资源 URL 是否正确
2. 确认资源文件确实存在于配置的路径下
3. 检查 CORS 配置（如果使用跨域 CDN）

### 字体不显示

1. 确认字体文件路径正确
2. 检查字体文件格式是否支持（.ttf）
3. 查看控制台是否有字体加载错误

### Shader 效果不生效

1. 确认 GLSL 文件路径正确
2. 检查 GLSL 文件内容是否完整
3. 查看控制台是否有 WebGL 相关错误
