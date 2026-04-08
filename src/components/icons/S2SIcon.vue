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
    <rect x="6" y="6" width="12" height="8" class="stroke-blue-400 fill-none" rx="0.8"/>
    
    <!-- 视频内容（抽象动态） -->
    <circle cx="12" cy="10" r="2" class="stroke-blue-300 fill-none">
      <animate attributeName="r" values="2;2.3;2" dur="1.5s" repeatCount="indefinite"/>
    </circle>
    
    <!-- AI识别光束 -->
    <g class="recognition-beams">
      <line x1="8" y1="8" x2="10" y2="8" class="stroke-purple-500">
        <animate attributeName="x2" values="10;12;10" dur="1.2s" repeatCount="indefinite"/>
      </line>
      <line x1="8" y1="10" x2="11" y2="10" class="stroke-purple-500">
        <animate attributeName="x2" values="11;13;11" dur="1s" repeatCount="indefinite" begin="0.2s"/>
      </line>
      <line x1="8" y1="12" x2="9" y2="12" class="stroke-purple-500">
        <animate attributeName="x2" values="9;11;9" dur="1.4s" repeatCount="indefinite" begin="0.4s"/>
      </line>
    </g>
    
    <!-- 字幕文本涌现 -->
    <g class="subtitles-emerging">
      <!-- 字幕行1 -->
      <rect x="10" y="16" width="8" height="1.2" class="fill-green-400 stroke-green-600" rx="0.3">
        <animate attributeName="opacity" values="0;1;1;0" dur="2s" repeatCount="indefinite"/>
      </rect>
      
      <!-- 字幕行2 -->
      <rect x="9" y="18" width="6" height="1.2" class="fill-green-500 stroke-green-700" rx="0.3">
        <animate attributeName="opacity" values="0;0;1;1;0" dur="2s" repeatCount="indefinite" begin="0.5s"/>
      </rect>
    </g>
    
    <!-- AI识别核心 -->
    <circle cx="18" cy="10" r="1.2" class="stroke-purple-600 fill-none">
      <animate attributeName="stroke-width" values="1.5;2;1.5" dur="1.8s" repeatCount="indefinite"/>
    </circle>
    
    <!-- 文字识别点 -->
    <circle cx="16" cy="9" r="0.5" class="fill-purple-500">
      <animate attributeName="r" values="0.5;0.7;0.5" dur="1s" repeatCount="indefinite"/>
    </circle>
    
    <circle cx="17" cy="11" r="0.4" class="fill-purple-400">
      <animate attributeName="r" values="0.4;0.6;0.4" dur="0.8s" repeatCount="indefinite" begin="0.3s"/>
    </circle>
    
    <!-- 识别数据流 -->
    <path d="M12,12 C14,13 16,14 18,14" class="stroke-purple-400 fill-none opacity-50">
      <animate attributeName="stroke-dasharray" values="1,2;2,1;1,2" dur="1.5s" repeatCount="indefinite"/>
    </path>
    
    <!-- 实时处理指示 -->
    <circle cx="20" cy="8" r="0.6" class="fill-green-500">
      <animate attributeName="opacity" values="1;0.3;1" dur="0.6s" repeatCount="indefinite"/>
    </circle>
  </svg>
</template>

<script setup>
// AI字幕识别SVG图标
// 表现AI实时识别视频内容并生成字幕的过程
</script>