<template>
  <el-button
    v-bind="$attrs"
    :class="['glass-btn', { 'is-frozen': isLocked }]"
    :loading="loading || innerLoading"
    :disabled="disabled || isLocked"
    :style="cssVars"
    @click="handleClick"
  >
    <!-- 透传 Loading 插槽 -->
    <template #loading v-if="$slots.loading">
      <slot name="loading"></slot>
    </template>

    <!-- 默认内容 -->
    <template #default>
      <!-- 内容层：相对定位，层级高 -->
      <div class="glass-content">
        <span v-if="isLocked && showCountdown" class="countdown-text">
          {{ currentCount }}s
        </span>
        <span v-else class="normal-content">
          <slot>{{ label }}</slot>
        </span>
      </div>

      <!-- 
        修复动画的关键：
        将装饰元素放在内容旁边，但依然在 slot 内。
        依靠 CSS 强制跳出文档流，相对于 button 根节点定位。
      -->
      <div class="glass-shine-wrapper">
        <div class="glass-shine"></div>
      </div>
      
      <!-- 暗黑模式高光层 -->
      <div class="glass-overlay"></div>
    </template>
  </el-button>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { TinyColor } from '@ctrl/tinycolor' // 需安装 npm install @ctrl/tinycolor

interface Props {
  themeColor?: string
  opacity?: number
  duration?: number
  showCountdown?: boolean
  label?: string
  loading?: boolean
  disabled?: boolean
  autoLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  themeColor: '#B0D060',
  opacity: 0.25,
  duration: 2000,
  showCountdown: true,
  label: '',
  loading: false,
  disabled: false,
  autoLoading: false
})

const emit = defineEmits(['click'])
const isLocked = ref(false)
const innerLoading = ref(false)
const currentCount = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const cssVars = computed(() => {
  const color = new TinyColor(props.themeColor)
  const rgb = color.toRgb()
  const isLight = color.isLight()

  return {
    '--theme-r': rgb.r,
    '--theme-g': rgb.g,
    '--theme-b': rgb.b,
    '--opacity-val': props.opacity,
    // 自动计算文字颜色：亮背景用深灰，暗背景用白
    '--text-color-val': isLight ? '#2c3e50' : '#ffffff' 
  }
})

const handleClick = (evt: MouseEvent) => {
  if (isLocked.value || props.loading || props.disabled) return
  emit('click', evt)
  isLocked.value = true
  if (props.autoLoading) innerLoading.value = true

  const totalSeconds = Math.ceil(props.duration / 1000)
  currentCount.value = totalSeconds

  timer = setInterval(() => {
    currentCount.value--
    if (currentCount.value <= 0) resetState()
  }, 1000)
  setTimeout(() => resetState(), props.duration)
}

const resetState = () => {
  if (timer) { clearInterval(timer); timer = null; }
  isLocked.value = false; innerLoading.value = false;
}
onBeforeUnmount(() => resetState())
</script>

<style scoped lang="scss">
.glass-btn {
  /* =========================================
     1. 彻底覆盖 Element Plus 默认变量 (解决变蓝问题)
     ========================================= */
  --base-rgb: var(--theme-r), var(--theme-g), var(--theme-b);
  
  /* 定义默认状态下的颜色 */
  --custom-bg: rgba(var(--base-rgb), var(--opacity-val));
  --custom-border: rgba(var(--base-rgb), 0.4);
  --custom-text: var(--text-color-val);
  
  /* 定义 Hover 状态下的颜色 (加深背景，不改变色相) */
  --custom-hover-bg: rgba(var(--base-rgb), calc(var(--opacity-val) + 0.15));
  --custom-hover-border: rgba(var(--base-rgb), 0.8);
  --custom-hover-text: var(--custom-text); /* 保持文字颜色不变 */

  /* 强力覆盖 Element 的变量，指向我们定义的自定义变量 */
  --el-button-bg-color: var(--custom-bg) !important;
  --el-button-text-color: var(--custom-text) !important;
  --el-button-border-color: var(--custom-border) !important;
  
  /* 关键：把 hover/active/focus 全部指回我们自己的颜色，消灭 default blue */
  --el-button-hover-bg-color: var(--custom-hover-bg) !important;
  --el-button-hover-text-color: var(--custom-hover-text) !important;
  --el-button-hover-border-color: var(--custom-hover-border) !important;
  
  --el-button-active-bg-color: var(--custom-hover-bg) !important;
  --el-button-active-border-color: var(--custom-hover-border) !important;
  
  --el-button-outline-color: rgba(var(--base-rgb), 0.2) !important; /* Focus 时的光圈 */

  /* =========================================
     2. 按钮本体样式
     ========================================= */
  position: relative;
  overflow: hidden; /* 必须保留，裁切流光 */
  border: none !important; /* 用 box-shadow 代替 border，质感更好 */
  box-shadow: 0 4px 6px rgba(var(--base-rgb), 0.2), inset 0 0 0 1px var(--custom-border);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 1;

  /* 悬停物理反馈 */
  &:hover:not(.is-disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(var(--base-rgb), 0.3), inset 0 0 0 1px var(--custom-hover-border);
  }

  /* 激活(点击)物理反馈 */
  &:active:not(.is-disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(var(--base-rgb), 0.2), inset 0 0 0 1px var(--custom-hover-border);
  }
}

/* =========================================
   3. 修复动画高度 (解决高度没占满问题)
   ========================================= */
.glass-shine-wrapper {
  /* 
   * 这是一个幽灵容器，它的作用是让内部的 shine 能够相对于 button 定位。
   * absolute 会向上寻找最近的 relative 父级，也就是 .glass-btn
   */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1; /* 在文字下方 */
  overflow: hidden;
  border-radius: inherit; /* 继承按钮圆角 */
}

.glass-shine {
  position: absolute;
  /* 
   * 核心修复：
   * 将高度设为 200%，并向上偏移 50%。
   * 这样即使 skew 倾斜了 25 度，上下边缘的空隙也会被额外的长度填补。
   */
  top: -50%; 
  height: 200%;
  
  left: -100%;
  width: 50%;
  background: linear-gradient(
    to right, 
    transparent, 
    rgba(255, 255, 255, 0.6), 
    transparent
  );
  transform: skewX(-25deg); /* 倾斜 */
  opacity: 0;
  transition: opacity 0.3s;
}

/* 触发动画 */
.glass-btn:hover:not(.is-frozen) .glass-shine {
  animation: shine 1.2s ease-in-out infinite;
  opacity: 1;
}

@keyframes shine {
  0% { left: -100%; opacity: 0; }
  10% { opacity: 0.8; }
  100% { left: 200%; opacity: 0; }
}

/* =========================================
   4. 内容层 (确保文字在最上层)
   ========================================= */
.glass-content {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
}
.countdown-text {
  font-family: monospace; font-weight: bold;
}

/* =========================================
   5. Dark Mode 适配 (保持不变)
   ========================================= */
.glass-overlay {
  position: absolute; 
  inset: 0; 
  pointer-events: none; 
  opacity: 0; 
  transition: opacity 0.3s;
  /* 默认：白色渐变 */
  background: linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%);
}

html.dark .glass-btn {
  /* 1. 提高背景透明度：从 0.15 提至 0.3，保证色彩可见 */
  --custom-bg: rgba(var(--base-rgb), 0.3);
  
  /* 2. 边框稍微亮一点 */
  --custom-border: rgba(var(--base-rgb), 0.1);
  
  /* 保持白字 */
  --custom-text: #ffffff; 
  
  /* Hover 逻辑: 更加明显 */
  --custom-hover-bg: rgba(var(--base-rgb), 0.3);
  --custom-hover-border: rgba(var(--base-rgb), 0.1);

  /* 3. 关键修改：阴影增加 "内发光(inset)" */
  /* 第一个shadow是外部投影，第二个shadow是内部色彩填充(关键) */
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.6), 
    inset 0 0 20px rgba(var(--base-rgb), 0.3), /* 增加这行：内部色彩辉光 */
    inset 0 0 0 1px var(--custom-border);
}

/* 4. 修改 Dark 模式下的高光层 */
html.dark .glass-overlay {
  opacity: 1;
  /* 关键修改：不要用白色(255,255,255)，改用主题色本身的亮度 */
  /* 让光泽感带上颜色，而不是变成死灰色 */
  background: rgba(var(--base-rgb), 0) 0%;
  /* 混合模式：让高光和背景融合得更通透 (可选，如果觉得颜色不正可以删掉这一行) */
  mix-blend-mode: plus-lighter; 
}

.is-frozen { filter: grayscale(0.5); cursor: not-allowed; opacity: 0.7; transform: none !important; }
</style>