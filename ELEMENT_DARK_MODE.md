# Element Plus 暗色模式完整适配指南

## 已完成的配置

### 1. 导入 Element Plus 暗色模式 CSS

在 `src/assets/main.css` 中已添加：

```css
@import 'element-plus/theme-chalk/dark/css-vars.css';
```

这会自动为所有 Element Plus 组件提供暗色模式支持。

### 2. 暗色模式切换逻辑

`src/stores/pageState.ts` 中已实现：

```typescript
watchEffect(() => {
  document.documentElement.classList[isDark.value ? 'add' : 'remove']('dark');
});
```

当 `isDark` 为 `true` 时，会在 `<html>` 元素上添加 `dark` 类，Element Plus 会自动应用暗色主题。

## Element Plus 暗色模式工作原理

Element Plus 使用 CSS 变量实现暗色模式：

```css
/* 亮色模式（默认） */
:root {
  --el-color-primary: #409eff;
  --el-bg-color: #ffffff;
  --el-text-color-primary: #303133;
  /* ... 更多变量 */
}

/* 暗色模式 */
html.dark {
  --el-color-primary: #409eff;
  --el-bg-color: #141414;
  --el-text-color-primary: #e5eaf3;
  /* ... 更多变量 */
}
```

## 自定义 Element Plus 暗色模式

如果需要自定义某些组件的暗色模式样式，可以在 `main.css` 中覆盖 CSS 变量：

### 方式 1：全局覆盖 CSS 变量

```css
/* 自定义暗色模式的主色调 */
html.dark {
  --el-color-primary: #6366f1;  /* 使用紫色作为主色 */
  --el-color-success: #10b981;
  --el-color-warning: #f59e0b;
  --el-color-danger: #ef4444;
  --el-color-info: #6b7280;
}
```

### 方式 2：针对特定组件

```css
/* 自定义按钮暗色模式 */
.dark .el-button {
  --el-button-bg-color: #374151;
  --el-button-border-color: #4b5563;
  --el-button-text-color: #e5e7eb;
}

/* 自定义输入框暗色模式 */
.dark .el-input {
  --el-input-bg-color: #1f2937;
  --el-input-border-color: #374151;
  --el-input-text-color: #e5e7eb;
}
```

## 常用 Element Plus 组件暗色模式变量

### 按钮 (Button)
```css
.dark {
  --el-button-bg-color: #374151;
  --el-button-border-color: #4b5563;
  --el-button-text-color: #e5e7eb;
  --el-button-hover-bg-color: #4b5563;
  --el-button-hover-border-color: #6b7280;
}
```

### 输入框 (Input)
```css
.dark {
  --el-input-bg-color: transparent;
  --el-input-border-color: #4b5563;
  --el-input-text-color: #e5e7eb;
  --el-input-placeholder-color: #6b7280;
}
```

### 下拉框 (Select)
```css
.dark {
  --el-select-input-focus-border-color: #6366f1;
  --el-select-dropdown-bg-color: #1f2937;
  --el-select-option-hover-bg-color: rgba(99, 102, 241, 0.2);
}
```

### 对话框 (Dialog)
```css
.dark {
  --el-dialog-bg-color: #1f2937;
  --el-dialog-title-font-size: 18px;
  --el-overlay-color-lighter: rgba(0, 0, 0, 0.7);
}
```

### 表格 (Table)
```css
.dark {
  --el-table-bg-color: #1f2937;
  --el-table-tr-bg-color: #1f2937;
  --el-table-header-bg-color: #374151;
  --el-table-row-hover-bg-color: #374151;
  --el-table-border-color: #4b5563;
}
```

### 消息提示 (Message)
```css
.dark {
  --el-message-bg-color: #374151;
  --el-message-border-color: #4b5563;
  --el-message-text-color: #e5e7eb;
}
```

### 通知 (Notification)
```css
.dark {
  --el-notification-bg-color: #374151;
  --el-notification-border-color: #4b5563;
  --el-notification-title-color: #e5e7eb;
}
```

## 完整的 CSS 变量列表

Element Plus 提供了大量 CSS 变量，完整列表请参考：
https://element-plus.org/zh-CN/guide/dark-mode.html

常用变量分类：

### 颜色变量
- `--el-color-primary` - 主色
- `--el-color-success` - 成功色
- `--el-color-warning` - 警告色
- `--el-color-danger` - 危险色
- `--el-color-error` - 错误色
- `--el-color-info` - 信息色

### 背景色变量
- `--el-bg-color` - 基础背景色
- `--el-bg-color-page` - 页面背景色
- `--el-bg-color-overlay` - 遮罩背景色

### 文字颜色变量
- `--el-text-color-primary` - 主要文字
- `--el-text-color-regular` - 常规文字
- `--el-text-color-secondary` - 次要文字
- `--el-text-color-placeholder` - 占位文字

### 边框颜色变量
- `--el-border-color` - 基础边框色
- `--el-border-color-light` - 浅色边框
- `--el-border-color-lighter` - 更浅边框
- `--el-border-color-extra-light` - 极浅边框
- `--el-border-color-dark` - 深色边框
- `--el-border-color-darker` - 更深边框

## 测试暗色模式

### 1. 手动切换

使用 DarkSwitch 组件切换暗色模式：

```vue
<template>
  <DarkSwitch />
</template>
```

### 2. 编程方式切换

```typescript
import { usePageState } from 'aoles-gl-vue'

const pageStore = usePageState()

// 切换到暗色模式
pageStore.isDark = true

// 切换到亮色模式
pageStore.isDark = false

// 切换
pageStore.isDark = !pageStore.isDark
```

### 3. 检查是否生效

打开浏览器开发者工具：

1. 检查 `<html>` 元素是否有 `dark` 类
2. 检查 CSS 变量值：
   ```javascript
   getComputedStyle(document.documentElement).getPropertyValue('--el-bg-color')
   ```
3. 观察 Element Plus 组件的背景色和文字颜色是否改变

## 常见问题

### 1. 暗色模式不生效

**原因：** 可能没有正确导入暗色模式 CSS

**解决：** 确保在 `main.css` 中导入：
```css
@import 'element-plus/theme-chalk/dark/css-vars.css';
```

### 2. 部分组件没有暗色样式

**原因：** 某些自定义样式覆盖了 Element Plus 的 CSS 变量

**解决：** 检查是否有硬编码的颜色值，改用 CSS 变量：

```css
/* ❌ 错误：硬编码颜色 */
.my-component {
  background-color: #ffffff;
  color: #000000;
}

/* ✅ 正确：使用 CSS 变量 */
.my-component {
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
}
```

### 3. 自定义组件不适配暗色模式

**解决：** 使用 Tailwind 的 `dark:` 前缀或 CSS 变量：

```vue
<template>
  <!-- 使用 Tailwind dark: 前缀 -->
  <div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
    内容
  </div>
  
  <!-- 或使用 CSS 变量 -->
  <div class="custom-component">
    内容
  </div>
</template>

<style scoped>
.custom-component {
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
  border: 1px solid var(--el-border-color);
}
</style>
```

### 4. 弹出层（Popper）暗色模式不生效

**原因：** 弹出层默认挂载到 `body`，可能不在 `.dark` 作用域内

**解决：** Element Plus 的暗色模式 CSS 已经处理了这个问题，确保导入了完整的暗色模式样式。

## 最佳实践

1. **优先使用 Element Plus 内置暗色模式**
   - 导入 `dark/css-vars.css`
   - 让 Element Plus 自动处理大部分组件

2. **使用 CSS 变量而不是硬编码颜色**
   ```css
   /* ✅ 推荐 */
   color: var(--el-text-color-primary);
   
   /* ❌ 不推荐 */
   color: #303133;
   ```

3. **自定义组件使用 Tailwind dark: 前缀**
   ```html
   <div class="bg-white dark:bg-gray-800">
   ```

4. **测试所有交互状态**
   - 悬停 (hover)
   - 激活 (active)
   - 禁用 (disabled)
   - 聚焦 (focus)

5. **保持一致的颜色系统**
   - 使用统一的灰度色阶
   - 主色调保持一致
   - 避免过多的颜色变体

## 参考资源

- [Element Plus 暗色模式官方文档](https://element-plus.org/zh-CN/guide/dark-mode.html)
- [Element Plus CSS 变量列表](https://element-plus.org/zh-CN/component/config-provider.html#%E9%85%8D%E7%BD%AE)
- [Tailwind CSS 暗色模式](https://tailwindcss.com/docs/dark-mode)
