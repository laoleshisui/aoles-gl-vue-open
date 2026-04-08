<template>
  <div class="select-none h-full w-full flex flex-col relative overflow-hidden rounded-xl" :style="attrWidth">
    <!-- disable -->
    <SplitLine 
      class="top-0 left-0 bottom-0"
      direction="vertical"
      :limitSize="limitSize"
      v-model:newWidth="pageStore.attrWidth"
/>
    <div v-show="selectTrackOptionsConfig.length === 0" class="w-full h-full flex flex-col justify-center items-center">
      <!-- <AttrEmptyIcon /> -->
      <span class="responsive-box text-sm dark:text-gray-500 text-gray-400">{{ tip }}</span>
    </div>
    <div class="absolute top-0 left-3 right-2 bottom-0 overflow-hidden ascrollbar">
      <AttrContainer :attrData="selectTrackOptionsConfig" :trackId="trackStore.selectResource?.id" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import AttrContainer from '@/components/item/formItem/AttrContainer.vue';
  import { useTrackState } from '@/stores/trackState';
  import SplitLine from '@/components/SplitLine.vue';
  import { usePageState } from '@/stores/pageState';
  import { computed, reactive, ref, watch } from 'vue';
  import { findNamedList } from '@/utils/common';
  import { cloneDeep, forEach } from 'lodash-es';
  import { useI18n } from 'vue-i18n'

  const { t } = useI18n()

  const pageStore = usePageState();
  const trackStore = useTrackState();

  const tip = ref('');
  //TODO: fetch tips from backend.
  const tips = ref([
    // '选中片段即可进行属性编辑',
    // 'AI合成的内容将会储存到云端素材库',
    // '上传的视频将会储存到云端素材库',
    // '素材库里的资源可以直接入轨、下载',
  ]);

  for(let i = 0; true; i++){
    const key = `AttributeContainer.Tips.${i}`;
    const val = t(key)
    if(key === val){
      break;
    }else{
      tips.value.push(val);
    }
  }

  const startPollingTips = () => {
    const poll = () => {
      let timeout = 5000;
      if(tips.value.length){
        const rondomTip = tips.value[Math.floor(Math.random() * tips.value.length)];
        if (tip.value === rondomTip){
          timeout = 1000;
        }else{
          timeout = 5000;
          tip.value = rondomTip
        }
      }

      setTimeout(poll, timeout);
    };
    poll();
  };
  startPollingTips();

  const TrackOptionsConfig: Record<string, any> = {};
  // 将data下的配置导入
  const attributeFiles = import.meta.glob('@/data/options/*.ts', { eager: true });
  for (const path in attributeFiles) {
    const name = path.match(/(?<=\/)(\w+)(?=\.ts)/) || [];
    TrackOptionsConfig[name[0]] = (attributeFiles[path] as { Options: Record<string, any> }).Options;
  }

  let selectTrackOptionsConfig: any[] = [];

  function updatedEffectList(){
    if(!trackStore.selectResource){
      return [];
    }
    const optionsConfig = TrackOptionsConfig[trackStore.selectResource.type];
    // const optionsConfig = cloneDeep(TrackOptionsConfig[trackStore.selectResource.type]);
    // if (!optionsConfig) return [];

    //TODO:video\text
    if(trackStore.selectResource.effectList){
      const curList = findNamedList(TrackOptionsConfig[trackStore.selectResource.type], 'AttributeContainer.FormItem.Video.EffectList');
      curList.children.splice(0, curList.children.length);

      const effectFormList = trackStore.selectResource.formEffectList();
      console.log("effectFormList: ", effectFormList.length, curList.children.length);
      forEach(effectFormList, (item)=>{
        curList.children.push(item);
      });
    }


    return optionsConfig ? optionsConfig.attributes : [];
  }

  watch([
    () => trackStore.selectResource,
    () => trackStore.effectListUpdate,
  ], () => {
    if(trackStore.selectResource) {      
      selectTrackOptionsConfig = updatedEffectList();
    }else{
      selectTrackOptionsConfig = [];
    }

    //reset.
    if(trackStore.effectListUpdate){
      trackStore.effectListUpdate = false;
    }
  }, { immediate: true }); // 立即执行一次获取初始值

  const attrWidth = computed(() => ({
    width: `${pageStore.attrWidth}px`
  }));
  const limitSize = reactive({
    minWidth: 300,
    maxWidth: 600
  });
</script>

<style scoped>
.responsive-box {
  width: 75%;
  max-width: 600px;
  padding: 20px;
  /* border: 1px solid #ccc; */
  
  /* 核心换行设置 */
  overflow-wrap: break-word;
  word-break: break-word;
  
  /* 移动端优化 */
  @media (max-width: 480px) {
    hyphens: auto;
    word-break: break-all;
  }
}
</style>