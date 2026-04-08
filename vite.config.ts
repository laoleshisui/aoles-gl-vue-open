import { defineConfig, Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import path, { resolve } from 'node:path';
import fs from 'node:fs';

// 自定义插件：复制静态文件 (Wasm 等)
function copyStaticFiles(): Plugin {
  return {
    name: 'copy-static-files',
    closeBundle() {
      const copyDir = (srcDir: string, destDir: string) => {
        if (!fs.existsSync(srcDir)) return;
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        
        const items = fs.readdirSync(srcDir, { withFileTypes: true });
        for (const item of items) {
          const srcPath = path.join(srcDir, item.name);
          const destPath = path.join(destDir, item.name);
          
          if (item.isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            // 只复制 wasm 和 mjs 文件
            if (srcPath.endsWith('.wasm') || srcPath.endsWith('.mjs')) {
              fs.copyFileSync(srcPath, destPath);
              console.log(`Copied: ${srcPath} -> ${destPath}`);
            }
          }
        }
      };
      
      if (fs.existsSync('src/wasm')) copyDir('src/wasm', 'dist/wasm');
      if (fs.existsSync('src/lib')) copyDir('src/lib', 'dist/lib');
      if (fs.existsSync('src/assets')) copyDir('src/assets', 'dist/assets');
    }
  };
}

// 自定义插件：复制类型声明文件
function copyDts(): Plugin {
  return {
    name: 'copy-dts',
    closeBundle() {
      const dtsSource = path.resolve(__dirname, 'types/index.d.ts');
      const dtsDest = path.resolve(__dirname, 'dist/index.d.ts');
      if (fs.existsSync(dtsSource)) {
        fs.copyFileSync(dtsSource, dtsDest);
        console.log(`Copied: ${dtsSource} -> ${dtsDest}`);
      }
    }
  };
}

// 🌟 纯净的 NPM 组件库配置
export default defineConfig({
  plugins:[
    vue({
      script: {
        defineModel: true,
        propsDestructure: true
      }
    }),
    // 🚨 彻底移除了 removeConsole，你的 log 完美保留！
    // 🚨 彻底移除了 AutoImport 和 Components，防止组件库内部作用域污染！
    copyStaticFiles(),
    copyDts()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions:['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  build: {
    outDir: 'dist',
    sourcemap: true, // 保留 sourceMap，方便在测试项目中 F12 调试源码
    minify: false,   // 库代码不压缩，由使用者的应用负责最终压缩！(极其关键，也是保留Log的保障)
    cssCodeSplit: false, // 🌟 极其关键：将组件库所有 CSS 合并为一个 style.css
    lib: {
      // ⚠️ 请确认你的入口是 .js 还是 .ts，根据实际情况修改
      entry: resolve(__dirname, 'src/index.ts'), 
      name: 'AolesGLVue',
      fileName: (format) => {
        if (format === 'es') return 'index.es.js';
        if (format === 'cjs') return 'index.cjs.js';
        return `index.${format}.js`;
      },
      formats: ['es', 'cjs'] // 组件库只需要 ESM 和 CJS，去掉冗余的 UMD
    },
    rollupOptions: {
      // 所有 peerDependencies 都必须 external，防止包体积爆炸和重复实例
      external:[
        'vue',
        'vue-router',
        'pinia',
        'element-plus',
        '@element-plus/icons-vue',
        '@vueuse/core',
        'vue-i18n',
        'axios',
        'lodash-es',
        '@webav/av-cliper',
        'vue3-moveable',
        'wavesurfer.js',
        'zod',
        '@ckpack/vue-color',
        '@ctrl/tinycolor',
        '@floating-ui/vue',
        'opfs-tools',
        'spark-md5',
        'srt-parser-2',
        'vue-virtual-scroller',
        'vue-element-plus-x',
      ],
      output: {
        exports: 'named',
        // 强制 CSS 文件名输出为 style.css，防止带 hash 导致外部项目引用失败
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'style.css';
          }
          return 'assets/[name]-[hash][extname]';
        },
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          pinia: 'Pinia',
          'element-plus': 'ElementPlus',
          '@element-plus/icons-vue': 'ElementPlusIcons',
          '@vueuse/core': 'VueUse',
          'vue-i18n': 'VueI18n',
          axios: 'Axios',
          'lodash-es': 'LodashEs',
        }
      }
    }
  }
});