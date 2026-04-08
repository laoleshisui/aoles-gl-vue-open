<template>
  <div
    class="overflow-hidden select-none relative flex flex-col min-h-0 flex-shrink-0 pt-2 transition-colors"
    :style="trackHeight"
  >

    <SplitLine
      class="top-0 left-0 right-0"
      direction="horizontal"
      :limitSize="limitSize"
      v-model:newHeight="page.trackHeight"
    />
    <TrackContro
      v-model="store.trackScale"
    />
    <TrackList />
  </div>
</template>

<script setup lang="ts">
import SplitLine from '@/components/SplitLine.vue';
import TrackContro from '@/components/item/trackItem/TrackContro.vue';
import TrackList from '@/components/TrackList.vue';
import { useTrackState } from '@/stores/trackState';
import { usePageState } from '@/stores/pageState';
import { computed, reactive, ref } from 'vue';

const page = usePageState();
const store = useTrackState(); // 假设这你有一个 addTrack 或 addResource 的方法


const trackHeight = computed(() => ({
  height: `${page.trackHeight}px`
}));

const limitSize = reactive({
  minHeight: 200,
  maxHeight: document.body.getBoundingClientRect().height - 200
});
</script>

<style scoped>
/* 如果需要额外的样式过渡 */
.transition-colors {
  transition: background-color 0.2s ease, border-color 0.2s ease;
}
</style>