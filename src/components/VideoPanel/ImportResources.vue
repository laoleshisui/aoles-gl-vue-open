<template>
<div class="space-y-2" >
    <h3 class="text-gray-600 dark:text-gray-300 text-xs font-semibold uppercase tracking-wide">{{ $t("Panel.Video.ImportResources.Title") }}</h3>
    <div class="grid grid-cols-2 gap-2">
        <template v-for="tool in tools">
          <CapabilityButton
          :icon-component="tool.icon"
          :label="tool.label"
          @select="tool.selectCB"
          />
        </template>
    </div>
</div>
</template>

<script setup lang="ts">
import { selectFile } from '@/utils/file';
import { useI18n } from 'vue-i18n'
import { isAudio, isFont, isImage, isSrtSubtitles, isVideo } from '@/utils/common';

import UploadVideoIcon from '../icons/UploadVideoIcon.vue';
import UploadAudioIcon from '../icons/UploadAudioIcon.vue';
import AddFontIcon from '../icons/AddFontIcon.vue';
import AddSrtsIcon from '../icons/AddSrtsIcon.vue';
import CapabilityButton from '@/components/item/common/CapabilityButton.vue';

import trackPipeline from '@/pipeline/track'
import { useTrackState } from '@/stores/trackState';
import { usePreviewState } from '@/stores/previewState';

const { t } = useI18n()

const trackStore = useTrackState();
const previewState = usePreviewState();

const props = defineProps([]);
const emit = defineEmits(['submit', 'clipResourceAdded']);

console.log("on importFiles")
trackStore.eventEmitter.on("importFiles", async (files)=>{
  console.log("importFiles: ", files);
  await onFiles(files)
});

const tools = [
  {
    label: t("Panel.Video.ImportResources.UploadLocalVideo"),
    icon: UploadVideoIcon,
    selectCB: onUploadLocalVideo
  },
  {
    label: t("Panel.Video.ImportResources.UploadLocalAudio"),
    icon: UploadAudioIcon,
    selectCB: onUploadLocalAudio
  },
  {
    label: t("Panel.Video.ImportResources.AddFont"),
    icon: AddFontIcon,
    selectCB: onUploadLocalFont
  },
  {
    label: t("Panel.Video.ImportResources.AddSrts"),
    icon: AddSrtsIcon,
    selectCB: onAddSrts
  }
]

async function onFiles(exFiles:File[]){
  for(let i = 0; i < exFiles.length; i++){
    if(isVideo(exFiles[i].name) || isImage(exFiles[i].name)){
      await onUploadLocalVideo([exFiles[i],]);
    }
    else if(isAudio(exFiles[i].name)){
      await onUploadLocalAudio([exFiles[i],]);
    }
    else if(isFont(exFiles[i].name)){
      await onUploadLocalFont([exFiles[i],]);
    }
    else if(isSrtSubtitles(exFiles[i].name)){
      await onAddSrts([exFiles[i],]);
    }
    else{
      console.error("unknown file type.");
    }
  }
}

async function onUploadLocalVideo(exFiles:File[]=[]) {
  let files = exFiles;
  if(exFiles.length === 0){
    files = await selectFile({multiple: true, accept: 'video/*,image/*'});
  }

  for(let i = 0; i < files.length; i++){
    const bloburl = URL.createObjectURL(files[i]);
    const iurl = {
      id: 1,
      url: bloburl, 
      origin_url:null, 
      cover_url:null,
      subtitles_url:null,
      content_description:null,
      file: files[i],
    }
    const defaultMaterial = {
      id: 1,
      type: 'formatMedia',
      prompt: files[i].name,
      urls: [iurl],
      scale: [1,1],
    };

    const options = {
      "startTime": Number(previewState.currentTS) + 1
    };
    await trackPipeline.addUrlsToTrack(defaultMaterial, options);

    emit('clipResourceAdded', defaultMaterial);
  }
}
async function onUploadLocalAudio(exFiles:File[]=[]) {
  let files = exFiles;
  if(exFiles.length === 0){
    files = await selectFile({multiple: true, accept: 'audio/*'});
  }

  for(let i = 0; i < files.length; i++){
    const bloburl = URL.createObjectURL(files[i]);
    const iurl = {
      id: 1,
      url: bloburl, 
      origin_url:null, 
      cover_url:null,
      subtitles_url:null,
      content_description:null,
      file: files[i],
    }
    const defaultMaterial = {
      id: 1,
      type: 'costomAudio',
      prompt: files[i].name,
      urls: [iurl],
      scale: [1,1],
    };

    const options = {
      "startTime": Number(previewState.currentTS) + 1
    };
    await trackPipeline.addUrlsToTrack(defaultMaterial, options);

    emit('clipResourceAdded', defaultMaterial);
  }
}

async function onUploadLocalFont(exFiles:File[] = []) {
  let files = exFiles;
  if(exFiles.length === 0){
    files = await selectFile({multiple: true, accept: '.ttf,.TTF'});
  }

  for(let i = 0; i < files.length; i++){
    const bloburl = URL.createObjectURL(files[i]);
    const iurl = {
      id: 1,
      url: bloburl, 
      origin_url:null, 
      cover_url:null,
      subtitles_url:null,
      content_description:null,
      file: files[i],
    }
    const defaultMaterial = {
      id: 1,
      type: 'costomFont',
      prompt: files[i].name,
      urls: [iurl],
      scale: [1,1],
    };

    const options = {
      "startTime": Number(previewState.currentTS) + 1
    };
    await trackPipeline.addUrlsToTrack(defaultMaterial, options);
    emit('clipResourceAdded', defaultMaterial);
  }
}

async function onAddSrts(exFiles:File[] = []) {
  let files = exFiles;
  if(exFiles.length === 0){
    files = await selectFile({multiple: true, accept: '.srt,.SRT'});
  }

  for(let i = 0; i < files.length; i++){
    const bloburl = URL.createObjectURL(files[i]);
    const iurl = {
      id: 1,
      url: bloburl, 
      origin_url:null, 
      cover_url:null,
      subtitles_url:null,
      content_description:null,
      file: files[i],
    }
    const defaultMaterial = {
      id: 1,
      type: 'costomSubtitle',
      prompt: files[i].name,
      urls: [iurl],
      scale: [1,1],
    };

    const options = {
      "startTime": Number(previewState.currentTS) + 1
    };
    await trackPipeline.addUrlsToTrack(defaultMaterial, options);

    emit('clipResourceAdded', defaultMaterial);
  }
}

async function addResource(resource) {
  const options = {
    "startTime": Number(previewState.currentTS) + 1
  };
  await trackPipeline.addUrlsToTrack(resource, options);
}


defineExpose({
  addResource
})
</script>