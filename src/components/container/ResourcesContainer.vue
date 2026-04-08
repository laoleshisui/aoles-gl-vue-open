<template>
  <div class="flex h-full overflow-hidden relative ">
    <MenuList :selected="store.selectedMenuItem.key" @toggle="onChangeSelect" />
    <ItemList
      :activeKey="store.selectedMenuItem.key"
      :defaultCollapse="store.hideSubMenu"
      :title="store.selectedMenuItem.title"
      @collapseChange="changeCollapse"
    />
  </div>
</template>

<script setup lang="ts">
  import MenuList from '@/components/MenuList.vue';
  import ItemList from '@/components/ItemList.vue';
  import { menuData, type MenuItem } from '@/data/baseMenu';
  import { ref, reactive, nextTick } from 'vue';
  import { usePageState } from '@/stores/pageState';

  const store = usePageState();
  function changeCollapse(newCollpase: boolean) {
    nextTick(() => {
      store.hideSubMenu = newCollpase;
    });
  }

  store.selectedMenuItem = menuData[0];

  function onChangeSelect(item: MenuItem) {
    if (store.selectedMenuItem.key === item.key){
      store.hideSubMenu = !store.hideSubMenu;
    }else{
      store.selectedMenuItem = item;
      store.hideSubMenu = false;
    }
  }
</script>
