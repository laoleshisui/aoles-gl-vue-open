import { ref, watchEffect } from 'vue';
import { defineStore } from 'pinia';

const timeRanges: Array<[start: number, end: number, theme: string]> = [
  [0, 5, 'dark'],
  [5, 7, 'dark'],
  [7, 12, 'light'],
  [12, 14, 'light'],
  [14, 18, 'light'],
  [18, 21, 'dark'],
  [21, 24, 'dark'],
];

const autoTheme = ()=>{
  const currentHour = new Date().getHours();
  const theme = timeRanges.find(([s, e]) => currentHour >= s && currentHour < e)?.[2] || 'dark';
  return theme
}

/**
 * localStorage.theme:
 * 0: light
 * 1: dark
 * 
 */

export const usePageState = defineStore('pageState', () => {
  // 暗色模式
  const isDark = ref(localStorage.theme ? localStorage.theme === 'dark' : autoTheme());
  console.log('🚀 ~ usePageState ~ isDark:', isDark);
  const isLoading = ref(localStorage.loadingPage === '1');
  const hideSubMenu = ref(localStorage.showSubmenu === '0');
  watchEffect(() => {
    console.log(`switch to ${isDark.value ? 'dark' : 'light'}`);
    localStorage.theme = isDark.value ? 'dark' : 'light';
    localStorage.loadingPage = isLoading.value ? '1' : '0';
    localStorage.hideSubMenu = hideSubMenu.value ? '1' : '0';
    document.documentElement.classList[isDark.value ? 'add' : 'remove']('dark');
  });

  const headerProgress = ref(0);

  // 属性宽度
  const attrWidth = ref(parseInt(localStorage.attrW || '400'));
  // 轨道高度
  const trackHeight = ref(parseInt(localStorage.trackH || '380'));
  watchEffect(() => {
    localStorage.attrW = attrWidth.value;
    localStorage.trackH = trackHeight.value;
  });

  const selectedMenuItem = ref(null);

  // WASM 资源路径配置，消费者通过 store 设置
  const wasmConfig = ref({
    jsPath: '',
    wasmPath: '',
  });

  // 视频生成回调函数，消费者可以自定义
  const generateCallback = ref<((controllerJson: any) => Promise<void>) | null>(null);

  return {
    hideSubMenu,
    selectedMenuItem,
    isLoading,
    isDark,
    attrWidth,
    trackHeight,
    headerProgress,
    wasmConfig,
    generateCallback,
  };
});
