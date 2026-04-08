// i18n.js
import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import zh from '@/locales/zh.json'

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: localStorage.getItem('lang') || 'zh', // 优先从本地存储读取
  fallbackLocale: 'en',          // 备用语言
  messages: { en, zh }           // 语言包
})

export default i18n;