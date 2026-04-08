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
    <!-- 视频帧基底 -->
    <rect x="6" y="4" width="12" height="8" class="stroke-blue-400 fill-blue-50" rx="1" />
    
    <!-- 播放标识 -->
    <polygon points="11,6 13,7 11,8" class="fill-blue-600" />
    
    <!-- 字幕文件 -->
    <rect x="6" y="14" width="12" height="6" class="stroke-green-400 fill-green-50" rx="0.5" />
    
    <!-- 字幕文本 -->
    <line x1="8" y1="16" x2="14" y2="16" class="stroke-green-600" />
    <line x1="8" y1="18" x2="12" y2="18" class="stroke-green-600" />
    
    <!-- 添加按钮 -->
    <circle cx="19" cy="11" r="2" class="stroke-purple-500 fill-white" />
    <line x1="19" y1="9.5" x2="19" y2="12.5" class="stroke-purple-600" />
    <line x1="17.5" y1="11" x2="20.5" y2="11" class="stroke-purple-600" />
    
    <!-- 连接光束 -->
    <path d="M17,11 C15,12 13,13 11,14" class="stroke-purple-300 fill-none opacity-60">
      <animate attributeName="stroke-dasharray" values="1,3;3,1;1,3" dur="1.5s" repeatCount="indefinite" />
    </path>
    
    <!-- 动态字幕涌现 -->
    <g class="subtitle-emerging">
      <line x1="10" y1="19" x2="11" y2="19" class="stroke-green-500">
        <animate attributeName="x2" values="10;11;10" dur="0.8s" repeatCount="indefinite" />
      </line>
      <line x1="10" y1="19" x2="10.5" y2="19" class="stroke-green-400">
        <animate attributeName="x2" values="10;10.5;10" dur="0.6s" repeatCount="indefinite" begin="0.3s" />
      </line>
    </g>
    
    <!-- 数据粒子流 -->
    <circle cx="16" cy="12" r="0.4" class="fill-purple-400">
      <animate attributeName="cx" values="16;14;12;10" dur="1s" repeatCount="indefinite" />
    </circle>
    <circle cx="16.5" cy="11.5" r="0.3" class="fill-purple-300">
      <animate attributeName="cx" values="16.5;14.5;12.5;10.5" dur="0.8s" repeatCount="indefinite" begin="0.2s" />
    </circle>
    
    <!-- 同步指示器 -->
    <circle cx="12" cy="11" r="0.8" class="stroke-purple-200 fill-none opacity-40">
      <animate attributeName="r" values="0.8;1;0.8" dur="1.2s" repeatCount="indefinite" />
    </circle>
    
    <!-- 时间轴对齐 -->
    <line x1="6" y1="12" x2="18" y2="12" class="stroke-gray-300 opacity-40" />
    <line x1="6" y1="13" x2="18" y2="13" class="stroke-gray-300 opacity-40" />
  </svg>
</template>

<script setup>
// 添加字幕文件SVG图标
// 表现视频与字幕文件的关联添加操作
</script>