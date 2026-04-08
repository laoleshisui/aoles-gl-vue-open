# 资源配置重构总结

## 改动概述

将硬编码的 `VITE_ASSERT_BASEPATH` 环境变量重构为可配置的资源管理系统，使 npm 包使用者能够灵活配置资源路径并注册自定义资源。

## 新增功能

### 1. 资源路径配置

**新增文件：** `src/config/assetConfig.ts`

提供统一的资源路径管理：

```typescript
import { configAssetPath } from 'your-package-name'

// 配置资源基础路径
configAssetPath({
  basePath: 'https://cdn.example.com/assets/'
})
```

### 2. 自定义字体注册

```typescript
import { registerFont, registerFonts } from 'your-package-name'

// 注册单个字体
registerFont({
  value: 'CustomFont',
  label: 'FontMap.Label.CustomFont',
  data: { path: '/fonts/CustomFont.ttf' }
})

// 批量注册
registerFonts([...])
```

### 3. 自定义转场特效注册

```typescript
import { registerTransition, registerTransitions } from 'your-package-name'

// 注册单个特效
registerTransition({
  value: 'CustomTransition',
  label: 'TransitionMap.Label.CustomTransition',
  data: {
    name: 'CustomTransition',
    controller_key: 'transition_key_custom',
    transition_duration_ts: 15,
    path: '/glsl/video/transition/custom.glsl',
    uniforms: []
  }
})

// 批量注册
registerTransitions([...])
```

### 4. 访问内置资源列表

```typescript
import { fontMap, transitionMap } from 'your-package-name'

console.log('Available fonts:', fontMap)
console.log('Available transitions:', transitionMap)
```

## 修改的文件

### 核心文件

1. **src/config/assetConfig.ts** (新增)
   - `AssetConfigManager` 类
   - `configAssetPath()` 函数
   - `getAssetUrl()`, `getFontUrl()`, `getGlslUrl()` 方法

2. **src/utils/font.ts**
   - 添加 `FontItem` 类型定义
   - 添加 `registerFont()` 函数
   - 添加 `registerFonts()` 函数
   - 替换 `import.meta.env.VITE_ASSERT_BASEPATH` 为 `assetConfig.getFontUrl()`

3. **src/utils/effect.ts**
   - 添加 `TransitionItem` 和 `TransitionUniform` 类型定义
   - 添加 `registerTransition()` 函数
   - 添加 `registerTransitions()` 函数
   - 替换 `import.meta.env.VITE_ASSERT_BASEPATH` 为 `assetConfig.getGlslUrl()`

4. **src/stores/previewState.ts**
   - 替换 `import.meta.env.VITE_ASSERT_BASEPATH` 为 `assetConfig.getAssetUrl()`

5. **src/class/VideoTrack.ts**
   - 替换 `import.meta.env.VITE_ASSERT_BASEPATH` 为 `assetConfig.getGlslUrl()`

6. **src/index.ts**
   - 导出 `configAssetPath` 和 `AssetConfig` 类型
   - 导出 `fontMap`, `registerFont`, `registerFonts` 和 `FontItem` 类型
   - 导出 `transitionMap`, `registerTransition`, `registerTransitions` 和相关类型

### 文档文件

1. **ASSET_CONFIG.md** (新增) - 资源路径配置指南
2. **CUSTOM_ASSETS.md** (新增) - 自定义字体和特效注册指南
3. **examples/asset-config-example.ts** (新增) - 完整使用示例

## API 导出清单

### 配置相关

```typescript
export { configAssetPath } from './config/assetConfig'
export type { AssetConfig } from './config/assetConfig'
```

### 字体相关

```typescript
export { fontMap, registerFont, registerFonts } from './utils/font'
export type { FontItem } from './utils/font'
```

### 特效相关

```typescript
export { transitionMap, registerTransition, registerTransitions } from './utils/effect'
export type { TransitionItem, TransitionUniform } from './utils/effect'
```

## 使用示例

### 基础配置

```typescript
// main.ts
import { createApp } from 'vue'
import { configAssetPath } from 'your-package-name'
import App from './App.vue'

// 配置资源路径
configAssetPath({
  basePath: import.meta.env.PROD
    ? 'https://cdn.example.com/assets/'
    : '/'
})

const app = createApp(App)
app.mount('#app')
```

### 完整集成

```typescript
// main.ts
import { createApp } from 'vue'
import { 
  configAssetPath, 
  registerFont, 
  registerTransition 
} from 'your-package-name'
import App from './App.vue'

// 1. 配置资源路径
configAssetPath({
  basePath: 'https://cdn.example.com/assets/'
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

const app = createApp(App)
app.mount('#app')
```

## 向后兼容性

- 默认 `basePath` 为 `'/'`，不配置也能正常工作
- 内置字体和特效保持不变
- 环境变量 `VITE_ASSERT_BASEPATH` 已从代码中移除，但 `.env.*` 文件保留供参考

## 迁移指南

### 从旧版本迁移

**之前：**
```bash
# .env
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

## 优势

1. **灵活性**：使用者可以自由配置资源路径
2. **可扩展性**：支持注册自定义字体和特效
3. **类型安全**：完整的 TypeScript 类型定义
4. **易用性**：简单的 API，清晰的文档
5. **向后兼容**：默认配置保持原有行为

## 注意事项

1. **配置时机**：必须在使用组件前调用 `configAssetPath()`
2. **资源可访问性**：确保配置的路径下的资源文件可被浏览器访问
3. **CORS**：如果使用跨域 CDN，注意配置 CORS
4. **唯一性**：注册自定义资源时，`value` 必须唯一

## 测试建议

1. 测试默认配置（不调用 `configAssetPath`）
2. 测试自定义 CDN 路径
3. 测试注册自定义字体
4. 测试注册自定义转场特效
5. 测试重复注册（应该输出警告并跳过）

## 相关文档

- [ASSET_CONFIG.md](./ASSET_CONFIG.md) - 资源路径配置详细指南
- [CUSTOM_ASSETS.md](./CUSTOM_ASSETS.md) - 自定义资源注册详细指南
- [examples/asset-config-example.ts](./examples/asset-config-example.ts) - 完整代码示例
