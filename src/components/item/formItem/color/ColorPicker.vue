<template>
  <el-popover
      placement="bottom"
      :width="220"
      trigger="click"
  >
    <template #reference>
      <div class="h-8 flex flex-row items-center cursor-pointer">
        <span
            class="w-6 h-4 block mr-4 border border-gray-500"
            :style="{ backgroundColor: displayValue }"
        />
        <i class="not-italic">{{ displayValue }}</i>
      </div>
    </template>
    <template #default>
      <Sketch :model-value="modelValue" @update:model-value="onUpdate" :preset-colors="defaultColors" />
    </template>
  </el-popover>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import defaultColors from './colorSet';
import { Sketch } from '@ckpack/vue-color';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue']);

// 确保显示的值符合 #RRGGBBAA 格式
const displayValue = computed(() => {
  // 如果当前值是有效颜色，但格式不是8位，转换为8位格式
  if (/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/i.test(props.modelValue)) {
    return expandTo8Digit(props.modelValue);
  }
  return props.modelValue;
});

// 将颜色扩展为8位格式 (#RRGGBBAA)
function expandTo8Digit(color: string): string {
  if (color.length === 4 || color.length === 7) {
    // 处理简写格式如 #RGB 或 #RRGGBB
    return color + (color.length === 4 ? 'F' : 'FF');
  }
  return color;
}

function onUpdate(value: any) {
  // 确保返回8位HEX格式
  let hexValue = value.hex8;
  // 如果vue-color返回的不是8位格式，手动转换
  if (hexValue.length === 7) {
    hexValue += 'FF';
  } else if (hexValue.length === 4) {
    hexValue += 'F';
  }
  emit('update:modelValue', hexValue);
}

// 辅助函数：将3位HEX扩展为6位
function expandHex(shortHex: string): string {
  if (shortHex.length === 4) {
    return `#${shortHex[1]}${shortHex[1]}${shortHex[2]}${shortHex[2]}${shortHex[3]}${shortHex[3]}`;
  }
  return shortHex;
}
</script>