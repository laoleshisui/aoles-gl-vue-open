<template>
  <div
    class="absolute left-0 right-0 top-0 bottom-0 z-20"
    :class="{ 'border border-blue-400': isActive }"
    ref="el"
    v-show="isActive"
  >
    <!-- 左侧手柄 -->
    <div
      class="cursor-col-resize absolute top-0 bottom-0 -left-3 w-3 flex items-center justify-center group"
      ref="handlerLeft"
      @mousedown="mouseDownHandler($event, 'left')"
    >
      <div class="handler-background left-background"></div>
      <div class="handler-line left-line"></div>
    </div>

    <!-- 右侧手柄 -->
    <div
      class="cursor-col-resize absolute top-0 bottom-0 -right-3 w-3 flex items-center justify-center group"
      ref="handlerRight"
      @mousedown="mouseDownHandler($event, 'right')"
    >
      <div class="handler-background right-background"></div>
      <div class="handler-line right-line"></div>
    </div>

    <!-- 吸附线指示器 -->
    <div 
      v-if="store.dragData.fixLines && store.dragData.fixLines.length > 0" 
      class="absolute top-0 bottom-0 w-px bg-blue-400 z-30"
      :style="{ left: `${store.dragData.fixLines[0][0]?.position}px` }"
    />
  </div>
</template>

<script setup lang="ts">
import { useTrackState } from '@/stores/trackState';
import { usePlayerState } from '@/stores/playerState';
import type { TrackItem } from '@/stores/trackState';
import { computed, ref } from 'vue';
import { getGridPixel } from '@/utils/canvasUtil';

const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  },
  lineIndex: {
    type: Number,
    default: 0
  },
  itemIndex: {
    type: Number,
    default: 0
  }
});

const store = useTrackState();
const playerStore = usePlayerState();
const targetTrack = computed(() => {
  return store.trackList[props.lineIndex].list[props.itemIndex];
});

const el = ref();

// 定位数据缓存
let positionLeft = 0;
// 手柄可操作的属性配置
let handlerData = {
  isVA: false,
  start: 0,
  end: 0,
  offsetR: 0,
  offsetL: 0,
  minStart: 0,
  maxStart: 0,
  minEnd: 0,
  maxEnd: 0
};
let enableMove = false;
let otherCoords: { left: number, right: number, start: number, end: number }[] = [];

// 获取吸附辅助线
function getFixLine(x: number, distance = 10) {
  // otherCoords、游标位置
  // 先获取与拖拽元素left、right，距离小于distance的元素
  const result = [];
  otherCoords.forEach(coord => {
    if (Math.abs(coord.left - x) <= distance) {
      result.push({ position: coord.left, frame: coord.start });
    }
    if (Math.abs(coord.right - x) <= distance) {
      result.push({ position: coord.right, frame: coord.end });
    }
  });
  // 获取与游标位置距离小于distance的元素
  const trackPlayPointX = getGridPixel(store.trackScale, playerStore.playStartFrame);
  if (Math.abs(trackPlayPointX - x) <= distance) {
    result.push({ position: trackPlayPointX, frame: playerStore.playStartFrame });
  }

  return result;
}

let fixPosition = { left: 0, right: 0 };

// 设置吸附
function adsorption(x: number, lines: { position: number, frame: number }[]) {
  if (lines.length === 0) {
    fixPosition = { left: 0, right: 0, start: 0, end: 0 };
    return;
  }
  // 吸附其实就是移动拖拽元素的位置
  // 找到最近的线，计算移动的距离
  const minLeftLine = lines.reduce((r, item) => {
    return Math.abs(item.position - x) < Math.abs(r.position - x) ? item : r;
  }, { position: Number.MAX_SAFE_INTEGER, frame: 0 });

  // eslint-disable-next-line consistent-return
  return minLeftLine;
}
const frameWidth = computed(() => getGridPixel(store.trackScale, 1));
function initLimits(lineData: TrackItem[], trackItem: TrackItem) {
  const beforeTrack = props.itemIndex > 0 ? lineData[props.itemIndex - 1] : null;
  const afterTrack = props.itemIndex < lineData.length ? lineData[props.itemIndex + 1] : null;
  const isVA = ['video', 'audio'].includes(trackItem.type);
  const limitData = {
    isVA,
    start: trackItem.start,
    end: trackItem.end,
    offsetR: trackItem.offsetR,
    offsetL: trackItem.offsetL,
    minStart: beforeTrack ? beforeTrack.end : 0, // 可以调节的最小start
    maxStart: trackItem.end - 1, // 最少要保留一帧数据
    minEnd: trackItem.start + 1,
    maxEnd: afterTrack ? afterTrack.start : (30 * 60 * 60) // 最长一小时
  };
  if (false && isVA) { // 音视频结尾受资源大小限制
    const rightMaxWidth = (trackItem.frameCount - limitData.offsetL); // 右侧最大宽度
    const leftMaxWidth = (trackItem.frameCount - limitData.offsetR);// 左侧最大宽度
    limitData.maxEnd = afterTrack ? (Math.min(afterTrack.start, limitData.start + rightMaxWidth)) : Math.min(rightMaxWidth + limitData.start, (30 * 60 * 60));
    limitData.minStart = beforeTrack ? (Math.max(beforeTrack.end, limitData.end - leftMaxWidth)) : Math.max(limitData.end - leftMaxWidth, 0);
  }
  Object.assign(handlerData, {
    ...limitData
  });
}
function setTrackFrameData(frameCount: number, handleType: string) {
  const { isVA, start: originStart, end: originEnd, offsetR, offsetL, minStart, maxStart, minEnd, maxEnd } = handlerData;
  const originWidth = originEnd - originStart;
  const leftMaxWidth = offsetL + originWidth;
  const rightMaxWidth = offsetR + originWidth;

  const clip = store.trackList[props.lineIndex].list[props.itemIndex]
  if (handleType === 'left') { // 操作左侧手柄
    let newStart = originStart + frameCount;
    if (newStart > maxStart) newStart = maxStart;
    if (newStart < minStart) newStart = minStart;
    let diffStart = newStart - originStart;
    if (false && isVA) { // 音视频的手柄操作限制在资源长度内，向内则视为资源裁切，裁切部分为 offset
      if (originEnd - newStart > leftMaxWidth) { // 音视频存在长度限制，手柄向内则截取， 向外展开截取，但是不能超过总长度
        newStart = originEnd - leftMaxWidth;
        diffStart = newStart - originStart;
      }
      clip.offsetL = Math.max(offsetL + diffStart, 0);
    } else { // 其他资源操作无限制
      // NOTE: frameCount connot be changed!
      // clip.frameCount = originEnd - newStart;
    }
    clip.start = newStart;
  } else { // 右侧手柄
    let newEnd = originEnd + frameCount;
    if (newEnd > maxEnd) newEnd = maxEnd;
    if (newEnd < minEnd) newEnd = minEnd;
    if (false && isVA) { // 音视频的手柄操作限制在资源长度内，向内则视为资源裁切，裁切部分为 offset
      if (newEnd - originStart > rightMaxWidth) { // 音视频存在长度限制，手柄向内则截取， 向外展开截取，但是不能超过总长度
        newEnd = originStart + rightMaxWidth;
      }
      const diffEnd = newEnd - originEnd;
      clip.offsetR = Math.max(offsetR - diffEnd, 0);
    } else { // 其他资源操作无限制
      // NOTE: frameCount connot be changed!
      // clip.frameCount = newEnd - originStart;
    }
    clip.end = newEnd;
  }
}

function mouseDownHandler(event: MouseEvent, type: string) {
  event.preventDefault();
  event.stopPropagation();

  otherCoords = [];
  for (let i = 0; i < store.trackList.length; i++) {
    for (let j = 0; j < store.trackList[i].list.length; j++) {
      if (i !== props.lineIndex || j !== props.itemIndex) {
        const item = store.trackList[i].list[j];
        otherCoords.push({
          start: item.start,
          end: item.end,
          left: getGridPixel(store.trackScale, item.start),
          right: getGridPixel(store.trackScale, item.end)
        });
      }
    }
  }
  playerStore.isPause = true;
  const { pageX: startX } = event;
  positionLeft = startX;
  enableMove = true;
  initLimits(store.trackList[props.lineIndex]?.list || [], targetTrack.value);

  const start = targetTrack.value.start;
  const end = targetTrack.value.end;

  const trackItem = el.value.closest('.trackItem');
  const position = type === 'left' ? trackItem.offsetLeft : trackItem.offsetLeft + trackItem.offsetWidth;

  document.onmousemove = documentEvent => {
    if (!enableMove) return;
    const { pageX } = documentEvent;
    const moveWidth = positionLeft - pageX;
    // 显示吸附线
    const lines = getFixLine(position - moveWidth);

    store.dragData.fixLines = [lines];

    const result = adsorption(position - moveWidth, lines);
    const frameCount = result?.frame ? (type === 'left' ? (result.frame - start) : (result.frame - end)) : -Math.round(moveWidth / frameWidth.value);
    setTrackFrameData(frameCount, type);
  };

  document.onmouseup = () => {
    enableMove = false;
    document.onmouseup = null;
    document.onmousemove = null;
    store.dragData.fixLines = [];
  };
}
</script>

<style scoped>
.handler-background {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 12px;
  background: rgba(59, 130, 246, 0.15);
  backdrop-filter: blur(4px);
  border-radius: 2px;
  transition: all 0.2s ease;
  opacity: 0.5;
}

.left-background {
  right: 0;
}

.right-background {
  left: 0;
}

.group:hover .handler-background {
  opacity: 1;
  background: rgba(59, 130, 246, 0.25);
}

.group:active .handler-background {
  background: rgba(59, 130, 246, 0.35);
}

.handler-line {
  width: 2px;
  height: 65%;
  background: #3b82f6;
  border-radius: 1px;
  transition: all 0.15s ease;
  position: relative;
  z-index: 1;
}

.group:hover .handler-line {
  background: #2563eb;
  height: 20px;
  box-shadow: 0 0 4px rgba(59, 130, 246, 0.6);
}

.group:active .handler-line {
  background: #1d4ed8;
  transform: scaleX(1.5);
}

.left-line {
  margin-right: 1px;
}

.right-line {
  margin-left: 1px;
}

.border {
  border-color: rgb(96 165 250);
}

/* 吸附线动画 */
.bg-blue-400 {
  animation: pulse-line 1s infinite;
}

@keyframes pulse-line {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}

/* 确保手柄在轨道项上方 */
.z-20 {
  z-index: 20;
}

.z-30 {
  z-index: 30;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .handler-background {
    width: 10px;
    backdrop-filter: blur(2px);
  }
  
  .handler-line {
    height: 14px;
    width: 1.5px;
  }
  
  .group:hover .handler-line {
    height: 16px;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .handler-background {
    background: rgba(59, 130, 246, 0.3);
    border: 1px solid #3b82f6;
  }
  
  .handler-line {
    background: #1d4ed8;
    border: 1px solid white;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .handler-background,
  .handler-line {
    transition: none;
  }
  
  .bg-blue-400 {
    animation: none;
  }
}

/* 毛玻璃效果支持检测 */
@supports not (backdrop-filter: blur(4px)) {
  .handler-background {
    background: rgba(59, 130, 246, 0.25);
  }
  
  .group:hover .handler-background {
    background: rgba(59, 130, 246, 0.35);
  }
  
  .group:active .handler-background {
    background: rgba(59, 130, 246, 0.45);
  }
}
</style>