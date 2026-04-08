<template>
  <svg width="1em" height="1em" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- 主矩形区域 (代表被截图的画面) -->
    <rect x="6" y="6" width="36" height="36" rx="3" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
    
    <!-- 内部：水平切割线 (暗示水平方向的截取) -->
    <path d="M6 24H42" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 6"/>
    
    <!-- 内部：垂直切割线 (暗示垂直方向的截取) -->
    <path d="M24 6V42" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 6"/>
    
    <!-- 这里的 stroke-dasharray="2 6" 模拟了十字准心的虚线效果 -->
  </svg>
</template>