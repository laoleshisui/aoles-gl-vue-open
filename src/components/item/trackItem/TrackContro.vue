<template>
  <div class="pl-4 pb-1 pr-4 w-full h-10">
    <div
      class="float-left ml-6 h-9 gap-6 flex flex-row flex-nowrap items-center justify-around"
    >
      <div v-for="item of icons" :key="item.title" @click="handlerIcon(item)">
        <el-tooltip
          :disabled="item.disable"
          class="bg-gray-400"
          :effect="store.isDark ? 'dark' : 'light'"
          :content="item.title"
          placement="bottom-start"
        >
          <component
            :is="item.icon"
            class="focus:outline-0"
            :class="item.disable ? 'cursor-not-allowed text-gray-400' : ''"
          />
        </el-tooltip>
      </div>
    </div>
    <div class="float-right flex w-36 h-9 justify-center items-center">
      <el-icon size="large" class="cursor-pointer hover:text-blue-400 mr-4"  @click="changeScale(-10)"><ZoomOut /></el-icon> 
      <el-slider v-model="modelValue" v-bind="sliderProps" />
      <el-icon size="large" class="cursor-pointer hover:text-blue-400 ml-4" @click="changeScale(10)"><ZoomIn /></el-icon> 
    </div>
  </div>
</template>

<script setup lang="ts">
  import { usePageState } from '@/stores/pageState';
  import { useTrackState } from '@/stores/trackState';
  import { usePreviewState } from '@/stores/previewState';
  import { getId } from '@/utils/common';
  import { ref, reactive, computed } from 'vue';
  import {ZoomIn, ZoomOut} from '@element-plus/icons-vue';
  import {downloadFileUrl } from '@/utils/common';
  import trackPipeline from '@/pipeline/track'
  import { useI18n } from 'vue-i18n';
import { ElMessage, ElMessageBox } from 'element-plus';
import AddTextInControlIcon from '@/components/icons/AddTextInControlIcon.vue';
import CaptureIcon from '@/components/icons/CaptureIcon.vue';
import SplitIcon from '@/components/icons/SplitIcon.vue';
import DeleteIcon from '@/components/icons/DeleteIcon.vue';
import UndoIcon from '@/components/icons/UndoIcon.vue';
import RedoIcon from '@/components/icons/RedoIcon.vue';
import { defaultTextSource } from '@/class/TextTrack';
  const previewState = usePreviewState();

  const { t } = useI18n()
  const props = defineProps({
    modelValue: {
      type: Number,
      default: 30
    }
  });
  const emit = defineEmits({
    'update:modelValue': val => {
      return val !== null;
    }
  });
  const modelValue = computed({
    get() {
      return props.modelValue;
    },
    set(value) {
      emit('update:modelValue', value);
    }
  });
  const store = usePageState();
  const trackStore = useTrackState();
  const previewStore = usePreviewState();
  const svgStyle = ref({
    fontSize: '1.75rem',
    padding: '0.25rem',
    boxSizing: 'content-box'
  });
  const sliderProps = reactive({
    showTooltip: false,
    size: 'small',
    step: 10,
    max: 100,
    min: 0
  });
  function changeScale(val: number) {
    let newVal = modelValue.value + val;
    if (newVal > sliderProps.max) newVal = sliderProps.max;
    if (newVal < sliderProps.min) newVal = sliderProps.min;
    modelValue.value = newVal;
  }
  const icons = computed(() => [
    // {
    //   title: '撤销',
    //   disable: true,
    //   icon: 'UndoIcon',
    //   icon: 'Undo'
    // },
    // {
    //   title: '前进',
    //   disable: true,
    //   icon: 'RedoIcon',
    //   icon: 'Redo'
    // },
    {
      title: '添加文字',
      disable: false,
      icon: AddTextInControlIcon,
      type: 'AddTextInControl',
    },
    {
      title: '截屏',
      disable: false,
      icon: CaptureIcon,
      type: 'Capture',
    },
    {
      title: '分割',
      disable: trackStore.selectTrackItem.line === -1 && trackStore.selectTrackItem.index === -1,
      icon: SplitIcon,
      type: 'Split',
    },
    {
      title: '删除',
      disable: trackStore.selectTrackItem.line === -1 && trackStore.selectTrackItem.index === -1,
      icon: DeleteIcon,
      type: 'Delete',
    }
  ]);

  const captureCanvas = () => {
    const element = document.querySelector('#canvas');
    if (!element) {
      console.error('Canvas 元素未找到');
      return null;
    }
    
    try {
      const dataUrl = element.toDataURL('image/png', 1.0);
      return dataUrl;
    } catch (error) {
      console.error('转换 Canvas 为 dataUrl 失败:', error);
      return null;
    }
  }


  async function handlerIcon(item: Record<string, any>) {
    console.log("handlerIcon: ", item);
    const { type, disable } = item;
    if (disable) {
      return;
    }
    if (type === 'Delete') {
      ElMessageBox.confirm(
        t('TrackControl.DeleteAllWarnMessage'),
        t('TrackControl.DeleteAllWarnTitle'),
        {
          confirmButtonText: t('TrackControl.DeleteAllWarnConfirmButtonText'),
          cancelButtonText: t('TrackControl.DeleteAllCancelButtonText'),
          type: 'warning',
        }
      )
      .then(async () => {
        await trackPipeline.deleteAllClips();
      })
      .catch(() => {
        ElMessage({
          type: 'info',
          message: t('TrackControl.DeleteAllWarnCancel'),
        });
      });
    } else if (type === 'Undo') {
      // store._undo();
    } else if (type === 'Redo') {
      // store._redo();
    } else if (type === 'Split') {
      const targetClip = trackStore.selectResource;
      await trackStore.splitClip(targetClip, previewStore.timelineTS);
    } else if (type === 'AddTextInControl') {
      trackPipeline.addResource(
        defaultTextSource, 
        {
          "startTime": Number(previewState.currentTS) + 1
        }
      );
    }
    else if(type === 'Capture'){
      const dataUrl = captureCanvas();
      downloadFileUrl(dataUrl, 'capture.png');
    }
  }
</script>