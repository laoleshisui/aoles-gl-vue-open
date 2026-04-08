<template>
  <Teleport to="body">
    <transition name="dialog-fade">
      <div v-show="visible" class="dialog-mask" @click.self="handleClickOutside">
        <div class="dialog-container">
          <!-- 头部 -->
          <div class="dialog-header">
            <h2 class="dialog-title">{{ $t("HeaderContainer.GlobalConfigDialog.Title") }}</h2>
            <button class="close-btn" @click="handleClose">
              <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <!-- 内容区 -->
          <div class="dialog-body custom-scroll">
            <div class="config-section">
              <h3 class="section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {{ $t("HeaderContainer.GlobalConfigDialog.CommonTitle") }}
              </h3>
              
              <div class="config-grid">
                <template v-for="(item, key) in editedData" :key="key">
                  <div 
                    class="config-item"
                    v-show="editedData[key].visible === undefined ? true : editedData[key].visible"
                  >
                    <!-- Label -->
                    <div class="item-label">
                      <label :for="key">{{ $t(item.label) }}</label>
                      <div v-if="item.tooltip" class="tooltip-trigger">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        <div class="tooltip-popover">{{ item.tooltip }}</div>
                      </div>
                    </div>
                    
                    <!-- Controls -->
                    <div class="item-control">
                      <template v-if="key === 'language'">
                        <LangSelect class="custom-select"/>
                      </template>
                      <template v-else-if="key === 'darkSwitch'">
                        <DarkSwitch class="custom-switch"/>
                      </template>
                      
                      <!-- Boolean Toggle -->
                      <div v-else-if="typeof item.value === 'boolean'" class="toggle-group">
                        <button 
                          :class="{ active: item.value }" 
                          @click="item.value = true"
                          class="toggle-opt"
                        >ON</button>
                        <button 
                          :class="{ active: !item.value }" 
                          @click="item.value = false"
                          class="toggle-opt"
                        >OFF</button>
                      </div>
                      
                      <!-- Number -->
                      <el-input-number 
                        :disabled="true"
                        v-else-if="typeof item.value === 'number'"
                        @keydown.stop
                        :min="editedData[key].min"
                        :max="editedData[key].max"
                        :step="editedData[key].step"
                        v-model.number="editedData[key].value"
                        class="glass-input-number"
                        :controls-position="'right'"
                      />
                      
                      <!-- Array -->
                      <div v-else-if="Array.isArray(item.value)" class="array-group">
                        <div class="array-inputs">
                          <el-input-number
                            :disabled="true"
                            v-for="(arrItem, idx) in item.value" 
                            :key="idx"
                            v-model.number="item.value[idx]"
                            @keydown.stop
                            @input="(val)=>{if(val==='') item.value[idx] = 0}"
                            :min="item.min" :max="item.max" :step="item.step"
                            class="glass-input-number compact"
                            :controls="false" 
                          />
                        </div>
                        <button v-show="item.default" @click="item.value = [...item.default]" class="reset-icon-btn" title="Reset">
                           <el-icon><Refresh /></el-icon>
                        </button>
                      </div>
                      
                      <!-- Text -->
                      <input v-else type="text" :id="key" v-model="editedData[key]" class="glass-text-input"/>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
          
          <!-- 底部 -->
          <div class="dialog-footer">
            <button class="btn-cancel" @click="handleClose">
              {{ $t("HeaderContainer.GlobalConfigDialog.Close") }}
            </button>
            <button class="btn-confirm" @click="handleConfirm">
              {{ $t("HeaderContainer.GlobalConfigDialog.Confirm") }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Refresh } from '@element-plus/icons-vue';
import LangSelect from '@/locales/LangSelect.vue';
import DarkSwitch from '@/components/item/common/DarkSwitch.vue';

const props = defineProps({
  visible: Boolean,
  originalData: Object,
  title: String
});

const emit = defineEmits(['update:visible', 'confirm', 'close']);
const editedData = ref({});

watch(() => props.originalData, (newVal) => {
  if (newVal) editedData.value = JSON.parse(JSON.stringify(newVal));
}, { immediate: true, deep: true });

const handleClose = () => {
  emit('update:visible', false);
  emit('close');
};

const handleClickOutside = () => handleClose();

const handleConfirm = () => {
  emit('update:visible', false);
  emit('confirm', { ...editedData.value });
};
</script>

<style scoped>
:global(:root) {
  --gc-mask: rgba(0, 0, 0, 0.2);
  --gc-blur: 10px; /* 背景模糊 */

  /* 卡片本体：高透明度白色 */
  --gc-bg: rgba(255, 255, 255, 0.65);
  --gc-border: rgba(255, 255, 255, 0.8);
  --gc-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  
  --gc-text-main: #1e293b;
  --gc-text-muted: #64748b;

  --gc-header-border: rgba(0,0,0,0.05);
  
  /* Section：第二层玻璃 */
  --gc-section-bg: rgba(255, 255, 255, 0.5);
  --gc-item-bg: rgba(255, 255, 255, 0.6);
  --gc-item-border: rgba(255, 255, 255, 0.5);
  
  /* 输入控件 */
  --gc-input-bg: rgba(255, 255, 255, 0.5);
  --gc-input-focus-bg: rgba(255, 255, 255, 0.9);
  --gc-accent: #3b82f6;

  /* 按钮 */
  --gc-btn-cancel-bg: rgba(148, 163, 184, 0.2);
  --gc-btn-confirm-bg: linear-gradient(135deg, #6366f1, #3b82f6);
}

:global(.dark) {
  --gc-mask: rgba(0, 0, 0, 0.5);
  
  /* 深色模式：高透明度深色 */
  --gc-bg: rgba(30, 41, 59, 0.65);
  --gc-border: rgba(255, 255, 255, 0.1);
  --gc-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  
  --gc-text-main: #f1f5f9;
  --gc-text-muted: #94a3b8;

  --gc-header-border: rgba(255,255,255,0.05);

  --gc-section-bg: rgba(0, 0, 0, 0.2);
  --gc-item-bg: rgba(255, 255, 255, 0.05);
  --gc-item-border: rgba(255, 255, 255, 0.05);
  
  --gc-input-bg: rgba(0, 0, 0, 0.3);
  --gc-input-focus-bg: rgba(0, 0, 0, 0.5);

  --gc-btn-cancel-bg: rgba(255, 255, 255, 0.1);
}

/* 动画 */
.dialog-fade-enter-active, .dialog-fade-leave-active { transition: opacity 0.3s ease; }
.dialog-fade-enter-from, .dialog-fade-leave-to { opacity: 0; }
.dialog-fade-enter-active .dialog-container { animation: dialog-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.dialog-fade-leave-active .dialog-container { animation: dialog-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse; }

@keyframes dialog-pop {
  0% { transform: scale(0.95) translateY(10px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

.dialog-mask {
  position: fixed; inset: 0; z-index: 2000;
  display: flex; align-items: center; justify-content: center;
  background: var(--gc-mask);
  backdrop-filter: blur(var(--gc-blur));
}

.dialog-container {
  width: min(800px, 94vw);
  max-height: 85vh;
  display: flex; flex-direction: column;
  background: var(--gc-bg);
  border: 1px solid var(--gc-border);
  box-shadow: var(--gc-shadow);
  border-radius: 24px;
  backdrop-filter: blur(20px); /* 核心玻璃效果 */
  color: var(--gc-text-main);
  overflow: hidden;
}

/* Header */
.dialog-header {
  padding: 18px 24px;
  display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--gc-header-border);
}
.dialog-title { margin: 0; font-size: 1.25rem; font-weight: 700; color: var(--gc-text-main); }
.close-btn {
  width: 32px; height: 32px; border-radius: 50%; border: none;
  background: transparent; color: var(--gc-text-muted); cursor: pointer;
  display: grid; place-items: center; transition: 0.2s;
}
.close-btn:hover { background: rgba(0,0,0,0.05); color: var(--gc-text-main); }
.dark .close-btn:hover { background: rgba(255,255,255,0.1); }

/* Body */
.dialog-body { padding: 24px; overflow-y: auto; flex: 1; }

.config-section {
  background: var(--gc-section-bg);
  border-radius: 16px; padding: 20px;
  border: 1px solid var(--gc-item-border);
}
.section-title {
  margin: 0 0 16px 0; font-size: 1rem; font-weight: 600; 
  display: flex; align-items: center; color: var(--gc-text-main); opacity: 0.9;
}

.config-grid { display: flex; flex-direction: column; gap: 12px; }

.config-item {
  display: grid; grid-template-columns: 140px 1fr; align-items: center; gap: 16px;
  padding: 12px 16px; border-radius: 12px;
  background: var(--gc-item-bg);
  border: 1px solid var(--gc-item-border);
  transition: 0.2s;
}
.config-item:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

/* Label */
.item-label {
  font-size: 0.9rem; font-weight: 500; color: var(--gc-text-muted);
  display: flex; align-items: center; gap: 6px;
}
.tooltip-trigger { position: relative; color: var(--gc-text-muted); cursor: help; opacity: 0.7; }
.tooltip-trigger:hover { opacity: 1; color: var(--gc-accent); }
.tooltip-popover {
  position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%) translateY(-8px);
  width: max-content; max-width: 220px; padding: 8px 12px; border-radius: 8px;
  background: rgba(15,23,42,0.9); color: white; font-size: 0.75rem; line-height: 1.4;
  opacity: 0; pointer-events: none; visibility: hidden; transition: 0.2s; z-index: 10;
}
.tooltip-trigger:hover .tooltip-popover { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(-4px); }

/* Controls */
.item-control { display: flex; align-items: center; }

/* Toggle Group */
.toggle-group {
  display: inline-flex; background: var(--gc-input-bg); padding: 3px; border-radius: 8px;
  border: 1px solid var(--gc-item-border);
}
.toggle-opt {
  padding: 4px 12px; border-radius: 6px; border: none; font-size: 0.75rem; font-weight: 600;
  background: transparent; color: var(--gc-text-muted); cursor: pointer; transition: 0.2s;
}
.toggle-opt.active { background: var(--gc-accent); color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

/* Text Input */
.glass-text-input {
  width: 100%; padding: 8px 12px; border-radius: 8px;
  background: var(--gc-input-bg); border: 1px solid var(--gc-item-border);
  color: var(--gc-text-main); font-size: 0.9rem; outline: none; transition: 0.2s;
}
.glass-text-input:focus { background: var(--gc-input-focus-bg); border-color: var(--gc-accent); }

/* Array Inputs */
.array-group { display: flex; flex: 1; gap: 8px; width: 100%; }
.array-inputs { display: flex; gap: 8px; flex: 1; }
.reset-icon-btn {
  background: transparent; border: none; color: var(--gc-text-muted); cursor: pointer;
  padding: 4px; border-radius: 4px; display: flex; align-items: center; transition: 0.2s;
}
.reset-icon-btn:hover { background: var(--gc-input-bg); color: var(--gc-accent); }

/* Element Plus Overrides (Deep) */
:deep(.glass-input-number), :deep(.glass-input-number .el-input__wrapper) { width: 100%; }
:deep(.el-input__wrapper) {
  background-color: var(--gc-input-bg) !important;
  box-shadow: none !important;
  border: 1px solid var(--gc-item-border) !important;
  border-radius: 8px !important;
  padding: 4px 10px;
}
:deep(.is-focus .el-input__wrapper) {
  background-color: var(--gc-input-focus-bg) !important;
  border-color: var(--gc-accent) !important;
}
:deep(.el-input__inner) { color: var(--gc-text-main) !important; font-family: inherit; }
:deep(.el-input-number__decrease), :deep(.el-input-number__increase) {
  background: transparent !important;
  border-color: var(--gc-item-border) !important;
  color: var(--gc-text-muted) !important;
}
:deep(.compact .el-input__wrapper) { padding: 0 8px; }

/* Footer */
.dialog-footer {
  padding: 16px 24px; display: flex; justify-content: flex-end; gap: 12px;
  border-top: 1px solid var(--gc-header-border);
}
.dialog-footer button {
  padding: 10px 24px; border-radius: 12px; font-weight: 600; font-size: 0.9rem;
  border: none; cursor: pointer; transition: 0.2s;
}
.btn-cancel { background: var(--gc-btn-cancel-bg); color: var(--gc-text-muted); }
.btn-cancel:hover { background: rgba(148,163,184,0.3); }
.btn-confirm { background: var(--gc-btn-confirm-bg); color: white; box-shadow: 0 4px 10px rgba(59,130,246,0.3); }
.btn-confirm:hover { transform: translateY(-1px); filter: brightness(1.1); }

/* Scrollbar */
.custom-scroll::-webkit-scrollbar { width: 6px; }
.custom-scroll::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.3); border-radius: 10px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }

@media (max-width: 640px) {
  .config-item { grid-template-columns: 1fr; gap: 8px; }
  .dialog-container { width: 96vw; max-height: 90vh; }
  .item-label { margin-bottom: 4px; }
}
</style>