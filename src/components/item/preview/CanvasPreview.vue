<template>
  <div class="absolute top-12 bottom-10 left-0 right-0 flex items-center justify-center">
    <div class="relative flex" :style="transformStyle">
      <canvas id="canvas" ref="previewCanvas" :width="videoWidth" :height="videoHeight" 
              class="block bg-black" />
      <PreviewMoveable 
          class="absolute top-0 left-0 w-full h-full" 
          :canvas-scale="scaleVal"
      />
    </div>
  </div>
  <PreviewControl />
  <div v-show="!store.wasmRuntimeInited" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
    <RandomLoading  size="150px"/>
  </div>
</template>


<script setup lang="ts">
  import { ref, inject, computed, watch, onMounted } from 'vue';
  import { usePreviewState } from '@/stores/previewState';
  import { controllerWasmLoader } from '@/utils/controllerWasmLoader';
  import PreviewControl from '@/components/item/preview/PreviewControl.vue';
  import PreviewMoveable from '@/components/item/preview/PreviewMoveable.vue';
  import { useTrackState } from '@/stores/trackState';
  import RandomLoading from '@/components/item/common/RandomLoading.vue'

  // WASM 资源路径由外部配置提供，不再内联打包
  import { usePageState } from '@/stores/pageState'

  const props = defineProps({
    containerSize: { // 容器大小
      type: Object,
      default() {
        return {
          width: 0,
          height: 0
        };
      }
    }
  });
  const store = usePreviewState();
  const trackStore = useTrackState();
  const pageStore = usePageState();
  const previewCanvas = ref();

  const videoConfig = computed(() => store.config.output.video_config);
  const videoWidth = computed(() => videoConfig.value.width);
  const videoHeight = computed(() => videoConfig.value.height);

  watch(() => [store.config.output.video_config.width, store.config.output.video_config.height], ([newWidth, newHeight]) => {
    trackStore.controllerCanvasSize = [newWidth, newHeight];
  });

  const loadControllerWasm = async () => {
    try {
      const controllerJs = pageStore.wasmConfig.jsPath
      const controllerWasm = pageStore.wasmConfig.wasmPath
      console.log('JS Path:', controllerJs)
      console.log('WASM Path:', controllerWasm)

      if (!controllerJs || !controllerWasm) {
        console.error('WASM paths not configured. Set pageState.wasmConfig before mounting ControllerPreview.')
        return
      }

      const module = await controllerWasmLoader.loadWasm({
        key: "GLController",
        jsPath: controllerJs,
        wasmPath: controllerWasm,
        canvas: previewCanvas.value
      })
      
      console.log('WASM module loaded successfully:', module)

      store.wasmRuntimeInited = true;
      console.log("wasmRuntimeInited: ", store.wasmRuntimeInited);

      previewCanvas.value.addEventListener('webglcontextlost', (event) => {
        event.preventDefault(); // 阻止浏览器默认恢复行为
        console.error("canvas 上下文丢失！");
        // 停止渲染循环
        // cancelAnimationFrame(animationFrame);
      });
  } catch (error) {
    console.error('加载WASM失败', error);
  }
  };

  onMounted(async () => {
    // 初始化 WASM 模块
    await loadControllerWasm();
  });

  const scaleVal = computed(() => {
    const { width, height } = props.containerSize;
    if (width === 0 || height === 0) return 1;

    // 减去头部和底部的边距 (根据你实际布局调整 96 这个值)
    const availWidth = width;
    const availHeight = height - 96;

    if (videoWidth.value === 0 || videoHeight.value === 0) return 1;

    return Math.min(
      availWidth / videoWidth.value,
      availHeight / videoHeight.value
    );
  });

  // 2. transformStyle 引用上面的 scaleVal
  const transformStyle = computed(() => {
    return {
      transform: `scale(${scaleVal.value})`,
      width: `${videoWidth.value}px`,
      height: `${videoHeight.value}px`,
      // 移除 marginLeft/marginTop，因为外层 flex 已经负责居中了
    };
  });
</script>

<style scoped>
.relative.flex {
  /* 确保容器强制水平居中 */
  margin-left: auto;
  margin-right: auto;
}
</style>