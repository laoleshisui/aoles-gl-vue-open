<template>
  <div
    class="audio-track-card flex flex-col rounded overflow-hidden h-full"
    :class="{ 'is-hover': isHovering }"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <div class="audio-track-header flex items-center text-xs pl-2 pr-3 overflow-hidden h-6 leading-6">
      <AudioIcon class="header-icon inline-block ml-1 mr-2 shrink-0" />
      <span class="header-title mr-4 shrink-0 truncate" :title="headerLabel">
        {{ formatString(headerLabel, 45) }}
      </span>
    </div>

    <div class="audio-track-body overflow-hidden flex-1 relative">
      <div ref="waveRef" class="wave-surface absolute inset-0" :style="waveStyle" />
      <div class="hover-overlay" />
    </div>

    <div v-show="loading" class="loading-mask">
      <Loading class="loading-spinner" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import WaveSurfer from 'wavesurfer.js';
import Loading from '@/components/Loading.vue';
import AudioIcon from '@/components/icons/AudioIcon.vue';
import { usePlayerState } from '@/stores/playerState';
import trackCheckPlaying from './trackCheckPlaying';
import type { AudioTractItem } from '@/stores/trackState';
import { WaveOptions } from '@/data/trackConfig';
import { formatString } from '@/utils/common';

const props = defineProps<{
  trackItem: AudioTractItem;
}>();

const playerStore = usePlayerState();

const isHovering = ref(false);
const loading = ref(true);
const waveRef = ref<HTMLDivElement | null>(null);
let wave: WaveSurfer | null = null;
let registeredLoading = false;

const headerLabel = computed(() => {
  const name = props.trackItem?.name ?? '未命名音频';
  const format = props.trackItem?.format ? ` · ${props.trackItem.format}` : '';
  return `${name}${format}`;
});

const waveStyle = computed(() => {
  const { start, end, frameCount, trimStart } = props.trackItem;
  const baseWidth = Math.max(1, frameCount - trimStart);
  const visibleWidth = Math.max(1, end - start);
  const widthPercent = (baseWidth / visibleWidth) * 100;
  return {
    width: `${widthPercent}%`,
    left: '0',
    right: 'auto',
    transform: 'none'
  };
});

const registerLoading = () => {
  if (!registeredLoading) {
    playerStore.ingLoadingCount = Math.max(0, playerStore.ingLoadingCount) + 1;
    registeredLoading = true;
  }
};

const unregisterLoading = () => {
  if (registeredLoading) {
    playerStore.ingLoadingCount = Math.max(0, playerStore.ingLoadingCount - 1);
    registeredLoading = false;
  }
};

const destroyWave = () => {
  if (wave) {
    wave.destroy();
    wave = null;
  }
};

const initWave = () => {
  destroyWave();
  const container = waveRef.value;
  const url = props.trackItem?.source?.url;
  if (!container || !url) {
    loading.value = false;
    unregisterLoading();
    return;
  }

  registerLoading();
  loading.value = true;

  wave = WaveSurfer.create({
    ...WaveOptions,
    container,
    url,
    normalize: true
  });

  wave.on('ready', () => {
    console.log('WaveSurfer generated!');
    loading.value = false;
    unregisterLoading();
  });

  wave.on('error', () => {
    console.log("WaveSurfer error");
    loading.value = false;
    unregisterLoading();
  });
};

watch(
  () => [waveRef.value],
  ([container]) => {
    // console.log("test: ", container)
    if (container) {
      initWave();
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  destroyWave();
  unregisterLoading();
});

trackCheckPlaying(props);
</script>

<style scoped>
:global(:root) {
  --audio-track-card-bg: linear-gradient(145deg, rgba(233, 241, 255, 0.92), rgba(209, 224, 255, 0.88));
  --audio-track-card-border: rgba(148, 163, 184, 0.35);
  --audio-track-card-shadow: 0 18px 32px rgba(148, 163, 184, 0.22);
  --audio-track-card-hover-shadow: 0 22px 38px rgba(96, 165, 250, 0.28);

  --audio-track-header-bg: linear-gradient(120deg, rgba(227, 238, 255, 0.96), rgba(198, 219, 255, 0.88));
  --audio-track-header-text: #1e293b;
  --audio-track-header-icon: #2563eb;
  --audio-track-header-hover-text: #0f172a;

  --audio-track-body-bg: rgba(30, 64, 175, 0.12);
  --audio-track-body-border: rgba(59, 130, 246, 0.35);
  --audio-track-hover-glow: rgba(59, 130, 246, 0.32);

  --audio-track-loading-mask: rgba(248, 250, 255, 0.72);
}

:global(.dark) {
  --audio-track-card-bg: linear-gradient(145deg, rgba(28, 38, 65, 0.9), rgba(17, 27, 53, 0.88));
  --audio-track-card-border: rgba(59, 130, 246, 0.28);
  --audio-track-card-shadow: 0 20px 36px rgba(15, 23, 42, 0.45);
  --audio-track-card-hover-shadow: 0 28px 44px rgba(59, 130, 246, 0.32);

  --audio-track-header-bg: linear-gradient(120deg, rgba(39, 56, 92, 0.82), rgba(30, 48, 94, 0.78));
  --audio-track-header-text: #e2e8f0;
  --audio-track-header-icon: #93c5fd;
  --audio-track-header-hover-text: #f8fafc;

  --audio-track-body-bg: rgba(37, 99, 235, 0.18);
  --audio-track-body-border: rgba(96, 165, 250, 0.42);
  --audio-track-hover-glow: rgba(96, 165, 250, 0.38);

  --audio-track-loading-mask: rgba(15, 23, 42, 0.72);
}

.audio-track-card {
  position: relative;
  background: var(--audio-track-card-bg);
  border: 1px solid var(--audio-track-card-border);
  box-shadow: var(--audio-track-card-shadow);
  transition: transform 0.22s ease, box-shadow 0.24s ease, border-color 0.2s ease;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.audio-track-card.is-hover {
  transform: translateY(-2px);
  box-shadow: var(--audio-track-card-hover-shadow);
  border-color: rgba(59, 130, 246, 0.42);
}

.audio-track-header {
  background: var(--audio-track-header-bg);
  color: var(--audio-track-header-text);
  transition: background 0.2s ease, color 0.2s ease;
  display: flex;
  align-items: center;
}

.audio-track-card.is-hover .audio-track-header {
  color: var(--audio-track-header-hover-text);
}

.header-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--audio-track-header-icon);
  transition: transform 0.18s ease;
}

.audio-track-card.is-hover .header-icon {
  transform: scale(1.08);
}

.header-title {
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.audio-track-body {
  background: var(--audio-track-body-bg);
  border-top: 1px solid var(--audio-track-body-border);
  position: relative;
}

.wave-surface {
  border-radius: 0 0 8px 8px;
}

.hover-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.18), transparent 55%);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.audio-track-card.is-hover .hover-overlay {
  opacity: 1;
  box-shadow: inset 0 0 0 1px var(--audio-track-hover-glow);
}

.loading-mask {
  position: absolute;
  inset: 0;
  background: var(--audio-track-loading-mask);
  display: grid;
  place-items: center;
  pointer-events: none;
}

.loading-spinner {
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .audio-track-card,
  .audio-track-header,
  .header-icon,
  .hover-overlay {
    transition: none;
  }
}
</style>