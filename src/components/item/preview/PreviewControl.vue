<template>
  <div class="flex items-center justify-center absolute bottom-0 left-0 right-0 pl-4 pr-4 h-8">
    <div class="absolute left-4 h-full text-xs leading-8">
      <span class="text-blue-400 mr-1 w-20 inline-block">{{ playTime }}</span>/<span class="ml-2 w-20">{{ allTime }}</span>
    </div>
    <div class="m-auto flex items-center">
      <ElIcon :size="24" class="cursor-pointer hover:text-blue-400 box-content" :class="[disable ? 'cursor-not-allowed' : 'cursor-pointer']">
        <VideoPause v-show="!store.isPause" @click="pauseVideo" />
        <VideoPlay v-show="store.isPause" @click="startPlay" />
      </ElIcon>
    </div>

    <!-- 右侧图标组 -->
    <div class="absolute right-4 h-full flex items-center space-x-4">
      <ResolutionSetter/>

      <el-icon :size="20" class="cursor-pointer hover:text-blue-400" @click="toggleFullscreen">
        <FullScreen />
      </el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { FullScreen, VideoPlay, VideoPause } from '@element-plus/icons-vue';
  import { ref, computed, watch } from 'vue';
  import { formatPlayerTime } from '@/utils/common';
  import { usePreviewState } from '@/stores/previewState';
  import { controllerWasmLoader } from '@/utils/controllerWasmLoader';
  import { useTrackState } from '@/stores/trackState';
  import ResolutionSetter from '@/components/item/common/ResolutionSetter.vue';
  const props = defineProps({
    disable: {
      type: Boolean,
      default: false
    }
  });
  const store = usePreviewState();
  const trackStore = useTrackState();

  const toggleFullscreen = () => {
    controllerWasmLoader.module["GLController"].requestFullscreen(false, false);
  }

  controllerWasmLoader.on("initialized", async (Module)=>{
  if(Module["key"] === 'GLController'){
      controllerWasmLoader.module["GLController"].on("OnTS", (ts: number) => {
        if(store.currentTS !== ts){
          store.currentTS = ts;
        }
      });
  }});


  const playTime = computed(() => formatPlayerTime(Number(store.currentTS)));
  const allTime = computed(() => formatPlayerTime(Number(store.durationTS)));

  const pauseVideo = () => {
    if (props.disable) return;
    store.isPause = true;

    controllerWasmLoader.module["GLController"].controllerMethodProxy.SetState(0);
  };
  function startPlay() {
    if (props.disable || store.timelineTS >= store.durationTS) return;
    store.isPause = false;

    if(store.needSeek){
      console.log("store.needSeek:" , store.needSeek);
      if(store.needSeek === 'all'){
        controllerWasmLoader.module["GLController"].controllerMethodProxy.Seek(store.timelineTS);
      }
      else if(store.needSeek ==='movedClips'){
        console.log("trackStore.needSeekClips: ", trackStore.needSeekClips.size);
        for (const clip of trackStore.needSeekClips) {
          controllerWasmLoader.module["GLController"].controllerMethodProxy.ConfigClip(clip.controller_key, trackStore.controllerTypeMap.get(clip.type), JSON.stringify({
            seek: Math.max(0, store.timelineTS - clip.start)
          }));
        }
        trackStore.needSeekClips.clear();
      }
    }
    store.needSeek = '';

    trackStore.SortTracks();
    
    controllerWasmLoader.module["GLController"].controllerMethodProxy.SetState(1);
  }

  watch(() => store.isPause, (newVal, oldVal) => {
    if (newVal && !oldVal) { // 只有从播放变为暂停时才执行
      pauseVideo();
    }
  }, { immediate: false });

  const switchPlayState = ()=>{
    if(store.isPause){
      startPlay();
    }else{
      pauseVideo();
    }
  }

  trackStore.eventEmitter.on('switchPlayState', ()=>{
    console.log("switchPlayState");
    switchPlayState();
  });

</script>