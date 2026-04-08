import { AudioSource, AudioTrack } from "@/class/AudioTrack";
import { defaultTextSource, TextSource, TextTrack } from "@/class/TextTrack";
import { VideoSource, VideoTrack } from "@/class/VideoTrack";
import { useTrackState } from "@/stores/trackState";
import { AIToolMap, cleanSrtContent } from "@/utils/common";
import { getFileFromStream, loadFilesToWasmFS } from "@/utils/file";
import { fontMap } from "@/utils/font";
import { getVideoFileInfo } from "@/utils/mediaUtil";
import { uniSourceMap } from "@/utils/uniSource";
import { audioDecoder, imageDecoder, videoDecoder } from "@/utils/webcodecs";
import SrtParser from 'srt-parser-2';

async function fillVideoSourceByFile(videoSource:VideoSource, srcFile:File){
  if(srcFile.type.startsWith('image/')){
    const frames = await imageDecoder.decode({ id: videoSource.id, stream: srcFile.stream(), type: srcFile.type });
    if (!frames) {
    //   ElMessage.error(t("Panel.Video.ImportResources.Message.ParseFailed"));
      return false;
    }
    videoSource.width = frames[0].codedWidth,
    videoSource.height = frames[0].codedHeight
  }
  else if(srcFile.type.startsWith('video/')){
    // const videoInfo = await getVideoFileInfo(srcFile);
    // console.log("videoInfo:", videoInfo);
    try{
        const clip = await videoDecoder.decode({ id: videoSource.id, stream: srcFile.stream(), type: srcFile.type });
        if (!clip) {
        //   ElMessage.error(t("Panel.Video.ImportResources.Message.ParseFailed"));
        // return false;
        throw new Error("decode failed.")
        }

        console.log("decode clip: ", clip);

        videoSource.width = clip.meta.width;
        videoSource.height = clip.meta.height;
        videoSource.duration = clip.meta.duration / 1e6;
    }catch(error){
        const videoInfo = await getVideoFileInfo(srcFile);
        console.log("videoInfo:", videoInfo);
        videoSource.width = videoInfo.width;
        videoSource.height = videoInfo.height;
        videoSource.duration = videoInfo.duration;
    }
    
  }

  return true;
}

export default {
    async deleteClip(lineIdx:number, clipIdx:number){
        const trackStore = useTrackState();
        if (lineIdx !== -1 && clipIdx !== -1) {
            await trackStore.removeClip(lineIdx, clipIdx);
            if(trackStore.trackList[lineIdx].list.length === 0){
                await trackStore.removeTrackLine(lineIdx);
            }
        }
    },
    async deleteAllClips(){
        const trackStore = useTrackState();
        for(let i = trackStore.trackList.length-1; i >= 0; i--){
            for(let j = trackStore.trackList[i].list.length-1; j >= 0; j--){
                await this.deleteClip(i, j);
            }
        }
    },
    async addResource(resource:VideoSource | AudioSource | TextSource, options={}){
        console.log("addResource: ", resource);
        const trackStore = useTrackState();

        const specifiedTrackKey = options['specifiedTrackKey'];
        console.log('specifiedTrackKey: ', specifiedTrackKey);
        let track_key = specifiedTrackKey;
        if(!specifiedTrackKey){
            track_key = await trackStore.addTrack(resource.type);
        }

        // let pos = Number(previewState.currentTS) + 1;
        let pos = options['startTime'] ?? 0;
        if(specifiedTrackKey){
            const track_idx = await trackStore.findTrackIndexByKey(specifiedTrackKey);
            const clipList = trackStore.trackList[track_idx].list;
            pos = clipList.length > 0 ? clipList[clipList.length - 1].end + 1 : pos;
            console.log('pos: ', pos, clipList.length);
        }

        let clip = null;
        if(resource.type === 'video'){
            clip =  new VideoTrack(resource, pos);
        }
        else if(resource.type === 'audio'){
            clip = new AudioTrack(resource, pos);
        }
        else if(resource.type === 'text'){
            clip = new TextTrack(resource, pos);
        }else{
            console.error("AddResource failed.");
            return;
        }
        console.log("AddResource: ", resource)

        await trackStore.addClip(clip, track_key);
    },
    async loadFontUrl(url:string, file:File, specified_name:string=""){
        uniSourceMap.push({
            url: url,
            file: file,
            wasmPath: specified_name || `/${file.name}`,
        });

        fontMap.push({
            label: specified_name || file.name,
            value: specified_name || file.name,
            data:
            {
                path: file.name
            }
        });

        await loadFilesToWasmFS([file, ]);
    },

    async addVideoClipWithFile(resFile){
        const trackStore = useTrackState();
    
        await loadFilesToWasmFS([ resFile["file"], ]);

        const id = resFile["url"];//FIXME: make id = url;

        const videoSource = {
            id: id,
            url: id,
            name: `/${resFile["file"].name}`,
            // format: file.type,
            width:  0,
            height: 0,
            duration: 10.0,
            type: "video",
            materialInfo: {
            materialId: resFile["material"].id,
            iUrlId: resFile["iurl"].id,
            }
        }

        if(! await fillVideoSourceByFile(videoSource, resFile["file"])){
            console.error('fillVideoSourceByFile failed.');
            return false;
        }else{
            console.log('fillVideoSourceByFile succeed: ', videoSource);
        }

        await this.addResource(videoSource, resFile.options);

        return videoSource;
    },
    async addAudioClipWithFile(resFile){
        const id = resFile["url"];//FIXME: make id = url.
        //audioDecoder.decode(video_file_without_audio_stream) would error.
        const clip = await audioDecoder.decode({ id, stream: resFile["file"].stream(), type: resFile["file"].type });

        await loadFilesToWasmFS([ resFile["file"], ]);
        const audioSource = {
            id: id,
            url: id,
            // url: URL.createObjectURL(file), // FIXME: invoke when audioSource is not used any more. But this is only used by waver.
            name: `/${resFile["file"].name}`,
            // format: file.type,
            duration: clip.meta.duration / 1e6,
            type: "audio",
            materialInfo: {
            materialId: resFile["material"].id,
            iUrlId: resFile["iurl"].id,
            }
        }

        if(resFile["videoResource"]){
            // audioSource.id = videoSource.id;
            console.log("attached videoSource: ", resFile["videoResource"].duration);
            audioSource.duration = resFile["videoResource"].duration; // sync with video
        }else{
            console.log("no attached videoSource");
        }

        await this.addResource(audioSource, resFile.options);
        return audioSource;
    },
    async addTextClipWithFile(file:File) {
        const trackStore = useTrackState();

        const parser = new SrtParser();
        const cleanedContent = cleanSrtContent(await file.text());
        
        const subtitles = parser.fromSrt(cleanedContent);
        console.log("subtitles:", JSON.stringify(subtitles));

        let track_key = '';
        for(let i = 0; i < subtitles.length; i++){
            const clip = new TextTrack(defaultTextSource, 0);

            clip.name = subtitles[i].text
            clip.start = Math.ceil(subtitles[i].startSeconds * 30);
            clip.end = Math.floor(subtitles[i].endSeconds * 30);
            
            if(i === 0){
                track_key = await trackStore.addTrack(clip.type);
                await trackStore.addClip(clip, track_key);
            }else{
                await trackStore.addClip(clip, track_key);
            }
        }
    },
    async addUrlsToTrack(material, options:{}){
        if(['video', 'f-video'].includes(AIToolMap[material.type]?.type || '')){
            //TODO: material.scale  ----  scale.

            const resFiles = []
            for(let i = 0; i < material.urls.length; i++){
            const item = material.urls[i];
            let targetUrl = item.url;
            // if(options.previewMode === "OriginVideo"){
            //     targetUrl = item.origin_url;
            // }else{
            //     targetUrl = item.url;
            // }
            try{
                const f = targetUrl.startsWith('blob:') ? item.file : await getFileFromStream(targetUrl);

                const uniSource = 
                {
                url: item.url,
                originUrl: item.origin_url || undefined,
                file: f,
                wasmPath: `/${f.name}`
                };
                uniSourceMap.push(uniSource);
                console.log("uniSource: ", uniSource);

                resFiles.push({
                "url": targetUrl,
                "file": f,
                "material": material,
                "iurl": item,
                "options": options,
                })
            } catch (error){
                console.error("addUrlsToTrack failed: ", targetUrl, error);
                continue;
            }
            };
            
            for(let i = 0; i < resFiles.length; i++){
            if(!resFiles[i].options.disableVideo){
                let resource = null;
                try{
                resource = await this.addVideoClipWithFile(resFiles[i]);
                }
                catch (error){
                console.error("addVideoClipWithFile failed: ", resFiles[i], error);
                }
                finally{
                resFiles[i]["videoResource"] = resource;
                }
            }
            }
            
            for(let i = 0; i < resFiles.length; i++){
            if(resFiles[i]["file"].type.startsWith('image/')){
                continue;
            }

            if(!resFiles[i].options.disableAudio){
                let resource = null;
                try{
                //make sure the audio span the same as the video span
                resource = await this.addAudioClipWithFile(resFiles[i]);
                }
                catch (error){
                console.error("addAudioClipWithFile failed: ", resFiles[i], error);
                }
                finally{
                resFiles[i]["audioResource"] = resource;
                }
            }
            }
        }
        else if(AIToolMap[material.type]?.type === 'audio'){
            if(options.disableAudio){
            return;
            }
            for(let i = 0; i < material.urls.length; i++){
            const item = material.urls[i];
            try{
                const f = item.url.startsWith('blob:') ? item.file :  await getFileFromStream(item.url);
                uniSourceMap.push({
                url: item.url,
                file: f,
                wasmPath: `/${f.name}`
                });

                
                const resFile = {
                "url": item.url,
                "file": f,
                "material": material,
                "iurl": item,
                "options": options,
                }
                await this.addAudioClipWithFile(
                resFile
                );
            } catch (error){
                console.error("addUrlsToTrack failed: ", item.url);
                continue;
            }
            };
        }
        else if(AIToolMap[material.type]?.type === 'font'){
            for(let i = 0; i < material.urls.length; i++){
            const item = material.urls[i];
            try{
                const f = item.url.startsWith('blob:') ? item.file :  await getFileFromStream(item.url);
                await this.loadFontUrl(item.url, f);
            } catch (error){
                console.error("addUrlsToTrack failed: ", item.url);
                continue;
            }
            };
        }
        else if(AIToolMap[material.type]?.type === 'subtitle'){
            for(let i = 0; i < material.urls.length; i++){
            const item = material.urls[i];
            try{
                const resFile = item.url.startsWith('blob:') ? item.file :  await getFileFromStream(item.url);
                await this.addTextClipWithFile(resFile);
            } catch (error){
                console.error("addUrlsToTrack failed: ", item.url);
                continue;
            }
            };
        }
        else{
            console.error("unknown material type:", material.type, material);
        }
    }
};