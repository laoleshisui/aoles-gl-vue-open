<template>
    <div class="relative flex-shrink-0">
        <img
            v-if="isImage(editableData.previewUrl)"
            crossorigin="anonymous"
            :src="editableData.previewUrl"
            alt="preview"
            class="w-20 h-14 object-cover rounded-md border dark:border-gray-600"
        >
        <AudioFileIcon
            v-else-if="isAudio(editableData.originUrl)"
            class="w-20 h-14 object-cover rounded-md border dark:border-gray-600"
        />
        <VideoFileIcon
            v-else
            class="w-20 h-14 object-cover rounded-md border dark:border-gray-600"
        />
        <button
            @click.stop="emit('delete', editableData)"
            class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
        >
            <el-icon :size="12">
                <Close />
            </el-icon>
        </button>
        <button
            v-show="editableData.editable"
            @click.stop="()=>{emit('edit', editableData); }"
            class="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
        >
            <el-icon :size="12">
                <EditPen />
            </el-icon>
        </button>
    </div>
</template>

<script setup lang="ts">
import { EditPen, Close } from '@element-plus/icons-vue';
import { isAudio, isImage } from '@/utils/common';

interface EditableData {
    name: string | number;
    previewUrl: string;
    originUrl: string;
    editable?: boolean
}

const props = defineProps<{ editableData: EditableData }>();
const emit = defineEmits<{
  (e: 'delete', payload: EditableData): void;
  (e: 'edit', payload: EditableData): void;
}>();
</script>