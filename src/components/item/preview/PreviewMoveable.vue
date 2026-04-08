<template>
  <div
      ref="moveContainer"
      class="absolute left-0 right-0 top-0 bottom-0 m-auto"
      :style="containerStyle"
  >
    <!-- 
      核心修改 1: 
      style 中显式增加 transformOrigin 和 rotate
      transform 的顺序建议为 translate -> rotate -> scale 以配合 Moveable 的默认逻辑
    -->
    <div
        v-for="(item, index) in targetList"
        :key="item.id"
        :data-eleId="item.id"
        :data-lineIndex="item.lineIndex"
        :data-itemIndex="item.itemIndex"
        :style="{
          zIndex: item.isSelected ? 9000 : index,
          top: `${item.top}px`,
          left: `${item.left}px`,
          width: `${item.w}px`,
          height: `${item.h}px`,
          transformOrigin: 'center center', 
          transform: `translate(${item.x}px, ${item.y}px) rotate(${item.rotation}deg) scale(${item.scaleX}, ${item.scaleY})`
        }"
        class="move-target absolute"
        @click.stop="selectItem(item.id)"
        @mousedown="mousedown($event, item.id)"
    />
    
    <!-- 核心修改 2: 绑定 @rotate 事件 -->
    <Moveable
        ref="moveable"
        v-bind="draggableOptions"
        :zoom="1/canvasScale" 
        @drag="onDrag"
        @scale="onScale"
        @rotate="onRotate"
    />
  </div>
</template>

<script setup lang="ts">
import { defaultMoveOptions } from '@/data/constant';
import Moveable from 'vue3-moveable';
import { ref, nextTick, reactive, computed, watch } from 'vue';
import { usePreviewState } from '@/stores/previewState';
import { useTrackState } from '@/stores/trackState';
import { TrackLineItf } from '@/class/Track';

const props = defineProps({
  canvasScale: {
    type: Number,
    default() {
      return 1;
    }
  }
});
const store = usePreviewState();
const trackStore = useTrackState();
const moveContainer = ref<HTMLElement>();
const moveable = ref();
const moveTarget = ref<HTMLElement | null>(null);

const containerStyle = computed(() => ({
  width: '100%',
  height: '100%',
  overflow: 'visible'
}));

// 核心修改 3: 接口增加 rotation
interface TargetItem {
  id: string;
  lineIndex: number,
  itemIndex: number,
  isSelected: boolean,
  y: number;
  x: number;
  w: number;
  h: number;
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  rotation: number; // 新增
}

const targetList = computed(() => {
  const { width, height } = store.config.output.video_config;
  const { currentTS } = store;
  const { trackList, selectResource } = trackStore;
  
  if (width === 0 && height === 0) {
    return [];
  }

  return trackList
    .reduce((acc: TargetItem[], { list }, lineIndex) => {
      const index = findCurrentItemIndex(list, currentTS);
      
      if (index !== -1) {
        const trackItem = list[index];
        acc.push({
          lineIndex,
          itemIndex: index,
          isSelected: selectResource === trackItem,
          id: trackItem.id,
          x: trackItem.centerX,
          y: -trackItem.centerY,
          w: trackItem.width,
          h: trackItem.height,
          left: width / 2 - trackItem.width / 2,
          top: height / 2 - trackItem.height / 2,
          scaleX: trackItem.scale / 100,
          scaleY: (trackItem.scaleY || trackItem.scale) / 100,
          // 核心修改 4: 读取 store 中的 rotation，如果没有则默认为 0
          rotation: trackItem.rotation || 0 
        });
      }
      return acc;
    }, []);
});

function findCurrentItemIndex(list: Array<any>, currentTS: number): number {
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (currentTS >= item.start && currentTS <= item.end) {
      return i;
    }
  }
  return -1;
}

watch(targetList, () => {
  nextTick(() => {
    moveable.value?.updateRect();
  });
}, { flush: 'post' });

// 核心修改 5: 配置开启旋转
const draggableOptions = reactive({
  target: moveTarget,
  className: 'cc-move',
  container: moveContainer,
  throttleDrag: 1,      
  throttleScale: 0.01,
  throttleRotate: 1,    // 旋转吸附步长，0为平滑，1为按整度数
  rotatable: true,
  draggable: true,
  resizable: false,
  scalable: true,
  renderDirections: ['n', 's', 'e', 'w', 'nw', 'ne', 'se', 'sw'], // 手柄锚点
  origin: true,
  rotationPosition: 'top', // 旋转手柄位置
  edge: false,          
  // ...defaultMoveOptions
});

function selectItem(eleid: string) {
  store.isPause = true;
  trackStore.selectTrackById(eleid);
}

function onDrag(params: any) {
  let { target, transform, translate } = params;
  const { lineindex, itemindex } = target.dataset;
  const [x, y] = translate;
  
  target.style.transform = transform;
  
  const track = trackStore.trackList[lineindex].list[itemindex];
  track.centerX = x;
  track.centerY = -y;
}

function onScale(params: any) {
  let { target, scale, transform } = params;
  const { lineindex, itemindex } = target.dataset;

  const newScaleX = scale[0] * 100;
  const newScaleY = scale[1] * 100;
  
  const track = trackStore.trackList[lineindex].list[itemindex];
  track.scale = newScaleX;
  track.scaleY = newScaleY;
  
  target.style.transform = transform;
}

// 核心修改 6: 实现旋转回调
function onRotate(params: any) {
  let { target, rotation, transform } = params;
  const { lineindex, itemindex } = target.dataset;

  // 1. 立即更新 DOM (moveable 会计算好 translate + rotate + scale 的组合)
  target.style.transform = transform;

  // 2. 更新数据
  const track = trackStore.trackList[lineindex].list[itemindex];
  // 假设 Track 类上有 rotation 属性，单位为度(deg)
  track.rotation = rotation; 
}

function mousedown(event: MouseEvent, eleid: string) {
  event.stopPropagation();
  store.isPause = true;
  trackStore.selectTrackById(eleid);
  
  const target = event.currentTarget as HTMLElement;
  moveTarget.value = target;
}

watch([() => trackStore.selectTrackItem, targetList], () => {
  if (moveContainer.value && trackStore.selectTrackItem.line !== -1 && trackStore.selectTrackItem.index !== -1) {
    const targetTrack = trackStore.trackList[trackStore.selectTrackItem.line]?.list[trackStore.selectTrackItem.index];
    if (targetTrack && targetList.value.find(item => item.id === targetTrack.id)) {
      moveTarget.value = moveContainer.value.querySelector(`.move-target[data-eleid='${targetTrack.id}']`) as HTMLElement;
    } else {
      moveTarget.value = null;
    }
  } else {
    moveTarget.value = null;
  }
}, { immediate: true, flush: 'post' });

</script>

<style>
  /* 
   * Moveable UI 修复版
   */
  body .cc-move {
    --moveable-color: #2979ff;
    --moveable-handle-size: 10px; 
  }

  body .cc-move .moveable-line {
    background-color: var(--moveable-color) !important;
    opacity: 1 !important; 
    box-shadow: 0 0 2px rgba(255, 255, 255, 0.5); 
  }

  body .cc-move .moveable-control {
    width: var(--moveable-handle-size) !important;
    height: var(--moveable-handle-size) !important;
    border: 2px solid var(--moveable-color) !important;
    background: #fff !important; 
    border-radius: 50% !important; 
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important; 
    
    margin-left: calc(var(--moveable-handle-size) / -2) !important;
    margin-top: calc(var(--moveable-handle-size) / -2) !important;
    z-index: 3000 !important;
  }

  body .cc-move .moveable-control.moveable-rotation {
    background: var(--moveable-color) !important; 
    border: 2px solid #fff !important;
  }
  
  body .cc-move .moveable-line.moveable-rotation-line {
    background-color: var(--moveable-color) !important;
    width: 1px !important; 
    height: 24px !important; 
    transform-origin: 50% 100% !important; 
    margin-top: -24px !important; 
  }

  body .cc-move .moveable-control:hover {
    border-color: #fff !important; 
    background: var(--moveable-color) !important;
  }

  .move-target {
    user-select: none;
    -webkit-user-drag: none;
    outline: none; 
    /* 核心修改 7: 确保 CSS 层面也是中心对齐，防止 Moveable 计算偏差 */
    transform-origin: center center !important;
  }
</style>