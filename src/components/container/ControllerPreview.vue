<template>
  <!-- 模板部分保持不变 -->
  <div class="flex-1 min-h-0 overflow-hidden relative" ref="playerContent"
  @click="cancelSelect"
  >
    <span class="text-s pl-2 inline-block w-full h-10 mb-2 leading-10">{{ $t("ControllerPreview.Title") }}</span>
    <CanvasPreview :containerSize="containerSize" />
  </div>
</template>

<script setup lang="ts">
  import CanvasPreview from '@/components/item/preview/CanvasPreview.vue';
  import { usePageState } from '@/stores/pageState';
  import { watch, ref, onMounted, onUnmounted, reactive } from 'vue';
  import { useTrackState } from '@/stores/trackState';
  
  const pageStore = usePageState();
  const trackStore = useTrackState();
  const playerContent = ref<HTMLDivElement>();
  const containerSize = reactive({
    width: 0,
    height: 0
  });
  
  // 添加 ResizeObserver
  let resizeObserver: ResizeObserver | null = null;
  
  function cancelSelect(event: MouseEvent) {
    event.stopPropagation();
    trackStore.selectTrackItem.line = -1;
    trackStore.selectTrackItem.index = -1;
  }
  
  // 更新画布尺寸
  function updateContainerSize() {
    if (!playerContent.value) return;
    let { width: maxW, height: maxH } = playerContent.value.getBoundingClientRect();
    containerSize.width = maxW;
    containerSize.height = maxH;
  }
  
  onMounted(() => {
    updateContainerSize();
    
    // 监听窗口大小变化
    window.addEventListener('resize', updateContainerSize, false);
    
    // 使用 ResizeObserver 监听元素大小变化
    if (playerContent.value) {
      resizeObserver = new ResizeObserver(() => {
        updateContainerSize();
      });
      resizeObserver.observe(playerContent.value);
    }
  });
  
  onUnmounted(() => {
    // 清理监听器
    window.removeEventListener('resize', updateContainerSize, false);
    
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  });
  
  // 可以保留对 trackHeight 的监听，但 ResizeObserver 已经能监听到相关变化
  watch(() => pageStore.trackHeight, () => {
    updateContainerSize();
  }, {
    flush: 'post'
  });
</script>