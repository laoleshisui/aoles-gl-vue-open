<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="visible"
        class="preview-modal-overlay"
        @click.self="handleClose"
      >
        <div class="preview-modal-shell">
          <button class="preview-modal-close" @click="handleClose">×</button>

          <div class="preview-media">
            <img
              v-if="type === 'image'"
              :src="src"
              crossorigin="anonymous"
              alt="preview image"
            />
            <video
              v-else-if="type === 'video'"
              :src="src"
              controls
              autoplay
            />
            <audio
              v-else-if="type === 'audio'"
              :src="src"
              controls
              autoplay
            />
            <p v-else class="unsupported">不支持预览的媒体类型</p>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  src: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'image',
    // validator: (value: string) => ['image', 'video'].includes(value)
  }
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'close'): void
}>()

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}
</script>

<style scoped>
.preview-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.72);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2147483647;
}

.preview-modal-shell {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 96vw;
  max-height: 96vh;
  padding: 24px;
  box-sizing: border-box;
}

.preview-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  border: none;
  background: rgba(18, 18, 18, 0.82);
  color: #fff;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  font-size: 22px;
  cursor: pointer;
  transition: background 0.2s ease;
  z-index: 10;
}

.preview-modal-close:hover {
  background: rgba(18, 18, 18, 0.95);
}

.preview-media {
  max-width: 92vw;
  max-height: 92vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-media img,
.preview-media video {
  display: block;
  max-width: 100%;
  max-height: 100%;
  height: calc(92vh - 48px);
  width: auto;
  object-fit: contain;
  background: #000;
  border-radius: 12px;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.32);
}

.preview-media video {
  outline: none;
}

.unsupported {
  color: #fff;
  padding: 24px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 12px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>