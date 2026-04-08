<template>
  <div
    class="text-left text-sm top-0 absolute trackItem"
    :class="[TrackHeightMap.get(props.trackItem.type), isDragState ? 'z-50 isDrag' : (isActive ? 'z-30' : 'z-10')]"
    :style="[itemClass]"
    :data-type="props.trackItem.type"
    :data-line="lineIndex"
    :data-index="itemIndex"
    @click="setSelectTract"
    @dblclick="trackItemChild.startEditing && trackItemChild.startEditing()"
  >
    <TrackHandler :isActive="isActive" :lineIndex="lineIndex" :itemIndex="itemIndex" />
    <component
        ref="trackItemChild"
        :is="componentMap.get(trackItem.type)"
        :trackItem="trackItem"
    />
    
    <!-- 选中状态指示器 -->
    <div v-if="isActive" class="active-indicator"></div>
  </div>
</template>

<script setup lang="ts">
import TrackHandler from '@/components/item/trackItem/TrackHandler.vue';
import VideoItem from '@/components/item/trackItem/template/VideoItem.vue';
import AudioItem from '@/components/item/trackItem/template/AudioItem.vue';
import TextItem from '@/components/item/trackItem/template/TextItem.vue';
import ImageItem from '@/components/item/trackItem/template/ImageItem.vue';
import EffectItem from '@/components/item/trackItem/template/EffectItem.vue';
import TransitionItem from '@/components/item/trackItem/template/TransitionItem.vue';
import FilterItem from '@/components/item/trackItem/template/FilterItem.vue';
import { TrackHeightMap } from '@/data/trackConfig';
import { useTrackState } from '@/stores/trackState';
import { computed, ref } from 'vue';

const props = defineProps({
  trackType: {
    type: String,
    default: ''
  },
  lineIndex: {
    type: Number,
    default: 0
  },
  itemIndex: {
    type: Number,
    default: 0
  },
  trackItem: {
    type: Object,
    default() {
      return {
        width: '0px',
        left: '0px'
      };
    }
  }
});

const store = useTrackState();
const trackItemChild = ref(null);

const isActive = computed(() => {
  return store.selectTrackItem.line === props.lineIndex && store.selectTrackItem.index === props.itemIndex;
});

const componentMap = new Map<string, any>([
  ['video', VideoItem],
  ['audio', AudioItem],
  ['text', TextItem],
  ['image', ImageItem],
  ['effect', EffectItem],
  ['transition', TransitionItem],
  ['filter', FilterItem]
]);

const isDragState = computed(() => {
  return store.moveTrackData.lineIndex === props.lineIndex && store.moveTrackData.itemIndex === props.itemIndex;
});

function setSelectTract(event:Event) {
  event.preventDefault();
  event.stopPropagation();
  store.selectTrackItem.line = props.lineIndex;
  store.selectTrackItem.index = props.itemIndex;
}

const itemClass = computed(() => {
  if (isDragState.value) {
    return {
      width: props.trackItem.showWidth,
      left: `${parseInt(props.trackItem.showLeft) + store.dragData.moveX}px`,
      top: `${store.dragData.moveY}px`
    };
  }
  return {
    width: props.trackItem.showWidth,
    left: props.trackItem.showLeft
  };
});
</script>

<style scoped>
.trackItem {
  overflow: visible;
}

.active-indicator {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 2px solid #3b82f6;
  border-radius: 2px;
  pointer-events: none;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    border-color: rgba(59, 130, 246, 0.7);
    border-width: 2px;
  }
  50% {
    border-color: rgba(59, 130, 246, 1);
    border-width: 3px;
  }
}

.trackItem :deep(.track-handler) {
  z-index: 20;
}

.isDrag {
  opacity: 0.8;
}

@media (prefers-reduced-motion: reduce) {
  .active-indicator {
    animation: none;
    border: 2px solid #3b82f6;
  }
}
</style>