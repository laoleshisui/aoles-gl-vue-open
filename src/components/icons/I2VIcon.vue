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
    <!-- 静态图像源 -->
    <rect x="4" y="6" width="5" height="4" class="stroke-blue-500 fill-none" rx="0.5"/>
    <line x1="4" y1="8" x2="9" y2="8" class="stroke-blue-400"/>
    <line x1="6.5" y1="6" x2="6.5" y2="10" class="stroke-blue-400"/>
    
    <!-- AI时空引擎 -->
    <circle cx="12" cy="12" r="2.5" class="stroke-purple-600 fill-none">
      <animate attributeName="stroke-dasharray" values="1,8;8,1;1,8" dur="2s" repeatCount="indefinite"/>
    </circle>
    
    <!-- 时间粒子流 -->
    <circle cx="10" cy="10" r="0.5" class="fill-purple-500">
      <animate attributeName="cx" values="10;14;10" dur="2.5s" repeatCount="indefinite"/>
      <animate attributeName="cy" values="10;14;10" dur="2.5s" repeatCount="indefinite"/>
    </circle>
    
    <circle cx="11" cy="11" r="0.4" class="fill-purple-400">
      <animate attributeName="cx" values="11;15;11" dur="2s" repeatCount="indefinite" begin="0.3s"/>
      <animate attributeName="cy" values="11;13;11" dur="2s" repeatCount="indefinite" begin="0.3s"/>
    </circle>
    
    <!-- 动态视频帧序列 -->
    <g class="video-sequence">
      <!-- 帧1（起始状态） -->
      <rect x="16" y="6" width="3" height="2" class="stroke-green-500 fill-none" rx="0.3">
        <animate attributeName="y" values="6;8;10;12;14;6" dur="3s" repeatCount="indefinite"/>
      </rect>
      
      <!-- 帧2（中间状态） -->
      <rect x="16" y="10" width="3" height="2" class="stroke-green-600 fill-none" rx="0.3">
        <animate attributeName="y" values="10;12;14;6;8;10" dur="3s" repeatCount="indefinite" begin="1s"/>
      </rect>
      
      <!-- 帧3（结束状态） -->
      <rect x="16" y="14" width="3" height="2" class="stroke-green-700 fill-none" rx="0.3">
        <animate attributeName="y" values="14;6;8;10;12;14" dur="3s" repeatCount="indefinite" begin="2s"/>
      </rect>
    </g>
    
    <!-- 图像到时间的转换流 -->
    <path d="M9,8 C10,9 11,10 12,11" class="stroke-blue-400 fill-none opacity-60">
      <animate attributeName="stroke-dasharray" values="1,3;3,1;1,3" dur="1.8s" repeatCount="indefinite"/>
    </path>
    
    <!-- 时空扭曲场 -->
    <path d="M10,14 Q12,12 14,14" class="stroke-purple-400 fill-none opacity-40">
      <animate attributeName="d" values="M10,14 Q12,12 14,14;M10,14 Q12,13 14,14;M10,14 Q12,12 14,14" dur="1.5s" repeatCount="indefinite"/>
    </path>
    
    <!-- 运动轨迹提示 -->
    <path d="M13,9 C14,10 15,11 16,12" class="stroke-yellow-400 fill-none opacity-50">
      <animate attributeName="stroke-dashoffset" values="0;10;0" dur="2s" repeatCount="indefinite"/>
    </path>
    
    <!-- 动态特征点 -->
    <circle cx="14" cy="8" r="0.6" class="fill-green-500">
      <animate attributeName="cx" values="14;15;16;14" dur="2s" repeatCount="indefinite"/>
    </circle>
    
    <circle cx="15" cy="16" r="0.5" class="fill-green-400">
      <animate attributeName="cy" values="16;15;14;16" dur="1.8s" repeatCount="indefinite" begin="0.5s"/>
    </circle>
  </svg>
</template>

<script setup>
// AI图生成视频SVG图标
// 表现静态图像通过AI时空引擎转化为动态视频的概念
</script>