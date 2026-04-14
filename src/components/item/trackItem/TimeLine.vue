<template>
  <div ref="canvasContainer" class="relative w-full h-5 text-center leading-5 text-sm z-20">
    <canvas
        :style="canvasStyle"
        v-bind="canvasAttr"
        ref="timeLine"
        @click="handleClick"
        class="block w-full h-full"
    />
  </div>
</template>

<script setup lang="ts">
  import { usePageState } from '@/stores/pageState';
  import { drawTimeLine, getSelectFrame } from '@/utils/canvasUtil';
  import type { UserConfig, CanvasConfig } from '@/utils/canvasUtil';
  import { ref, computed, onMounted, onUnmounted, nextTick, watch, reactive, toRefs } from 'vue';
  
  const props = defineProps({
    start: { // 开始坐标
      type: Number,
      default: 0
    },
    step: { // 步进，与视频fps同步
      type: Number,
      default: 30
    },
    scale: { // 时间轴缩放比例
      type: Number,
      default: 0
    },
    focusPosition: { // 选中元素时在时间轴中高亮显示
      type: Object,
      default() {
        return {
          start: 0, // 起始帧数
          end: 0 // 结束帧数
        };
      }
    }
  });
  
  const emits = defineEmits({
    selectFrame(val: number) {
      return val !== null;
    }
  });
  
  /**
   * 初始化 Canvas
   * */
  const canvasContainer = ref<HTMLDivElement>();
  const timeLine = ref<HTMLCanvasElement>();
  let canvasContext = {} as CanvasRenderingContext2D;
  let resizeObserver: ResizeObserver | null = null;
  
  const { isDark, hideSubMenu } = toRefs(usePageState());
  const canvasConfigs = computed(() => ({
    bgColor: isDark.value ? '#37415160' : '#E5E7EB60', // 背景颜色
    ratio: window.devicePixelRatio || 1, // 设备像素比
    textSize: 12, // 字号
    textScale: 0.83, // 支持更小号字： 10 / 12
    lineWidth: 1, // 线宽
    // eslint-disable-next-line
    textBaseline: 'middle' as 'middle', // 文字对齐基线
    // eslint-disable-next-line
    textAlign: 'center' as 'center', // 文字对齐方式
    longColor: isDark.value ? '#E5E7EB' : '#374151', // 长线段颜色
    shortColor: isDark.value ? '#9CA3AF' : '#6B7280', // 短线段颜色
    textColor: isDark.value ? '#E5E7EB' : '#374151', // 文字颜色
    subTextColor: isDark.value ? '#9CA3AF' : '#6B7280', // 小文字颜色
    focusColor: isDark.value ? '#6D28D960' : '#C4B5FD60' // 选中元素区间
  }));
  
  const canvasAttr = reactive({
    width: 0,
    height: 0
  });
  
  const canvasStyle = computed(() => {
    return {
      width: '100%',
      height: '100%',
      display: 'block'
    };
  });
  
  // 重绘线条
  function updateTimeLine() {
    if (!canvasContext || !timeLine.value) return;
    drawTimeLine(canvasContext, { ...props } as UserConfig, { ...canvasAttr, ...canvasConfigs.value } as CanvasConfig);
  }
  
  // 设置 canvas 上下文环境
  function setCanvasContext() {
    if (!timeLine.value) return;
    canvasContext = timeLine.value.getContext('2d')!;
    canvasContext.font = `${canvasConfigs.value.textSize * canvasConfigs.value.ratio}px -apple-system, ".SFNSText-Regular", "SF UI Text", "PingFang SC", "Hiragino Sans GB", "Helvetica Neue", "WenQuanYi Zen Hei", "Microsoft YaHei", Arial, sans-serif`;
    canvasContext.lineWidth = canvasConfigs.value.lineWidth;
    canvasContext.textBaseline = canvasConfigs.value.textBaseline;
    canvasContext.textAlign = canvasConfigs.value.textAlign;
  }
  
  // 设置 canvas 大小
  function setCanvasRect() {
    if (!canvasContainer.value) return;
    
    const { width, height } = canvasContainer.value.getBoundingClientRect();
    
    // 确保canvas的像素尺寸与CSS尺寸匹配
    canvasAttr.width = Math.floor(width * canvasConfigs.value.ratio);
    canvasAttr.height = Math.floor(height * canvasConfigs.value.ratio);
    
    nextTick(() => {
      setCanvasContext();
      updateTimeLine();
    });
  }
  
  function handleClick(event: MouseEvent) {
    if (!timeLine.value) return;
    
    const rect = timeLine.value.getBoundingClientRect();
    const scaleX = timeLine.value.width / rect.width;
    const offset = (event.clientX - rect.left) * scaleX;
    
    const frameIndex = getSelectFrame(props.start + offset, props.scale, props.step);
    emits('selectFrame', frameIndex);
  }
  
  onMounted(() => {
    setCanvasRect();
    
    // 监听容器尺寸变化
    if (canvasContainer.value) {
      resizeObserver = new ResizeObserver(() => {
        setCanvasRect();
      });
      resizeObserver.observe(canvasContainer.value);
    }
    
    // 监听窗口大小变化
    window.addEventListener('resize', setCanvasRect, false);
  });
  
  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    window.removeEventListener('resize', setCanvasRect, false);
  });
  
  watch(canvasConfigs, updateTimeLine, { flush: 'post' });
  watch(props, updateTimeLine, { flush: 'post' });
  watch(hideSubMenu, () => {
    setTimeout(() => {
      setCanvasRect();
    }, 300);
  }, {
    flush: 'post'
  });
</script>