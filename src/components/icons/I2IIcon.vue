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
    <!-- 基础图像框架 -->
    <rect x="5" y="5" width="10" height="8" class="stroke-blue-400 fill-none" rx="0.8"/>
    
    <!-- 图像内容（抽象风景） -->
    <line x1="5" y1="8" x2="15" y2="8" class="stroke-green-400"/> <!-- 地平线 -->
    <circle cx="12" cy="6" r="1.2" class="stroke-yellow-400 fill-none"/> <!-- 太阳 -->
    <path d="M7,9 L8,10 L7,11" class="stroke-gray-500"/> <!-- 山丘 -->
    
    <!-- AI编辑光束（从外部注入智能） -->
    <path d="M17,8 C16,7 15,6.5 14,6" class="stroke-purple-500 fill-none">
      <animate attributeName="stroke-dasharray" values="1,3;3,1;1,3" dur="1.8s" repeatCount="indefinite"/>
    </path>
    
    <!-- 智能编辑点（动态效果） -->
    <g class="transform-origin-center">
      <!-- 色彩增强点 -->
      <circle cx="12" cy="7" r="0.6" class="fill-purple-500">
        <animate attributeName="r" values="0.6;0.9;0.6" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;0.7;1" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      
      <!-- 细节优化点 -->
      <circle cx="8" cy="9" r="0.5" class="fill-cyan-500">
        <animate attributeName="r" values="0.5;0.7;0.5" dur="1.2s" repeatCount="indefinite" begin="0.3s"/>
      </circle>
      
      <!-- 风格化点 -->
      <circle cx="10" cy="10" r="0.4" class="fill-pink-500">
        <animate attributeName="r" values="0.4;0.6;0.4" dur="1s" repeatCount="indefinite" begin="0.6s"/>
      </circle>
    </g>
    
    <!-- AI能量源（外部智能） -->
    <circle cx="18" cy="8" r="1.5" class="stroke-purple-500 fill-none">
      <animate attributeName="stroke-width" values="1.5;2;1.5" dur="2s" repeatCount="indefinite"/>
    </circle>
    
    <!-- 神经网络连接线 -->
    <path d="M18,8 C17.5,8.5 17,9 16.5,9.5" class="stroke-purple-300 fill-none opacity-60"/>
    <path d="M18,8 C17.5,7.5 17,7 16.5,6.5" class="stroke-purple-300 fill-none opacity-60"/>
    
    <!-- 编辑效果辐射波纹 -->
    <circle cx="12" cy="7" r="2" class="stroke-purple-300 fill-none opacity-30">
      <animate attributeName="r" values="2;3;2" dur="2.5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite"/>
    </circle>
  </svg>
</template>

<script setup>
// AI图片编辑SVG图标
// 表现AI智能从外部注入图像进行编辑的概念
</script>

<style scoped>
.transform-origin-center {
  transform-origin: center;
}
</style>