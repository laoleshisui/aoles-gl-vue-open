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
    <!-- 文本振动源 -->
    <g class="text-source">
      <line x1="6" y1="8" x2="8" y2="8" class="stroke-blue-500"/>
      <line x1="6" y1="9.5" x2="7.5" y2="9.5" class="stroke-blue-500"/>
      <line x1="6" y1="11" x2="7" y2="11" class="stroke-blue-500"/>
    </g>
    
    <!-- AI共振核心 -->
    <circle cx="12" cy="12" r="2" class="stroke-purple-500 fill-none">
      <animate attributeName="r" values="2;2.3;2" dur="1.2s" repeatCount="indefinite"/>
    </circle>
    
    <!-- 声波涌现（从核心向外辐射） -->
    <g class="sound-waves">
      <!-- 声波环1 -->
      <circle cx="12" cy="12" r="3.5" class="stroke-green-400 fill-none opacity-40">
        <animate attributeName="r" values="3.5;4.5;3.5" dur="1.8s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.4;0;0.4" dur="1.8s" repeatCount="indefinite"/>
      </circle>
      
      <!-- 声波环2 -->
      <circle cx="12" cy="12" r="5" class="stroke-green-500 fill-none opacity-30">
        <animate attributeName="r" values="5;6;5" dur="2.2s" repeatCount="indefinite" begin="0.3s"/>
        <animate attributeName="opacity" values="0.3;0;0.3" dur="2.2s" repeatCount="indefinite" begin="0.3s"/>
      </circle>
      
      <!-- 声波环3 -->
      <circle cx="12" cy="12" r="6.5" class="stroke-green-600 fill-none opacity-20">
        <animate attributeName="r" values="6.5;7.5;6.5" dur="2.6s" repeatCount="indefinite" begin="0.6s"/>
        <animate attributeName="opacity" values="0.2;0;0.2" dur="2.6s" repeatCount="indefinite" begin="0.6s"/>
      </circle>
    </g>
    
    <!-- 频率调制点 -->
    <circle cx="12" cy="10" r="0.6" class="fill-purple-400">
      <animate attributeName="cy" values="10;11;12;11;10" dur="1.5s" repeatCount="indefinite"/>
    </circle>
    
    <circle cx="11" cy="13" r="0.5" class="fill-purple-500">
      <animate attributeName="cy" values="13;12;13;14;13" dur="1.2s" repeatCount="indefinite" begin="0.4s"/>
    </circle>
    
    <circle cx="13" cy="14" r="0.4" class="fill-purple-600">
      <animate attributeName="cy" values="14;13;12;13;14" dur="1s" repeatCount="indefinite" begin="0.8s"/>
    </circle>
    
    <!-- 文本到声波的转换流 -->
    <path d="M8,10 C9,10.5 10,11 11,11.5" class="stroke-blue-400 fill-none opacity-60">
      <animate attributeName="stroke-dasharray" values="1,2;2,1;1,2" dur="1.5s" repeatCount="indefinite"/>
    </path>
    
    <!-- 声波特征点（振幅变化） -->
    <circle cx="16" cy="9" r="0.4" class="fill-green-400">
      <animate attributeName="r" values="0.4;0.7;0.4" dur="1s" repeatCount="indefinite"/>
    </circle>
    
    <circle cx="17" cy="12" r="0.5" class="fill-green-500">
      <animate attributeName="r" values="0.5;0.8;0.5" dur="0.8s" repeatCount="indefinite" begin="0.3s"/>
    </circle>
    
    <circle cx="16" cy="15" r="0.3" class="fill-green-600">
      <animate attributeName="r" values="0.3;0.6;0.3" dur="1.2s" repeatCount="indefinite" begin="0.6s"/>
    </circle>
  </svg>
</template>

<script setup>
// AI文字生成语音SVG图标
// 表现文本通过AI共振转化为声波的概念
</script>