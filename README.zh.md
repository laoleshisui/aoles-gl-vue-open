<div align="center">
  <img src="./public/favicon.ico" width="80" height="80" alt="Aoles GL logo" />
  <h1>Aoles GL — Vue</h1>
  <p><strong>基于 Vue 3 + WebGL/OpenGL 的高性能 Web 视频编辑器组件库</strong></p>
  <p>
    <a href="https://www.npmjs.com/package/aoles-gl-vue"><img src="https://img.shields.io/npm/v/aoles-gl-vue?color=42b883&label=npm&logo=npm" alt="npm version" /></a>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" alt="license" /></a>
    <img src="https://img.shields.io/badge/Vue-3.4+-42b883?logo=vue.js&logoColor=white" alt="Vue 3" />
    <img src="https://img.shields.io/badge/TypeScript-4.7+-3178c6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/WebGL-OpenGL-red?logo=opengl" alt="WebGL" />
    <img src="https://img.shields.io/badge/WASM-enabled-654ff0?logo=webassembly&logoColor=white" alt="WASM" />
    <img src="https://img.shields.io/badge/i18n-zh%20%7C%20en-orange" alt="i18n" />
  </p>
  <p>
    <a href="./README.md">English</a> · <a href="./README.zh.md">中文</a>
  </p>
</div>

---

## Aoles GL 是什么？

**Aoles GL** 是一个专业级 Web 视频编辑器组件库。Vue 版本（`aoles-gl-vue`）是首个发布版本 —— React、Svelte 等框架的支持正在规划中。

它利用 **WebGL/OpenGL** 实现实时渲染，并通过 **WebAssembly** 处理性能密集型任务，让你在浏览器中获得媲美桌面应用的流畅体验。引入组件、接入数据，即可拥有完整的视频编辑套件 —— 时间轴、预览、素材面板、属性编辑器、转场效果等一应俱全。

## ✨ 特性

- **WebGL 加速预览** — 基于 WebGL/OpenGL 实时渲染，复杂合成也流畅无比
- **WASM 高性能处理** — 编解码、特效等重计算任务交由 WebAssembly 处理
- **组件化架构** — 六个独立容器组件，按需使用
- **丰富的时间轴** — 多轨道编辑，支持拖拽、裁剪、分割、转场
- **高度可扩展** — 支持注册自定义字体、转场、特效和资源路径
- **内置国际化** — 自带中英文，可轻松扩展其他语言
- **TypeScript 优先** — 完整类型定义
- **Vue 3 + Vite** — 现代技术栈，支持 Tree-shaking 的 ES 模块输出

## 📦 安装

```bash
npm install aoles-gl-vue
```

> **注意：** 本库有 peer dependencies，如未安装请执行：

```bash
npm install vue@^3.4 vue-router@^4 pinia@^2 element-plus @element-plus/icons-vue \
  @vueuse/core vue-i18n@^9 axios lodash-es @webav/av-cliper wavesurfer.js \
  zod@^4 vue3-moveable @ckpack/vue-color @ctrl/tinycolor \
  @floating-ui/vue opfs-tools spark-md5 srt-parser-2 vue-virtual-scroller vue-element-plus-x
```

## 🚀 快速开始

**1. 引入样式**

```ts
// main.ts
import 'aoles-gl-vue/style.css'
```

**2. 注册 i18n**

```ts
import { createI18n } from 'vue-i18n'
import { setupI18n } from 'aoles-gl-vue'

const i18n = createI18n({ locale: 'zh', legacy: false })
setupI18n(i18n) // 自动合并组件库语言包
```

**3. 使用组件**

```vue
<script setup lang="ts">
import {
  HeaderContainer,
  ResourcesContainer,
  ControllerPreview,
  AttributeContainer,
  TrackContainer,
  GlobalConfigDialog,
} from 'aoles-gl-vue'
</script>

<template>
  <div class="editor-layout">
    <HeaderContainer />
    <div class="editor-body">
      <ResourcesContainer />
      <ControllerPreview />
      <AttributeContainer />
    </div>
    <TrackContainer />
    <GlobalConfigDialog />
  </div>
</template>
```

## 🧩 组件说明

| 组件 | 说明 |
|---|---|
| `HeaderContainer` | 顶部工具栏 — 导出、撤销/重做、设置 |
| `ResourcesContainer` | 素材库 — 视频、音频、图片、文字、特效 |
| `ControllerPreview` | WebGL 实时预览播放器 |
| `AttributeContainer` | 选中轨道元素的属性面板 |
| `TrackContainer` | 多轨道时间轴，支持拖拽、裁剪、分割 |
| `GlobalConfigDialog` | 全局配置弹窗 |

## ⚙️ 扩展配置

**注册自定义字体**

```ts
import { registerFont } from 'aoles-gl-vue'

registerFont([
  { name: '我的字体', url: '/fonts/my-font.woff2' }
])
```

**注册自定义转场**

```ts
import { registerTransition } from 'aoles-gl-vue'

registerTransition([
  { id: 'my-transition', name: '我的转场', glsl: '...' }
])
```

## 🏗️ 技术栈

| 层级 | 技术 |
|---|---|
| 框架 | Vue 3.4 + TypeScript |
| 构建 | Vite 4 |
| 渲染 | WebGL / OpenGL + GLSL 着色器 |
| 处理 | WebAssembly (WASM) |
| UI | Element Plus + Tailwind CSS |
| 状态管理 | Pinia |
| 国际化 | Vue i18n 9 |
| 音频 | wavesurfer.js |
| 视频 | @webav/av-cliper |

## 🗺️ 路线图

- [x] Vue 3 组件库
- [ ] React 版本
- [ ] Svelte 版本
- [ ] 更多内置转场与特效
- [ ] 插件系统

## 🔗 相关项目

- [aoles-gl-vue-test](https://github.com/laoleshisui/aoles-gl-vue-test) — 官方集成示例，展示完整的真实接入方案

## 🤝 参与贡献

欢迎任何形式的贡献！无论是 Bug 反馈、功能建议还是 Pull Request，都非常感谢。

1. Fork 本仓库
2. 创建你的分支：`git checkout -b feat/your-feature`
3. 提交改动：`git commit -m 'feat: add some feature'`
4. 推送并发起 Pull Request

请保持与现有代码风格一致，PR 尽量聚焦单一改动。

## 📄 开源协议

[Apache-2.0](./LICENSE) © laoleshisui
