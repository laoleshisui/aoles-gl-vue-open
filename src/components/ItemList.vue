<template>
  <div
    class="flex flex-col transition-all duration-200 overflow-x-hidden"
    :style="contrainerStyle"
  >
    <div class="min-h-full flex flex-col overflow-hidden">
      <div class="h-10 flex items-center justify-between ">
        <span class="text-s inline leading-10 pl-3 select-none]">{{ $t(title) }}</span>
        
        <!--
 <ElIcon :size="16" class="mr-3 mt-1 float-right cursor-pointer p-2 box-content" @click="switchCollapse">
          <Fold />
        </ElIcon> 
-->
        <!-- <i class="iconfont icon-shuangjiantou_zuo_line mr-3" @click="switchCollapse" /> -->
      </div>


      <VideoPanel v-show="activeKey === 'video'" :key="`video`"/>
      
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import VideoPanel from '@/components/VideoPanel/index.vue'

  const props = defineProps({
    activeKey: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    defaultCollapse: {
      type: Boolean,
      default: false
    }
  });
  const emit = defineEmits({
    collapseChange(newCollapse: boolean) {
      return newCollapse !== null;
    }
  });

  const contrainerStyle = computed(()=>{
    if(collapse.value){
      return {
        width: "0rem"
      }
    }
    else if(['video', 'materials', 'ai', 'project', 'subject'].includes(props.activeKey)){
      return {
        width: "24rem"
      }
    }
    else if(props.activeKey === 'mini-drama'){
      return {
        width: "48rem"
      }
    }
    else{
      return {
        width: "100%"
      }
    }
  });

  const title = computed(() => props.title);
  const collapse = ref(props.defaultCollapse);
  function switchCollapse() {
    collapse.value = !collapse.value;
  }
  watch(collapse, newValue => {
    emit('collapseChange', newValue);
  });
  watch(() => props.defaultCollapse, newValue => {
    collapse.value = newValue;
  });
</script>