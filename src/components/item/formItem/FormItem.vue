<template>
  <el-tabs
      v-if="componentData.dataType === 'Tabs'"
      v-bind="componentData.attr || {}"
      v-model="activeIndex"
  >
      <AttrContainer :attrData="componentData.children" />
  </el-tabs>
  <el-tab-pane
      v-else-if="componentData.dataType === 'TabPane'"
      :label="`${$t(componentData.name)}`"
      :name="index"
      :key="index"
  >
    <AttrContainer :attrData="componentData.children" />
  </el-tab-pane>
  <el-collapse
      v-else-if="componentData.dataType === 'Collapse'"
      v-model="activeIndex"
  >
    <AttrContainer :attrData="componentData.children" />
  </el-collapse>
  <el-collapse-item
      v-else-if="componentData.dataType === 'CollapsePane'"
      :title="componentData.showCount 
        ? `${$t(componentData.name)} (${componentData.children.length})` 
        : `${$t(componentData.name)}`"
      :name="index"
      :key="`${componentData.updateKey}-${updateSeed}`"
  >
    <AttrContainer :attrData="componentData.children" />
  </el-collapse-item>
  <el-radio
      v-else-if="componentData.dataType === 'RadioItem'"
      :label="componentData.value"
      size="large"
  >
    {{ $t(componentData.name) }}
  </el-radio>
  <el-radio-button
      v-else-if="componentData.dataType === 'RadioButtonItem'"
      :label="componentData.value"
      size="small"
  >
    {{ $t(componentData.name) }}
  </el-radio-button>
  <div class="formItem" v-else-if="componentData.dataType === 'Slider'">
    <span class="formTitle" v-show="componentData.name">{{ $t(componentData.name) }}</span>
    <div class="formContent">
      <el-slider v-model="formValue" v-bind="componentData.attr" />
    </div>
    <span class="ml-2 w-12 text-center text-sm leading-8">{{ formValue }}{{ componentData.label }}</span>
  </div>
  <div class="formItem" v-else-if="componentData.dataType === 'String'">
    <span class="formTitle" v-show="componentData.name">{{ $t(componentData.name) }}</span>
    <div class="formContent">
      <el-input @keydown.stop v-model="formValue" type="textarea" v-bind="componentData.attr" />
    </div>
  </div>
  <div class="formItem" v-else-if="componentData.dataType === 'Number'">
    <span class="formTitle" v-show="componentData.name">{{ $t(componentData.name) }}</span>
    <div class="formContent">
      <el-input-number @keydown.stop v-model="formValue" v-bind="componentData.attr" />
    </div>
  </div>
  <div class="formItem" v-else-if="componentData.dataType === 'Radio'">
    <span class="formTitle" v-show="componentData.name">{{ $t(componentData.name) }}</span>
    <div class="formContent">
      <el-radio-group v-model="formValue" v-bind="componentData.attr">
        <AttrContainer :attrData="componentData.children" />
      </el-radio-group>
    </div>
  </div>
  <div class="formItem" v-else-if="componentData.dataType === 'RadioButton'">
    <span class="formTitle" v-show="componentData.name">{{ $t(componentData.name) }}</span>
    <div class="formContent">
      <el-radio-group v-model="formValue" v-bind="componentData.attr">
        <AttrContainer :attrData="componentData.children" />
      </el-radio-group>
    </div>
  </div>
  <div class="formItem" v-else-if="componentData.dataType === 'Boolean'">
    <span class="formTitle" v-show="componentData.name">{{ $t(componentData.name) }}</span>
    <div class="formContent">
      <el-switch v-model="formValue" v-bind="componentData.attr" />
    </div>
  </div>
  <div class="formItem" v-else-if="componentData.dataType === 'TextArea'">
    <span class="formTitle" v-show="componentData.name">{{ $t(componentData.name) }}</span>
    <div class="formContent">
      <el-input
          @keydown.stop
          v-model="formValue"
          v-bind="componentData.attr"
          type="textarea"
      />
    </div>
  </div>
  <div class="formItem" v-else-if="componentData.dataType === 'Color'">
    <span class="formTitle" v-show="componentData.name">{{ $t(componentData.name) }}</span>
    <div class="formContent">
      <ColorPicker v-model="formValue" v-bind="componentData.attr" />
    </div>
  </div>
  <div class="formItem" v-else-if="componentData.dataType === 'Flex'">
    <span class="formTitle" v-show="componentData.name">{{ $t(componentData.name) }}</span>
    <div class="formContentFlex">
      <AttrContainer :attrData="componentData.children" />
    </div>
  </div>
  <div v-else-if="componentData.dataType === 'Grid'">
    <div class="grid grid-cols-2 gap-2">
      <AttrContainer :attrData="componentData.children" />
    </div>
  </div>
  <div  v-else-if="componentData.dataType === 'Button'">
    <div
    class="h-14 rounded overflow-hidden relative cursor-pointer"
    @click="addItem"
    >
      <CoverItem 
      :cover="componentData.covor"
      :name="`${$t(componentData.name)}`"
      />
    </div>
  </div>
  <div class="itemHeader" v-else-if="componentData.dataType === 'ListItem'">
    <span class="formTitle" v-show="componentData.name">{{ $t(componentData.name) }}</span>
    <ConfigDialog
        v-model:visible="showDialog"
        :original-data="componentData.data"
        @confirm="configItem"
      />
    <div class="itemActions">
      <el-button 
        size="small" 
        circle
        :disabled="false"
        @click="showDialog = true"
      >
        <el-icon><Setting /></el-icon>
      </el-button>
      <el-button 
        size="small" 
        circle
        :disabled="index === 0"
        @click="moveItemUp(index)"
      >
        <el-icon><ArrowUp /></el-icon>
      </el-button>
      <el-button 
        size="small" 
        circle
        :disabled="formValue === null || index === formValue.length - 1"
        @click="moveItemDown(index)"
      >
        <el-icon><ArrowDown /></el-icon>
      </el-button>
      <el-button 
        size="small" 
        type="danger" 
        circle
        @click="removeItem(index)"
      >
        <el-icon><Delete /></el-icon>
      </el-button>
    </div>
  </div>
  <div class="formItem" v-else-if="componentData.dataType === 'Select'">
    <span class="formTitle" v-show="componentData.name">{{ $t(componentData.name) }}</span>
    <div class="formContent">
      <div class="itemActions">
        <ConfigDialog
          v-model:visible="showDialog"
          :original-data="selectConfigData"
          @confirm="val => selectConfigData = val"
        />
        <el-select v-model="formValue" v-bind="componentData.attr" :popper-append-to-body="false">
          <el-option
            v-for="item in componentData.options"
            :key="item.value"
            :label="$t(item.label)"
            :value="item.value"
          />
        </el-select>
        <el-button 
          size="small" 
          circle
          :disabled="false"
          @click="showDialog = true"
        >
          <el-icon><Setting /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import ColorPicker from '@/components/item/formItem/color/ColorPicker.vue';
  import AttrContainer from '@/components/item/formItem/AttrContainer.vue';
  import ConfigDialog from '@/components/item/formItem/ConfigDialog.vue';
  import { ref, computed, onMounted } from 'vue';
  import { useTrackState } from '@/stores/trackState';
  import { storeToRefs } from 'pinia';
  import { get, set } from 'lodash-es';
  import { ArrowUp, ArrowDown, Delete, Plus, Setting } from '@element-plus/icons-vue';
  import { getId } from '@/utils/common';
  import CoverItem from "./CoverItem.vue";
  const props = defineProps({
    componentData: {
      type: Object,
      default() {
        return {};
      }
    },
    index: {
      type: Number,
      default: 0
    }
  });
  const trackStore = useTrackState();
  const activeIndex = ref(props.componentData.defaultValue); // 内部状态
  const { selectResource, selectTrackItem, trackList } = storeToRefs(trackStore);
  const formValue = computed({
    get() {
      if (trackStore.selectResource) {
        return get(trackStore.trackList[trackStore.selectTrackItem.line].list[trackStore.selectTrackItem.index], props.componentData.mappingKey);
      } else {
        return null;
      }
    },
    set(value) {
      if (selectResource.value && props.componentData.mappingKey) {
        set(trackList.value[selectTrackItem.value.line].list[selectTrackItem.value.index], props.componentData.mappingKey, value);
      }
    }
  });


  function getItem(value:string, map){
      let item = null;
      for(let i = 0; i < map.length; i++){
          if(map[i].value === value){
              item = map[i];
              break;
          }
      }

      return item;
  }
  const selectConfigData = computed({
    get() {
      if(props.componentData.ownSelectOptionsKey && props.componentData.mappingKey){
        const map = get(trackStore.trackList[trackStore.selectTrackItem.line].list[trackStore.selectTrackItem.index], props.componentData.ownSelectOptionsKey);
        const value = get(trackStore.trackList[trackStore.selectTrackItem.line].list[trackStore.selectTrackItem.index], props.componentData.mappingKey);
        const item = getItem(value, map);
        return item.data;
      }else{
        return {}
      }
    },
    set(itemData) {
      if (props.componentData.ownSelectOptionsKey && props.componentData.mappingKey) {
        const map = get(trackStore.trackList[trackStore.selectTrackItem.line].list[trackStore.selectTrackItem.index], props.componentData.ownSelectOptionsKey);
        const newMap = [...map];
        const value = get(trackStore.trackList[trackStore.selectTrackItem.line].list[trackStore.selectTrackItem.index], props.componentData.mappingKey);
        const item = getItem(value, newMap);
        item.data = itemData;
        set(trackStore.trackList[trackStore.selectTrackItem.line].list[trackStore.selectTrackItem.index], props.componentData.ownSelectOptionsKey, newMap);
      }
    }
  })

//   const currentConfig = ref({
//   name: '水平翻转',
//   path: "/glsl/video/effect/hflip.glsl",
//   duration: 15,
//   enabled: true,
//   uniforms: [
//     {
//       name: 'flipIntensity',
//       type: 'float',
//       value: 1.0,
//       min: 0.0,
//       max: 1.0,
//       step: 0.1,
//       label: '翻转强度',
//       description: '控制水平翻转的强度，0=不翻转，1=完全翻转'
//     },
//     {
//       name: 'centerOffset',
//       type: 'vec2',
//       value: [0.5, 0.5],
//       min: 0.0,
//       max: 1.0,
//       componentLabels: ['X 偏移', 'Y 偏移'],
//       description: '翻转中心点的位置偏移'
//     },
//     {
//       name: 'edgeSoftness',
//       type: 'float',
//       value: 0.05,
//       min: 0.0,
//       max: 0.5,
//       step: 0.01,
//       label: '边缘柔和度'
//     },
//     {
//       name: 'enableDistortion',
//       type: 'bool',
//       value: false,
//       label: '启用扭曲效果'
//     },
//     {
//       name: 'distortionType',
//       type: 'enum',
//       value: 'wave',
//       options: [
//         { value: 'wave', label: '波浪形' },
//         { value: 'spiral', label: '螺旋形' },
//         { value: 'pinch', label: '捏合' }
//       ],
//       label: '扭曲类型'
//     }
//   ]
// });

  const showDialog = ref(false);

  const updateSeed = ref(0);

  onMounted(() => {
    if (props.componentData?.updateKey) {
      trackStore.eventEmitter.on(props.componentData.updateKey, ()=>{
        console.log("updateSeed: ", updateSeed.value);
        updateSeed.value++;
      });
    }
  })

  const dispatchChange = () => {
    trackStore.effectListUpdate = true;
    trackStore.eventEmitter.dispatchEvent(props.componentData.targetListUpdateKey || null);
  }

  const addItem = async () => {
    const item = {...props.componentData.data, controller_key: "effect_" + getId()}
    // const newList = [...formValue.value, item];
    // formValue.value = newList;

    await trackStore.addAtransition(item);

    dispatchChange();
  };

  const removeItem = async (index: number) => {
    // const newList = [...formValue.value];

    await trackStore.removeAtransition(formValue.value[index]);

    // newList.splice(index, 1);
    // formValue.value = newList;

    dispatchChange();
  };

  const moveItemUp = (index: number) => {
    if (index === 0) return;
    const newList = [...formValue.value];
    [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
    formValue.value = newList;

    dispatchChange();
  };

  const moveItemDown = (index: number) => {
    if (index === formValue.value.length - 1) return;
    const newList = [...formValue.value];
    [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    formValue.value = newList;

    dispatchChange();
  };

  const configItem = (newConfig) => {
    let newList = [...formValue.value];
    newList[props.index] = newConfig;
    formValue.value = newList;

    dispatchChange();
  }
</script>

<style scoped>
  .formItem {
    @apply w-full flex flex-row grow-0 shrink-0 mb-1 justify-start items-center;
    min-height: 28px;
  }
  .formItemVertical {
    @apply w-full flex flex-col grow-0 shrink-0 mb-1 justify-start items-start;
  }
  .formTitle{
    @apply w-1/3 block pl-2 pr-2 text-left shrink-0;
    font-size: 12px;
    line-height: 28px;
    color: #6b7280;
  }
  .dark .formTitle{
    color: #9ca3af;
  }
  .formContent{
    @apply flex flex-row flex-1 items-center;
    min-height: 28px;
  }
  .formContentFlex{
    @apply flex flex-row flex-wrap flex-1 overflow-x-hidden shrink-0 justify-between gap-2;
  }
  .formContentFlex > * {
    flex: 1;
  }
  .formContentFlex .formTitle{
    @apply w-auto pl-0 pr-1;
    font-size: 12px;
  }
  .formContentFlex .formItem{
    @apply mb-0;
  }
  .itemHeader {
    padding: 4px 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--el-border-color);
    font-size: 12px;
  }
  .itemActions {
    width: 100%;
    display: flex;
    gap: 3px;
    align-items: center;
  }
</style>