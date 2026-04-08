import { uniqueId } from 'lodash-es';
import type { BaseTractItem, TrackType } from './Base';
import { getId } from '@/utils/common';
import z from 'zod';

export interface TextSource {
  content: string,
  fill: string,
  stroke: string,
  fontSize: number,
  fontFamily: string,
  textBackgroundColor: string
  name: string,
  type: string
}

export const defaultTextSource = {
  content: '', 
  fontSize: 25,
  fontFamily: 'NotoSansSC',
  name: 'Text',
  type: "text",
  fill: '#FFFFFFFF',
  stroke:'#00000000',
  textBackgroundColor:'#00000000'
}

const zodDescription = z.object({
  controller_key: z.string().describe('The controller key of the clip.'),

  start: z.number().nullable().describe('The start timestamp (in frame) of the clip in its track. For example, 10 means the text clip will start showing at 10th frame (include the 10th).'),
  end: z.number().nullable().describe('The end timestamp (in frame) of the clip in its track. For example, 100 means the text clip will stop showing at 100th frame (include the 100th).'),

  fontSize: z.number().nullable().describe('The font size (in pixel) of the clip.'),
  strokeWidth: z.number().nullable().describe('The stroke size (in pixel) of the clip.'),
  textPadding: z.number().nullable().describe('The text padding (in pixel) of the clip.'),

  centerX: z.number().nullable().describe('The x position (in pixel) of the clip which is anchored at the center.'),
  centerY: z.number().nullable().describe('The y position (in pixel) of the clip which is anchored at the center.'),
  scale: z.number().nullable().describe('The horizontal scaling of the clip which is anchored at the center. For example, 10 means 10%.'),
  scaleY: z.number().nullable().describe('The vertical scaling of the clip which is anchored at the center. For example, 10 means 10%.'),
  rotation: z.number().nullable().describe('The rotation of the clip which is anchored at the center. For example, 10 means 10 deg.'),

  name: z.string().nullable().describe('The text content of the clip.'),

  fontFamily: z.string().nullable().describe('The font family of the clip.'),
  
  fill: z.string().nullable().describe('The font color of the clip. Format is #RRGGBBAA.'),
  stroke: z.string().nullable().describe('The font stroke color of the clip. Format is #RRGGBBAA.'),
  textBackgroundColor: z.string().nullable().describe('The font background color of the clip. Format is #RRGGBBAA.'),
}).describe("Text clip description.")
export class TextTrack implements BaseTractItem {
  controller_key: string;
  wasmCB:boolean;
  source: TextSource;
  // 文本内容
  fill: string;
  stroke: string;
  textBackgroundColor: string;
  // 影响文本绘制的属性都使用getter/setter，在设置时，需要重新计算文本宽高
  fontSize = 20;
  strokeWidth = 1;
  textPadding = 2;
  fontFamily = 'Arial';

  content = '';
  type: TrackType = 'text';
  centerX = 0;
  centerY = 0;
  width = 0;
  height = 0;
  rotation:number;
  scale = 100;
  scaleY = 100;
  id: string;
  name: string;
  frameCount: number;
  start: number;
  end: number;
  format: string;
  applyInTrack: boolean;
  constructor(source: TextSource, curFrame: number) {
    this.controller_key = getId("text_clip");
    this.wasmCB = false;
    // 设置ID
    this.id = uniqueId();

    this.source = source;
    // 设置文字信息
    this.content = source.content;
    this.fontSize = source.fontSize;
    this.strokeWidth = 1;
    this.textPadding = 2*this.strokeWidth;
    this.fontFamily = source.fontFamily;
    this.fill = source.fill;
    this.stroke = source.stroke;
    this.textBackgroundColor = source.textBackgroundColor;
    this.name = source.name;
    // 对于文本意义不大
    this.format = 'text';
    // 设置轨道信息
    this.frameCount = 30 * 10;
    this.start = curFrame;
    this.end = this.start + this.frameCount;
    // 设置绘制信息
    this.centerX = 0;
    this.centerY = 0;
    this.rotation = 0;

    this.width = 0;
    this.height = 0;

    this.scale = 100;
    this.scaleY = 100;

    this.applyInTrack = false;

  }

  clone(){
    const copiedSource = {...this.source};
    const cloned = new TextTrack(copiedSource, 0)
    //{wasmCB, controller_key, id} are inited by itself.

    cloned.content = this.content
    cloned.fontSize = this.fontSize
    cloned.strokeWidth = this.strokeWidth
    cloned.textPadding = this.textPadding
    cloned.fontFamily = this.fontFamily
    cloned.fill = this.fill
    cloned.stroke = this.stroke
    cloned.textBackgroundColor = this.textBackgroundColor
    cloned.name = this.name
    cloned.format = this.format
    cloned.frameCount = this.frameCount
    cloned.start = this.start
    cloned.end = this.end
    cloned.centerX = this.centerX
    cloned.centerY = this.centerY
    cloned.width = this.width
    cloned.height = this.height
    cloned.rotation = this.rotation
    cloned.scale = this.scale
    cloned.scaleY = this.scaleY
    cloned.applyInTrack = this.applyInTrack

    return cloned;
  }

  syncFromObject(obj:any){
    // if (obj.id) this.id = obj.id;
    // if (obj.controller_key) this.controller_key = obj.controller_key;

    if (obj.content) this.content = obj.content
    if (obj.fontSize) this.fontSize = obj.fontSize
    if (obj.strokeWidth) this.strokeWidth = obj.strokeWidth
    if (obj.textPadding) this.textPadding = obj.textPadding
    if (obj.fontFamily) this.fontFamily = obj.fontFamily
    if (obj.stroke) this.stroke = obj.stroke
    if (obj.textBackgroundColor) this.textBackgroundColor = obj.textBackgroundColor

    if (obj.applyInTrack) this.applyInTrack = obj.applyInTrack

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
  }

  zodDescribe(){
    // console.log("zodDescribe: ", this)
    const description = zodDescription.parse(this)
    // console.log("zodDescribe result: ", description)
    return description;
  }
}