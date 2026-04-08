<template>
<el-switch
    class="mr-4"
    size="default"
    :active-icon="Moon"
    :inactive-icon="Sunny"
    :inline-prompt="inner"
    v-model="store.isDark"
    :style="switchClass"
    /> 
</template>

<script setup lang="ts">
  /* eslint-disable camelcase */
  import { ref, computed } from 'vue';
  import {  Sunny, Moon } from '@element-plus/icons-vue';
  import { usePageState } from '@/stores/pageState';


  const store = usePageState();
  const inner = ref(true);
  const switchClass = computed(() => ({
    '--el-switch-border-color': store.isDark ? '#4B5563' : '#D1D5DB',
    '--el-color-white': store.isDark ? '#F3F4F6' : '#374151'
  }));
</script>