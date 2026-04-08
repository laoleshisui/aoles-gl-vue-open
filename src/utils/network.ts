import axios from 'axios';
import { extractFileExtension, isAudio, isImage, isVideo } from './common';

export function replaceDomain(oUrl:string, cdnDomain="oss.pixoclip.com") {
    try {
        const url = new URL(oUrl);
        url.hostname = cdnDomain;
        return url.toString();
    } catch (error) {
        // console.error("Invalid URL provided:", oUrl);
        return oUrl; // 如果URL无效，返回原字符串
    }
}

/**
 * 生成符合RFC4122标准的UUID v4
 * @returns {string} 32字符的UUID（无连字符）
 */
export function generateUUIDv4() {
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}