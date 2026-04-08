export class EventEmitter {
  constructor() {
    this.listeners = {};
    this.uid = 0;
  }

  uniqueID(){
    if(this.uid < Number.MAX_SAFE_INTEGER){
      this.uid++;
    }else{
      this.uid = 0;
    }
    return this.uid;
  }
  on(event, callback) {
      if (!this.listeners[event]) {
          this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
  }

  off(event, callback) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }
  off(event) {
    if (this.listeners[event]) {
      delete this.listeners[event];
      return true;
    }
    return false;
  }
  async dispatchEvent(event, ...args) {
    if (!event || !this.listeners[event]) return;
    
    const results = [];
    for (const callback of this.listeners[event]) {
      try {
        const result = await callback(...args);
        results.push({ success: true, data: result });
      } catch (err) {
        results.push({ success: false, error: err });
        console.error(`Error in ${event} listener:`, err);
      }
    }
    return results; // 返回所有执行结果
  }
}