/**
 * 资源路径配置示例
 *
 * 这个文件展示了如何在不同场景下配置资源路径和注册自定义资源
 */

import { configAssetPath, registerFont, registerFonts, registerTransition, registerTransitions } from '../src/index'

// ============================================
// 示例 1: 开发环境 - 使用本地路径
// ============================================
export function setupDevelopment() {
  configAssetPath({
    basePath: '/'
  })

  // 资源将从以下路径加载：
  // - 字体: /fonts/NotoSansSC-Regular.ttf
  // - Shader: /glsl/video/transition/book_flip.glsl
}

// ============================================
// 示例 2: 生产环境 - 使用 CDN
// ============================================
export function setupProduction() {
  configAssetPath({
    basePath: 'https://cdn.example.com/assets/'
  })

  // 资源将从以下路径加载：
  // - 字体: https://cdn.example.com/assets/fonts/NotoSansSC-Regular.ttf
  // - Shader: https://cdn.example.com/assets/glsl/video/transition/book_flip.glsl
}

// ============================================
// 示例 3: 使用 OSS（阿里云/腾讯云等）
// ============================================
export function setupOSS() {
  configAssetPath({
    basePath: 'https://oss.pixoclip.com/pixoclip/'
  })

  // 资源将从以下路径加载：
  // - 字体: https://oss.pixoclip.com/pixoclip/fonts/NotoSansSC-Regular.ttf
  // - Shader: https://oss.pixoclip.com/pixoclip/glsl/video/transition/book_flip.glsl
}

// ============================================
// 示例 4: 使用环境变量
// ============================================
export function setupWithEnv() {
  // 在 .env 文件中定义：
  // VITE_ASSET_BASE_PATH=https://cdn.example.com/

  configAssetPath({
    basePath: import.meta.env.VITE_ASSET_BASE_PATH || '/'
  })
}

// ============================================
// 示例 5: 自定义子目录结构
// ============================================
export function setupCustomStructure() {
  configAssetPath({
    basePath: 'https://cdn.example.com/',
    fontDir: 'custom-fonts',      // 自定义字体目录
    glslDir: 'custom-shaders'      // 自定义 shader 目录
  })

  // 注意：如果自定义了子目录，需要确保资源文件部署在对应位置
}

// ============================================
// 示例 6: 在 Vue 应用中使用
// ============================================
export function setupInVueApp() {
  // main.ts
  /*
  import { createApp } from 'vue'
  import { configAssetPath } from 'your-package-name'
  import App from './App.vue'

  // 在创建应用前配置
  configAssetPath({
    basePath: import.meta.env.PROD
      ? 'https://cdn.example.com/assets/'
      : '/'
  })

  const app = createApp(App)
  app.mount('#app')
  */
}

// ============================================
// 示例 7: 动态切换资源路径（不推荐）
// ============================================
export function setupDynamic() {
  // 虽然可以动态切换，但不推荐在运行时频繁更改
  // 因为已加载的资源不会重新加载

  const isDev = import.meta.env.DEV

  if (isDev) {
    configAssetPath({ basePath: '/' })
  } else {
    configAssetPath({ basePath: 'https://cdn.example.com/' })
  }
}

// ============================================
// 示例 8: 使用 jsDelivr CDN（npm 包）
// ============================================
export function setupJsDelivr() {
  // 如果你的包发布到 npm，可以使用 jsDelivr
  configAssetPath({
    basePath: 'https://cdn.jsdelivr.net/npm/your-package@1.0.0/dist/'
  })
}

// ============================================
// 示例 9: 使用 unpkg CDN（npm 包）
// ============================================
export function setupUnpkg() {
  configAssetPath({
    basePath: 'https://unpkg.com/your-package@1.0.0/dist/'
  })
}

// ============================================
// 示例 10: 多环境配置
// ============================================
export function setupMultiEnv() {
  const env = import.meta.env.MODE // 'development' | 'staging' | 'production'

  const assetPaths = {
    development: '/',
    staging: 'https://staging-cdn.example.com/assets/',
    production: 'https://cdn.example.com/assets/'
  }

  configAssetPath({
    basePath: assetPaths[env] || '/'
  })
}

// ============================================
// 示例 11: 注册自定义字体
// ============================================
export function setupCustomFont() {
  // 先配置资源路径
  configAssetPath({
    basePath: 'https://cdn.example.com/assets/'
  })

  // 注册单个自定义字体
  registerFont({
    value: 'Roboto',
    label: 'FontMap.Label.Roboto',
    data: { path: '/fonts/Roboto-Regular.ttf' }
  })

  // 批量注册多个字体
  registerFonts([
    {
      value: 'OpenSans',
      label: 'FontMap.Label.OpenSans',
      data: { path: '/fonts/OpenSans-Regular.ttf' }
    },
    {
      value: 'Lato',
      label: 'FontMap.Label.Lato',
      data: { path: '/fonts/Lato-Regular.ttf' }
    }
  ])
}

// ============================================
// 示例 12: 注册自定义转场特效
// ============================================
export function setupCustomTransition() {
  // 注册单个转场特效
  registerTransition({
    value: 'CustomFade',
    label: 'TransitionMap.Label.CustomFade',
    data: {
      name: 'TransitionMap.Label.CustomFade',
      controller_key: 'transition_key_custom_fade',
      transition_duration_ts: 15,
      path: '/glsl/video/transition/custom_fade.glsl',
      uniforms: []
    }
  })

  // 注册带参数的转场特效
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
}

// ============================================
// 示例 13: 完整集成示例
// ============================================
export function setupComplete() {
  // 1. 配置资源路径
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
  import { fontMap, transitionMap } from '../src/index'
  console.log('Total fonts:', fontMap.length)
  console.log('Total transitions:', transitionMap.length)
}

// ============================================
// 示例 14: 动态加载自定义资源
// ============================================
export async function setupDynamicAssets() {
  // 从服务器获取自定义资源配置
  const response = await fetch('/api/custom-assets')
  const { fonts, transitions } = await response.json()

  // 注册字体
  fonts.forEach(font => registerFont(font))

  // 注册转场特效
  transitions.forEach(transition => registerTransition(transition))

  console.log('Custom assets loaded')
}
