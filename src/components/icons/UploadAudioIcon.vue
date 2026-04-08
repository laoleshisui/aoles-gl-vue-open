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
    <!-- 本地文件轮廓 -->
    <path d="M6,4 L6,16 L14,16 L18,12 L18,4 L6,4 Z" class="stroke-blue-400 fill-blue-50" />
    
    <!-- 文件折叠角 -->
    <path d="M14,16 L14,12 L18,12" class="stroke-blue-400 fill-none" />
    
    <!-- 音频标识（声波符号） -->
    <path d="M9,8 L9,12 M11,7 L11,13 M13,8 L13,12" class="stroke-purple-500" />
    <circle cx="15" cy="10" r="1.5" class="stroke-purple-500 fill-none" />
    
    <!-- 上传箭头 -->
    <path d="M12,18 L12,22" class="stroke-gray-500" />
    <path d="M9,20 L12,17 L15,20" class="stroke-gray-500 fill-none" />
    
    <!-- 动态上传效果 -->
    <circle cx="12" cy="20" r="1.5" class="stroke-blue-500 fill-none">
      <animate attributeName="r" values="1.5;2;1.5" dur="1.5s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="1;0.7;1" dur="1.5s" repeatCount="indefinite" />
    </circle>
    
    <!-- 声波上传效果 -->
    <circle cx="12" cy="20" r="2.5" class="stroke-purple-300 fill-none opacity-40">
      <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
    </circle>
    
    <!-- 数据流动效果 -->
    <path d="M12,16 L12,18" class="stroke-blue-300">
      <animate attributeName="stroke-dasharray" values="2,1;1,2;2,1" dur="1.2s" repeatCount="indefinite" />
    </path>
    
    <!-- 音频脉冲效果 -->
    <g class="audio-pulse">
      <path d="M9,8 L9,12" class="stroke-purple-500">
        <animate attributeName="d" values="M9,8 L9,12;M9,7 L9,13;M9,8 L9,12" dur="1s" repeatCount="indefinite" />
      </path>
      <path d="M11,7 L11,13" class="stroke-purple-500">
        <animate attributeName="d" values="M11,7 L11,13;M11,6 L11,14;M11,7 L11,13" dur="0.8s" repeatCount="indefinite" begin="0.2s" />
      </path>
      <path d="M13,8 L13,12" class="stroke-purple-500">
        <animate attributeName="d" values="M13,8 L13,12;M13,7 L13,13;M13,8 L13,12" dur="1.2s" repeatCount="indefinite" begin="0.4s" />
      </path>
    </g>
    
    <!-- 文件阴影效果 -->
    <path d="M7,5 L7,17 L15,17 L19,13 L19,5 L7,5 Z" class="stroke-gray-300 fill-none opacity-30" />
  </svg>
</template>

<script setup>
// 上传本地音频文件SVG图标
// 结合文件图标、音频标识和上传动作
</script>