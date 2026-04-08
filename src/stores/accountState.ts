import { ref, watchEffect, computed } from 'vue';
import { defineStore } from 'pinia';
import { logout } from '@/services/dataServer';

export const useAccountState = defineStore('accountState', () => {
    const matrialsFilter = ref("*");
    const currentDropReceiver = ref("");
    const materials = ref<[]>([]);
    const taskMaterials = ref<[]>([]);
    const generatingTasks = ref(new Map());

    const showFinder = ref(false);
    return {
        matrialsFilter,
        materials,
        taskMaterials,
        generatingTasks,
        showFinder,
        currentDropReceiver,
    }
});