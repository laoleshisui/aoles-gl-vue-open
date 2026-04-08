<template>
  <div class="tabsToggle">
    <div
      v-for="tab in menuData"
      class="relative"
      :class="[
        selected === tab.key 
          ? 'dark:text-white text-gray-800 active-tab' 
          : 'dark:text-gray-400 text-gray-800/60 hover:dark:text-white hover:text-gray-800'
      ]"
      @click="$emit('toggle', tab)"
      :key="tab.key"
    >
      <div class="tab-item group  overflow-hidden transition-all duration-300">
        <!-- Active indicator bar -->
        <div 
          class="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-purple-500 transition-all duration-500 ease-in-out"
          :class="[
            selected === tab.key ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0',
            store.hideSubMenu ? '-translate-x-4' : 'translate-x-0'
          ]"
        />
        
        <!-- Background highlight effect -->
        <div 
          class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg transition-all duration-300"
          :class="selected === tab.key ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-50'"
        />
        
        <!-- Glow effect -->
        <div 
          class="absolute inset-0 rounded-lg shadow-lg transition-all duration-500"
          :class="selected === tab.key ? 'shadow-blue-500/20 dark:shadow-purple-400/20' : 'shadow-transparent'"
        />
        
        <!-- Content -->
        <div class="relative z-10 flex flex-col items-center justify-center">
          <i 
            class="iconfont transition-all duration-300"
            :class="[
              tab.icon,
              selected === tab.key 
                ? 'scale-110 text-blue-600 dark:text-purple-300' 
                : 'group-hover:scale-105'
            ]"
          />
          <span 
            class="font-medium transition-all duration-300 mt-1"
            :class="selected === tab.key ? 'tracking-wide' : ''"
          >
            {{ $t(tab.title) }}
          </span>
        </div>
        
        <!-- Ripple effect -->
        <div class="ripple absolute inset-0 rounded-lg overflow-hidden">
          <div class="ripple-effect"></div>
        </div>

      </div>

      <div v-if="tab.key === 'materials' && accountState.generatingTasks.size + accountState.taskMaterials.length > 0"
          class="absolute z-[1] -top-0 -right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
      >
      {{ accountState.generatingTasks.size + accountState.taskMaterials.length }}
      </div>
    </div>

    <!-- 底部图片气泡弹窗组件 -->
    <div class="bottom-tab-wrapper">
      <ImageHoverPopover
        ref="qqGroupRef"
        image-src="/image/cover/qq_group.png"
        alt-text="音频封面"
        caption=""
        :show-arrow="false"
        max-width="100px"
        max-height="100px"
        position="top"
        :listenMouse="0x03"
      >
        <template #trigger>
          <div 
            class="tab-item group relative overflow-hidden transition-all duration-300 dark:text-gray-400 text-gray-800/60 hover:dark:text-white hover:text-gray-800"
            @click="handleQQGroupIconClick"
          >
            <!-- Background highlight effect -->
            <div 
              class="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg transition-all duration-300 opacity-0 scale-95 group-hover:opacity-50"
            />
            
            <!-- Glow effect -->
            <div 
              class="absolute inset-0 rounded-lg shadow-lg transition-all duration-500 shadow-transparent"
            />
            
            <!-- Content -->
            <div class="relative z-10 flex flex-col items-center justify-center w-full h-full">
              <i 
                class="iconfont icon-audio transition-all duration-300 group-hover:scale-105"
              />
              <Pengyouquan class="mt-1"/>
            </div>
            
            <!-- Ripple effect -->
            <div class="ripple absolute inset-0 rounded-lg overflow-hidden">
              <div class="ripple-effect"></div>
            </div>
          </div>
        </template>
      </ImageHoverPopover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { menuData, type MenuItem } from '@/data/baseMenu';
import { usePageState } from '@/stores/pageState';
import { ref, onMounted } from 'vue';
import ImageHoverPopover from "@/components/item/common/ImageHoverPopover.vue"
import Pengyouquan from './icons/Pengyouquan.vue';
import { useAccountState } from '@/stores/accountState';

const store = usePageState();
const accountState = useAccountState();

defineProps<{
  selected: string
}>();

defineEmits({
  toggle: (payload: MenuItem) => true
});

const qqGroupRef = ref();
const qqGroupVisible = ref(false);

const ICPInfoRef = ref();
const ICPInfoVisible = ref(false);

const handleQQGroupIconClick = () => {
  qqGroupVisible.value = !qqGroupVisible.value;
  if(qqGroupVisible.value){
    qqGroupRef.value.showPopover();
  }else{
    qqGroupRef.value.hidePopover();
  }
};

const handleICPIconClick = () => {
  ICPInfoVisible.value = !ICPInfoVisible.value;
  if(ICPInfoVisible.value){
    ICPInfoRef.value.showPopover();
  }else{
    ICPInfoRef.value.hidePopover();
  }
};

// Add ripple effect
const addRippleEffect = () => {
  const items = document.querySelectorAll('.tab-item');
  items.forEach(item => {
    item.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const ripple = this.querySelector('.ripple-effect');
      if (ripple) {
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('animate');
        
        setTimeout(() => {
          ripple.classList.remove('animate');
        }, 600);
      }
    });
  });
};

onMounted(() => {
  addRippleEffect();
});
</script>

<style scoped lang="scss">
.tabsToggle {
  width: 80px;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 100%;
  padding-bottom: 70px; // 为底部图标预留空间
  
  .tab-item {
    margin: 6px 7px;
    width: 66px;
    height: 58px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    border-radius: 8px;
    
    i {
      font-weight: 550;
      font-size: 18px;
      transition: all 0.3s ease;
    }
    
    span {
      font-size: 11px;
      font-weight: 500;
      line-height: 18px;
      transition: all 0.3s ease;
    }
    
    &.active-tab {
      transform: translateX(2px);
    }
  }
  
  /* 底部图标容器 - 固定在底部且水平居中 */
  .bottom-tab-wrapper {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex flex-col;
    justify-content: center;
    align-items: center;
    padding: 6px 0;
    
    .tab-item {
      margin: 0;
    }
  }
  
  // 指示条动画样式
  .absolute {
    transition: opacity 0.3s ease-in-out, 
                transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), 
                scale 0.3s ease-in-out;
    
    &:not(.-translate-x-4) {
      transition: opacity 0.3s ease-in-out, 
                  transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), 
                  scale 0.3s ease-in-out;
    }
  }
  
  .ripple {
    .ripple-effect {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      pointer-events: none;
      width: 20px;
      height: 20px;
      margin-left: -10px;
      margin-top: -10px;
      
      &.animate {
        animation: ripple 0.6s linear;
      }
    }
  }
  
  @keyframes ripple {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(10);
      opacity: 0;
    }
  }
}

.dark {
  .tabsToggle {
    .tab-item {
      &.active-tab {
        i {
          text-shadow: 0 0 10px rgba(192, 132, 252, 0.4);
        }
      }
    }
  }
}
</style>