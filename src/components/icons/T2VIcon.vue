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
    <!-- 时间维度轴 -->
    <line x1="6" y1="18" x2="18" y2="18" class="stroke-gray-400"/>
    
    <!-- 文本输入维度 -->
    <g transform="translate(0, -2)">
      <line x1="5" y1="5" x2="7" y2="5" class="stroke-blue-500"/>
      <line x1="5" y1="6.5" x2="6.5" y2="6.5" class="stroke-blue-500"/>
      <line x1="5" y1="8" x2="6" y2="8" class="stroke-blue-500"/>
    </g>
    
    <!-- AI意识场（时空扭曲场） -->
    <path d="M10,10 C12,8 16,8 18,10" class="stroke-purple-500 fill-none opacity-60"/>
    <path d="M10,14 C12,16 16,16 18,14" class="stroke-purple-500 fill-none opacity-60"/>
    
    <!-- 时间粒子流 -->
    <circle cx="9" cy="12" r="0.4" class="fill-purple-400">
      <animate attributeName="cx" values="9;15;9" dur="3s" repeatCount="indefinite"/>
    </circle>
    <circle cx="11" cy="11" r="0.3" class="fill-purple-400">
      <animate attributeName="cx" values="11;17;11" dur="2.5s" repeatCount="indefinite" begin="0.5s"/>
    </circle>
    
    <!-- 视频帧序列涌现 -->
    <g class="video-frames">
      <!-- 帧1 -->
      <rect x="12" y="6" width="2" height="1.5" class="stroke-green-400 fill-none" rx="0.3">
        <animate attributeName="y" values="6;8;10;12;14;6" dur="4s" repeatCount="indefinite"/>
      </rect>
      
      <!-- 帧2 -->
      <rect x="14" y="8" width="2" height="1.5" class="stroke-green-500 fill-none" rx="0.3">
        <animate attributeName="y" values="8;10;12;14;6;8" dur="4s" repeatCount="indefinite" begin="0.8s"/>
      </rect>
      
      <!-- 帧3 -->
      <rect x="16" y="10" width="2" height="1.5" class="stroke-green-600 fill-none" rx="0.3">
        <animate attributeName="y" values="10;12;14;6;8;10" dur="4s" repeatCount="indefinite" begin="1.6s"/>
      </rect>
    </g>
    
    <!-- 创造性时间扭曲 -->
    <path d="M8,12 Q10,9 12,10 Q14,11 16,10" class="stroke-yellow-400 fill-none opacity-60">
      <animate attributeName="d" values="M8,12 Q10,9 12,10 Q14,11 16,10;M8,12 Q10,11 12,10 Q14,9 16,10;M8,12 Q10,9 12,10 Q14,11 16,10" dur="2s" repeatCount="indefinite"/>
    </path>
    
    <!-- AI核心（时空生成器） -->
    <circle cx="12" cy="12" r="1.2" class="stroke-purple-600 fill-none">
      <animate attributeName="r" values="1.2;1.5;1.2" dur="1.8s" repeatCount="indefinite"/>
    </circle>
    
    <!-- 文本到时间的转换流 -->
    <path d="M6,7 C7,8 8,9 9,10" class="stroke-blue-400 fill-none opacity-50">
      <animate attributeName="stroke-dasharray" values="1,2;2,1;1,2" dur="1.5s" repeatCount="indefinite"/>
    </path>
  </svg>
</template>

<script setup>
// AI文字生成视频SVG图标
// 表现文本在时间维度上的AI驱动演化
</script>