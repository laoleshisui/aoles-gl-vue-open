// srt-utils.js
class SRTUtils {
  // 解析SRT字符串
  static parse(srtText) {
    if (!srtText) return []
    
    const lines = srtText.trim().split(/\r?\n\r?\n/)
    const subtitles = []
    
    for (let block of lines) {
      const parts = block.split(/\r?\n/)
      if (parts.length < 3) continue
      
      const index = parseInt(parts[0].trim(), 10)
      if (isNaN(index)) continue
      
      const timeMatch = parts[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/)
      if (!timeMatch) continue
      
      const [, h1, m1, s1, ms1, h2, m2, s2, ms2] = timeMatch
      
      const subtitle = {
        index,
        start: this.timeToMs(parseInt(h1), parseInt(m1), parseInt(s1), parseInt(ms1)),
        end: this.timeToMs(parseInt(h2), parseInt(m2), parseInt(s2), parseInt(ms2)),
        text: parts.slice(2).join('\n')
      }
      
      subtitles.push(subtitle)
    }
    
    return subtitles
  }
  
  // 生成SRT字符串
  static build(subtitles) {
    return subtitles
      .sort((a, b) => a.start - b.start)
      .map((sub, idx) => {
        return `${idx + 1}\n${this.msToTime(sub.start)} --> ${this.msToTime(sub.end)}\n${sub.text}`
      })
      .join('\n\n')
  }
  
  // 时间格式转换
  static msToTime(ms) {
    const totalSeconds = ms / 1000
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = Math.floor(totalSeconds % 60)
    const milliseconds = Math.floor(ms % 1000)
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0'),
      milliseconds.toString().padStart(3, '0')
    ].join(':').replace(/:(\d{3})$/, ',$1')
  }
  
  // 时间到毫秒
  static timeToMs(hours, minutes, seconds, milliseconds) {
    return ((hours * 3600) + (minutes * 60) + seconds) * 1000 + milliseconds
  }
  
  // 调整时间
  static shift(subtitles, offsetMs) {
    return subtitles.map(sub => ({
      ...sub,
      start: Math.max(0, sub.start + offsetMs),
      end: Math.max(0, sub.end + offsetMs)
    }))
  }
  
  // 合并字幕
  static merge(...srtContents) {
    let allSubtitles = []
    let indexOffset = 0
    
    for (const content of srtContents) {
      const subtitles = this.parse(content)
      const adjusted = subtitles.map((sub, idx) => ({
        ...sub,
        index: indexOffset + idx + 1
      }))
      allSubtitles.push(...adjusted)
      indexOffset += subtitles.length
    }
    
    return this.build(allSubtitles.sort((a, b) => a.start - b.start))
  }
  
  // 分割字幕
  static split(srtText, maxDuration) {
    const subtitles = this.parse(srtText)
    const parts = []
    let currentPart = []
    let currentStart = subtitles[0]?.start || 0
    
    for (const sub of subtitles) {
      if (sub.end - currentStart > maxDuration && currentPart.length > 0) {
        parts.push(this.build(currentPart))
        currentPart = []
        currentStart = sub.start
      }
      currentPart.push(sub)
    }
    
    if (currentPart.length > 0) {
      parts.push(this.build(currentPart))
    }
    
    return parts
  }
  
  // 转换为VTT格式
  static toVTT(srtText) {
    return srtText
      .replace(/^\uFEFF/, '') // 移除BOM
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, '$1:$2:$3.$4')
      .replace(/^([0-9]+\n)/, 'WEBVTT\n\n$1')
  }
  
  // 从VTT转换为SRT
  static fromVTT(vttText) {
    return vttText
      .replace(/WEBVTT\n\n?/, '')
      .replace(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})/g, '$1:$2:$3,$4')
  }
}

// 导出
export default SRTUtils