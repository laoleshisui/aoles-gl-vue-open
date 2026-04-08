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
    
    <!-- 视频标识 -->
    <rect x="8" y="7" width="6" height="4" class="stroke-green-400 fill-green-50" rx="0.5" />
    <polygon points="11,8 13,9 11,10" class="fill-green-500" />
    
    <!-- 上传箭头 -->
    <path d="M12,18 L12,22" class="stroke-gray-500" />
    <path d="M9,20 L12,17 L15,20" class="stroke-gray-500 fill-none" />
    
    <!-- 动态上传效果 -->
    <circle cx="12" cy="20" r="1.5" class="stroke-blue-500 fill-none">
      <animate attributeName="r" values="1.5;2;1.5" dur="1.5s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="1;0.7;1" dur="1.5s" repeatCount="indefinite" />
    </circle>
    
    <!-- 数据流动效果 -->
    <path d="M12,16 L12,18" class="stroke-blue-300">
      <animate attributeName="stroke-dasharray" values="2,1;1,2;2,1" dur="1.2s" repeatCount="indefinite" />
    </path>
    
    <!-- 文件阴影效果 -->
    <path d="M7,5 L7,17 L15,17 L19,13 L19,5 L7,5 Z" class="stroke-gray-300 fill-none opacity-30" />
  </svg>
</template>

<script setup>
// 上传本地视频文件SVG图标
// 结合文件图标、视频标识和上传动作
</script>