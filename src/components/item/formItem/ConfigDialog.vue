<!-- ConfigDialog.vue -->
<template>
  <Teleport to="body">
    <transition name="dialog-fade">
      <div v-show="visible" class="dialog-mask" @click.self="handleClickOutside">
        <div class="dialog-container">
          <!-- 对话框标题 -->
          <div class="dialog-header">
            <h2 class="dialog-title">{{ title }}</h2>
            <button class="close-btn" @click="handleClose">
              <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <!-- 配置表单 -->
          <div class="dialog-body custom-scroll">
            <div class="config-section">
              <h3 class="section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {{ $t("AttributeContainer.FormItem.ConfigDialog.CommonTitle") }}
              </h3>
              
              <div class="config-grid">
                <template v-for="(value, key) in editedData" :key="key">
                  <div v-if="['name', 'transition_duration_ts'].includes(key)" class="config-item">
                    <div class="item-label">
                      <label :for="key">{{ getLabel(key) }}</label>
                    </div>
                    
                    <div class="item-control">
                      <div v-if="typeof value === 'boolean'" class="toggle-group">
                        <button 
                          :class="{ active: editedData[key] }" 
                          @click="editedData[key] = true"
                          class="toggle-opt"
                        >On</button>
                        <button 
                          :class="{ active: !editedData[key] }" 
                          @click="editedData[key] = false"
                          class="toggle-opt"
                        >Off</button>
                      </div>
                      
                      <el-input-number 
                        v-else-if="typeof value === 'number'"
                        :id="key" 
                        v-model.number="editedData[key]"
                        class="glass-input-number"
                        :controls-position="'right'"
                      />
                      
                      <select v-else-if="key === 'language'" v-model="editedData[key]" class="glass-select">
                        <option value="zh-CN">简体中文</option>
                        <option value="en-US">English</option>
                        <option value="ja-JP">日本語</option>
                      </select>
                      
                      <input v-else type="text" readonly :id="key" :value="$t(editedData[key])" class="glass-text-input readonly"/>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <!-- Uniform 配置项 -->
            <div v-if="uniformConfig" class="config-section mt-4">
              <h3 class="section-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {{ $t("AttributeContainer.FormItem.ConfigDialog.UniformConfig") }}
              </h3>
              
              <div class="config-grid">
                <div v-for="(uniform, idx) in (editedData.uniforms || [])" :key="idx" class="config-item uniform-item">
                  
                  <!-- Uniform Header -->
                  <div class="uniform-header">
                    <h4>{{ $t(uniform.label || uniform.name) }}</h4>
                    <div v-if="uniform.description" class="tooltip-trigger">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                      <div class="tooltip-popover">{{ $t(uniform.description) }}</div>
                    </div>
                  </div>
                  
                  <!-- Uniform Controls -->
                  <div class="item-control full-width">
                    <!-- Float / Int -->
                    <div v-if="uniform.type === 'float' || uniform.type === 'int'" class="flex gap-2 w-full">
                      <el-input-number
                        v-model="uniform.value"
                        :min="uniform.min"
                        :max="uniform.max"
                        :step="uniform.step"
                        class="glass-input-number flex-1"
                        :controls-position="'right'"
                      />
                    </div>
                    
                    <!-- Vec2 / Vec3 -->
                    <div v-else-if="uniform.type === 'vec2' || uniform.type === 'vec3'" class="vector-grid">
                      <div v-for="(component, compIndex) in uniform.value" :key="compIndex" class="vector-cell">
                        <span class="vector-label">{{ uniform.componentLabels?.[compIndex] || ['X','Y','Z','W'][compIndex] }}</span>
                        <el-input-number
                          v-model.number="uniform.value[compIndex]"
                          :min="uniform.min"
                          :max="uniform.max"
                          :step="uniform.step || 0.01"
                          class="glass-input-number compact"
                          :controls="false"
                        />
                      </div>
                    </div>
                    
                    <!-- Bool -->
                    <div v-else-if="uniform.type === 'bool'" class="bool-control">
                      <label class="toggle-switch">
                        <input type="checkbox" v-model="uniform.value"/>
                        <span class="slider"></span>
                      </label>
                      <span class="value-text">{{ uniform.value ? 'ON' : 'OFF' }}</span>
                    </div>
                    
                    <!-- Enum -->
                    <div v-else-if="uniform.type === 'enum'" class="w-full">
                      <select v-model="uniform.value" class="glass-select w-full">
                        <option v-for="(option, optIndex) in uniform.options" :key="optIndex" :value="option.value">
                          {{ option.label || option.value }}
                        </option>
                      </select>
                    </div>
                    
                    <!-- Color -->
                    <div v-else-if="uniform.type === 'color'" class="color-picker-wrapper">
                       <input type="color" v-model="uniform.value" class="color-native-input"/>
                       <div class="color-preview" :style="{ backgroundColor: uniform.value }"></div>
                       <span class="color-code">{{ uniform.value }}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 预设部分 -->
              <div v-if="uniformPresets.length > 0" class="presets-container">
                <h4 class="presets-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="mr-1" stroke="currentColor" stroke-width="2">
                    <path d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Uniform 预设
                </h4>
                <div class="presets-list">
                  <div v-for="(preset, idx) in uniformPresets" :key="idx" 
                       class="preset-card" @click="loadUniformPreset(preset)">
                    <span class="preset-name">{{ preset.name }}</span>
                    <button @click.stop="deleteUniformPreset(idx)" class="preset-del-btn">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 底部按钮 -->
          <div class="dialog-footer">
            <button class="btn-cancel" @click="handleClose">
              {{ $t("AttributeContainer.FormItem.ConfigDialog.Close") }}
            </button>
            <button class="btn-confirm" @click="handleConfirm">
              {{ $t("AttributeContainer.FormItem.ConfigDialog.Confirm") }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps({
  visible: Boolean,
  originalData: Object,
  title: { type: String, default: "ConfigDialog" }
});

const emit = defineEmits(['update:visible', 'confirm', 'close']);

const editedData = ref({});
const uniformPresets = ref([]);

const uniformConfig = computed(() => {
  return editedData.value.uniforms && editedData.value.uniforms.length > 0;
});

function getDefaultValue(type) {
  switch (type) {
    case 'float': return 0.5;
    case 'int': return 1;
    case 'vec2': return [0.5, 0.5];
    case 'vec3': return [0.5, 0.5, 0.5];
    case 'bool': return false;
    case 'enum': return '';
    case 'color': return '#ffffff';
    default: return 0;
  }
}

watch(() => props.originalData, (newVal) => {
  if (newVal) {
    editedData.value = JSON.parse(JSON.stringify(newVal));
    if (editedData.value.uniforms === undefined) {
      editedData.value.uniforms = [];
    }
    // 确保有默认值
    editedData.value.uniforms.forEach(uniform => {
      if (uniform.value === undefined) {
        uniform.value = getDefaultValue(uniform.type);
      }
    });
  }
}, { immediate: true, deep: true });

onMounted(() => {
  try {
    const savedPresets = localStorage.getItem('uniformPresets');
    if (savedPresets) uniformPresets.value = JSON.parse(savedPresets);
  } catch (e) { console.error('Failed to load uniform presets', e); }
});

const handleClose = () => {
  emit('update:visible', false);
  emit('close');
};

const handleClickOutside = () => handleClose();

const handleConfirm = () => {
  const outputData = { ...editedData.value };
  if (outputData.uniforms && !Array.isArray(outputData.uniforms)) {
    outputData.uniforms = [];
  }
  emit('update:visible', false);
  emit('confirm', outputData);
};

const loadUniformPreset = (preset) => {
  if (confirm(`Load preset "${preset.name}"?`)) {
    editedData.value.uniforms = JSON.parse(JSON.stringify(preset.uniforms));
  }
};

const deleteUniformPreset = (index) => {
  if (confirm("Delete this preset?")) {
    uniformPresets.value.splice(index, 1);
    savePresetsToLocalStorage();
  }
};

const savePresetsToLocalStorage = () => {
  localStorage.setItem('uniformPresets', JSON.stringify(uniformPresets.value));
};

const getLabel = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
</script>

<style scoped>
:global(:root) {
  --config-mask: rgba(0, 0, 0, 0.2);
  --config-blur: 10px;

  /* 主体卡片 */
  --config-bg: rgba(255, 255, 255, 0.65);
  --config-border: rgba(255, 255, 255, 0.8);
  --config-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  
  --config-text-main: #1e293b;
  --config-text-muted: #64748b;
  --config-header-border: rgba(0,0,0,0.05);

  /* 内部 Section */
  --config-section-bg: rgba(255, 255, 255, 0.5);
  --config-item-bg: rgba(255, 255, 255, 0.6);
  --config-item-border: rgba(255, 255, 255, 0.5);
  
  /* 输入控件 */
  --config-input-bg: rgba(255, 255, 255, 0.5);
  --config-input-focus-bg: rgba(255, 255, 255, 0.9);
  --config-accent: #3b82f6;

  /* 按钮 */
  --config-btn-cancel: rgba(148, 163, 184, 0.2);
  --config-btn-confirm: linear-gradient(135deg, #6366f1, #3b82f6);
}

:global(.dark) {
  --config-mask: rgba(0, 0, 0, 0.5);
  
  --config-bg: rgba(30, 41, 59, 0.65);
  --config-border: rgba(255, 255, 255, 0.1);
  --config-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  
  --config-text-main: #f1f5f9;
  --config-text-muted: #94a3b8;
  --config-header-border: rgba(255,255,255,0.05);

  --config-section-bg: rgba(0, 0, 0, 0.2);
  --config-item-bg: rgba(255, 255, 255, 0.05);
  --config-item-border: rgba(255, 255, 255, 0.05);
  
  --config-input-bg: rgba(0, 0, 0, 0.3);
  --config-input-focus-bg: rgba(0, 0, 0, 0.5);
  
  --config-btn-cancel: rgba(255, 255, 255, 0.1);
}

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
  background: var(--config-mask);
  backdrop-filter: blur(var(--config-blur));
}

.dialog-container {
  width: min(800px, 94vw); max-height: 85vh;
  display: flex; flex-direction: column;
  background: var(--config-bg);
  border: 1px solid var(--config-border);
  box-shadow: var(--config-shadow);
  border-radius: 24px;
  backdrop-filter: blur(20px);
  color: var(--config-text-main);
  overflow: hidden;
}

/* Header */
.dialog-header {
  padding: 16px 24px; display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid var(--config-header-border);
}
.dialog-title { margin: 0; font-size: 1.25rem; font-weight: 700; color: var(--config-text-main); }
.close-btn {
  width: 32px; height: 32px; border-radius: 50%; border: none;
  background: transparent; color: var(--config-text-muted); cursor: pointer;
  display: grid; place-items: center; transition: 0.2s;
}
.close-btn:hover { background: rgba(0,0,0,0.05); color: var(--config-text-main); }
.dark .close-btn:hover { background: rgba(255,255,255,0.1); }

/* Body */
.dialog-body { padding: 24px; overflow-y: auto; flex: 1; }
.custom-scroll::-webkit-scrollbar { width: 6px; }
.custom-scroll::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.3); border-radius: 10px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }

.config-section {
  background: var(--config-section-bg);
  border-radius: 16px; padding: 20px;
  border: 1px solid var(--config-item-border);
}
.section-title {
  margin: 0 0 16px 0; font-size: 1rem; font-weight: 600; 
  display: flex; align-items: center; color: var(--config-text-main); opacity: 0.9;
}

.config-grid { display: flex; flex-direction: column; gap: 12px; }

.config-item {
  display: grid; grid-template-columns: 140px 1fr; align-items: center; gap: 16px;
  padding: 12px 16px; border-radius: 12px;
  background: var(--config-item-bg);
  border: 1px solid var(--config-item-border);
  transition: 0.2s;
}
.config-item.uniform-item { display: flex; flex-direction: column; align-items: stretch; gap: 8px; }
.config-item:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

/* Item Label */
.item-label {
  font-size: 0.9rem; font-weight: 500; color: var(--config-text-muted);
}
.uniform-header {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 0.9rem; font-weight: 600; color: var(--config-text-main);
  padding-bottom: 6px; border-bottom: 1px solid var(--config-header-border);
}
.tooltip-trigger { position: relative; color: var(--config-text-muted); cursor: help; opacity: 0.7; }
.tooltip-trigger:hover { opacity: 1; color: var(--config-accent); }
.tooltip-popover {
  position: absolute; bottom: 100%; right: 0; transform: translateY(-8px);
  width: max-content; max-width: 220px; padding: 8px 12px; border-radius: 8px;
  background: rgba(15,23,42,0.9); color: white; font-size: 0.75rem; 
  opacity: 0; pointer-events: none; visibility: hidden; transition: 0.2s; z-index: 10;
}
.tooltip-trigger:hover .tooltip-popover { opacity: 1; visibility: visible; transform: translateY(-4px); }

/* Controls */
.item-control { display: flex; align-items: center; gap: 12px; }
.item-control.full-width { width: 100%; flex-wrap: wrap; }

.toggle-group {
  display: inline-flex; background: var(--config-input-bg); padding: 3px; border-radius: 8px;
  border: 1px solid var(--config-item-border);
}
.toggle-opt {
  padding: 4px 12px; border-radius: 6px; border: none; font-size: 0.75rem; font-weight: 600;
  background: transparent; color: var(--config-text-muted); cursor: pointer; transition: 0.2s;
}
.toggle-opt.active { background: var(--config-accent); color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }

.glass-text-input, .glass-select {
  width: 100%; padding: 8px 12px; border-radius: 8px;
  background: var(--config-input-bg); border: 1px solid var(--config-item-border);
  color: var(--config-text-main); font-size: 0.9rem; outline: none; transition: 0.2s;
}
.glass-text-input.readonly { opacity: 0.7; cursor: default; }
.glass-text-input:focus, .glass-select:focus { background: var(--config-input-focus-bg); border-color: var(--config-accent); }

/* Vector Grid */
.vector-grid { display: flex; gap: 8px; width: 100%; }
.vector-cell { flex: 1; display: flex; align-items: center; background: var(--config-input-bg); border-radius: 8px; padding: 2px 6px; border: 1px solid var(--config-item-border); }
.vector-label { font-size: 0.7rem; font-weight: 700; color: var(--config-text-muted); width: 12px; margin-right: 4px; }

/* Boolean Toggle Switch */
.bool-control { display: flex; align-items: center; gap: 10px; width: 100%; }
.toggle-switch { position: relative; width: 44px; height: 24px; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute; inset: 0; cursor: pointer; background-color: rgba(148,163,184,0.3); border-radius: 34px; transition: .3s;
}
.slider:before {
  position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; border-radius: 50%; transition: .3s;
}
input:checked + .slider { background-color: var(--config-accent); }
input:checked + .slider:before { transform: translateX(20px); }
.value-text { font-size: 0.85rem; font-weight: 600; color: var(--config-text-muted); width: 30px; }

/* Color Picker */
.color-picker-wrapper { display: flex; align-items: center; gap: 10px; width: 100%; }
.color-native-input { width: 0; height: 0; opacity: 0; position: absolute; }
.color-preview {
  width: 100%; height: 32px; border-radius: 8px; border: 1px solid var(--config-item-border);
  position: relative; cursor: pointer;
}
.color-preview::after { content: ''; position: absolute; inset: 0; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1); border-radius: 8px; }
.color-code { font-family: monospace; font-size: 0.85rem; color: var(--config-text-muted); }

/* Presets */
.presets-container { margin-top: 12px; padding-top: 12px; border-top: 1px dashed var(--config-item-border); }
.presets-header { font-size: 0.85rem; color: var(--config-text-muted); margin: 0 0 8px 0; display: flex; align-items: center; }
.presets-list { display: flex; flex-wrap: wrap; gap: 8px; }
.preset-card {
  display: flex; align-items: center; gap: 8px; padding: 6px 10px;
  background: var(--config-input-bg); border: 1px solid var(--config-item-border);
  border-radius: 8px; cursor: pointer; transition: 0.2s; font-size: 0.85rem;
}
.preset-card:hover { background: var(--config-input-focus-bg); border-color: var(--config-accent); }
.preset-del-btn {
  background: transparent; border: none; color: #ef4444; opacity: 0.6; cursor: pointer;
  display: grid; place-items: center; padding: 2px;
}
.preset-del-btn:hover { opacity: 1; background: rgba(239,68,68,0.1); border-radius: 4px; }

/* Element Plus Deep Overrides */
:deep(.glass-input-number), :deep(.glass-input-number .el-input__wrapper) { width: 100%; }
:deep(.el-input__wrapper) {
  background-color: var(--config-input-bg) !important;
  box-shadow: none !important;
  border: 1px solid var(--config-item-border) !important;
  border-radius: 8px !important;
  padding: 1px 11px;
}
:deep(.is-focus .el-input__wrapper) {
  background-color: var(--config-input-focus-bg) !important;
  border-color: var(--config-accent) !important;
}
:deep(.el-input__inner) { color: var(--config-text-main) !important; font-family: inherit; height: 30px; }
:deep(.el-input-number__decrease), :deep(.el-input-number__increase) {
  background: transparent !important;
  border-color: var(--config-item-border) !important;
  color: var(--config-text-muted) !important;
  width: 28px;
}
:deep(.compact .el-input__wrapper) { padding-left: 0; padding-right: 0; text-align: center; }
:deep(.compact .el-input__inner) { text-align: center; }

/* Footer */
.dialog-footer {
  padding: 16px 24px; display: flex; justify-content: flex-end; gap: 12px;
  border-top: 1px solid var(--config-header-border);
}
.dialog-footer button {
  padding: 10px 24px; border-radius: 12px; font-weight: 600; font-size: 0.9rem;
  border: none; cursor: pointer; transition: 0.2s;
}
.btn-cancel { background: var(--config-btn-cancel); color: var(--config-text-muted); }
.btn-cancel:hover { background: rgba(148,163,184,0.3); }
.btn-confirm { background: var(--config-btn-confirm); color: white; box-shadow: 0 4px 10px rgba(59,130,246,0.3); }
.btn-confirm:hover { transform: translateY(-1px); filter: brightness(1.1); }

@media (max-width: 640px) {
  .config-item { grid-template-columns: 1fr; gap: 8px; }
  .dialog-container { width: 96vw; max-height: 90vh; }
}
</style>