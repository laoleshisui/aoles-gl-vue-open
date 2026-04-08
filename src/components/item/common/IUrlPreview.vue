<template>
  <div
    draggable="true"
    class="task-card__thumbnail group/item w-12 h-12"
    @click="previewImage(replaceDomain(iurl.origin_url || iurl.url), getUrlType(iurl.url))"
  >
    <!-- 
      class="w-12 h-12" 是默认尺寸。
      当你在父组件调用 <FileThumbnail class="w-20 h-20" /> 时，
      Vue 会把它合并为 "task-card__thumbnail ... w-12 h-12 w-20 h-20"。
      只要 Tailwind配置正常，新的尺寸通常会覆盖旧的。
    -->

    <!-- 情况 A：显示图片 -->
    <img
      v-if="shouldShowImage"
      :src="standardUrl"
      crossorigin="anonymous"
      :class="[commonClass, 'object-cover']"
      alt="Preview"
      loading="lazy"
    />

    <!-- 情况 B：显示图标 -->
    <div
      v-else
      :class="[commonClass, 'flex items-center justify-center', fallbackConfig.bgClass]"
    >
      <el-icon :size="20" :class="fallbackConfig.textClass">
        <component :is="fallbackConfig.icon" />
      </el-icon>
    </div>

    <PreviewModal
      :visible="isPreviewVisible"
      :src="previewSrc"
      :type="previewType"
      @update:visible="isPreviewVisible = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getUrlType, isAudio, isImage, isVideo } from '@/utils/common';
import { replaceDomain } from '@/utils/network';

interface FileItemUrl {
  url: string;
  cover_url?: string;
}

const props = defineProps<{
  iurl: FileItemUrl;
}>();

const isPreviewVisible = ref(false);
const previewSrc = ref('');
const previewType = ref('image');

const previewImage = (url: string, type?: string) => {
  if (!url) return;
  previewSrc.value = url;
  previewType.value = type || getUrlType(url);
  isPreviewVisible.value = true;
};

// ================= 样式常量 =================

/**
 * 内部元素样式：
 * 关键是 w-full h-full，让内部内容永远跟随根 div 的大小变化
 */
const commonClass = `
  w-full h-full 
  rounded-md 
  border border-white/30 dark:border-gray-600/50 
  shadow-sm 
  cursor-pointer 
  hover:scale-105 transition-transform duration-200
  flex-shrink-0
`;

// ================= 逻辑处理 (保持不变) =================

const fileType = computed<'image' | 'video' | 'audio' | 'other'>(() => {
  const url = props.iurl.url;
  if (!url) return 'other';
  if (isImage(url)) return 'image';
  if (isVideo(url)) return 'video';
  if (isAudio(url)) return 'audio';
  return 'other';
});

const standardUrl = computed<string>(() => {
  const type = fileType.value;
  let rawUrl = '';
  if (type === 'image') {
    rawUrl = props.iurl.cover_url || props.iurl.url;
  } else if (type === 'video' && props.iurl.cover_url) {
    rawUrl = props.iurl.cover_url;
  }
  return rawUrl ? replaceDomain(rawUrl) : '';
});

const shouldShowImage = computed(() => !!standardUrl.value);

const fallbackConfig = computed(() => {
  const type = fileType.value;
  if (type === 'video') {
    return {
      bgClass: 'bg-indigo-50/50 dark:bg-indigo-900/20',
      textClass: 'text-indigo-600 dark:text-indigo-400',
      icon: 'VideoFileIcon'
    };
  }
  if (type === 'audio') {
    return {
      bgClass: 'bg-indigo-50/50 dark:bg-indigo-900/20',
      textClass: 'text-indigo-600 dark:text-indigo-400',
      icon: 'AudioFileIcon'
    };
  }
  return {
    bgClass: 'bg-gray-50/50 dark:bg-gray-800/20',
    textClass: 'text-gray-600 dark:text-gray-400',
    icon: 'FileIcon'
  };
});

</script>

<style lang="css" scoped>
/* 
   关键修改：
   移除了 width: 100%; height: 100%;
   现在尺寸完全由 Tailwind 的 class 控制（w-12 或 w-20 等）。
*/
.task-card__thumbnail {
  position: relative;
  /* display: inline-flex 保证它表现得像个图标盒子，不会占据整行 */
  display: inline-flex; 
  align-items: center;
  justify-content: center;
  
  cursor: grab;
  user-select: none;
}

.task-card__thumbnail:active {
  cursor: grabbing;
}

.task-card__thumbnail:hover :deep(img),
.task-card__thumbnail:hover :deep(div) {
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  filter: brightness(1.05);
}
</style>