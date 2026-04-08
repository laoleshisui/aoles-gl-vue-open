<template>
  <div
    class="thumbnail-card flex flex-col rounded-xl overflow-hidden h-full"
    ref="el"
  >
    <!-- 头部信息栏 -->
    <div class="header-bar flex items-center text-xs px-3 py-2 overflow-hidden">
      <!-- <VideoIcon class="header-icon " /> -->
      <span class="header-time mr-2 shrink-0 font-medium">
        {{ formatPlayerTime(trackItem.end - trackItem.start).substring(3) }}
      </span>
      <span class="header-title truncate font-medium" :title="trackItem.name">
        {{ formatString(trackItem.name, 45) }}
      </span>
    </div>

    <!-- 缩略图容器 -->
    <div
      ref="container"
      class="thumbnail-container overflow-hidden flex-1 relative"
      :style="waveStyle"
    >
      <!-- 缩略图网格 -->
      <div class="thumbnail-strip absolute inset-0 flex">
        <img
          v-for="(item, index) in thumbnails"
          :key="index"
          :src="item"
          alt=""
          class="thumbnail-image object-cover border-r border-gray-700/60 last:border-r-0"
          draggable="false"
        />
      </div>

      <!-- 加载遮罩 -->
      <div v-show="loading" class="loading-overlay">
        <div class="loading-content">
          <Loading class="loading-icon text-blue-400 mb-2" />
          <span class="loading-text text-xs">加载中...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Loading from '@/components/Loading.vue';
import { formatPlayerTime, isImage, isVideo } from '@/utils/common';
import type { PropType } from 'vue';
import trackCheckPlaying from './trackCheckPlaying';
import { computed, ref, watch, onUnmounted } from 'vue';
import { videoDecoder } from '@/utils/webcodecs';
import { useResizeObserver } from '@vueuse/core';
import { formatString } from '@/utils/common';
import VideoIcon from '@/components/icons/VideoIcon.vue';

const props = defineProps({
  trackItem: {
    type: Object as PropType<VideoTractItem>,
    default() {
      return {
        showWidth: '0px',
        showLeft: '0px'
      };
    }
  }
});

const container = ref();
const loading = ref(true);
const imgs = ref<string[]>([]);
const el = ref();
const containerWidth = ref<number>(100);

const waveStyle = computed(() => {
  return {
    transformOrigin: 'left top',
    left: `-${0}%`,
    right: `-${100}%`,
    width: `${100}%`
  };
});

async function initVideo() {
  const { source } = props.trackItem;

  const start = performance.now();

  const thumbnails = await videoDecoder.thumbnails(source);

  console.log(`生成${thumbnails.length}张缩略图耗时`, performance.now() - start, 'ms');

  imgs.value = thumbnails.map(({ img }) => {
    return URL.createObjectURL(img);
  });

  console.log('缩略图连接耗时', performance.now() - start, 'ms');

  loading.value = false;
}

async function initImage() {
  const { source } = props.trackItem;
  imgs.value = [source.url];
  loading.value = false;
}

useResizeObserver(el, entries => {
  const entry = entries[0];
  const { width } = entry.contentRect;
  containerWidth.value = width;
});

function getUniformSubarray(array, need, offset) {
  const interval = Math.max(Math.floor((array.length - offset) / need), 1);

  const subarray = [];
  for (let i = offset; subarray.length < need; i += interval) {
    if (i >= array.length) {
      subarray.push(array[array.length - 1]);
    } else {
      subarray.push(array[i]);
    }
  }

  return subarray;
}

const thumbnails = computed(() => {
  if (imgs.value.length === 0) return [];
  const { start, end, trimStart, frameCount, name } = props.trackItem;

  let srcFrameCnt = frameCount;
  if (isImage(name)) {
    srcFrameCnt = end - start;
  }

  const needCnt = containerWidth.value > 0 ? Math.ceil(containerWidth.value / 50) : 1;
  const offset = Math.ceil(imgs.value.length * trimStart / srcFrameCnt);
  return getUniformSubarray(imgs.value, needCnt, offset);
});

watch(
  () => props.trackItem.name,
  () => {
    if (isImage(props.trackItem.name)) {
      initImage();
    } else {
      initVideo();
    }
  },
  {
    immediate: true,
    flush: 'post'
  }
);
trackCheckPlaying(props);

onUnmounted(() => {
  if (isVideo(props.trackItem.name)) {
    imgs.value.forEach(item => {
      URL.revokeObjectURL(item);
    });
  }
});
</script>

<style scoped>
:global(:root) {
  --thumb-card-bg: linear-gradient(145deg, rgba(236, 242, 255, 0.94), rgba(222, 231, 255, 0.9));
  --thumb-card-border: rgba(148, 163, 184, 0.35);
  --thumb-card-shadow: 0 26px 54px rgba(148, 163, 184, 0.32);
  --thumb-card-hover-shadow: 0 32px 70px rgba(37, 99, 235, 0.42);

  --thumb-header-bg: linear-gradient(120deg, rgba(231, 238, 252, 0.92), rgba(210, 226, 255, 0.78));
  --thumb-header-text: #1f2937;
  --thumb-header-time-bg: rgba(99, 102, 241, 0.22);
  --thumb-header-time-text: #1d4ed8;
  --thumb-header-icon: #2563eb;
  --thumb-header-icon-hover: #1d4ed8;

  --thumb-container-bg: linear-gradient(135deg, rgba(235, 244, 255, 0.95), rgba(224, 235, 255, 0.9));
  --thumb-strip-overlay: inset 0 -1px 0 rgba(148, 163, 184, 0.18);
  --thumb-image-border: rgba(148, 163, 184, 0.32);
  --thumb-image-hover-shadow: 0 16px 28px rgba(59, 130, 246, 0.25);

  --thumb-loading-mask: rgba(226, 232, 240, 0.65);
  --thumb-loading-text: #334155;

  --thumb-scroll-track: rgba(203, 213, 225, 0.45);
  --thumb-scroll-thumb: rgba(99, 102, 241, 0.35);
  --thumb-scroll-thumb-hover: rgba(79, 70, 229, 0.47);
}

:global(.dark) {
  --thumb-card-bg: linear-gradient(145deg, rgba(28, 37, 60, 0.92), rgba(18, 26, 44, 0.9));
  --thumb-card-border: rgba(59, 130, 246, 0.22);
  --thumb-card-shadow: 0 32px 66px rgba(11, 20, 38, 0.55);
  --thumb-card-hover-shadow: 0 34px 72px rgba(59, 130, 246, 0.36);

  --thumb-header-bg: linear-gradient(120deg, rgba(45, 58, 89, 0.58), rgba(30, 64, 175, 0.26));
  --thumb-header-text: #f1f5ff;
  --thumb-header-time-bg: rgba(76, 106, 218, 0.38);
  --thumb-header-time-text: #e0e7ff;
  --thumb-header-icon: #93c5fd;
  --thumb-header-icon-hover: #bfdbfe;

  --thumb-container-bg: linear-gradient(135deg, rgba(24, 33, 58, 0.9), rgba(16, 24, 45, 0.92));
  --thumb-strip-overlay: inset 0 -1px 0 rgba(96, 165, 250, 0.22);
  --thumb-image-border: rgba(96, 165, 250, 0.28);
  --thumb-image-hover-shadow: 0 18px 32px rgba(59, 130, 246, 0.32);

  --thumb-loading-mask: rgba(22, 31, 50, 0.68);
  --thumb-loading-text: #dbeafe;

  --thumb-scroll-track: rgba(27, 38, 62, 0.5);
  --thumb-scroll-thumb: rgba(96, 165, 250, 0.42);
  --thumb-scroll-thumb-hover: rgba(125, 190, 255, 0.54);
}

.thumbnail-card {
  position: relative;
  background: var(--thumb-card-bg);
  border: 1px solid var(--thumb-card-border);
  box-shadow: var(--thumb-card-shadow);
  border-radius: 6px;
  overflow: hidden;
  transition: transform 0.28s ease, box-shadow 0.32s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.thumbnail-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--thumb-card-hover-shadow);
}

.header-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--thumb-header-bg);
  color: var(--thumb-header-text);
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  overflow: hidden;
}

.header-bar::after {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  background: radial-gradient(circle at 18% 50%, rgba(59, 130, 246, 0.18), transparent 58%);
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.thumbnail-card:hover .header-bar::after {
  opacity: 1;
}

.header-icon {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
  color: var(--thumb-header-icon);
  transition: transform 0.2s ease, color 0.2s ease, filter 0.2s ease;
}

.thumbnail-card:hover .header-icon {
  transform: scale(1.1);
  color: var(--thumb-header-icon-hover);
  filter: drop-shadow(0 4px 10px rgba(59, 130, 246, 0.32));
}

.header-time {
  padding: 2px;
  border-radius: 2px;
  background: var(--thumb-header-time-bg);
  color: var(--thumb-header-time-text);
  letter-spacing: 0.05em;
}

.header-title {
  flex: 1;
  min-width: 0;
  color: var(--thumb-header-text);
}

.thumbnail-container {
  background: var(--thumb-container-bg);
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

.thumbnail-container::-webkit-scrollbar {
  height: 6px;
}

.thumbnail-container::-webkit-scrollbar-track {
  background: var(--thumb-scroll-track);
  border-radius: 999px;
}

.thumbnail-container::-webkit-scrollbar-thumb {
  background: var(--thumb-scroll-thumb);
  border-radius: 999px;
}

.thumbnail-container::-webkit-scrollbar-thumb:hover {
  background: var(--thumb-scroll-thumb-hover);
}

.thumbnail-strip {
  mix-blend-mode: normal;
  box-shadow: var(--thumb-strip-overlay);
}

.thumbnail-image {
  width: 52px;
  height: 100%;
  flex-shrink: 0;
  border-right: 1px solid var(--thumb-image-border);
  transition: transform 0.25s ease, filter 0.25s ease, box-shadow 0.25s ease;
}

.thumbnail-image:hover {
  transform: scale(1.08);
  z-index: 2;
  box-shadow: var(--thumb-image-hover-shadow);
  filter: brightness(1.05) saturate(1.15);
}

.thumbnail-image:last-child {
  border-right: none;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: var(--thumb-loading-mask);
  display: grid;
  place-items: center;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.loading-text {
  color: var(--thumb-loading-text);
  letter-spacing: 0.08em;
}

@media (max-width: 768px) {
  .thumbnail-image {
    width: 44px;
  }

  .header-bar {
    padding-inline: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .thumbnail-card,
  .header-icon,
  .thumbnail-image {
    transition: none;
  }

  .thumbnail-card:hover,
  .thumbnail-image:hover {
    transform: none;
  }
}
</style>