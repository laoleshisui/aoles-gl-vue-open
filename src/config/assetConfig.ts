/**
 * 资源配置管理
 * 用于管理字体、GLSL shader 等静态资源的基础路径
 */

export interface AssetConfig {
  /** 资源基础路径，例如: '/' 或 'https://cdn.example.com/assets/' */
  basePath: string
  /** 字体文件目录，相对于 basePath */
  fontDir: string
  /** GLSL shader 文件目录，相对于 basePath */
  glslDir: string
}

class AssetConfigManager {
  private config: AssetConfig = {
    basePath: '/',
    fontDir: 'fonts',
    glslDir: 'glsl/video/transition'
  }

  /**
   * 设置资源配置
   */
  setConfig(config: Partial<AssetConfig>) {
    this.config = { ...this.config, ...config }
    console.log("config: ", this.config);
  }

  /**
   * 获取完整的资源配置
   */
  getConfig(): AssetConfig {
    return { ...this.config }
  }

  /**
   * 获取资源基础路径
   */
  getBasePath(): string {
    return this.config.basePath
  }

  /**
   * 获取字体文件的完整 URL
   * @param fontPath 字体文件路径，例如: '/fonts/NotoSansSC-Regular.ttf' 或 'NotoSansSC-Regular.ttf'
   */
  getFontUrl(fontPath: string): string {
    const cleanPath = fontPath.startsWith('/') ? fontPath.substring(1) : fontPath
    const basePath = this.config.basePath.endsWith('/')
      ? this.config.basePath
      : this.config.basePath + '/'
    return basePath + cleanPath
  }

  /**
   * 获取 GLSL shader 文件的完整 URL
   * @param glslPath GLSL 文件路径，例如: '/glsl/video/transition/book_flip.glsl' 或 'book_flip.glsl'
   */
  getGlslUrl(glslPath: string): string {
    const cleanPath = glslPath.startsWith('/') ? glslPath.substring(1) : glslPath
    const basePath = this.config.basePath.endsWith('/')
      ? this.config.basePath
      : this.config.basePath + '/'
    return basePath + cleanPath
  }

  /**
   * 获取任意资源的完整 URL
   * @param assetPath 资源路径
   */
  getAssetUrl(assetPath: string): string {
    const cleanPath = assetPath.startsWith('/') ? assetPath.substring(1) : assetPath
    const basePath = this.config.basePath.endsWith('/')
      ? this.config.basePath
      : this.config.basePath + '/'
    return basePath + cleanPath
  }
}

// 导出单例
export const assetConfig = new AssetConfigManager()

/**
 * 配置资源路径（供外部调用）
 * @example
 * ```ts
 * import { configAssetPath } from 'your-package'
 *
 * // 开发环境
 * configAssetPath({ basePath: '/' })
 *
 * // 生产环境使用 CDN
 * configAssetPath({ basePath: 'https://cdn.example.com/assets/' })
 * ```
 */
export function configAssetPath(config: Partial<AssetConfig>) {
  assetConfig.setConfig(config)
}
