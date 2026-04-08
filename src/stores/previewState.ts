import { watch, ref, toRefs, reactive } from 'vue';
import { defineStore } from 'pinia';
import { loadNetFileToWasmFS } from '@/utils/file';
import { controllerWasmLoader } from '@/utils/controllerWasmLoader';
import { uniSourceMap } from '@/utils/uniSource';
import { assetConfig } from '@/config/assetConfig';
import { getSize, GetStrideWidth } from '@/utils/common';

export const usePreviewState = defineStore('previewState', () => {
  const isPause = ref(true);
  const currentTS = ref(0);
  const durationTS = ref(Infinity);

  controllerWasmLoader.on("initialized", async (Module)=>{
  if(Module["key"] === 'GLController'){
      controllerWasmLoader.module["GLController"].on("OnDurationTS", (ts)=>{
        durationTS.value = Number(ts);
      });
  }});

  const timelineTS = ref(0);
  watch(() => currentTS.value, () => {
    timelineTS.value = Number(currentTS.value);

    if(timelineTS.value >= durationTS.value){
      isPause.value = true;
    }
  });

  const needSeek = ref('');

  const wasmRuntimeInited = ref(false);

  // only files which wasm need.
  const assetsList = ref([
    // "/fonts/GangFengFanTi.ttf",
    "/fonts/NotoSansSC-Regular.ttf",
    // "/glsl/text/slide_long_line_new.glsl",
    "/glsl/text/position_text.glsl",
    "/glsl/video/position.glsl",
    "/glsl/video/effect/hflip.glsl",
    // "/glsl/video/transition/book_flip.glsl",
  ]);

  for(let i = 0; i < assetsList.value.length; i++){
    console.log("url: ", assetConfig.getAssetUrl(assetsList.value[i]));
    uniSourceMap.push({
        url: assetConfig.getAssetUrl(assetsList.value[i]),
        wasmPath: assetsList.value[i],
    })
  }

  const config = ref({
    output: {
      filename: String("./out.mp4"),
      video: Boolean(false),
      audio: Boolean(false),
      audio_config:{
        sample_rate: Number(48000),
      },
      video_config:{
        bps: Number(4000000),
        codec_name: String("libx264"),
        fps: Number(30),
        height: Number(320),
        width: Number(240)
      }
    }
  });

  function loadAssets(l:number, r:number){
    if(wasmRuntimeInited.value){
      console.log("loadAssets: ", l , " , " , r);
      for(let i = l; i < r; i++){
        const assetUrl = assetConfig.getAssetUrl(assetsList.value[i]);
        console.log("loadNetFileToWasmFS: ", assetUrl, " ----> ", assetsList.value[i]);
        loadNetFileToWasmFS(assetUrl, assetsList.value[i]);
      }
    }
  }

  watch(() => wasmRuntimeInited.value, (newVal)=>{
    loadAssets(0, assetsList.value.length);

    if(newVal){
      console.log("wasmRuntimeInited, set config");
      config.value = 
      {
        output: {
          filename: String("./out.mp4"),
          video: Boolean(false),
          audio: Boolean(false),
          audio_config:{
            sample_rate: Number(48000),
          },
          video_config:{
            bps: Number(4000000),
            codec_name: String("libx264"),
            fps: Number(30),
            height: localStorage.previewSolutionHeight ? Number(localStorage.previewSolutionHeight) : 640,
            width: localStorage.previewSolutionWidth ? Number(localStorage.previewSolutionWidth) : 360
          }
        }
      };
    }
  });

  function jumpTimelineTo(fIdx: number, directly:boolean=false){
    if(!directly){
      const span = Math.abs(fIdx - timelineTS.value);
      console.log("span: ", span);
      if(span < 30 * 1 && span < durationTS.value / 5){
        //1s
        return;
      }
    }
    needSeek.value = 'all';
    timelineTS.value = fIdx < 0 ? 0 : (fIdx > durationTS.value ? durationTS.value : fIdx);
  }
  
  watch(() => assetsList.value.length, (newVal, oldVal) => {
    if(!wasmRuntimeInited){
      return;
    }
    if (newVal > oldVal) {
      loadAssets(oldVal, newVal);
    }
  });


  watch(config, (newVal) => {
    console.log("ConfigController: ", JSON.stringify(newVal));
    controllerWasmLoader.module["GLController"].controllerMethodProxy.Reset();
    controllerWasmLoader.module["GLController"].controllerMethodProxy.ConfigController(JSON.stringify(newVal));

    console.log("SetWindowSize: ", config.value.output.video_config.width, config.value.output.video_config.height);
    controllerWasmLoader.module["GLController"].controllerMethodProxy.SetWindowSize(config.value.output.video_config.width, config.value.output.video_config.height);
    console.log("SetRenderFPS: ", config.value.output.video_config.fps);
    controllerWasmLoader.module["GLController"].controllerMethodProxy.SetRenderFPS(config.value.output.video_config.fps);

    //init state pause, instead of stop.
    controllerWasmLoader.module["GLController"].controllerMethodProxy.SetState(0);
  }, {deep: false});

  watch(() => [config.value.output.video_config.width, config.value.output.video_config.height], ([newWidth, newHeight], [oldWidth, oldHeight]) => {
    if(wasmRuntimeInited.value){
      controllerWasmLoader.module["GLController"].controllerMethodProxy.SetWindowSize(newWidth, newHeight);
    };
  });

  watch(() => config.value.output.video_config.fps, (newVal, oldVal) => {
    if(wasmRuntimeInited.value){
      controllerWasmLoader.module["GLController"].controllerMethodProxy.SetRenderFPS(newVal);
    }
  });

  
  const previewMode = ref(localStorage.previewMode || 'OriginVideo');

  const applyNewResolutionMode = (currentMode:string, currentResolution:string, currentRatio:string)=>{
    let outputScale = 1;
      if(currentMode === 'OriginVideo'){
        outputScale = 1;
      }
      else if (currentMode === 'ScaledVideo'){
        outputScale = 3;
      }else{
        console.error("unknown currentMode:", currentMode);
        return false;
      }
      localStorage.outputScale = `${outputScale}`

      const previewSize = getSize(currentResolution, currentRatio);

      if (previewSize) {
        localStorage.previewSolutionWidth = String(GetStrideWidth(Math.floor(previewSize[0]/outputScale)));
        localStorage.previewSolutionHeight = String(GetStrideWidth(Math.floor(previewSize[1]/outputScale)));
        return true;
      }else{
        return false;
      }
  }

  return {
    isPause,
    currentTS,
    durationTS,
    timelineTS,
    needSeek,
    wasmRuntimeInited,
    // assetsList,
    config,
    previewMode,

    jumpTimelineTo,
    applyNewResolutionMode
  };
});
