<template>
  <div 
    class="group relative h-auto p-5 rounded-2xl cursor-pointer transition-all duration-500 overflow-hidden select-none border"
    :class="{
      /* 
         通用样式: 
         backdrop-blur-xl (背景模糊), backdrop-saturate (增加通透感)
      */
      'backdrop-blur-xl backdrop-saturate-150': true,

      /* 
         选中状态 (Tinted Glass - 染色玻璃): 
         背景: Indigo 色调，低透明度
         边框: 明显的 Indigo 亮边
         阴影: 带有颜色的辉光
      */
      'bg-indigo-500/10 dark:bg-indigo-500/20 border-indigo-500/50 ring-1 ring-indigo-500/30 shadow-[0_0_20px_0_rgba(99,102,241,0.15)]': selected,
      
      /* 
         未选中状态 (Frosted Glass - 磨砂玻璃):
         背景: 极低透明度的白色/Slate色
         边框: 经典的玻璃白边 (dark下更细微)
         阴影: 柔和的漂浮感
         Hover: 亮度提升
      */
      'bg-white/40 dark:bg-slate-900/40 border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-slate-800/40 hover:border-white/60 dark:hover:border-white/20 shadow-lg shadow-black/5 dark:shadow-black/20 hover:shadow-xl': !selected
    }"
    @click="emit('select', value)"
  >

    <!-- 1. 光泽层 (Sheen): 模拟光线扫过玻璃表面的质感 -->
    <div class="absolute inset-0 pointer-events-none z-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-50 dark:opacity-20"></div>

    <!-- 2. 噪点纹理层 (Noise): 增加物理材质感，防止玻璃太'塑料' -->
    <div class="absolute inset-0 opacity-[0.15] dark:opacity-[0.25] pointer-events-none z-0 mix-blend-overlay" 
         style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http%3A//www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url%28%23noiseFilter%29%22 opacity=%220.5%22/%3E%3C/svg%3E')">
    </div>

    <!-- 3. 顶部边缘棱镜高光 (Top Highlight): 模拟玻璃切面的厚度反光 -->
    <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/25 opacity-100"></div>
    <div class="absolute inset-0 pointer-events-none rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] z-30"></div>

    <!-- 背景装饰图 -->
    <img
      v-if="imageUrl"
      :src="imageUrl"
      alt=""
      class="absolute top-0 right-0 h-full w-3/4 object-cover 
             opacity-50 group-hover:opacity-80 
             pointer-events-none transition-all duration-700 
             mix-blend-overlay dark:mix-blend-color-dodge
             group-hover:scale-105"
      :style="imageMaskStyle"
    />

    <!-- 内容区域 -->
    <div class="relative flex items-center justify-between z-10 h-10 w-full">
      <div class="flex items-center gap-4 w-full">
        <!-- 文本信息 -->
        <div class="flex flex-col flex-1 min-w-0 justify-center h-full">
          <span 
            class="text-sm font-bold tracking-wide truncate transition-all duration-300"
            :class="selected ? 'text-indigo-900 dark:text-indigo-100 translate-x-1' : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1'"
            :style="{ textShadow: '0 1px 2px rgba(255,255,255,0.1)' }"
          >
            {{ label }}
          </span>
        </div>

        <!-- 选中状态指示灯 -->
        <div v-if="selected" class="relative flex items-center justify-center">
            <!-- 玻璃下的发光点 -->
            <div class="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_2px_rgba(99,102,241,0.8)] animate-pulse border border-white/50"></div>
        </div>
        
        <!-- 未选中时的箭头提示 -->
        <div v-else class="opacity-0 group-hover:opacity-60 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
           <svg class="w-4 h-4 text-slate-800 dark:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'

const props = defineProps({
  label: String,
  description: String,
  value: [String, Number, Object],
  selected: Boolean,
  iconComponent: Object as () => Component,
  imageUrl: String, 
})

const emit = defineEmits(['select'])

const imageMaskStyle = computed(() => {
  // 这会让图片左侧淡出，更好地融入玻璃
  const mask = 'linear-gradient(to left, black 0%, rgba(0,0,0,0.5) 50%, transparent 100%)';
  return {
    'mask-image': mask,
    '-webkit-mask-image': mask, 
  };
});
</script>

<style scoped>
/* 
  如果你的 tailwind 配置里没有 backdrop-blur 支持，或者浏览器兼容性需要 polyfill，
  可以在这里添加，但在现代浏览器和标准 Tailwind 设置下通常不需要。
*/
</style>