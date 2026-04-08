<template>
  <header class="h-14 w-full flex flex-nowrap flex-row items-center justify-between dark:border-darker border-gray-200">
    <div class="flex w-1/5 pl-2 items-center">
      <img
        :class="store.isDark ? 'border-white' : 'border-blue-500'"
        class="head-img avatar mx-4 cursor-pointer rounded-full object-cover border-2"
        @click=""
        :src="accountStore.userProfile?.avatarUrl  || 'https://api.dicebear.com/9.x/pixel-art/svg?seed=' + accountStore.userProfile?.username"
        alt="head"
        crossorigin="anonymous"
      />
    </div>
    <PixelDinoProgress 
    class="flex w-3/5 ml-10 "
    v-show="pageStore.headerProgress > 0" 
    :percentage="pageStore.headerProgress" 
    :height="55" />
    <div class="flex w-1/5 flex-row-reverse pr-6 items-center">
      <ThrottleButton
        color="#B0D060"
        :opacity="0.5"
        size="default"
        :duration="3000"
        :show-countdown="false"
        @click="onGenerate"
      >
        <el-icon class="mr-1">
          <Upload />
        </el-icon>
        <span>{{ $t("HeaderContainer.Generate") }}</span>
      </ThrottleButton>
      <el-icon
        size="large"
        @click="showDialog=true"
        class="mr-4"
        :style="{ cursor: 'pointer' }"
      >
        <Setting />
      </el-icon>
      <GlobalConfigDialog
        v-model:visible="showDialog"
        :original-data="currentConfig"
        @confirm="configItem"
      />
</div>
  </header>
</template>

<script setup lang="ts">
  /* eslint-disable camelcase */
  import { watch, ref, computed, toRaw } from 'vue';
  import { Upload} from '@element-plus/icons-vue';
  import { usePageState } from '@/stores/pageState';
  import { useTrackState } from '@/stores/trackState';
  import { usePreviewState } from '@/stores/previewState';
  import { Combinator, type OffscreenSprite } from '@webav/av-cliper';

  import { ElLoading, ElMessage } from 'element-plus';
  import { Setting } from '@element-plus/icons-vue';
  import GlobalConfigDialog from '@/components/container/GlobalConfigDialog.vue';
  import { useI18n } from 'vue-i18n'
import { controllerWasmLoader } from '@/utils/controllerWasmLoader';
import { GetStrideWidth, processPaths } from '@/utils/common';
import { useAccountState} from '@/stores/accountState';
import { uniSourceMap } from '@/utils/uniSource';
import PixelDinoProgress from '@/components/item/common/PixelDinoProgress.vue';
import ThrottleButton from '@/components/item/common/ThrottleButton.vue';

const accountStore = useAccountState();
const pageStore = usePageState();

  const { t } = useI18n()

  const trackState = useTrackState();

  const previewState = usePreviewState();

  const showDialog = ref(false);

  const isOnControllerJsonStr = ref(false);

  const currentConfig = ref({
    // solutionRatio: {value: '16:9', label: "宽高比"},
    darkSwitch:{
      label: "HeaderContainer.GlobalConfigDialog.DarkSwitch",
    },
    language:{
      label: "HeaderContainer.GlobalConfigDialog.Language",
    },
    outputFPS:{
      label: "HeaderContainer.GlobalConfigDialog.OutputFPS",
      min:30, max:30, step:0,
      value: localStorage.outputFPS ? Number(localStorage.outputFPS) : 30,
    },
    previewSolution: {
      value: [localStorage.previewSolutionWidth ? Number(localStorage.previewSolutionWidth) : 360, localStorage.previewSolutionHeight ? Number(localStorage.previewSolutionHeight) : 640],
      // min:360, max:640, step:0,
      min:2, max:19200, step:0,
      // default: [360, 640],
      label: "HeaderContainer.GlobalConfigDialog.PreviewSolution",
    },
    outputScale:{
      label: "HeaderContainer.GlobalConfigDialog.OutputScale",
      visible: false,
      min:0, max:10, step:0,
      value: localStorage.outputScale ? Number(localStorage.outputScale) : 3,
    },
    outputSolution: {
      value: [1080, 1920],
      min:2, max:19200, step:0,
      // default: [1080, 1920],
      label: "HeaderContainer.GlobalConfigDialog.OutputSolution",
    },
  });
  const configItem = (newConfig) => {
    currentConfig.value = newConfig;
  }

  watch(currentConfig, (newConfig)=>{
    // console.log("newConfig:", currentConfig.value.previewSolution.value[0]);
    previewState.config.output.video_config.width = currentConfig.value.previewSolution.value[0];
    previewState.config.output.video_config.height = currentConfig.value.previewSolution.value[1];

    localStorage.outputFPS = currentConfig.value.outputFPS.value;

    localStorage.previewSolutionWidth = currentConfig.value.previewSolution.value[0];
    localStorage.previewSolutionHeight = currentConfig.value.previewSolution.value[1];

    localStorage.outputScale = currentConfig.value.outputScale.value;

    toRaw(currentConfig.value).outputSolution.value[0] = currentConfig.value.previewSolution.value[0] * currentConfig.value.outputScale.value;
    toRaw(currentConfig.value).outputSolution.value[1] = currentConfig.value.previewSolution.value[1] * currentConfig.value.outputScale.value;
  }, {immediate: true});

  const store = usePageState();

  controllerWasmLoader.on("initialized", async (Module)=>{
  if(Module["key"] === 'GLController'){
    controllerWasmLoader.module["GLController"].on("OnControllerJsonStr", generate);
  }});

  const onGenerate = async() => {
    const loading = ElLoading.service({ text: '正在合成视频' });
   
    if(!isOnControllerJsonStr.value){
      isOnControllerJsonStr.value = true;
    }
    controllerWasmLoader.module["GLController"].controllerMethodProxy.ControllerToJsonStr();

    loading.close();
  };

  const generate = async (controllerJsonStr:any)=>{
    if(trackState.frameCount === 0 || trackState.frameCount > 3000000){
      ElMessage.warning('No clip.');
      return;
    }else{
      console.log("trackState.frameCount: ", trackState.frameCount);
    }

    const controllerJson = controllerJsonStr;
    //1. replace path with url
    // await processPaths(controllerJson, ['path', 'font_path', 'glsl_path'], (path:string)=>{
    //   for (let i = uniSourceMap.length - 1; i >= 0; i--) {
    //     if (uniSourceMap[i].wasmPath === path) {
    //       return uniSourceMap[i].originUrl || uniSourceMap[i].url;
    //     }
    //   }
    //   return;
    // })
    //2.enable outputing video & audio
    controllerJson["output"]["muxer"] = true;
    controllerJson["output"]["audio"] = true;
    controllerJson["output"]["video"] = true;
    //3.TODO: make all clips' size specified scale larger.
    await processPaths(controllerJson, ['width'], (oldVal:number)=>{
      return GetStrideWidth(oldVal * Number(localStorage.outputScale));
    })
    await processPaths(controllerJson, ['height', 'font_size'], (oldVal:number)=>{
      return oldVal * Number(localStorage.outputScale);
    })
    //4.TODO: make fps larger.

    // 如果外部设置了自定义回调，使用自定义回调
    try{
      if (pageStore.generateCallback) {
        await pageStore.generateCallback(controllerJson);
        ElMessage.success(t("HeaderContainer.Message.GenerateSucceed"));
        return;
      }else{
        ElMessage.error(t("HeaderContainer.Message.GenerateFailed" + 'no generateCallback'));
      }
    }catch(error){
      ElMessage.error(t("HeaderContainer.Message.GenerateFailed") + error);
    }
    
  }
</script>

<style>
.head-img {
    transition: transform 0.3s ease, border-color 0.3s ease;
}
.head-img:hover {
    transform: scale(1.15);
}
.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e0e0e0;
  box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}
</style>
