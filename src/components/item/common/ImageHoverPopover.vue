<template>
  <div
    class="image-hover-popover"
    @mouseenter="()=>{ if (listenMouse & 0x01){ showPopover(); }}"
    @mouseleave="()=>{ if (listenMouse & 0x02){ hidePopover(); }}"
  >
    <!-- 触发元素 -->
    <slot name="trigger">
      <div class="default-trigger">
        <span>Hover me</span>
      </div>
    </slot>

    <!-- 使用 Teleport 将弹窗渲染到 body 中 -->
    <Teleport to="body" :disabled="!teleportToBody">
      <div 
        v-if="isVisible" 
        ref="popoverRef"
        class="popover-content"
        :class="[position, { 'with-arrow': showArrow }]"
        :style="popoverStyle"
      >
        <div v-if="showArrow" class="popover-arrow" :class="position"></div>
        <div class="popover-image-container">
          <img 
            :src="imageSrc" 
            :alt="altText" 
            class="popover-image"
            @load="handleImageLoad"
          />
          <div v-if="caption" class="popover-caption">{{ caption }}</div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

interface Props {
  imageSrc: string
  altText?: string
  caption?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  showDuration?:number
  showArrow?: boolean
  maxWidth?: string
  maxHeight?: string
  teleportToBody?: boolean
  listenMouse?:number
}

const props = withDefaults(defineProps<Props>(), {
  altText: 'Image preview',
  caption: '',
  position: 'top',
  delay: 30,
  showDuration:-1,
  showArrow: true,
  maxWidth: '200px',
  maxHeight: '180px',
  teleportToBody: true,
  listenMouse: 0x03,
})

const isVisible = ref(false)
const popoverRef = ref<HTMLElement | null>(null)
const imageLoaded = ref(false)
const showTimeout = ref<NodeJS.Timeout | null>(null)
const hideTimeout = ref<NodeJS.Timeout | null>(null)

const popoverStyle = computed(() => ({
  '--max-width': props.maxWidth,
  '--max-height': props.maxHeight
}))

const showPopover = () => {
  if (hideTimeout.value) {
    clearTimeout(hideTimeout.value)
    hideTimeout.value = null
  }
  
  showTimeout.value = setTimeout(() => {
    isVisible.value = true
  }, props.delay)

  if(props.showDuration > 0){
    setTimeout(() => {
        hidePopover();
    }, props.showDuration)
  }
}

const hidePopover = () => {
  if (showTimeout.value) {
    clearTimeout(showTimeout.value)
    showTimeout.value = null
  }
  
  hideTimeout.value = setTimeout(() => {
    isVisible.value = false
    imageLoaded.value = false
  }, 150)
}

const handleImageLoad = () => {
  imageLoaded.value = true
}

const calculatePosition = async () => {
  if (!isVisible.value || !props.teleportToBody) return
  
  await nextTick()
  const trigger = document.querySelector('.image-hover-popover')
  const popover = popoverRef.value
  
  if (!trigger || !popover) return
  
  const triggerRect = trigger.getBoundingClientRect()
  const popoverRect = popover.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  const ARROW_OFFSET = 10 // 箭头间距
  const MARGIN = 8 // 屏幕边距
  
  let left = 0
  let top = 0
  
  switch (props.position) {
    case 'top':
      // 水平居中
      left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2
      // 垂直位置（上方）
      top = triggerRect.top - popoverRect.height - ARROW_OFFSET
      
      // 确保不超出左右边界
      left = Math.max(MARGIN, Math.min(left, viewportWidth - popoverRect.width - MARGIN))
      // 确保不超出上边界（如果上方空间不足，强制贴顶）
      top = Math.max(MARGIN, top)
      break
      
    case 'bottom':
      // 水平居中
      left = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2
      // 垂直位置（下方）
      top = triggerRect.bottom + ARROW_OFFSET
      
      // 确保不超出左右边界
      left = Math.max(MARGIN, Math.min(left, viewportWidth - popoverRect.width - MARGIN))
      // 确保不超出下边界（如果下方空间不足，强制贴底）
      top = Math.min(top, viewportHeight - popoverRect.height - MARGIN)
      break
      
    case 'left':
      // 垂直居中
      top = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2
      // 水平位置（左侧）
      left = triggerRect.left - popoverRect.width - ARROW_OFFSET
      
      // 确保不超出上下边界
      top = Math.max(MARGIN, Math.min(top, viewportHeight - popoverRect.height - MARGIN))
      // 确保不超出左边界（如果左侧空间不足，强制贴左）
      left = Math.max(MARGIN, left)
      break
      
    case 'right':
      // 垂直居中
      top = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2
      // 水平位置（右侧）
      left = triggerRect.right + ARROW_OFFSET
      
      // 确保不超出上下边界
      top = Math.max(MARGIN, Math.min(top, viewportHeight - popoverRect.height - MARGIN))
      // 确保不超出右边界（如果右侧空间不足，强制贴右）
      left = Math.min(left, viewportWidth - popoverRect.width - MARGIN)
      break
  }
  
  // 应用最终位置
  popover.style.left = `${left}px`
  popover.style.top = `${top}px`
}

// 监听显示状态变化
watch(isVisible, (val) => {
  if (val && props.teleportToBody) {
    nextTick(() => {
      calculatePosition()
    })
  }
})

// 点击外部关闭弹窗
const handleClickOutside = (event: MouseEvent) => {
  if (popoverRef.value && !popoverRef.value.contains(event.target as Node)) {
    hidePopover()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  window.addEventListener('resize', calculatePosition)
  window.addEventListener('scroll', calculatePosition, true)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('resize', calculatePosition)
  window.removeEventListener('scroll', calculatePosition, true)
  if (showTimeout.value) clearTimeout(showTimeout.value)
  if (hideTimeout.value) clearTimeout(hideTimeout.value)
})

defineExpose({
  showPopover,
  hidePopover
})
</script>

<style scoped lang="scss">
.image-hover-popover {
  display: inline-block;
  position: relative;
  cursor: pointer;
}

.default-trigger {
  padding: 8px 16px;
  background-color: #f0f0f0;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #e0e0e0;
  }
}


// 当渲染到 body 时的样式
.popover-content {
  position: fixed;
  z-index: 9999;
  background: #ffffffA0;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e0e0e000;
  animation: fadeIn 0.2s ease-out;
  overflow: hidden;
  max-width: var(--max-width);
  max-height: var(--max-height);

  &.with-arrow {
    &.top::before {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-top-color: white;
    }

    &.bottom::before {
      content: '';
      position: absolute;
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-bottom-color: white;
    }

    &.left::before {
      content: '';
      position: absolute;
      right: -6px;
      top: 50%;
      transform: translateY(-50%);
      border: 6px solid transparent;
      border-left-color: white;
    }

    &.right::before {
      content: '';
      position: absolute;
      left: -6px;
      top: 50%;
      transform: translateY(-50%);
      border: 6px solid transparent;
      border-right-color: white;
    }
  }
}
.dark .popover-content {
    background: #000000A0;
}

.popover-image-container {
  display: flex;
  flex-direction: column;
}

.popover-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  border-radius: 6px 6px 0 0;
  opacity: v-bind('imageLoaded ? 1 : 0');
  transition: opacity 0.2s ease;
}

.popover-caption {
  padding: 8px 12px;
  background: #f8f9fa;
  color: #495057;
  font-size: 12px;
  border-top: 1px solid #e9ecef;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 深色模式支持
@media (prefers-color-scheme: dark) {
  .popover-content {
    background: #2d3748;
    border-color: #4a5568;
    
    &.with-arrow {
      &.top::before {
        border-top-color: #2d3748;
      }
      &.bottom::before {
        border-bottom-color: #2d3748;
      }
      &.left::before {
        border-left-color: #2d3748;
      }
      &.right::before {
        border-right-color: #2d3748;
      }
    }
  }

  .popover-caption {
    background: #4a5568;
    color: #e2e8f0;
    border-top-color: #4a5568;
  }
}
</style>