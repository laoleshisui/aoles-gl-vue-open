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
    <!-- 文件轮廓 -->
    <path d="M6,4 L6,16 L14,16 L18,12 L18,4 L6,4 Z" class="stroke-blue-400 fill-blue-50" />
    <path d="M14,16 L14,12 L18,12" class="stroke-blue-400 fill-none" />
    
    <!-- 字体标识（字母A） -->
    <path d="M9,12 L11,8 L13,12 M10,10 L12,10" class="stroke-purple-600 fill-none" />
    
    <!-- 上传箭头 -->
    <path d="M12,18 L12,22" class="stroke-gray-500" />
    <path d="M9,20 L12,17 L15,20" class="stroke-gray-500 fill-none" />
    
    <!-- 动态上传效果 -->
    <circle cx="12" cy="20" r="1.5" class="stroke-blue-500 fill-none">
      <animate attributeName="r" values="1.5;2;1.5" dur="1.5s" repeatCount="indefinite" />
    </circle>
    
    <!-- 字体特征流动 -->
    <g class="font-features-flow">
      <path d="M10,14 L10,16" class="stroke-purple-400">
        <animate attributeName="d" values="M10,14 L10,16;M10,13.5 L10,16.5;M10,14 L10,16" dur="1s" repeatCount="indefinite" />
      </path>
      <path d="M12,14 L12,15" class="stroke-purple-500">
        <animate attributeName="d" values="M12,14 L12,15;M12,13.5 L12,15.5;M12,14 L12,15" dur="0.8s" repeatCount="indefinite" begin="0.2s" />
      </path>
      <path d="M14,14 L14,16" class="stroke-purple-300">
        <animate attributeName="d" values="M14,14 L14,16;M14,13.5 L14,16.5;M14,14 L14,16" dur="1.2s" repeatCount="indefinite" begin="0.4s" />
      </path>
    </g>
    
    <!-- 数据流动效果 -->
    <path d="M12,16 L12,18" class="stroke-blue-300">
      <animate attributeName="stroke-dasharray" values="2,1;1,2;2,1" dur="1.2s" repeatCount="indefinite" />
    </path>
    
    <!-- 字体特征点 -->
    <circle cx="11" cy="9" r="0.4" class="fill-purple-500">
      <animate attributeName="r" values="0.4;0.6;0.4" dur="0.8s" repeatCount="indefinite" />
    </circle>
    
    <!-- 文件阴影 -->
    <path d="M7,5 L7,17 L15,17 L19,13 L19,5 L7,5 Z" class="stroke-gray-300 fill-none opacity-30" />
  </svg>
</template>

<script setup>
// 上传字体文件SVG图标
// 结合文件图标、字体标识和上传动作
</script>