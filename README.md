<div align="center">
  <img src="./public/favicon.ico" width="80" height="80" alt="Aoles GL logo" />
  <h1>Aoles GL — Vue</h1>
  <p><strong>A high-performance web video editor component library powered by Vue 3 + WebGL/OpenGL</strong></p>
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

## What is Aoles GL?

**Aoles GL** is a professional-grade web video editor component library. The Vue version (`aoles-gl-vue`) is the first release — support for React, Svelte, and other frameworks is on the roadmap.

It leverages **WebGL/OpenGL** for real-time rendering and **WebAssembly** for performance-critical processing, delivering desktop-app-level performance directly in the browser. Drop in the components, wire up your data, and you have a fully functional video editing suite — timeline, preview, resource panel, attribute editor, transitions, and more.

## ✨ Features

- **WebGL-Accelerated Preview** — Real-time rendering via WebGL/OpenGL, smooth even with complex compositions
- **WASM-Powered Processing** — Heavy lifting (encoding, decoding, effects) offloaded to WebAssembly
- **Component-Based Architecture** — Six independent container components, use only what you need
- **Rich Timeline** — Multi-track editing with drag-and-drop, trim, split, and transitions
- **Extensible** — Register custom fonts, transitions, effects, and asset paths
- **i18n Built-in** — Ships with Chinese and English, easily extendable
- **TypeScript First** — Full type definitions included
- **Vue 3 + Vite** — Modern stack, tree-shakeable ES module output

## 📦 Installation

```bash
npm install aoles-gl-vue
```

> **Note:** This library relies on peer dependencies. Install them if not already present:

```bash
npm install vue@^3.4 vue-router@^4 pinia@^2 element-plus @element-plus/icons-vue \
  @vueuse/core vue-i18n@^9 axios lodash-es @webav/av-cliper wavesurfer.js \
  zod@^4 vue3-moveable @ckpack/vue-color @ctrl/tinycolor \
  @floating-ui/vue opfs-tools spark-md5 srt-parser-2 vue-virtual-scroller vue-element-plus-x
```

## 🚀 Quick Start

**1. Import styles**

```ts
// main.ts
import 'aoles-gl-vue/style.css'
```

**2. Register i18n**

```ts
import { createI18n } from 'vue-i18n'
import { setupI18n } from 'aoles-gl-vue'

const i18n = createI18n({ locale: 'en', legacy: false })
setupI18n(i18n) // merges the library's language packs
```

**3. Use components**

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

## 🧩 Components

| Component | Description |
|---|---|
| `HeaderContainer` | Top toolbar — export, undo/redo, settings |
| `ResourcesContainer` | Media library — video, audio, image, text, effects |
| `ControllerPreview` | WebGL-powered real-time preview player |
| `AttributeContainer` | Property panel for selected track items |
| `TrackContainer` | Multi-track timeline with drag, trim, split |
| `GlobalConfigDialog` | Global settings dialog |

## ⚙️ Configuration

**Register custom fonts**

```ts
import { registerFont } from 'aoles-gl-vue'

registerFont([
  { name: 'My Font', url: '/fonts/my-font.woff2' }
])
```

**Register custom transitions**

```ts
import { registerTransition } from 'aoles-gl-vue'

registerTransition([
  { id: 'my-transition', name: 'My Transition', glsl: '...' }
])
```

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3.4 + TypeScript |
| Build | Vite 4 |
| Rendering | WebGL / OpenGL + GLSL shaders |
| Processing | WebAssembly (WASM) |
| UI | Element Plus + Tailwind CSS |
| State | Pinia |
| i18n | Vue i18n 9 |
| Audio | wavesurfer.js |
| Video | @webav/av-cliper |

## 🗺️ Roadmap

- [x] Vue 3 component library
- [ ] React version
- [ ] Svelte version
- [ ] More built-in transitions & effects
- [ ] Plugin system

## 🤝 Contributing

Contributions are welcome! Whether it's bug reports, feature requests, or pull requests — all help is appreciated.

1. Fork the repository
2. Create your branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add some feature'`
4. Push and open a Pull Request

Please follow the existing code style and keep PRs focused.

## 📄 License

[Apache-2.0](./LICENSE) © laoleshisui
