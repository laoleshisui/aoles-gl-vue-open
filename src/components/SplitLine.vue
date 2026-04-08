<template>
  <div
    class="flex absolute justify-center items-center transition-all duration-200 group"
    :class="[
      disabled ? 'cursor-not-allowed opacity-50' : isVertical ? 'cursor-col-resize' : 'cursor-row-resize',
      isVertical ? 'w-1.5 h-full' : 'h-1.5 w-full'
    ]"
    ref="lineElement"
    @mousedown="mouseDownHandler"
  >
    <!-- 拖动手柄 - 移除旋转逻辑 -->
    <span
      class="absolute flex z-10 rounded-lg shadow-sm border transition-transform duration-200 transform origin-center hover:scale-110"
      :class="[
        isVertical 
          ? 'h-12 w-3 -translate-x-1/2' 
          : 'w-12 h-3 -translate-y-1/2',
        store.isDark 
          ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 hover:border-gray-500' 
          : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
      ]"
    >
      <el-icon 
        class="flex-auto m-auto opacity-60 transition-opacity duration-200 hover:opacity-100"
        :size="14"
        :color="store.isDark ? '#D1D5DB' : '#4B5563'"
      >
        <!-- 使用两个不同的图标 -->
        <MoreFilled v-if="!isVertical" />
        <!-- 或者使用 transform 旋转 -->
        <MoreFilled v-else :style="{ transform: 'rotate(90deg)' }" />
      </el-icon>
    </span>
  </div>
</template>

<script setup lang="ts">
  import { MoreFilled } from '@element-plus/icons-vue';
  import { usePageState } from '@/stores/pageState';
  import { computed, ref } from 'vue';

  const props = defineProps({
    disabled: {
      type: Boolean,
      default: false
    },
    newWidth: {
      type: Number,
      default: 0
    },
    newHeight: {
      type: Number,
      default: 0
    },
    direction: {
      type: String,
      default: 'horizontal'
    },
    limitSize: {
      type: Object,
      default() {
        return {
          minHeight: 0,
          maxHeight: 999999,
          minWidth: 0,
          maxWidth: 999999
        };
      }
    }
  });

  const emit = defineEmits({
    'update:newWidth': (val: number) => true,
    'update:newHeight': (val: number) => true
  });

  const newWidthValue = computed({
    get: () => props.newWidth,
    set: (newValue) => emit('update:newWidth', newValue)
  });

  const newHeightValue = computed({
    get: () => props.newHeight,
    set: (newValue) => emit('update:newHeight', newValue)
  });

  const lineElement = ref<HTMLElement>();
  const store = usePageState();
  const isVertical = computed(() => props.direction === 'vertical');

  // 定位数据缓存
  const positionState = ref({
    left: 0,
    top: 0
  });

  let enableMove = false;

  function mouseDownHandler(event: MouseEvent) {
    if (props.disabled) return;
    
    event.preventDefault();
    const rect = lineElement.value!.getBoundingClientRect();
    positionState.value = {
      left: rect.left,
      top: rect.top
    };
    enableMove = true;

    const handleMouseMove = (documentEvent: MouseEvent) => {
      if (!enableMove) return;
      
      const { clientX, clientY } = documentEvent;
      const { left: oldLeft, top: oldTop } = positionState.value;
      const { minHeight, maxHeight, minWidth, maxWidth } = props.limitSize;
      
      if (isVertical.value) {
        // 竖向分割线：只改变宽度（X轴）
        const offsetX = clientX - oldLeft;
        const newWidth = newWidthValue.value - offsetX;
        newWidthValue.value = Math.max(minWidth, Math.min(maxWidth, newWidth));
        positionState.value = { left: clientX, top: oldTop }; // 只更新X坐标
      } else {
        // 横向分割线：只改变高度（Y轴）
        const offsetY = clientY - oldTop;
        const newHeight = newHeightValue.value - offsetY;
        newHeightValue.value = Math.max(minHeight, Math.min(maxHeight, newHeight));
        positionState.value = { left: oldLeft, top: clientY }; // 只更新Y坐标
      }
    };

    const handleMouseUp = () => {
      enableMove = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
</script>

<style scoped>
/* 自定义拖动时的视觉效果 */
:deep(.el-icon) {
  transition: transform 0.2s ease;
}

/* 拖动时的状态反馈 */
div:active .el-icon {
  transform: scale(1.1);
}

div:active span {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}
</style>