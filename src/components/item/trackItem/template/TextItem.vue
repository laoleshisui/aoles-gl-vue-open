<template>
  <div
    class="track-text-card"
    @mouseenter="isHovering = true"
    @mouseleave="isHovering = false"
  >
    <div
      class="track-text-header"
      :class="{
        'is-hover': isHovering && !isEditing,
        'is-editing': isEditing
      }"
    >
      <TextIcon class="header-icon" />
      <span class="header-title" @click.stop="startEditing">
        {{ props.trackItem.name || '未命名文本' }}
      </span>

      <input
        v-show="isEditing"
        ref="nameInput"
        v-model="editedName"
        type="text"
        maxlength="80"
        placeholder="输入内容"
        class="name-input"
        @focus="handleFocus"
        @blur="saveEdit"
        @keydown.stop="handleKeydown"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';
import { useTrackState } from '@/stores/trackState';
import TextIcon from '@/components/icons/TextIcon.vue';

interface TrackItemPayload {
  width?: string;
  left?: string;
  name: string;
  id?: string;
}

const props = withDefaults(
  defineProps<{
    trackItem: TrackItemPayload;
    isEditActive?: boolean;
  }>(),
  {
    trackItem: () => ({
      width: '0px',
      left: '0px',
      name: '',
      id: ''
    }),
    isEditActive: false
  }
);

const store = useTrackState();

const isHovering = ref(false);
const isEditing = ref(false);
const editedName = ref(props.trackItem.name);
const nameInput = ref<HTMLInputElement | null>(null);

const startEditing = () => {
  if (isEditing.value) return;
  isEditing.value = true;
  editedName.value = props.trackItem.name;
  nextTick(() => {
    nameInput.value?.focus();
    nameInput.value?.select();
  });
};

const handleFocus = () => {
  nameInput.value?.select();
};

const saveEdit = () => {
  if (!isEditing.value) return;
  const trimmed = editedName.value.trim();
  if (trimmed && trimmed !== props.trackItem.name) {
    if (store.selectResource) {
      store.selectResource.name = trimmed;
    }
  } else {
    editedName.value = props.trackItem.name;
  }
  isEditing.value = false;
};

const cancelEdit = () => {
  editedName.value = props.trackItem.name;
  isEditing.value = false;
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    saveEdit();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    cancelEdit();
  } else if (event.key === 'Backspace' || event.key === 'Delete') {
    event.preventDefault();
    editedName.value = editedName.value.slice(0, -1);
  }
};

watch(
  () => props.trackItem.name,
  newName => {
    if (!isEditing.value) {
      editedName.value = newName;
    }
  }
);

watch(
  () => props.isEditActive,
  active => {
    if (active) {
      startEditing();
    } else if (isEditing.value) {
      cancelEdit();
    }
  }
);

defineExpose({
  startEditing
});
</script>

<style scoped>
:global(:root) {
  --text-track-card-bg: linear-gradient(135deg, rgba(247, 249, 255, 0.88), rgba(232, 238, 255, 0.84));
  --text-track-card-border: rgba(148, 163, 184, 0.35);
  --text-track-card-shadow: 0 14px 24px rgba(148, 163, 184, 0.2);
  --text-track-hover-shadow: 0 18px 28px rgba(96, 165, 250, 0.22);

  --text-track-header-bg: rgba(241, 245, 255, 0.82);
  --text-track-header-text: #1f2937;
  --text-track-header-hover-bg: rgba(219, 234, 254, 0.96);
  --text-track-header-icon: #2563eb;

  --text-track-input-bg: rgba(255, 255, 255, 0.98);
  --text-track-input-text: #0f172a;
  --text-track-input-border: rgba(99, 102, 241, 0.45);
  --text-track-input-focus-border: rgba(59, 130, 246, 0.7);
  --text-track-input-shadow: 0 0 0 3px rgba(99, 102, 241, 0.16);
  --text-track-input-focus-shadow: 0 0 0 3px rgba(59, 130, 246, 0.22);
}

:global(.dark) {
  --text-track-card-bg: linear-gradient(135deg, rgba(29, 39, 66, 0.88), rgba(18, 27, 50, 0.84));
  --text-track-card-border: rgba(59, 130, 246, 0.32);
  --text-track-card-shadow: 0 16px 30px rgba(15, 23, 42, 0.38);
  --text-track-hover-shadow: 0 22px 36px rgba(59, 130, 246, 0.28);

  --text-track-header-bg: rgba(37, 51, 82, 0.82);
  --text-track-header-text: #e8edff;
  --text-track-header-hover-bg: rgba(51, 65, 105, 0.9);
  --text-track-header-icon: #93c5fd;

  --text-track-input-bg: rgba(15, 23, 42, 0.94);
  --text-track-input-text: #f8fafc;
  --text-track-input-border: rgba(96, 165, 250, 0.5);
  --text-track-input-focus-border: rgba(147, 197, 253, 0.75);
  --text-track-input-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18);
  --text-track-input-focus-shadow: 0 0 0 3px rgba(96, 165, 250, 0.28);
}

.track-text-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 6px;
  overflow: hidden;
  background: var(--text-track-card-bg);
  border: 1px solid var(--text-track-card-border);
  box-shadow: var(--text-track-card-shadow);
  transition: transform 0.18s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.track-text-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--text-track-hover-shadow);
}

.track-text-header {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 12px;
  background: var(--text-track-header-bg);
  color: var(--text-track-header-text);
  font-size: 0.75rem;
  letter-spacing: 0.01em;
  cursor: text;
  user-select: none;
  transition: background 0.2s ease, color 0.2s ease;
  position: relative;
}

.track-text-header.is-hover {
  background: var(--text-track-header-hover-bg);
}

.track-text-header.is-editing {
  background: var(--text-track-header-hover-bg);
}

.header-icon {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
  color: var(--text-track-header-icon);
  transition: transform 0.2s ease;
}

.track-text-header.is-hover .header-icon,
.track-text-header.is-editing .header-icon {
  transform: scale(1.1);
}

.header-title {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.name-input {
  position: absolute;
  left: 1.75rem;
  right: 0.75rem;
  height: 20px;
  border: 1px solid var(--text-track-input-border);
  border-radius: 4px;
  background: var(--text-track-input-bg);
  color: var(--text-track-input-text);
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0 6px;
  outline: none;
  box-shadow: var(--text-track-input-shadow);
  transition: border 0.18s ease, box-shadow 0.18s ease;
}

.name-input:focus {
  border-color: var(--text-track-input-focus-border);
  box-shadow: var(--text-track-input-focus-shadow);
}

@media (prefers-reduced-motion: reduce) {
  .track-text-card,
  .track-text-header,
  .header-icon,
  .name-input {
    transition: none;
  }
}
</style>