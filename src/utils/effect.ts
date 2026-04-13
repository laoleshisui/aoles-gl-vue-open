import { controllerWasmLoader } from "./controllerWasmLoader";
import { loadNetFileToWasmFS } from "./file";
import { uniSourceMap } from "./uniSource";
import { assetConfig } from "@/config/assetConfig";

export interface TransitionUniform {
    name: string
    type: string
    value: number
    min: number
    max: number
    step: number
    label: string
    description: string
}

export interface TransitionItem {
    value: string
    label: string
    data: {
        name?: string
        transition_type?: string
        controller_key?: string
        transition_duration_ts?: number
        path?: string
        uniforms?: TransitionUniform[]
    }
}

export const transitionMap: TransitionItem[] = [
    {
        "value": "",
        "label": "TransitionMap.Label.None",
        "data": {}
    },
    {
        "value": "LinearBlur",
        "label": "TransitionMap.LinearBlur.Label",
        "data": {
            "name": "TransitionMap.LinearBlur.Label",
            "transition_type": "transition",
            "controller_key": "transition_key_linear_blur",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/linear_blur.glsl",
            "uniforms": [
                {
                    "name": "intensity",
                    "type": "float",
                    "value": 0.2,
                    "min": 0,
                    "max": 1,
                    "step": 0.1,
                    "label": "TransitionMap.LinearBlur.Uniforms.Intensity.Label",
                    "description": "TransitionMap.LinearBlur.Uniforms.Intensity.Description",
                },
                {
                    "name": "passes",
                    "type": "int",
                    "value": 6,
                    "min": 0,
                    "max": 10,
                    "step": 1,
                    "label": "TransitionMap.LinearBlur.Uniforms.Passes.Label",
                    "description": "TransitionMap.LinearBlur.Uniforms.Passes.Description",
                }
            ]
        }
    },
    {
        "value": "DefocusBlur",
        "label": "TransitionMap.DefocusBlur.Label",
        "data": {
            "name": "TransitionMap.DefocusBlur.Label",
            "transition_type": "transition",
            "controller_key": "transition_key_defocus_blur",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/defocus_blur.glsl",
            "uniforms": [
                {
                    "name": "blurSize",
                    "type": "float",
                    "value": 0.2,
                    "min": 0,
                    "max": 1,
                    "step": 0.1,
                    "label": "TransitionMap.DefocusBlur.Uniforms.BlurSize.Label",
                    "description": "TransitionMap.DefocusBlur.Uniforms.BlurSize.Description",
                }
            ]
        }
    },
    {
        "value": "BookFlip",
        "label": "TransitionMap.Label.BookFlip",
        "data": {
            "name": "TransitionMap.Label.BookFlip",
            "transition_type": "transition",
            "controller_key": "transition_key_book_flip",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/book_flip.glsl",
            "uniforms": []
        }
    },
    {
        "value": "ButterflyWaveScrawler",
        "label": "TransitionMap.Label.ButterflyWaveScrawler",
        "data": {
            "name": "TransitionMap.Label.ButterflyWaveScrawler",
            "transition_type": "transition",
            "controller_key": "transition_key_butterfly_wave_scrawler",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/ButterflyWaveScrawler.glsl",
            "uniforms": []
        }
    },
    {
        "value": "Cannabisleaf",
        "label": "TransitionMap.Label.Cannabisleaf",
        "data": {
            "name": "TransitionMap.Label.Cannabisleaf",
            "transition_type": "transition",
            "controller_key": "transition_key_cannabisleaf",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/cannabisleaf.glsl",
            "uniforms": []
        }
    },
    {
        "value": "CrossWarp",
        "label": "TransitionMap.Label.CrossWarp",
        "data": {
            "name": "TransitionMap.Label.CrossWarp",
            "transition_type": "transition",
            "controller_key": "transition_key_cross_warp",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/crosswarp.glsl",
            "uniforms": []
        }
    },
    {
        "value": "Cube",
        "label": "TransitionMap.Label.Cube",
        "data": {
            "name": "TransitionMap.Label.Cube",
            "transition_type": "transition",
            "controller_key": "transition_key_cube",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/cube.glsl",
            "uniforms": []
        }
    },
    {
        "value": "DoomScreenTransition",
        "label": "TransitionMap.Label.DoomScreenTransition",
        "data": {
            "name": "TransitionMap.Label.DoomScreenTransition",
            "transition_type": "transition",
            "controller_key": "transition_key_doom_screen_transition",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/DoomScreenTransition.glsl",
            "uniforms": []
        }
    },
    {
        "value": "Doorway",
        "label": "TransitionMap.Label.Doorway",
        "data": {
            "name": "TransitionMap.Label.Doorway",
            "transition_type": "transition",
            "controller_key": "transition_key_doorway",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/doorway.glsl",
            "uniforms": []
        }
    },
    {
        "value": "FilmBurn",
        "label": "TransitionMap.Label.FilmBurn",
        "data": {
            "name": "TransitionMap.Label.FilmBurn",
            "transition_type": "transition",
            "controller_key": "transition_key_film_burn",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/FilmBurn.glsl",
            "uniforms": [
                {
                    name: 'Seed',
                    type: 'float',
                    value: 2.30,
                    min: 0.0,
                    max: 10.0,
                    step: 0.1,
                    label: 'TransitionMap.FilmBurn.Uniforms.Seed.Label',
                    description: 'TransitionMap.FilmBurn.Uniforms.Seed.Description'
                },
            ]
        }
    },
    {
        "value": "Flyeye",
        "label": "TransitionMap.Label.Flyeye",
        "data": {
            "name": "TransitionMap.Label.Flyeye",
            "transition_type": "transition",
            "controller_key": "transition_key_flyeye",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/flyeye.glsl",
            "uniforms": []
        }
    },
    {
        "value": "GlitchDisplace",
        "label": "TransitionMap.Label.GlitchDisplace",
        "data": {
            "name": "TransitionMap.Label.GlitchDisplace",
            "transition_type": "transition",
            "controller_key": "transition_key_glitch_displace",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/GlitchDisplace.glsl",
            "uniforms": []
        }
    },
    {
        "value": "GlitchMemories",
        "label": "TransitionMap.Label.GlitchMemories",
        "data": {
            "name": "TransitionMap.Label.GlitchMemories",
            "transition_type": "transition",
            "controller_key": "transition_key_glitch_memories",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/GlitchMemories.glsl",
            "uniforms": []
        }
    },
    {
        "value": "InvertedPageCurl",
        "label": "TransitionMap.Label.InvertedPageCurl",
        "data": {
            "name": "TransitionMap.Label.InvertedPageCurl",
            "transition_type": "transition",
            "controller_key": "transition_key_inverted_page_curl",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/InvertedPageCurl.glsl",
            "uniforms": []
        }
    },
    {
        "value": "Kaleidoscope",
        "label": "TransitionMap.Label.Kaleidoscope",
        "data": {
            "name": "TransitionMap.Label.Kaleidoscope",
            "transition_type": "transition",
            "controller_key": "transition_key_kaleidoscope",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/kaleidoscope.glsl",
            "uniforms": []
        }
    },
    {
        "value": "LuminanceMelt",
        "label": "TransitionMap.Label.LuminanceMelt",
        "data": {
            "name": "TransitionMap.Label.LuminanceMelt",
            "transition_type": "transition",
            "controller_key": "transition_key_luminance_melt",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/luminance_melt.glsl",
            "uniforms": []
        }
    },
    {
        "value": "Morph",
        "label": "TransitionMap.Label.Morph",
        "data": {
            "name": "TransitionMap.Label.Morph",
            "transition_type": "transition",
            "controller_key": "transition_key_morph",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/morph.glsl",
            "uniforms": []
        }
    },
    {
        "value": "Mosaic",
        "label": "TransitionMap.Label.Mosaic",
        "data": {
            "name": "TransitionMap.Label.Mosaic",
            "transition_type": "transition",
            "controller_key": "transition_key_mosaic",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/Mosaic.glsl",
            "uniforms": []
        }
    },
    {
        "value": "Pinwheel",
        "label": "TransitionMap.Label.Pinwheel",
        "data": {
            "name": "TransitionMap.Label.Pinwheel",
            "transition_type": "transition",
            "controller_key": "transition_key_pinwheel",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/pinwheel.glsl",
            "uniforms": []
        }
    },
    {
        "value": "PolkaDotsCurtain",
        "label": "TransitionMap.Label.PolkaDotsCurtain",
        "data": {
            "name": "TransitionMap.Label.PolkaDotsCurtain",
            "transition_type": "transition",
            "controller_key": "transition_key_polka_dots_curtain",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/PolkaDotsCurtain.glsl",
            "uniforms": []
        }
    },
    {
        "value": "Radial",
        "label": "TransitionMap.Label.Radial",
        "data": {
            "name": "TransitionMap.Label.Radial",
            "transition_type": "transition",
            "controller_key": "transition_key_radial",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/Radial.glsl",
            "uniforms": []
        }
    },
    {
        "value": "Ripple",
        "label": "TransitionMap.Label.Ripple",
        "data": {
            "name": "TransitionMap.Label.Ripple",
            "transition_type": "transition",
            "controller_key": "transition_key_ripple",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/ripple.glsl",
            "uniforms": []
        }
    },
    {
        "value": "RotateScaleFade",
        "label": "TransitionMap.Label.RotateScaleFade",
        "data": {
            "name": "TransitionMap.Label.RotateScaleFade",
            "transition_type": "transition",
            "controller_key": "transition_key_rotate_scale_fade",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/rotate_scale_fade.glsl",
            "uniforms": []
        }
    },
    {
        "value": "Swap",
        "label": "TransitionMap.Label.Swap",
        "data": {
            "name": "TransitionMap.Label.Swap",
            "transition_type": "transition",
            "controller_key": "transition_key_swap",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/swap.glsl",
            "uniforms": []
        }
    },
    {
        "value": "TangentMotionBlur",
        "label": "TransitionMap.Label.TangentMotionBlur",
        "data": {
            "name": "TransitionMap.Label.TangentMotionBlur",
            "transition_type": "transition",
            "controller_key": "transition_key_tangent_motion_blur",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/tangentMotionBlur.glsl",
            "uniforms": []
        }
    },
    {
        "value": "TVStatic",
        "label": "TransitionMap.Label.TVStatic",
        "data": {
            "name": "TransitionMap.Label.TVStatic",
            "transition_type": "transition",
            "controller_key": "transition_key_tv_static",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/TVStatic.glsl",
            "uniforms": []
        }
    },
    {
        "value": "WaterDrop",
        "label": "TransitionMap.Label.WaterDrop",
        "data": {
            "name": "TransitionMap.Label.WaterDrop",
            "transition_type": "transition",
            "controller_key": "transition_key_water_drop",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/WaterDrop.glsl",
            "uniforms": []
        }
    },
    {
        "value": "Windowslice",
        "label": "TransitionMap.Label.Windowslice",
        "data": {
            "name": "TransitionMap.Label.Windowslice",
            "transition_type": "transition",
            "controller_key": "transition_key_windowslice",
            "transition_duration_ts": 15,
            "path": "/glsl/video/transition/windowslice.glsl",
            "uniforms": []
        }
    }
]

controllerWasmLoader.on("initialized", async (Module)=>{
    if(Module["key"] === 'GLController'){
        for(let i = 0; i < transitionMap.length; i++){
            if(transitionMap[i].value){
                const url = assetConfig.getGlslUrl(transitionMap[i].data.path);
                const wasmPath = transitionMap[i].data.path;
                uniSourceMap.push({
                    url: url,
                    wasmPath: wasmPath,
                })
                await loadNetFileToWasmFS(url, wasmPath);//glsl files are very small, pre-dowload it.
            }
        }
    }
});

export async function getTransitionItem(value:string, map=transitionMap){
    let item = null;
    for(let i = 0; i < map.length; i++){
        if(map[i].value === value){
            item = map[i];
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

    return item;
}

/**
 * 注册自定义转场特效
 * @param transition 转场特效配置对象
 * @example
 * ```ts
 * registerTransition({
 *   value: 'MyCustomTransition',
 *   label: 'TransitionMap.Label.MyCustomTransition',
 *   data: {
 *     name: 'TransitionMap.Label.MyCustomTransition',
 *     controller_key: 'transition_key_my_custom',
 *     transition_duration_ts: 15,
 *     path: '/glsl/video/transition/my_custom.glsl',
 *     uniforms: []
 *   }
 * })
 * ```
 */
export function registerTransition(transition: TransitionItem) {
    // 检查是否已存在
    const exists = transitionMap.some(t => t.value === transition.value)
    if (exists) {
        console.warn(`Transition "${transition.value}" already exists, skipping registration`)
        return
    }

    transitionMap.push(transition)

    // 如果 WASM 已初始化，立即加载资源
    if (controllerWasmLoader.module["GLController"]) {
        if (transition.value && transition.data.path) {
            const url = assetConfig.getGlslUrl(transition.data.path)
            const wasmPath = transition.data.path
            uniSourceMap.push({
                url: url,
                wasmPath: wasmPath,
            })
            loadNetFileToWasmFS(url, wasmPath).catch(err => {
                console.error(`Failed to load transition shader: ${transition.value}`, err)
            })
        }
    }
}

/**
 * 批量注册自定义转场特效
 * @param transitions 转场特效配置数组
 */
export function registerTransitions(transitions: TransitionItem[]) {
    transitions.forEach(transition => registerTransition(transition))
}