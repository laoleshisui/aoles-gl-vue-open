<template>
<div 
    class="absolute inset-0 bg-cover bg-center"
    :style="{ backgroundImage: `url(${cover})` }"
></div>
<div class="absolute inset-0 bg-black bg-opacity-20"></div>
<!-- <div class="absolute inset-0 flex items-center justify-center">
    <i v-if="resource.type === 'video'" class="iconfont icon-bofang text-white text-sm" />
    <i v-else class="iconfont icon-tupian text-white text-sm" />
</div> -->
<div class="absolute bottom-0 left-0 right-0 p-1 bg-black bg-opacity-70 backdrop-blur-sm">
<p 
    class="text-xs text-center truncate px-1 font-medium text-white dark:text-gray-100"
    :title="name"
>
    {{ formatFileName(name) }}
</p>
</div>
</template>

<script setup lang="ts">

const props = defineProps(['cover', 'name']);
const emit = defineEmits([]);

const formatFileName = (name) => {
  const extensionIndex = name.lastIndexOf('.');
  
  if (extensionIndex === -1) return name;
  
  const basename = name.substring(0, extensionIndex);
  const extension = name.substring(extensionIndex);
  
  return basename + extension;
};

</script>