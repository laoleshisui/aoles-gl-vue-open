<template>
  <el-select v-model="locale">
    <el-option value="en" label="English"/>
    <el-option value="zh" label="中文"/>
  </el-select>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { watch } from 'vue'

const { locale } = useI18n()

watch(locale, (newLang) => {
  localStorage.setItem('lang', newLang)
})

</script>