import './assets/main.css';  // 这行必须在最前面！

// 1. 如果你下面不用 Editor，上面就注释掉；如果下面要用，上面必须放开注释！
// import Editor from './pages/views/Editor.vue'
import HeaderContainer from './components/container/HeaderContainer.vue'
import ResourcesContainer from './components/container/ResourcesContainer.vue'
import ControllerPreview from './components/container/ControllerPreview.vue'
import AttributeContainer from './components/container/AttributeContainer.vue'
import TrackContainer from './components/container/TrackContainer.vue'
import GlobalConfigDialog from './components/container/GlobalConfigDialog.vue'



export { HeaderContainer, ResourcesContainer, ControllerPreview, AttributeContainer, TrackContainer, GlobalConfigDialog }

// 导出 stores，方便消费者配置（如 wasmConfig）
export { usePageState } from './stores/pageState'
export { useTrackState } from './stores/trackState'
export { usePreviewState } from './stores/previewState'

import { processPaths, extractFileExtension } from '@/utils/common';
export { processPaths, extractFileExtension }

// 资源路径配置
export { configAssetPath } from './config/assetConfig'
export type { AssetConfig } from './config/assetConfig'

// 字体和特效注册
export { fontMap, registerFont, registerFonts } from './utils/font'
export type { FontItem } from './utils/font'
export { transitionMap, registerTransition, registerTransitions } from './utils/effect'
export type { TransitionItem, TransitionUniform } from './utils/effect'

// 资源映射表（供外部编辑）
export { uniSourceMap } from './utils/uniSource'
export type { UniSource as UniSourceItem } from './utils/uniSource'

import trackPipeline from '@/pipeline/track'
export { trackPipeline } 

// 2. 引入你库内部的语言包
import zhDict from './locales/zh.json'
import enDict from './locales/en.json'

// 3. 导出一个辅助函数，方便外部应用一键合并语言包 (如果是 js 文件，去掉 : any)
export function setupAolesI18n(i18nInstance) {
  if (i18nInstance && i18nInstance.global) {
    i18nInstance.global.mergeLocaleMessage('zh-CN', zhDict)
    i18nInstance.global.mergeLocaleMessage('en', enDict)
  }
}

// (可选) 直接导出字典
export const aolesLocales = { zh: zhDict, en: enDict }

// Vue 插件安装逻辑 (可选)
export default {
  install(app:any) {
    app.component('HeaderContainer', HeaderContainer)
    app.component('ResourcesContainer', ResourcesContainer)
    app.component('ControllerPreview', ControllerPreview)
    app.component('AttributeContainer', AttributeContainer)
    app.component('TrackContainer', TrackContainer)
    app.component('GlobalConfigDialog', GlobalConfigDialog)
  }
}