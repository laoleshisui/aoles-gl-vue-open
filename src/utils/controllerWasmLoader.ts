export class ControllerWasmLoader {
    module: { [key: string]: any }  = {};
    listeners: { [key: string]: Function[] } = {
      initialized: [],
      loaded: [],
      error: []
    };
    on(event: string, callback: Function) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
    };
      
    off(event: string, callback: Function) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
      
    dispatchEvent(event: string, ...args: any[]) {
      if (!this.listeners[event]) return;
      this.listeners[event].forEach(callback => {
        try {
          callback(...args);
        } catch (err) {
          console.error(`Error in ${event} listener:`, err);
        }
      });
    };
  
    constructor() {}
  
    async loadWasm(options: {key:string, jsPath: string, wasmPath?: string, canvas?: HTMLCanvasElement} = {key:"model_key", jsPath: '', wasmPath: ''}) {
      const {key, jsPath, wasmPath, canvas = null} = options;
  
      if (this.module[key]) {
        return this.module[key];
      }
  
      try {
        const Module = this.getDefaultModuleConfig();
        Module["key"] = key;
        Module.canvas = canvas;
        Module["mainScriptUrlOrBlob"] = jsPath;
        Module["locateFile"] = (path) => {
          if (path === 'GLController.wasm') {
            console.log(`path : ${path}, return: ${wasmPath}`)
            return wasmPath;
          }else{
            console.log(`path : ${path}, return: ${path}`)
            return path;
          }
        };

        console.log("Module: ", Module);
        this.module[key] = await this.loadGLController(jsPath, Module);
        console.log('WASM模块初始化完成: ', Module["key"]);
        
        this.dispatchEvent('initialized', this.module[key]);
        return this.module[key];
      } catch (error) {
        console.error('Controller WASM loader error:', key, error);
        // this.dispatchEvent('error', error);
        throw error;
      }
    }

    private async loadGLController(jsPath:string, Module={}) {
      try {
        // 使用动态导入
        const module = await import(jsPath);
        const createGLController = module.default;
        const instance = await createGLController(Module);
        return instance;
      } catch (error) {
        console.error('Failed to load module:', error);
        throw error;
      }
    }
  
    private getDefaultModuleConfig() {
      return {
        arguments: [] as string[],
        print: (...args: any[]) => {console.log(...args)},
        printErr: (...args: any[]) => {console.error(...args)},
        setStatus: (text: string) => {console.log(`Status: ${text}`)},
        onRuntimeInitialized: () => {},
        OnTS(ts: number){
          // console.log("[JS] OnTS Received:", ts);
          this.dispatchEvent("OnTS", ts);
        },
        OnDurationTS(ts: number){
          console.log("[JS] OnDurationTS Received:", ts);
          this.dispatchEvent("OnDurationTS", ts);
        },
        OnTextSize(data){
          console.log("[JS] OnTextSize Received:", data);

          var key = data.key;
          var width = data.width;
          var height = data.height;

          this.dispatchEvent("OnTextSize", key, width, height);

        },
        OnConfigClip(data){
          console.log("[JS] OnConfigClip Received:", data);

          var key = data.key;
          var type = data.type;
          var configJson = data.config_json;

          this.dispatchEvent("OnConfigClip", key, type, configJson);
        },
        OnUniforms(data){
          // console.log("[JS] OnUniforms Received:", data);

          var key = data.key;
          var clipKey = data.clip_key;
          var type = data.type;
          var uniforms = data.uniforms;

          this.dispatchEvent("OnUniforms", key, clipKey, type, uniforms);
        },
        OnAddTrack(data) {
            console.log("[JS] OnAddTrack Received:", data);

            var key = data.key;
            var type = data.type;

            this.dispatchEvent("OnAddTrack", key, type);
        },
        OnAddClip(clipData) {
            console.log("[JS] OnAddClip Received:", clipData);

            var key = clipData.key;
            var trackKey = clipData.track_key;
            var type = clipData.type;
            var paths = clipData.src_path; // 已经是数组了，不需要再 parse
            var startTs = clipData.start_ts;
            var endTs = clipData.end_ts;
            var streamInfo = clipData.stream_info;

            // 你的业务逻辑...
            console.log(`Adding clip ${key} to track ${trackKey}, time: ${startTs}-${endTs}`);
            this.dispatchEvent("OnAddClip", key, trackKey, type, paths, startTs, endTs, streamInfo);
        },
        OnAddClipTransition(data) {
            console.log("[JS] OnAddClipTransition Received:", data);

            var key = data.key;
            var clipKey = data.clip_key;
            var type = data.type;
            var glslPath = data.glsl_path; // 已经是数组了，不需要再 parse
            var startTs = data.start_ts;
            var endTs = data.end_ts;

            this.dispatchEvent("OnAddClipTransition", key, clipKey, type, glslPath, startTs, endTs);
        },
        OnRemoveClipTransition(data) {
            console.log("[JS] OnRemoveClipTransition Received:", data);

            var key = data.key;
            var clipKey = data.clip_key;
            var type = data.type;

            this.dispatchEvent("OnRemoveClipTransition", key, clipKey, type);
        },
        OnRemoveClip(clipData) {
            console.log("[JS] OnRemoveClip Received:", clipData);

            var key = clipData.key;
            var trackKey = clipData.track_key;
            var type = clipData.type;

            this.dispatchEvent("OnRemoveClip", key, trackKey, type);
        },
        OnRemoveTrack(clipData) {
            console.log("[JS] OnRemoveTrack Received:", clipData);

            var key = clipData.key;
            var type = clipData.type;

            this.dispatchEvent("OnRemoveTrack", key, type);
        },
        OnControllerJsonStr(data){
            console.log("[JS] OnControllerJsonStr Received:", data);

            var controller_json = data.controller_json;

            this.dispatchEvent("OnControllerJsonStr", controller_json);
        },
        canvas: null as HTMLCanvasElement | null,

        listeners: {
          initialized: [],
          loaded: [],
          error: []
        } as { [key: string]: Function[] },
        on(event: string, callback: Function) {
          if (!this.listeners[event]) {
            this.listeners[event] = [];
          }
          this.listeners[event].push(callback);
        },
      
        off(event: string, callback: Function) {
          if (!this.listeners[event]) return;
          this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        },
      
        dispatchEvent(event: string, ...args: any[]) {
          if (!this.listeners[event]) return;
          this.listeners[event].forEach(callback => {
            try {
              callback(...args);
            } catch (err) {
              console.error(`Error in ${event} listener:`, err);
            }
          });
        }
      };
    }
  }
  
  export const controllerWasmLoader = new ControllerWasmLoader();