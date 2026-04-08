<template>
  <svg
    class="w-6 h-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <!-- 文本光标基底 -->
    <rect x="6" y="8" width="12" height="8" class="stroke-gray-200 fill-none" rx="1" />
    
    <!-- 已有文字内容 -->
    <line x1="8" y1="11" x2="14" y2="11" class="stroke-gray-400" />
    <line x1="8" y1="13" x2="12" y2="13" class="stroke-gray-400" />
    
    <!-- 动态光标 -->
    <line x1="12" y1="8" x2="12" y2="16" class="stroke-blue-500">
      <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
    </line>
    
    <!-- 添加按钮（融合设计） -->
    <circle cx="19" cy="12" r="1.8" class="stroke-blue-500 fill-blue-50" />
    <line x1="19" y1="10.5" x2="19" y2="13.5" class="stroke-blue-600" />
    <line x1="17.5" y1="12" x2="20.5" y2="12" class="stroke-blue-600" />
    
    <!-- 文字注入粒子 -->
    <circle cx="18" cy="12" r="0.4" class="fill-blue-400">
      <animate attributeName="cx" values="18;16;14;12" dur="0.8s" repeatCount="indefinite" />
    </circle>
    <circle cx="18.5" cy="12" r="0.3" class="fill-blue-300">
      <animate attributeName="cx" values="18.5;16.5;14.5;12.5" dur="0.6s" repeatCount="indefinite" begin="0.2s" />
    </circle>
    
    <!-- 新生文字（打字机效果） -->
    <line x1="12" y1="15" x2="13" y2="15" class="stroke-green-600">
      <animate attributeName="x2" values="12;13;12" dur="0.6s" repeatCount="indefinite" />
    </line>
    <line x1="12" y1="15" x2="12.5" y2="15" class="stroke-green-500">
      <animate attributeName="x2" values="12;12.5;12" dur="0.4s" repeatCount="indefinite" begin="0.3s" />
    </line>
    
    <!-- 连接轨迹 -->
    <path d="M17.5,12 C16,12 14,12 12,12" class="stroke-blue-200 fill-none opacity-40">
      <animate attributeName="stroke-dashoffset" values="0;10;0" dur="1.2s" repeatCount="indefinite" />
    </path>
  </svg>
</template>

<script setup>
// 全新设计：添加文字片段SVG图标
// 采用光标+打字机概念，更符合文字编辑场景
</script>