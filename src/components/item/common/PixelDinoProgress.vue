<template>
  <div 
    class="lumina-progress" 
    :style="{ 
      '--p': safeProgress + '%', 
      '--theme': color,
      '--height': height + 'px' 
    }"
    :class="{ 'is-finished': isCompleted }"
  >
    <!-- 背景轨道 -->
    <div class="track-base"></div>

    <!-- 进度填充（流光渐变） -->
    <div class="track-fill"></div>

    <!-- 动态里程碑节点 -->
    <div 
      v-for="node in nodes" 
      :key="node" 
      class="milestone"
      :class="{ 'reached': safeProgress >= node }"
      :style="{ left: node + '%' }"
    ></div>

    <!-- 障碍物：极简浮动几何 -->
    <div 
      v-for="(obs, i) in obstacles" 
      :key="i"
      class="obs-node"
      :style="{ left: obs.pos + '%' }"
    >
      <div class="obs-shape" :class="obs.type"></div>
    </div>

    <!-- 核心玩家：Lumina (能量体) -->
    <div 
      class="lumina-player"
      :style="{ 
        left: safeProgress + '%',
        transform: `translateX(-50%) translateY(${-jumpHeight}px) rotate(${rotation}deg)`
      }"
    >
      <div class="spark-core" :class="playerState">
        <div class="trail"></div>
      </div>
      
      <!-- 悬浮数值显示 -->
      <div class="value-badge" v-if="safeProgress > 0 && !isCompleted">
        {{ Math.floor(safeProgress) }}
      </div>
    </div>

    <!-- 胜利光幕 -->
    <transition name="wave">
      <div v-if="isCompleted" class="finish-overlay">
        <span class="finish-text">COMPLETED</span>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';

interface Props {
  percentage: number;
  height?: number;
  color?: string; // 主题色
}

const props = withDefaults(defineProps<Props>(), {
  percentage: 0,
  height: 60,
  color: '#6366f1' // 默认 Indigo
});

const nodes = [25, 50, 75];
const safeProgress = computed(() => Math.min(100, Math.max(0, props.percentage)));
const isCompleted = computed(() => safeProgress.value >= 100);

// --- 物理逻辑 ---
const obstacles = ref([
  { pos: 15, type: 'diamond' },
  { pos: 40, type: 'bar' },
  { pos: 65, type: 'diamond' },
  { pos: 88, type: 'bar' }
]);

const jumpHeight = computed(() => {
  const p = safeProgress.value;
  const JUMP_RANGE = 5;
  const MAX_H = 28;
  
  for (const obs of obstacles.value) {
    const dist = Math.abs(p - obs.pos);
    if (dist < JUMP_RANGE) {
      // 归一化正弦波跳跃
      return Math.sin((dist / JUMP_RANGE) * Math.PI / 2 + Math.PI/2) * MAX_H;
    }
  }
  return 0;
});

const rotation = computed(() => (jumpHeight.value * 2));
const playerState = computed(() => {
  if (jumpHeight.value > 1) return 'state-jump';
  if (safeProgress.value > 0) return 'state-move';
  return 'state-idle';
});
</script>

<style scoped>
.lumina-progress {
  position: relative;
  width: 100%;
  height: var(--height);
  display: flex;
  align-items: center;
  /* 变量定义 */
  --bg-dim: rgba(150, 150, 150, 0.1);
  --glow: v-bind('props.color');
  overflow: visible;
  padding: 0 10px;
  box-sizing: border-box;
}

/* 轨道基础 */
.track-base {
  position: absolute;
  left: 0; right: 0;
  height: 4px;
  background: var(--bg-dim);
  border-radius: 10px;
  z-index: 1;
}

/* 填充条 - 带有流体渐变和外发光 */
.track-fill {
  position: absolute;
  left: 0;
  width: var(--p);
  height: 4px;
  background: linear-gradient(90deg, transparent, var(--theme));
  box-shadow: 0 0 15px var(--theme);
  border-radius: 10px;
  z-index: 2;
  transition: width 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

/* 里程碑节点 */
.milestone {
  position: absolute;
  width: 6px; height: 6px;
  background: var(--bg-dim);
  border-radius: 50%;
  z-index: 3;
  transform: translateX(-50%);
  transition: all 0.4s ease;
}
.milestone.reached {
  background: var(--theme);
  box-shadow: 0 0 8px var(--theme);
  transform: translateX(-50%) scale(1.3);
}

/* 障碍物样式 */
.obs-node {
  position: absolute;
  z-index: 2;
  bottom: calc(50% + 6px);
  transform: translateX(-50%);
}
.obs-shape {
  background: currentColor;
  opacity: 0.3;
  color: #94a3b8;
  transition: all 0.3s;
}
.obs-shape.diamond { width: 10px; height: 10px; transform: rotate(45deg); }
.obs-shape.bar { width: 4px; height: 16px; border-radius: 2px; }

/* 玩家主体 */
.lumina-player {
  position: absolute;
  z-index: 10;
  bottom: calc(50% - 6px);
  transition: left 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spark-core {
  width: 12px; height: 12px;
  background: var(--theme);
  border-radius: 50%;
  box-shadow: 0 0 20px var(--theme);
  position: relative;
  transition: all 0.3s ease;
}

/* 状态切换动画 */
.state-move {
  width: 18px; height: 8px; /* 运动时变扁平，像流星 */
  border-radius: 4px;
}
.state-jump {
  width: 14px; height: 14px;
  border-radius: 2px; /* 跳跃时变方块/棱形 */
}

/* 拖尾效果 */
.trail {
  position: absolute;
  right: 100%; top: 50%;
  width: 20px; height: 2px;
  background: linear-gradient(90deg, transparent, var(--theme));
  transform: translateY(-50%);
  opacity: 0.6;
}

/* 数值气泡 */
.value-badge {
  position: absolute;
  top: -24px;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 10px;
  font-weight: 800;
  color: var(--theme);
  opacity: 0.8;
}

/* 胜利态 */
.finish-overlay {
  position: absolute;
  inset: 0;
  background: var(--theme);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.finish-text {
  color: white;
  font-size: 12px;
  letter-spacing: 4px;
  font-weight: bold;
  animation: tracking-in 0.5s cubic-bezier(0.215, 0.610, 0.355, 1.000) both;
}

@keyframes tracking-in {
  0% { letter-spacing: -0.5em; opacity: 0; }
  40% { opacity: 0.6; }
  100% { opacity: 1; }
}

/* 过渡动画 */
.wave-enter-active { animation: slide-in 0.4s ease-out; }
@keyframes slide-in {
  from { clip-path: circle(0% at 100% 50%); }
  to { clip-path: circle(150% at 100% 50%); }
}

/* 暗黑模式适配 */
@media (prefers-color-scheme: dark) {
  .obs-shape { color: #f8fafc; opacity: 0.2; }
}
</style>