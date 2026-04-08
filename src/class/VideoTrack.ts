import { forEach, uniqueId } from 'lodash-es';
import type { BaseTractItem, TrackType } from './Base';
import { getId, GetStrideWidth } from '@/utils/common';
import { mappingFormItem } from '@/utils/formItemUtils';
import { transitionMap } from '@/utils/effect';
import { loadNetFileToWasmFS } from '@/utils/file';
import { controllerWasmLoader } from '@/utils/controllerWasmLoader';
import { assetConfig } from '@/config/assetConfig';
import z from 'zod';

export interface VideoSource {
  id: string,// === url
  url: string,
  name: string, // use as wasm file path
  duration: number,
  width: number,
  height: number,
  type: string,
  materialInfo: {
    materialId:number,
    iUrlId:number,
  }
}

export interface ControllerEffect {
  controller_key?: string,
  name: string;
  path: string;
  type: string;
  uniforms: Record<string, any>;
}


const zodDescription = z.object({
  controller_key: z.string().describe('The controller key of the clip.'),

  start: z.number().nullable().describe('The start timestamp (in frame) of the clip in its track. For example, 10 means the clip will start showing at 10th frame (include the 10th).'),
  end: z.number().nullable().describe('The end timestamp (in frame) of the clip in its track. For example, 100 means the clip will stop showing at 100th frame (include the 100th).'),

  width: z.number().nullable().describe('The width (in pixel) of the clip.'),
  height: z.number().nullable().describe('The height (in pixel) of the clip.'),

  centerX: z.number().nullable().describe('The x position (in pixel) of the clip which is anchored at the center.'),
  centerY: z.number().nullable().describe('The y position (in pixel) of the clip which is anchored at the center.'),
  scale: z.number().nullable().describe('The horizontal scaling of the clip which is anchored at the center. For example, 10 means 10%.'),
  scaleY: z.number().nullable().describe('The vertical scaling of the clip which is anchored at the center. For example, 10 means 10%.'),
  rotation: z.number().nullable().describe('The rotation of the clip which is anchored at the center. For example, 10 means 10 deg.'),
  
  name: z.string().nullable().describe('The source file path of the clip in wasm FS.'),

  trimStart: z.number().nullable().describe('The timestamp (in frame) where start triming in the origin source.'),
}).describe("Video clip description.")

export class VideoTrack implements BaseTractItem {
  controller_key: string;
  wasmCB:boolean;
  id: string;
  type: TrackType = 'video';
  source: VideoSource;
  name: string;
  format: string;
  frameCount: number;
  start: number;
  end: any;
  centerX: number;
  centerY: number;
  scale: number;
  scaleY: number;
  height: number;
  width: number;
  rotation: number;
  offsetL: number;
  offsetR: number;
  transition:string;
  ownTransitionMap:any;
  effectList: ControllerEffect[];
  trimStart: number;
  materialInfo: {
    materialId:number,
    iUrlId:number,
  };

  constructor(source: VideoSource, curFrame: number) {
    this.controller_key = getId("video_clip")
    this.wasmCB = false;
    // 设置ID
    this.id = uniqueId();
    // 设置视频信息
    this.source = source;//reset when onAddClip.
    // 获取文件名称
    this.name = source.name;
    // 获取文件类型
    this.format = source.format;
    // 设置轨道信息
    this.frameCount = Math.ceil(source.duration * 30);
    this.start = Math.round(curFrame);
    this.end = Math.ceil(this.start + this.frameCount);

    // 设置绘制信息
    this.centerX = 0;
    this.centerY = 0;
    this.scale = 100;
    this.scaleY = 100;
    this.height = source.height;
    this.width = GetStrideWidth(source.width);
    this.rotation = 0;

    // 设置裁剪信息
    this.offsetL = 0;
    this.offsetR = 0;

    this.materialInfo = source.materialInfo

    this.transition = '';
    this.ownTransitionMap = [...transitionMap]
    forEach(this.ownTransitionMap, item => {
      if(item.value){
        item.data.controller_key = 'transition_' + this.controller_key + item.data.controller_key;
      }
    });

    this.effectList = []
    this.trimStart = 0;

  }

  zodDescribe(){
    // console.log("zodDescribe: ", this)
    const description = zodDescription.parse(this)
    // console.log("zodDescribe result: ", description)
    return description;
  }

  clone(){
    const copiedSource = {...this.source};
    const cloned = new VideoTrack(copiedSource, 0)
    //{wasmCB, controller_key, id} are inited by itself.
  
    // 获取文件名称
    cloned.name = this.name
    // 获取文件类型
    cloned.format = this.format
    // 设置轨道信息
    cloned.frameCount = this.frameCount
    cloned.start = this.start
    cloned.end = this.end 

    // 设置绘制信息
    cloned.centerX = this.centerX
    cloned.centerY = this.centerY
    cloned.scale = this.scale
    cloned.scaleY = this.scaleY
    cloned.rotation = this.rotation
    cloned.height = this.height
    cloned.width = this.width

    // 设置裁剪信息
    cloned.offsetL = this.offsetL 
    cloned.offsetR = this.offsetR 

    cloned.transition = this.transition 
    cloned.ownTransitionMap = {...this.ownTransitionMap }
    forEach(cloned.ownTransitionMap, item => {
      if(item.value){
        item.data.controller_key = 'transition_' + cloned.controller_key + item.data.controller_key;
      }
    });

    cloned.effectList = {...this.effectList}
    cloned.trimStart = this.trimStart

    cloned.materialInfo = this.materialInfo

    return cloned;
  }

  syncFromObject(obj:any){
    // if (obj.id) this.id = obj.id;
    // if (obj.controller_key) this.controller_key = obj.controller_key;

    // 获取文件名称
    if (obj.name) this.name = obj.name
    // 获取文件类型
    if (obj.format) this.format = obj.format
    // 设置轨道信息
    if (obj.frameCount) this.frameCount = obj.frameCount
    if (obj.start) this.start = obj.start
    if (obj.end) this.end = obj.end 

    // 设置绘制信息
    if (obj.centerX) this.centerX = obj.centerX
    if (obj.centerY) this.centerY = obj.centerY
    if (obj.scale) this.scale = obj.scale
    if (obj.scaleY) this.scaleY = obj.scaleY
    if (obj.rotation) this.rotation = obj.rotation
    if (obj.height) this.height = obj.height
    if (obj.width) this.width = obj.width

    // 设置裁剪信息
    if (obj.offsetL) this.offsetL = obj.offsetL 
    if (obj.offsetR) this.offsetR = obj.offsetR 

    if (obj.transition) this.transition = obj.transition 
    // cloned.ownTransitionMap = {...obj.ownTransitionMap }
    // forEach(cloned.ownTransitionMap, item => {
    //   if(item.value){
    //     item.data.controller_key = 'transition_' + cloned.controller_key + item.data.controller_key;
    //   }
    // });

    if (obj.effectList) this.effectList = {...obj.effectList}
    if (obj.trimStart) this.trimStart = obj.trimStart

    if (obj.materialInfo) this.materialInfo = obj.materialInfo
  }

  formEffectList(){
    let ret = [];
    for(let i = 0; i < this.effectList.length; i++){
      const effectItem = mappingFormItem('ListItem', {
        controller_key: this.effectList[i].controller_key,
        name: this.effectList[i].name,
        data: this.effectList[i],
        mappingKey: "effectList",
        targetListUpdateKey: "UpdateVideoEffectList",
        children: []
      })

      ret.push(effectItem);
    }
    return ret;
  }

  async getTransitionItem(value:string=this.transition){
    let item = null;
    for(let i = 0; i < this.ownTransitionMap.length; i++){
        if(this.ownTransitionMap[i].value === value){
            item = this.ownTransitionMap[i];
            break;
        }
    }

    if(value){
        try {
            controllerWasmLoader.module["GLController"].FS.lookupPath(item?.data.path);
        } catch (e) {
            const assetUrl = assetConfig.getGlslUrl(item?.data.path);
            await loadNetFileToWasmFS(assetUrl, item?.data.path)
            // return null;//loadNetFileToWasmFS need time.
        }
    }

    console.log("getTransitionItem: ", item);
    return item;
  }
}