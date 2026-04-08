<template>
    <!-- No changes needed in the template wrapper -->
    <el-dropdown trigger="click" @command="handleRatioChange" placement="bottom-end">
        <el-button
            size="small"
            class="transparent-btn"
        >
            {{ currentRatio }}
        </el-button>
        <template #dropdown>
            <el-dropdown-menu class="custom-dropdown-menu">
                <!-- START: Multi-Mode Switch Section -->
                <div class="dropdown-control-item" @click.stop>
                    <div class="control-header">
                        <span class="control-label" style="display: block; text-align: center;">{{ t('ControllerPreview.ResolutionSetter.PreviewModeLabel') }}</span>
                    </div>
                    <!-- 使用 Radio Group 实现多档切换 -->
                    <el-radio-group 
                        v-model="currentMode" 
                        size="small" 
                        @change="handleModeChange"
                        class="mode-switch-group"
                    >
                        <el-radio-button 
                            v-for="mode in modeOptions"
                            :key="mode.value"
                            :label="t(mode.label)"
                            :value="mode.value"
                        >
                        </el-radio-button>
                    </el-radio-group>
                    <el-radio-group 
                        v-model="currentResolution" 
                        size="small" 
                        @change="handleResolutionChange"
                        class="mode-switch-group"
                    >
                        <el-radio-button 
                            v-for="resolution in resolutionOptions"
                            :key="resolution.value"
                            :label="resolution.label"
                            :value="resolution.value"
                        >
                        </el-radio-button>
                    </el-radio-group>
                </div>
                <!-- Optional Divider -->
                <el-divider style="margin: 5px 0;" />
                <!-- END: Multi-Mode Switch Section -->

                <el-dropdown-item
                    v-for="ratio in ratioOptions"
                    :key="ratio"
                    :command="ratio"
                    :class="{ 'is-active': ratio === currentRatio }"
                >
                    {{ ratio }}
                </el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePreviewState } from '@/stores/previewState';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { getSize, GetStrideWidth } from '@/utils/common';

const store = usePreviewState();
const { t } = useI18n()

// --- Multi-Mode Logic ---
// 定义多档模式选项
const modeOptions = [
    { label: 'ControllerPreview.ResolutionSetter.ModeOptions.OriginVideo', value: 'OriginVideo' },
    { label: 'ControllerPreview.ResolutionSetter.ModeOptions.ScaledVideo', value: 'ScaledVideo' },
];

const resolutionOptions = [
    { label: '480P', value: '480p' },
    { label: '720P', value: '720p' },
    { label: '1080P', value: '1080p' },
    { label: '2K', value: '2k' },
    { label: '4K', value: '4k' },
];

const ratioOptions: string[] = ['9:16', '16:9', '1:1', '3:4', '4:3'];

const currentMode = ref<string>(localStorage.previewMode || store.previewMode);
const currentResolution = ref<string>(localStorage.targetResolution || "1080p");
const currentRatio = ref<string>(localStorage.resolutionRatio || '16:9');

console.log("init state:", currentMode.value, currentResolution.value, currentRatio.value);

function handleModeChange (val: string | number | boolean){
    const newModeIdx = String(val);
    console.log("handleModeChange", newModeIdx, localStorage.previewMode)

    if (newModeIdx === localStorage.previewMode) {
      console.error("previewMode not changed:", newModeIdx);
      return;
    }

    ElMessageBox.confirm(
      t('ControllerPreview.ResolutionSetter.ChangeWarnMessage'),
      t('ControllerPreview.ResolutionSetter.ChangeWarnTitle'),
      {
        confirmButtonText: t('ControllerPreview.ResolutionSetter.ChangeWarnConfirmButtonText'),
        cancelButtonText: t('ControllerPreview.ResolutionSetter.ChangeWarnCancelButtonText'),
        type: 'warning',
      }
    )
    .then(() => {
      // 保存状态
      localStorage.previewMode = newModeIdx;
      currentMode.value = newModeIdx;
      store.previewMode = newModeIdx;

      // 可以在这里根据不同模式做逻辑处理
      console.log('Mode changed to:', newModeIdx);
      ElMessage.success(`Switched to ${newModeIdx.toUpperCase()} mode`);

      applyChange();
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: t('ControllerPreview.ResolutionSetter.ChangeWarnCancel'),
      });
      currentMode.value = localStorage.previewMode
    });
};

function handleResolutionChange (val: string | number | boolean){
    const newResolution = String(val);
    console.log("handleResolutionChange", newResolution, localStorage.targetResolution)

    if (newResolution === localStorage.targetResolution) {
      console.error("previewResolution not changed:", newResolution);
      return;
    }

    ElMessageBox.confirm(
      t('ControllerPreview.ResolutionSetter.ChangeWarnMessage'),
      t('ControllerPreview.ResolutionSetter.ChangeWarnTitle'),
      {
        confirmButtonText: t('ControllerPreview.ResolutionSetter.ChangeWarnConfirmButtonText'),
        cancelButtonText: t('ControllerPreview.ResolutionSetter.ChangeWarnCancelButtonText'),
        type: 'warning',
      }
    )
    .then(() => {
      // 保存状态
      localStorage.targetResolution = newResolution;
      currentResolution.value = newResolution;
      // store.previewResolution = newResolution;

      // 可以在这里根据不同模式做逻辑处理
      console.log('newResolution changed to:', newResolution);
      ElMessage.success(`Switched to ${newResolution.toUpperCase()}`);
    

      applyChange();
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: t('ControllerPreview.ResolutionSetter.ChangeWarnCancel'),
      });
      currentResolution.value = localStorage.targetResolution
    });
};

function handleRatioChange (command: string | number | object){
  const newRatio = command as string;

  if (newRatio === currentRatio.value) {
    return;
  }

  ElMessageBox.confirm(
    t('ControllerPreview.ResolutionSetter.ChangeWarnMessage'),
    t('ControllerPreview.ResolutionSetter.ChangeWarnTitle'),
    {
      confirmButtonText: t('ControllerPreview.ResolutionSetter.ChangeWarnConfirmButtonText'),
      cancelButtonText: t('ControllerPreview.ResolutionSetter.ChangeWarnCancelButtonText'),
      type: 'warning',
    }
  )
  .then(() => {
    // 保存状态
    localStorage.resolutionRatio = newRatio;
    currentRatio.value = newRatio;
    // store.currentRatio = newRatio;

  
    // 可以在这里根据不同模式做逻辑处理
    console.log('newRatio changed to:', newRatio);
    ElMessage.success(`Switched to ${newRatio.toUpperCase()}`);
  
    applyChange();
  })
  .catch(() => {
    ElMessage({
      type: 'info',
      message: t('ControllerPreview.ResolutionSetter.ChangeWarnCancel'),
    });
    currentRatio.value = localStorage.resolutionRatio
  });
};

const applyChange = ()=>{
    const succeed =store.applyNewResolutionMode(currentMode.value, currentResolution.value, currentRatio.value)

    if(succeed){
      ElMessage({
          type: 'success',
          message: t('ControllerPreview.ResolutionSetter.ChangeWarnChangeSucceed'),
      });

      setTimeout(() => {
          window.location.reload();
      }, 500);
    }else{
      ElMessage({
          type: 'error',
          message: t('ControllerPreview.ResolutionSetter.ChangeWarnChangeError'),
      });
    }
    
}
</script>

<style scoped>
.transparent-btn {
  background: transparent;
  border-color: #5b6e97a0; 
  color: #86a3c3a0; 
}

.transparent-btn:hover,
.transparent-btn:focus {
  background: transparent;
  color: #409EFF; 
  border-color: #c6e2ff; 
}

/* 容器样式调整 */
.dropdown-control-item {
    padding: 8px 16px;
    display: flex;
    flex-direction: column; /* 改为垂直布局，以便上面放Label，下面放较宽的按钮组 */
    gap: 8px; 
    min-width: 200px; /* 稍微加宽下拉菜单以容纳三个按钮 */
    cursor: default; 
}

.control-header {
    margin-bottom: 0px;
}

.control-label {
    font-size: 13px;
    color: #909399; /* 使用稍淡的颜色作为标题 */
}

/* 确保 radio group 填满宽度 */
.mode-switch-group {
    width: 100%;
    display: flex;
}
.mode-switch-group .el-radio-button {
  flex: 1;
  /* min-width: 0; */
}
.mode-switch-group .el-radio-button .el-radio-button__inner {
  width: 100%;
  text-align: center;
  box-sizing: border-box;
}

/* 强制让按钮均分宽度 (可选) */
:deep(.el-radio-button__inner) {
    width: 100%;
    padding-left: 5px;
    padding-right: 5px;
    text-align: center;
}
:deep(.el-radio-button) {
    flex: 1;
}
</style>