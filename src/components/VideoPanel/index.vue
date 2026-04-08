<template>
  <div class="ascrollbar p-4 flex-1 flex flex-col overflow-y-auto h-64">
    <div class="space-y-3">
      <ImportResources ref="importResourcesChild"
      @clipResourceAdded="resource => recentResourcesChild.addRecentResource(resource)"
      @submit=""
      />

      <RecentResources ref="recentResourcesChild"
      @clickRecentResource="resource => importResourcesChild.addResource(resource)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import '@/assets/iconfont/iconfont.css';

import RecentResources from './RecentResources.vue';
import ImportResources from './ImportResources.vue';
import { useTrackState } from '@/stores/trackState';

const trackStore = useTrackState();

const importResourcesChild = ref(null)
const recentResourcesChild = ref(null)
</script>
