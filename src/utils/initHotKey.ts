import { useTrackState } from '@/stores/trackState';
import { toRaw } from 'vue';
import { usePageState } from '@/stores/pageState';
import trackPipeline from '@/pipeline/track'
const store = useTrackState();

const pageStore = usePageState();

export const initHotKey = () => {
    // 注册全局事件
    window.onkeydown = async (event: KeyboardEvent) => {
      // 判断按键是否在输入框中
      let activeElement = document.activeElement;
      if (activeElement && (['input', 'textarea'].includes(activeElement.tagName.toLowerCase()) || activeElement.isContentEditable)) {
        return;
      }
      const { composed, ctrlKey, metaKey, shiftKey, key, type } = event;
      switch (key) {
        case 'Backspace':
            // 删除操作
            if(ctrlKey || metaKey){
                await trackPipeline.deleteAllClips();
            }else{
                if (store.selectTrackItem.line !== -1 && store.selectTrackItem.index !== -1) {
                    const targetTrackIdx = toRaw(store.selectTrackItem.line);
                    const targetClipIdx = toRaw(store.selectTrackItem.index);
                    await trackPipeline.deleteClip(targetTrackIdx, targetClipIdx);
                }
            }
            break;
        case 'Escape':
            store.selectTrackItem.line = -1;
            store.selectTrackItem.index = -1;
            break;
        case 'S':
        case 's':
            if(ctrlKey || metaKey){}
            break;
        case ' ':
            if(ctrlKey || metaKey){
                
            }else{
                await store.eventEmitter.dispatchEvent('switchPlayState');
            }
            break;
        case 'Enter':
            break;
        case 'Tab':
            pageStore.hideSubMenu = !pageStore.hideSubMenu;
            break;
        default:
            console.log(composed, ctrlKey, metaKey, key, type);
            break;
      }
    };
};