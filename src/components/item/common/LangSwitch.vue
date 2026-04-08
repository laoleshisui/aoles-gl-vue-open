<template>
<div class="relative group hidden sm:block">
  <button class="flex items-center gap-1.5 text-sm font-medium hover:text-blue-500 transition-colors">
    <!-- SVG 使用 currentColor，会跟随父级文字颜色平滑过渡 -->
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
    <span>{{ locale === 'zh' ? 'CN' : 'EN' }}</span>
  </button>
  
  <!-- Dropdown (Style unchanged) -->
  <div class="absolute right-0 top-full pt-4 w-28 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right">
      <div class="bg-white/90 backdrop-blur-xl rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden">
        <div @click="setLang('en')" class="px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm cursor-pointer flex justify-between">
            English <span v-if="locale === 'en'" class="text-blue-500">✓</span>
        </div>
        <div @click="setLang('zh')" class="px-4 py-2 hover:bg-gray-50 text-gray-700 text-sm cursor-pointer flex justify-between">
            简体中文 <span v-if="locale === 'zh'" class="text-blue-500">✓</span>
        </div>
      </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

const setLang = (lang) => {
  locale.value = lang;
};
</script>