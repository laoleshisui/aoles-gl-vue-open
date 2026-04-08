import { forEach } from "lodash-es"

export interface UniSource{
    url:string,
    originUrl?:string,//if no origin, use url.
    wasmPath:string
}

export const uniSourceMap:UniSource[] = [];

export function getUniSourceByWasmPath(wasmPath:string){
    for(let i = 0; i < uniSourceMap.length; i++){
        if(uniSourceMap[i].wasmPath === wasmPath){
            return uniSourceMap[i];
        }
    };
    return null;
}