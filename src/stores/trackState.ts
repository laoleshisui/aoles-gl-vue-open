import { ref, reactive, computed, toRaw, nextTick, watch } from 'vue';
import { defineStore } from 'pinia';
import { condWait, extractFileExtension, getId, GetStrideWidth, parseRGBA, rgbaToHex } from '@/utils/common';
import type { Track, TrackLineItf } from '@/class/Track';
import { controllerWasmLoader } from '@/utils/controllerWasmLoader';
import { EventEmitter } from '@/utils/eventEmitter.js';
import { forEach } from 'lodash-es';
import { getFontItem } from '@/utils/font';
import { VideoTrack } from '@/class/VideoTrack';
import { AudioTrack } from '@/class/AudioTrack';
import { defaultTextSource, TextTrack } from '@/class/TextTrack';
import { getUniSourceByWasmPath } from '@/utils/uniSource';

export const useTrackState = defineStore('trackState', () => {
  const dragData = reactive({ // 拖拽数据
    dataInfo: {} as Track,
    dragType: '',
    dragPoint: {
      x: 0,
      y: 0
    },
    // 吸附辅助线
    fixLines: [] as { position: number, frame: number }[][],
    moveX: 0,
    moveY: 0
  });

  const eventEmitter = new EventEmitter();

  const controllerCanvasSize = ref([0, 0])

  const controllerTypeMap = new Map([
    ["video", "video"],
    ["audio", "audio"],
    ["image", "video"],
    ["text", "text"],
  ]);

  const needSeekClips = ref(new Set());

  const moveTrackData = reactive({ // 行内移动
    lineIndex: -1,
    itemIndex: -1
  });
  // 轨道放大比例
  const trackScale = ref(parseInt(localStorage.trackS || '40'));
  const trackList = reactive<TrackLineItf[]>([]);

  // 选中元素坐标
  const selectTrackItem = reactive({
    line: -1,
    index: -1
  });
  // 选中元素
  const selectResource = computed(() => {
    if (selectTrackItem.line === -1) {
      return null;
    }
    return trackList[selectTrackItem.line]?.list[selectTrackItem.index] || null;
  });

  const effectListUpdate = ref(false);

  const condWaitId = new Map();

  // 删除元素
  async function removeClip(lineIndex: number, itemIndex: number) {
    controllerWasmLoader.module["GLController"].controllerMethodProxy.RemoveClip(
      trackList[lineIndex].list[itemIndex].controller_key, 
      trackList[lineIndex].controller_key,
      controllerTypeMap.get(trackList[lineIndex].type)
    );

    // trackList[lineIndex].list.splice(itemIndex, 1);

    // if (trackList[lineIndex].list.length === 0 && !trackList[lineIndex].main) {
    //   removeTrackLine(lineIndex);
    // }

    condWaitId.set('RemoveClip', 'start')
    await condWait(()=>{
      return condWaitId.get("RemoveClip") === 'finished';
    }, "RemoveClip")
    console.log("condWait finished: ", 'RemoveClip');
  }

  function getClipIndexById(id: string){
    let retTrackIndex: number = -1;
    let retClipIndex: number = -1;
    trackList.forEach((item, index) => {
      item.list.forEach((trackItem, trackIndex) => {
          if (trackItem.id === id) {
            retTrackIndex = index;
            retClipIndex = trackIndex;
            return [retTrackIndex, retClipIndex] ;
          }
        });
    });
    return [retTrackIndex, retClipIndex] ;
  }

  function selectTrackById(id: string) {
    [selectTrackItem.line, selectTrackItem.index] = getClipIndexById(id)
  }

  async function removeTrackLine(lineIndex: number) {
    controllerWasmLoader.module["GLController"].controllerMethodProxy.RemoveTrack(trackList[lineIndex].controller_key, controllerTypeMap.get(trackList[lineIndex].type));

    // trackList.splice(lineIndex, 1);
    condWaitId.set('RemoveTrack', 'start')
    await condWait(()=>{
      return condWaitId.get("RemoveTrack") === 'finished';
    }, "RemoveTrack")
    console.log("condWait finished: ", 'RemoveTrack');
  }

  function SortClipInLine(trackLineIdx:number){
    const line = trackList[trackLineIdx];
    line.list.sort((a, b) => a.start - b.start);//make sure ordered by ts. 
    const clipOrder = [];
    for(let i = 0; i < line.list.length; i++){
      clipOrder.push(line.list[i].controller_key);
    }

    controllerWasmLoader.module["GLController"].controllerMethodProxy.SortClips(line.controller_key, controllerTypeMap.get(line.type), clipOrder);
  }

  async function SortEffect(clip){
    const clipEffectOrder = [];

    const transitionItemData = (await clip.getTransitionItem(clip.transition)).data;
    console.log("test: ", transitionItemData);
    if(clip.transition){
      clipEffectOrder.push(transitionItemData.controller_key);
    }
    for(let i = 0; i < clip.effectList.length; i++){
      clipEffectOrder.push(clip.effectList[i].controller_key)
    }
    clipEffectOrder.push("position_" + clip.controller_key);

    controllerWasmLoader.module["GLController"].controllerMethodProxy.SortAtransitions(clip.controller_key, controllerTypeMap.get(clip.type), clipEffectOrder);

    if(clip.transition){
      controllerWasmLoader.module["GLController"].controllerMethodProxy.ConfigClip(clip.controller_key, controllerTypeMap.get(clip.type), JSON.stringify({
        transition_duration_ts: transitionItemData.transition_duration_ts
      }));
      controllerWasmLoader.module["GLController"].controllerMethodProxy.ConfigClipTransition(transitionItemData.controller_key, controllerTypeMap.get(clip.type), JSON.stringify({
        start_ts: 0,
        end_ts: transitionItemData.transition_duration_ts
      }));
    }
  }

  function SortTracks(){
    {
      for(let i = 0; i < trackList.length; i++){
        SortClipInLine(i);
      }
    }

    {
      const videoTracks = trackList.filter((line) => {
        return controllerTypeMap.get(line.type) === "video" || controllerTypeMap.get(line.type) === "text";
      });
      const videoTrackOrder = [];
      for(let i = 0; i < videoTracks.length; i++){
        videoTrackOrder.push(videoTracks[i].controller_key);
        console.log(i, " ordered video track controller_key:", videoTracks[i].controller_key);
      }
      controllerWasmLoader.module["GLController"].controllerMethodProxy.SortTracks("video", videoTrackOrder);
    }
    
    {
      const audioTracks = trackList.filter((line) => {
        return line.type == "audio";
      });
      const audioTrackOrder = [];
      for(let i = 0; i < audioTracks.length; i++){
        audioTrackOrder.push(audioTracks[i].controller_key);
        console.log(i, " ordered audio track controller_key:", audioTracks[i].controller_key);
      }
      controllerWasmLoader.module["GLController"].controllerMethodProxy.SortTracks("audio", audioTrackOrder);
    }
  }

  function getClipScaleValue(clip : Track){
    const scaleX = clip.scale / 100;
    const scaleY = clip.scaleY / 100;
    return [scaleX, scaleY];
  }
  function getClipCenterValue(clip : Track){
    const centerX = clip.centerX / controllerCanvasSize.value[0];
    const centerY = clip.centerY / controllerCanvasSize.value[1];
    return [centerX, centerY];
  }
  function degreeToRadian(degree:number){
    return degree * Math.PI / 180;
  }
  function radianToDegree(radian:number){
    return radian * 180 / Math.PI;
  }
  function getControllerCenterX(clip : Track){
    return clip.centerX / controllerCanvasSize.value[0] + 0.5;
  }
  function getControllerCenterY(clip : Track){
    return clip.centerY / controllerCanvasSize.value[1] + 0.5;
  }
  function toCenterX(centerX:number, clip:Track){
    return (centerX - 0.5) * controllerCanvasSize.value[0];
  }
  function toCenterY(centerY:number, clip:Track){
    return (centerY - 0.5) * controllerCanvasSize.value[1];
  }

  function ListenClipChange(clip: Track) {
    const clipType = controllerTypeMap.get(clip.type);
    if (!clipType) return; // 无效类型提前退出

    const toConfigClip = (config: Record<string, any>, clipItem:Track) => {
      controllerWasmLoader.module["GLController"].controllerMethodProxy.ConfigClip(
        clipItem.controller_key,
        clipType,
        JSON.stringify(config)
      );
    };
    const toConfigClipTransition = (config: Record<string, any>, clipItem:Track, controller_key='') => {
      // console.log("JSON.stringify(config):" , JSON.stringify(config));
      //NOTE:Not use controllerMethodProxy to make function call synchronously.
      controllerWasmLoader.module["GLController"].controllerMethodProxy.ConfigClipTransition(
        controller_key ? controller_key : "position_" + clipItem.controller_key,
        clipType,
        JSON.stringify(config)
      );
    };

    const textConfig = (fontSize, strokeWidth, textPadding, clipItem:Track)=>{
      toRaw(clipItem).fontSize = fontSize;
      if(strokeWidth > clipItem.fontSize / 4){
        toRaw(clipItem).strokeWidth = Math.round(clipItem.fontSize / 4);
      }
      toRaw(clipItem).textPadding = Math.max(textPadding, 2*clipItem.strokeWidth)
      return { 
        font_size: clipItem.fontSize,
        stroke_width: clipItem.strokeWidth,
        text_padding: clipItem.textPadding
      }
    }
    const clipConfigMap: Record<string, (value: any, oldval:any, clipItem:Track) => Record<string, any>> = {
      name: (value: any, oldval:any, clipItem:Track) => ({
        path: value,
        ...(clipType === "text" ? { text_type: "text" } : {}),
      }),
      start: (value: any, oldval:any, clipItem:Track) => ({ start_ts: value }),
      end: (value: any, oldval:any, clipItem:Track) => ({ end_ts: value }),
      trimStart: (value: any, oldval:any, clipItem:Track) => ({ trim_start_ts: value }),
      volume: (value: any, oldval:any, clipItem:Track) => ({ volume: value / 100 }),
      fontSize: (value: any, oldval:any, clipItem:Track) => {
        return textConfig(value, clipItem.strokeWidth, clipItem.textPadding, clipItem);
      },
      strokeWidth: (value: any, oldval:any, clipItem:Track) => {
        return textConfig(clipItem.fontSize, value, clipItem.textPadding, clipItem);
      },
      textPadding: (value: any, oldval:any, clipItem:Track) => {
        return textConfig(clipItem.fontSize, clipItem.strokeWidth, value, clipItem);
      },
      fontFamily: async (value: any, oldval:any, clipItem:Track) => {
        if(value !== oldval){
          const fontItem = await getFontItem(value);
          // console.log("fontItem: ", fontItem, value, oldval);
          if(fontItem){
            return {font_file: fontItem.data.path};
          }else{
            clipItem.fontFamily = oldval;
            return {};
          }
        }else{
          return {}
        }
      }
    };

    const createScaleUniforms = (value: any, oldval:any, clipItem:Track) => {
      const scaleValue = getClipScaleValue(clipItem);
      return {
        uniform: {
          scaleX: {
            type: "float",
            value: `(0, ${scaleValue[0]}}) (1, ${scaleValue[0]})`
          },
          scaleY: {
            type: "float",
            value: `(0, ${scaleValue[1]}}) (1, ${scaleValue[1]}})`
          },
        }
      }
    };
    const clipTransitionConfigMap: Record<string, (value: any, oldval:any, clipItem:Track) => Record<string, any>> = {
      applyInTrack: (value: any, oldval:any, clipItem:Track)=>{return{}},
      centerX: (value: any, oldval:any, clipItem:Track) => {
        const cx = getControllerCenterX(clipItem)
        return {uniform: { 
            centerX: 
            {
              type: "float",
              value: `(0, ${cx}) (1, ${cx})`
            },
          }
        }
      },
      centerY: (value: any, oldval:any, clipItem:Track) => {
        const cy = getControllerCenterY(clipItem)
        return {uniform: {
           centerY: {
              type: "float",
              value: `(0, ${cy}) (1, ${cy})`
            },
          }
        }
      },
      rotation: (value: any, oldval:any, clipItem:Track) => {
        const radian = degreeToRadian(value);
        return {uniform: {
           rotation: {
              type: "float",
              value: `(0, ${radian}) (1, ${radian})`
            },
          }
        }
      },
      scale: createScaleUniforms,
      scaleY: createScaleUniforms,
      fill: (value: any, oldval:any, clipItem:Track) => {
        const color = parseRGBA(clipItem.fill);
        return {
          uniform: {
            textColorR: 
            {
              type: "float",
              value: `(0, ${color.r}) (1, ${color.r})`
            },
            textColorG: 
            {
              type: "float",
              value: `(0, ${color.g}) (1, ${color.g})`,
            },
            textColorB: 
            {
              type: "float",
              value: `(0, ${color.b}) (1, ${color.b})`,
            },
            textColorA: 
            {
              type: "float",
              value: `(0, ${color.a}) (1, ${color.a})`,
            },
          }
        }
      },
      stroke: (value: any, oldval:any, clipItem:Track) => {
        const color = parseRGBA(clipItem.stroke);
        return {
          uniform: {
            textStrokeColorR: 
            {
              type: "float",
              value: `(0, ${color.r}) (1, ${color.r})`,
            },
            textStrokeColorG: 
            {
              type: "float",
              value: `(0, ${color.g}) (1, ${color.g})`,
            },
            textStrokeColorB: 
            {
              type: "float",
              value: `(0, ${color.b}) (1, ${color.b})`,
            },
            textStrokeColorA: 
            {
              type: "float",
              value: `(0, ${color.a}) (1, ${color.a})`,
            }
          }
        }
      },
      textBackgroundColor: (value: any, oldval:any, clipItem:Track) => {
        const color = parseRGBA(clipItem.textBackgroundColor);
        return {
          uniform: {
            textBgColorR: 
            {
              type: "float",
              value: `(0, ${color.r}) (1, ${color.r})`,
            },
            textBgColorG: 
            {
              type: "float",
              value: `(0, ${color.g}) (1, ${color.g})`,
            },
            textBgColorB: 
            {
              type: "float",
              value: `(0, ${color.b}) (1, ${color.b})`,
            },
            textBgColorA: 
            {
              type: "float",
              value: `(0, ${color.a}) (1, ${color.a})`,
            },
          }
        }
      }
    };

    // const toConfigAttr = (key:string) => {
    //   if(key == "name" || key == "fontSize"){
    //     if(clipType == "text"){
    //       // controllerWasmLoader.module["GLController"].controllerMethodProxy.QueuedDispatch(()=>{
              
    //       // });
    //       const clipConfigResultStr = controllerWasmLoader.module["GLController"].GetClipConfig(clip.controller_key, controllerTypeMap.get(clip.type), JSON.stringify({
    //         config : [
    //           "size"
    //         ]
    //       }));

    //       const clipConfigResult = JSON.parse(clipConfigResultStr)
    //       // console.log("clipConfigResult: ", clipConfigResult);
    //       clip.width = clipConfigResult["size"]["width"];
    //       clip.height = clipConfigResult["size"]["height"];
    //       //force invoke. toConfigClipTransition donot use the newVal (directly use clip.xxx) , so we use 0 as newVal.
    //       {
    //         toConfigClipTransition(clipTransitionConfigMap["centerX"](0));
    //         toConfigClipTransition(clipTransitionConfigMap["centerY"](0));
    //       }
    //     }
    //   };
    // }

    Object.keys(clipConfigMap).forEach((key) => {
      watch(
        () => clip[key as keyof Track],
        async (newVal, oldVal) => {
          if(clip.wasmCB){
            return;
          }
          if (newVal !== oldVal) {
            toConfigClip(await clipConfigMap[key](newVal, oldVal, toRaw(clip)), toRaw(clip));

            if(clip.applyInTrack){
              const applyInTrackKeys = ['volume', 'fontSize', 'strokeWidth', 'textPadding', 'fontFamily'];
              if(applyInTrackKeys.includes(key)){
                const [line, index] = getClipIndexById(clip.id)
                forEach(trackList[line].list, async (clipItem)=>{
                  if(clipItem !== clip){
                    toRaw(clipItem)[key] = newVal;
                    toConfigClip(await clipConfigMap[key](newVal, oldVal, toRaw(clipItem)), toRaw(clipItem));
                  }
                });
              }
            }

            //FIXME: donnot run it in case of fault when changing fontsize.
            // toConfigAttr(key);
          }
        }
      );
    });
    Object.keys(clipTransitionConfigMap).forEach((key) => {
      watch(
        () => clip[key as keyof Track],
        (newVal, oldVal) => {
          if(clip.wasmCB){
            return;
          }
          if(key === 'applyInTrack'){
            const [line, index] = getClipIndexById(clip.id)
            forEach(trackList[line].list, (clipItem)=>{
              if(clipItem !== clip){
                toRaw(clipItem)[key] = newVal;
              }
            });
          }
          if (newVal !== oldVal) {
            toConfigClipTransition(clipTransitionConfigMap[key](newVal, oldVal, toRaw(clip)), toRaw(clip));
            if(clip.applyInTrack){
              const [line, index] = getClipIndexById(clip.id)
              forEach(trackList[line].list, (clipItem)=>{
                if(clipItem !== clip){
                  toRaw(clipItem)[key] = newVal;
                  toConfigClipTransition(clipTransitionConfigMap[key](newVal, oldVal, toRaw(clipItem)), toRaw(clipItem));
                }
              });
            }
          }
        }
      );
    });

    if(clip.transition !== undefined){
      watch(()=>clip.transition, async (newVal, oldVal)=>{
        if(clip.wasmCB){
          return;
        }
        console.log("old:", oldVal)
        console.log("new:", newVal)

        const newItem = await clip.getTransitionItem(newVal)
        console.log("newItem:", newItem)
        if(oldVal){
          const oldItem = await clip.getTransitionItem(oldVal)
          await removeAtransition(oldItem.data);
        }
        if(!newVal){
          await removeAtransition(newItem.data);
          return
        }
        
        if(newItem){
          await addAtransition(newItem.data);
        }else{
          if(newVal){
            toRaw(clip).transition = oldVal;
          }
        }

        await SortEffect(clip);
      });
    }
    if(clip.ownTransitionMap !== undefined){
      watch(()=>(clip.ownTransitionMap), async ()=>{
        if(clip.wasmCB){
          return;
        }
        await SortEffect(clip);

        const transitionItem = await clip.getTransitionItem();
        console.log("transitionItem.data.uniforms: ", transitionItem.data.uniforms);
        if(transitionItem.data.uniforms){
          const config_json = {
            uniform: {}
          }
          forEach(transitionItem.data.uniforms, (uniform_item)=>{
            config_json.uniform[uniform_item["name"]] = 
            {
              type: "float",
              value: `(0, ${uniform_item["value"]}) (1, ${uniform_item["value"]})`,
            }
            ;
          });
          toConfigClipTransition(config_json, toRaw(clip), transitionItem.data.controller_key);
        }
      });
    }
    

    if(clip.effectList){
      watch(()=>(clip.effectList), async ()=>{
        if(clip.wasmCB){
          return;
        }
        await SortEffect(clip);
        
        forEach(clip.effectList, (effect)=>{
          console.log("effect.uniforms: ", effect.uniforms);
          if(effect.uniforms){
            const config_json = {
              uniform: {}
            }
            forEach(effect.uniforms, (uniform_item)=>{
              config_json.uniform[uniform_item["name"]] = 
              {
                type: "float",
                value: `(0, ${uniform_item["value"]}) (1, ${uniform_item["value"]})`,
              }
              ;
            });
            toConfigClipTransition(config_json, toRaw(clip), effect.controller_key);
          }
        });
      });
    }

  }

  function findUnoccupiedInSelectedLine(clip: Track, currentTS:number){
    if(selectTrackItem.index < 0){
      return [-1, -1];
    }
    const line = trackList[selectTrackItem.line];
    if(!line || !clip || controllerTypeMap.get(clip.type) !== controllerTypeMap.get(line.type)){
      return [-1, -1];
    }
    for(let i = 0; i < line.list.length; i++){
      // find the first unoccupied in the line.
      if(line.list[i].start > currentTS){
        if(i-1 < line.list.length && currentTS > line.list[i-1].end){
          return [selectTrackItem.line, i];
        }
      }
    }
    return [selectTrackItem.line, line.list.length];
  }

  async function addTrack(type:string, custom_controller_key?:string){
    if(!type || !controllerTypeMap.has(type)){
      console.error("type unknown:", type);
      return;
    }
    const controller_key = custom_controller_key ? custom_controller_key : getId(type + '_track');
    controllerWasmLoader.module["GLController"].controllerMethodProxy.AddTrack(controller_key, controllerTypeMap.get(type));
    condWaitId.set('AddTrack', 'start')
    await condWait(()=>{
      return condWaitId.get("AddTrack") === 'finished';
    }, "AddTrack")
    console.log("condWait finished: ", 'AddTrack');
    return controller_key;
  }

  async function toSrcPaths(newItem:Track){
    const result = {
      "path": newItem.name,
      "user_data": {
        ...(newItem.materialInfo === undefined ? {} : {
          "materialInfo" : newItem.materialInfo
        })
      }
    }

    if(newItem.type == "text"){
      result["type"] = "text";

      const font_path = (await getFontItem(newItem.fontFamily))?.data.path ?? (await getFontItem(newItem.fontFamily, "path"))?.data.path;
      result["font_path"] = font_path;
    }else{
      if (extractFileExtension(newItem.name.toLowerCase()) === '.webm'){
        if(newItem.type == "video"){
          result["dec_codec"] = "libvpx-vp9";
        }
      }
    }
    return result
  }
  async function parseSrcPath(srcPaths, clip){
    console.log("parseSrcPath:", srcPaths)
    clip.name = srcPaths.path;

    if(srcPaths.user_data.materialInfo !== undefined){
      clip.materialInfo = srcPaths.user_data.materialInfo;
    }
  
    if(clip.type === "text"){
      const fontItem = await getFontItem(srcPaths.font_path, "path");
      clip.fontFamily = fontItem?.value;
    }
  }

  function addPositionClipTransition(clip:Track){
    if(controllerTypeMap.get(clip.type) == "video"){
      controllerWasmLoader.module["GLController"].controllerMethodProxy.ConfigClip(clip.controller_key, controllerTypeMap.get(clip.type), JSON.stringify({
        width : GetStrideWidth(clip.width),
        height : clip.height,
      }));

      const video_ct_controller_key = "position_" + clip.controller_key;
      controllerWasmLoader.module["GLController"].controllerMethodProxy.AddClipTransition(video_ct_controller_key, clip.controller_key, "video", "/glsl/video/position.glsl", 0,  Number.MAX_SAFE_INTEGER);
    }

    //FIXME: unique clip_transition key.
    if(controllerTypeMap.get(clip.type) == "text"){
      const text_ct_controller_key = "position_" + clip.controller_key;
      controllerWasmLoader.module["GLController"].controllerMethodProxy.AddClipTransition(text_ct_controller_key, clip.controller_key, "text", "/glsl/text/position_text.glsl", 0, Number.MAX_SAFE_INTEGER);
    }
  }
  function initPositionClipTransition(clip:Track){
    if(controllerTypeMap.get(clip.type) == "video"){
      const video_ct_controller_key = "position_" + clip.controller_key;

      const scaleValue = getClipScaleValue(clip);
      const cx = getControllerCenterX(clip);
      const cy = getControllerCenterY(clip);
      const radian = degreeToRadian(clip.rotation);
      const json = JSON.stringify({
        "notify": true, // must nofity the init value to js.
        "uniform":{
            "centerX" : 
            {
              type: "float",
              value: `(0, ${cx}) (1, ${cx})`,
            },
            "centerY" : 
            {
              type: "float",
              value: `(0, ${cy}) (1, ${cy})`,
            },
            "scaleX" : 
            {
              type: "float",
              value: `(0, ${scaleValue[0]}) (1, ${scaleValue[0]})`,
            },
            "scaleY" : 
            {
              type: "float",
              value: `(0, ${scaleValue[1]}) (1, ${scaleValue[1]})`
            },
            "rotation" :{
              type: "float",
              value: `(0, ${radian}) (1, ${radian})`
            }
        },
      });
      controllerWasmLoader.module["GLController"].controllerMethodProxy.ConfigClipTransition(video_ct_controller_key, "video", json);
    }

    //FIXME: unique clip_transition key.
    if(controllerTypeMap.get(clip.type) == "text"){
      const text_ct_controller_key = "position_" +  clip.controller_key;

      const scaleValue = getClipScaleValue(clip);
      const cx = getControllerCenterX(clip);
      const cy = getControllerCenterY(clip);
      console.log("colors:", clip.fill, clip.stroke, clip.textBackgroundColor);
      const textColor = parseRGBA(clip.fill);
      const textStroke = parseRGBA(clip.stroke);
      const textStrokeColor = parseRGBA(clip.textBackgroundColor);
      const radian = degreeToRadian(clip.rotation);
      const json = JSON.stringify({
        "notify": true, // must nofity the init value to js.
        "uniform":{
            "textColorR": 
            {
              type: "float",
              value: `(0, ${textColor.r}) (1, ${textColor.r})`,
            },
            "textColorG": 
            {
              type: "float",
              value: `(0, ${textColor.g}) (1, ${textColor.g})`,
            },
            "textColorB": 
            {
              type: "float",
              value: `(0, ${textColor.b}) (1, ${textColor.b})`,
            },
            "textColorA": 
            {
              type: "float",
              value: `(0, ${textColor.a}) (1, ${textColor.a})`,
            },
            "textStrokeColorR":
            {
              type: "float",
              value: `(0, ${textStroke.r}) (1, ${textStroke.r})`,
            },
            "textStrokeColorG":
            {
              type: "float",
              value: `(0, ${textStroke.g}) (1, ${textStroke.g})`,
            },
            "textStrokeColorB":
            {
              type: "float",
              value: `(0, ${textStroke.b}) (1, ${textStroke.b})`,
            },
            "textStrokeColorA":
            {
              type: "float",
              value: `(0, ${textStroke.a}) (1, ${textStroke.a})`,
            },
            "textBgColorR":
            {
              type: "float",
              value: `(0, ${textStrokeColor.r}) (1, ${textStrokeColor.r})`,
            },
            "textBgColorG":
            {
              type: "float",
              value:`(0, ${textStrokeColor.g}) (1, ${textStrokeColor.g})`,
            },
            "textBgColorB":
            {
              type: "float",
              value:`(0, ${textStrokeColor.b}) (1, ${textStrokeColor.b})`,
            },
            "textBgColorA":
            {
              type: "float",
              value:`(0, ${textStrokeColor.a}) (1, ${textStrokeColor.a})`,
            },
            "centerX" : 
            {
              type: "float",
              value:`(0, ${cx}) (1, ${cx})`,
            },
            "centerY" : 
            {
              type: "float",
              value:`(0, ${cy}) (1, ${cy})`,
            },
            "scaleX" : 
            {
              type: "float",
              value:`(0, ${scaleValue[0]}) (1, ${scaleValue[0]})`,
            },
            "scaleY" : 
            {
              type: "float",
              value:`(0, ${scaleValue[1]}) (1, ${scaleValue[1]})`,
            },
            "rotation" :{
              type: "float",
              value: `(0, ${radian}) (1, ${radian})`
            },
        },
      });
      controllerWasmLoader.module["GLController"].controllerMethodProxy.ConfigClipTransition(text_ct_controller_key, "text", json);
    }
  }

  //newItem is only for data into wasm.
  async function addClip(newItem: Track, track_key:string) {
    const srcPath = await toSrcPaths(newItem);

    controllerWasmLoader.module["GLController"].controllerMethodProxy.AddClip(newItem.controller_key, track_key, controllerTypeMap.get(newItem.type), JSON.stringify(srcPath), newItem.start, newItem.end);
    condWaitId.set('AddClip', 'start')
    await condWait(()=>{
      return condWaitId.get("AddClip") === 'finished';
    }, "AddClip")
    console.log("condWait finished: ", 'AddClip');

    initPositionClipTransition(newItem);

    return newItem.controller_key;
  }

  function findTrackIndexByKey(key:string){
    for(let i = 0; i < trackList.length; i++){
      if(trackList[i].controller_key === key){
        return i;
      }
    }
    return -1;
  }

  function findClipByKey(key:string, trackType:string='unknown'){
    for(let i = 0; i < trackList.length; i++){
      if(trackType === 'unknown' || trackList[i].type === trackType){
        for(let j = 0; j < trackList[i].list.length; j++){
          if(trackList[i].list[j].controller_key === key){
            return [i, j];
          }
        }
      }
    }
    return null;
  }

  async function splitClip(targetClip, ts:number){
    if(targetClip.start < ts && ts < targetClip.end){

      const clipData = targetClip.clone();
      console.log('cloned :',targetClip,  clipData);
      if(!clipData){
        targetClip.end = ts;
        return;
      }
      
      clipData.start = ts;
      clipData.end = targetClip.end;

      targetClip.end = ts;

      const newClipKey = await addClip(clipData, trackList[toRaw(selectTrackItem).line].controller_key);

      const newClipIdx = findClipByKey(newClipKey, clipData.type);
      if(newClipIdx === null){
        console.error("newClip is null");
        return;
      }
      const newClip = trackList[newClipIdx[0]].list[newClipIdx[1]];

      SortClipInLine(selectTrackItem.line);

      if (targetClip.type !== 'text'){
        //(+ targetClip.trimStart) means re-splite a clip.
        newClip.trimStart = (ts - targetClip.start) + targetClip.trimStart;//
        console.log('test ts: ', targetClip.start, targetClip.trimStart, ' result: ', newClip.trimStart);
      }

      // if (newClip.type !== 'text'){
      //   controllerWasmLoader.module["GLController"].controllerMethodProxy.ConfigClip(newClip.controller_key, controllerTypeMap.get(newClip.type), JSON.stringify({
      //     trim_start_ts : newClip.trimStart,
      //   }));
      // }
    }
  }

  //in selected clip.
  async function addAtransition(data:any){
    if(!selectResource.value){
      console.error("addAtransition failed.");
      return;
    }
    console.log("addAtransition: ", data.controller_key , " to ", selectResource.value.controller_key);
    controllerWasmLoader.module["GLController"].controllerMethodProxy.AddClipTransition(data.controller_key , selectResource.value.controller_key, controllerTypeMap.get(selectResource.value.type), data.path, 0, Number.MAX_SAFE_INTEGER);
    
    condWaitId.set('AddClipTransition', 'start')
    await condWait(()=>{
      return condWaitId.get("AddClipTransition") === 'finished';
    }, "AddClipTransition")
    console.log("condWait finished: ", 'AddClipTransition');

    //init uniforms
    initAtransition(data);
  }
  function initAtransition(data:any){
    if(data.uniforms){
      const config_json = {
        uniform: {}
      }
      forEach(data.uniforms, (uniform_item)=>{
        config_json.uniform[uniform_item["name"]] = 
        {
          type: "float",
          value: `(0, ${uniform_item["value"]}) (1, ${uniform_item["value"]})`,
        }
        ;
      });
      controllerWasmLoader.module["GLController"].controllerMethodProxy.ConfigClipTransition(
        data.controller_key,
        data.type,
        JSON.stringify(config_json)
      );
    }
  }

  /**
   * 1. effect:  "effect_" + [getId()]
   * 2. posotion: "position_" + [clipKey]
   * 3. transition: "transition_" + [clipKey] + transitionKey
   */
  function getClipTransitionType(controller_key){
    if(controller_key.startsWith("effect_")){
      return "effect";
    }
    else if(controller_key.startsWith("position_")){
      return "position";
    }
    else if(controller_key.startsWith("transition_")){
      return "transition";
    }else{
      return null;
    }
  }

  async function removeAtransition(data:any){
    if(!selectResource.value){
      console.error("removeAtransition failed.");
      return;
    }
    console.log("removeAtransition: ", data.controller_key , " from ", selectResource.value.controller_key);
    controllerWasmLoader.module["GLController"].controllerMethodProxy.RemoveClipTransition(data.controller_key , selectResource.value.controller_key, controllerTypeMap.get(selectResource.value.type));
  
    condWaitId.set('RemoveClipTransition', 'start')
    await condWait(()=>{
      return condWaitId.get("RemoveClipTransition") === 'finished';
    }, "RemoveClipTransition")
    console.log("condWait finished: ", 'RemoveClipTransition');
  }


  controllerWasmLoader.on("initialized", async (Module)=>{
    if(Module["key"] === 'GLController'){
        controllerWasmLoader.module["GLController"].on("OnTextSize", async (key:string, width:number, height:number)=>{
          console.log("OnTextSize: ", key, width, height);

          await condWait(()=>{
            return findClipByKey(key, "text") !== null;
          }, "findClipByKey in OnTextSize")

          const clipIdx = findClipByKey(key, "text");
          
          if(clipIdx){
            const clip = trackList[clipIdx[0]].list[clipIdx[1]];
            clip.wasmCB = true;
            clip.width = width;
            clip.height = height;

            nextTick(()=>{
              clip.wasmCB = false;
            });
          }else{
            console.error("clipIdx is null");
          }
        });

        controllerWasmLoader.module["GLController"].on("OnAddTrack", (key:string, type:string)=>{
          console.log("OnAddTrack: ", key, type);
          const line = {
            type: type,
            controller_key: key,
            list: [] as Track[]
          };
          trackList.push(line);

          condWaitId.set("AddTrack", "finished");
        });

        controllerWasmLoader.module["GLController"].on("OnRemoveTrack", async (key:string, type:string)=>{
          console.log("OnRemoveTrack: ", key, type);

          selectTrackItem.line = -1;
          selectTrackItem.index = -1;

          await condWait(()=>{
            return findTrackIndexByKey(key) !== -1;
          }, "findTrackIndexByKey in OnRemoveTrack")
          
          const trackIdx = findTrackIndexByKey(key);
          trackList.splice(trackIdx, 1);

          condWaitId.set("RemoveTrack", "finished");
        });

        controllerWasmLoader.module["GLController"].on("OnAddClip", async (key:string, trackKey:string, type:string, pathsJson:string[], startTs:number, endTs:number, streamInfo:any)=>{
          console.log("OnAddClip: ", key, trackKey, type, pathsJson, startTs, endTs, streamInfo);
          const trackIdx = findTrackIndexByKey(trackKey);
          if(trackIdx >= 0 && trackList[trackIdx] !== null){
            //TODO: position
            //TODO: Parse(clipData), because clipData maybe from Json.

            console.log("streamInfo: ", streamInfo);
            let clip = null;
            if(type === "video"){
              const videoSource = {
                ...streamInfo,
                type: "video",
              }
              
              if(videoSource.duration < 0){//FIXME: image duration from wasm < 0
                videoSource.duration = 10;
              }
              clip = new VideoTrack(videoSource, startTs)//FIXME: add endTs
            }
            else if(type === "audio"){
              const audioSource = {
                ...streamInfo,
                type: "audio",
              }
              clip = new AudioTrack(audioSource, startTs)
            }
            else if(type === "text"){
              clip  = new TextTrack(defaultTextSource, 0);
              clip.width = streamInfo.width;
              clip.height = streamInfo.height;
            }
            else {
              console.error("unknown clip added.")
              return;
            }
            {
              clip.controller_key = key; // reset the controller key.
              await parseSrcPath(pathsJson, clip);

              //set clip.source
              clip.source.name = clip.name;
              if(type === "video" || type === "audio"){
                const unisource = getUniSourceByWasmPath(clip.name);
                if(!unisource){
                  console.error("unisource is null");
                  return
                }

                clip.source.url = unisource.url;
                clip.source.id = clip.source.url;
                clip.source.materialInfo = clip.materialInfo;
              }

              clip.start = Math.round(startTs)
              clip.end = Math.round(endTs);
            }

            console.log("add clip:", clip);

            addPositionClipTransition(clip);
            
            trackList[trackIdx].list.push(clip);
            selectTrackItem.line = trackIdx;
            selectTrackItem.index = trackList[trackIdx].list.length - 1;

            // ref.
            const clipLineIdx = toRaw(selectTrackItem.line);
            const clipIdx = toRaw(selectTrackItem.index);
            ListenClipChange(trackList[clipLineIdx].list[clipIdx]);
            controllerWasmLoader.module["GLController"].controllerMethodProxy.QueuedDispatch(()=>{
              InitClipDefault(trackList[clipLineIdx].list[clipIdx]);
            });
          }else{
            console.error("track is null")
          }

          condWaitId.set("AddClip", "finished");
        });

        controllerWasmLoader.module["GLController"].on("OnRemoveClip", async (key:string, trackKey:string, type:string)=>{
          console.log("OnRemoveClip: ", key, trackKey, type);

          //unselect
          selectTrackItem.line = -1;
          selectTrackItem.index = -1;

          await condWait(()=>{
            return findClipByKey(key, type) !== null;
          }, "findClipByKey in OnRemoveClip")

          const clipIdx = findClipByKey(key, type);
          if(!clipIdx){
            console.error("clipIdx is null");
            return;
          }
          trackList[clipIdx[0]].list.splice(clipIdx[1], 1);

          // if (trackList[clipIdx[0]].list.length === 0) {
          //   removeTrackLine(clipIdx[0]);//not await
          // }

          condWaitId.set("RemoveClip", "finished");
        });

        controllerWasmLoader.module["GLController"].on("OnUniforms", async (key:string, clipKey:string, type:string, uniforms)=>{
          //NOTE: Make sure all uniforms have been set initial value at least before invoke ConfigClipTransition with 'notify' to invoke OnUniforms callback to get all uniforms' real value.
          console.log("OnUniforms: ", key, clipKey, type, uniforms);

          
          await condWait(()=>{
            return findClipByKey(clipKey, type) !== null;
          }, "findClipByKey in OnUniforms")

          const clipIdx = findClipByKey(clipKey, type);
          if(!clipIdx){
            console.error("clipIdx is null");
            return;
          }

          const ctType = getClipTransitionType(key)
          if(ctType === "position"){
            const clip = trackList[clipIdx[0]].list[clipIdx[1]];

            {
              clip.wasmCB = true;
              if(type === "video"){
                clip.scale = Math.floor(uniforms["scaleX"] * 100)
                clip.scaleY = Math.floor(uniforms["scaleY"] * 100)
                clip.rotation = radianToDegree(uniforms["rotation"]);

                clip.centerX = toCenterX(uniforms["centerX"], clip)
                clip.centerY = toCenterY(uniforms["centerY"], clip)
              }
              else if(type === "text"){
                clip.textBackgroundColor = rgbaToHex(uniforms["textBgColorA"], uniforms["textBgColorG"], uniforms["textBgColorB"], uniforms["textBgColorA"]);
                clip.fill = rgbaToHex(uniforms["textColorR"], uniforms["textColorG"], uniforms["textColorB"], uniforms["textColorA"]);
                clip.stroke = rgbaToHex(uniforms["textStrokeColorR"], uniforms["textStrokeColorG"], uniforms["textStrokeColorB"], uniforms["textStrokeColorA"]);

                clip.scale = Math.floor(uniforms["scaleX"] * 100)
                clip.scaleY = Math.floor(uniforms["scaleY"] * 100)
                clip.rotation = radianToDegree(uniforms["rotation"]);

                clip.centerX = toCenterX(uniforms["centerX"], clip)
                clip.centerY = toCenterY(uniforms["centerY"], clip)
              }

              nextTick(()=>{
                clip.wasmCB = false;
              });
            }
          }
          else if(ctType === "effect"){
            //TODO: uniforms
          }
        });

        controllerWasmLoader.module["GLController"].on("OnConfigClip", async (key:string, type:string, configJson)=>{
          console.log("OnConfigClip: ", key, type, configJson);

          await condWait(()=>{
            return findClipByKey(key, type) !== null;
          }, "findClipByKey in OnConfigClip")

          //clipConfigMap
          const clipIdx = findClipByKey(key, type);
          if(!clipIdx){
            console.error("clipIdx is null");
            return;
          }
          const clip = trackList[clipIdx[0]].list[clipIdx[1]];

          {
            clip.wasmCB = true;

            if("path" in configJson){
              clip.name = configJson["path"]
            }
            if("start_ts" in configJson){
              clip.start = Math.floor(configJson["start_ts"])
            }
            if("end_ts" in configJson){
              clip.end = Math.floor(configJson["end_ts"])
            }
            if("volume" in configJson){
              clip.volume = Math.floor(configJson["volume"] * 100)
            }
            if("font_size" in configJson){
              clip.fontSize = configJson["font_size"]
            }
            if("stroke_width" in configJson){
              clip.strokeWidth = configJson["stroke_width"]
            }
            if("text_padding" in configJson){
              clip.textPadding = configJson["text_padding"]
            }
            if("font_file" in configJson){
              const fontItem = await getFontItem(configJson["font_file"], "path");
              clip.fontFamily = fontItem?.value;
            }

            // console.log("test:", clip);
            

            nextTick(()=>{
              clip.wasmCB = false;
            });
          }

          condWaitId.set("ConfigClip", "finished");
        });

        controllerWasmLoader.module["GLController"].on("OnAddClipTransition", async (key:string, clipKey:string, type:string, glslPath:string, startTs:number, endTs:number)=>{
          console.log("OnAddClipTransition: ", key, type, clipKey);

          await condWait(()=>{
            return findClipByKey(clipKey, type) !== null;
          }, "findClipByKey in OnAddClipTransition")
          //clipConfigMap
          const clipIdx = findClipByKey(clipKey, type);
          if(!clipIdx){
            console.error("clipIdx is null");
          }
          const clip = trackList[clipIdx[0]].list[clipIdx[1]];

          {
            clip.wasmCB = true;

            //TODO: format key, [] means unique
            /**
             * 1. effect:  "effect_" + [getId()]
             * 2. posotion: "position_" + [clipKey]
             * 3. transition: "transition_" + [clipKey] + transitionKey
             */
            const ctType = getClipTransitionType(key)
            if(ctType === "effect"){//effect
              clip.effectList.push({
                controller_key: key,
                name: glslPath.substring(glslPath.lastIndexOf('/') + 1, glslPath.lastIndexOf('.')),//TODO:find name
                path: glslPath,
                uniforms: []//added when onuniform, if the uniform need change.
              })
            }
            // else if(key){

            // }
            

            nextTick(()=>{
              clip.wasmCB = false;
            });
          }
          if(type === "video"){//only video clip had multi glsl now.
            await SortEffect(clip);
          }
          condWaitId.set("AddClipTransition", "finished");
        });

        controllerWasmLoader.module["GLController"].on("OnRemoveClipTransition", async (key:string, clipKey:string, type:string)=>{
          console.log("OnRemoveClipTransition: ", key, type, clipKey);

          await condWait(()=>{
            return findClipByKey(clipKey, type) !== null;
          }, "findClipByKey in OnRemoveClipTransition")
          //clipConfigMap
          const clipIdx = findClipByKey(clipKey, type);
          if(!clipIdx){
            console.error("clipIdx is null");
          }
          const clip = trackList[clipIdx[0]].list[clipIdx[1]];

          {
            clip.wasmCB = true;

            //TODO: format key, [] means unique
            
            const ctType = getClipTransitionType(key)
            console.log("ctType: ", ctType, clip.effectList, key)
            if(ctType === "effect"){//effect
              let deleteIdx = null;
              for (let i = 0; i < clip.effectList.length; i++) {
                if (clip.effectList[i].controller_key === key) {
                  deleteIdx = i;
                  break; // No need to keep searching once found
                }
              }
              if (deleteIdx !== null) {  // Check explicitly against null
                clip.effectList.splice(deleteIdx, 1);
              }
            }
            else if(ctType === "transition"){
              // clip.transition = '';//Fixbug: should not be changed again.
            }

            nextTick(()=>{
              clip.wasmCB = false;
            });
          }
          //FIXME: bug when remove video clip
          // if(type === "video"){//only video clip had multi glsl now.
          //   SortEffect(clip);
          // }
          condWaitId.set("RemoveClipTransition", "finished");
        });
    }
  });

  function InitClipDefault(clip: Track){
    if(controllerTypeMap.get(clip.type) === "text"){
      if(!clip.name){
        clip.name = "Text";
      }
      clip.fontSize = 25;
    }
  }
  function ClipMoved(clip: Track, from_track_key: string, to_track_key: string){
    controllerWasmLoader.module["GLController"].controllerMethodProxy.MoveClip(clip.controller_key, from_track_key, to_track_key);
  }

  const frameCount = computed(() => {
    return trackList.reduce((res, { list }) => {
      return Math.max(list.reduce((max, track) => Math.max(max, track.end), 0), res);
    }, 0);
  });

  return {
    controllerCanvasSize,
    controllerTypeMap,
    moveTrackData,
    selectTrackItem,
    selectResource,
    trackScale,
    trackList,
    frameCount,
    dragData,
    effectListUpdate,
    eventEmitter,
    needSeekClips,

    findTrackIndexByKey,
    findClipByKey,
    getClipIndexById,
    selectTrackById,
    removeTrackLine,
    addTrack,
    addClip,
    removeClip,
    ClipMoved,
    SortTracks,
    findUnoccupiedInSelectedLine,
    addAtransition,
    removeAtransition,
    splitClip,
  };
});
