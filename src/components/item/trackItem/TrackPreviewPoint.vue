<template>
  <div
      class="z-30 w-px absolute -top-5 bottom-0 bg-gray-700 dark:bg-gray-100 transition-transform duration-75"
      id="previewPlayPoint"
      :style="trackStyle"
      @mousedown="onMouseDown"
  >
    <span
class="playPoint block border-1 border-gray-600 bg-gray-600 h-3 w-2.5 dark:border-gray-100 dark:bg-gray-100 sticky top-0 right-0 left-0 cursor-move"
/>
  </div>
</template>

<script setup lang="ts">
  import { getGridPixel, getSelectFrame } from '@/utils/canvasUtil';
  import { computed, ref, watch } from 'vue';
  import { useTrackState } from '@/stores/trackState';
  import { usePreviewState } from '@/stores/previewState';
  const offsetLine = {
    left: 10
  };

  const trackStore = useTrackState();
  const previewStore = usePreviewState();

  const trackStyle = computed(() => {
    return {
      left: `${offsetLine.left}px`,
      transform: `translate(${getGridPixel(trackStore.trackScale, previewStore.timelineTS)}px, 0px)`
    };
  });

  const isDragging = ref(false);

  let lastTimelinePos = 0;

  let lastExecution = 0;
  const debounceDelay = 50; // 毫秒，可根据需求调整

  function onMouseDown(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    previewStore.isPause = true;
    isDragging.value = true;

    lastTimelinePos = previewStore.timelineTS;
  }

  function onDebouncedMouseMove(event: MouseEvent) {
      const now = Date.now();
      if (now - lastExecution > debounceDelay) {
          lastExecution = now;
          onMouseMove(event);
      }
  }

  function onMouseMove(event: MouseEvent) {
    // event.stopPropagation();
    // event.preventDefault();
    if (isDragging.value) {
      // 获取相对于#timeline的偏移量
      const rect = document.getElementById('track-container').getBoundingClientRect();
      // 默认fps为30
      const frame = getSelectFrame(event.pageX - offsetLine.left - rect.left, trackStore.trackScale, 30);

      const playFrame = frame - 1;
      const startFrame = playFrame < 0 ? 0 : playFrame > trackStore.frameCount ? trackStore.frameCount : playFrame;
      previewStore.timelineTS = startFrame;
    }
  }

  document.addEventListener('mousemove', onDebouncedMouseMove);

  function onMouseUp(event: MouseEvent) {
    // event.stopPropagation();
    // event.preventDefault();

    if(isDragging.value){
      const afterMoveTimelinePos = previewStore.timelineTS;
      previewStore.timelineTS = lastTimelinePos;
      previewStore.jumpTimelineTo(afterMoveTimelinePos);
    }

    isDragging.value = false;
  }

  document.addEventListener('mouseup', onMouseUp);
</script>

<style scoped>
  .playPoint{
    transform: translateX(-50%);
  }
  .playPoint::after{
    content: '';
    display: block;
    width: 10px;
    height: 10px;
    border: 5px solid;
    position: absolute;
    top: 100%;
    border-right-color: transparent;
    border-left-color: transparent;
    border-bottom-color: transparent;
  }
</style>