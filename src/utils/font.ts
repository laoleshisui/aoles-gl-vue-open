import { controllerWasmLoader } from "./controllerWasmLoader";
import { loadNetFileToWasmFS } from "./file";
import { uniSourceMap } from "./uniSource";
import { assetConfig } from "@/config/assetConfig";

export interface FontItem {
    value: string
    label: string
    data: {
        path: string
    }
}

export const fontMap: FontItem[] = [
    {
        value: 'NotoSansSC',
        label: 'FontMap.Label.NotoSansSC', 
        data:
        {
            path: '/fonts/NotoSansSC-Regular.ttf'
        }
    },
    // {
    //     value: 'GangFengFanTi',
    //     label: 'FontMap.Label.GangFengFanTi', 
    //     data:
    //     {
    //         path: '/fonts/GangFengFanTi.ttf'
    //     }
    // },
    {
        value: 'qiji',
        label: 'FontMap.Label.Qiji', 
        data:
        {
            path: '/fonts/qiji.ttf'
        }
    },
    {
        value: 'CactusClassicalSerif-Regular',
        label: 'FontMap.Label.CactusClassicalSerif-Regular', 
        data:
        {
            path: '/fonts/CactusClassicalSerif-Regular.ttf'
        }
    },
    {
        value: 'LongCang-Regular',
        label: 'FontMap.Label.LongCang-Regular', 
        data:
        {
            path: '/fonts/LongCang-Regular.ttf'
        }
    },
    {
        value: 'MaShanZheng-Regular',
        label: 'FontMap.Label.MaShanZheng-Regular', 
        data:
        {
            path: '/fonts/MaShanZheng-Regular.ttf'
        }
    },
    {
        value: 'NotoSerifSC-Regular',
        label: 'FontMap.Label.NotoSerifSC-Regular', 
        data:
        {
            path: '/fonts/NotoSerifSC-Regular.ttf'
        }
    },
    {
        value: 'ZCOOLKuaiLe-Regular',
        label: 'FontMap.Label.ZCOOLKuaiLe-Regular', 
        data:
        {
            path: '/fonts/ZCOOLKuaiLe-Regular.ttf'
        }
    },
    {
        value: 'ZCOOLQingKeHuangYou-Regular',
        label: 'FontMap.Label.ZCOOLQingKeHuangYou-Regular', 
        data:
        {
            path: '/fonts/ZCOOLQingKeHuangYou-Regular.ttf'
        }
    },
    {
        value: 'ZCOOLXiaoWei-Regular',
        label: 'FontMap.Label.ZCOOLXiaoWei-Regular', 
        data:
        {
            path: '/fonts/ZCOOLXiaoWei-Regular.ttf'
        }
    },
    {
        value: 'ZhiMangXing-Regular',
        label: 'FontMap.Label.ZhiMangXing-Regular', 
        data:
        {
            path: '/fonts/ZhiMangXing-Regular.ttf'
        }
    },
]

controllerWasmLoader.on("initialized", async (Module)=>{
    if(Module["key"] === 'GLController'){
        for(let i = 0; i < fontMap.length; i++){
            const url = assetConfig.getFontUrl(fontMap[i].data.path)
            uniSourceMap.push({
                url: url,
                wasmPath: fontMap[i].data.path,
            })
        }
    }
});


export async function getFontItem(value:string, key:string="value"){
    let fontItem = null;
    for(let i = 0; i < fontMap.length; i++){
        if(key === "path"){
            if(fontMap[i]["data"]["path"] === value){
                fontItem = fontMap[i];
                break;
            }
        }
        else if(key in fontMap[i] && fontMap[i][key] === value){
            fontItem = fontMap[i];
            break;
        }else{
            // break;
        }
    }
    try {
        controllerWasmLoader.module["GLController"].FS.lookupPath(fontItem?.data.path);
    } catch (e) {
        const assetUrl = assetConfig.getFontUrl(fontItem?.data.path);
        await loadNetFileToWasmFS(assetUrl, fontItem?.data.path)
        // return null;//loadNetFileToWasmFS need time.
    }

    console.log("get fontItem: ",  fontItem);
    return fontItem;
}

/**
 * 注册自定义字体
 * @param font 字体配置对象
 * @example
 * ```ts
 * registerFont({
 *   value: 'MyCustomFont',
 *   label: 'FontMap.Label.MyCustomFont',
 *   data: { path: '/fonts/MyCustomFont.ttf' }
 * })
 * ```
 */
export function registerFont(font: FontItem) {
    // 检查是否已存在
    const exists = fontMap.some(f => f.value === font.value)
    if (exists) {
        console.warn(`Font "${font.value}" already exists, skipping registration`)
        return
    }

    fontMap.push(font)

    // 添加到 uniSourceMap
    uniSourceMap.push({
        url: font.data.path,
        wasmPath: font.data.path,
    })
}

/**
 * 批量注册自定义字体
 * @param fonts 字体配置数组
 */
export function registerFonts(fonts: FontItem[]) {
    fonts.forEach(font => registerFont(font))
}