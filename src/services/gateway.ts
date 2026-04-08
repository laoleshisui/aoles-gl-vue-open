import axios from 'axios';
import { getAccessToken, safeRefresh } from './dataServer';
// 创建Axios实例
export const gateway = axios.create({
  baseURL: import.meta.env.VITE_API_GATEWAY,
  timeout: 3600000 // 1000ms * 60 * 60 = 1h
})


// 请求拦截器：注入当前Token
gateway.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：处理Token过期
gateway.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config
    
    // 401错误且未重试过 && 不是刷新请求本身
    if (error.response?.status === 401 && 
        !originalRequest._retry &&
        originalRequest.url !== '/auth/refresh') {
      
      // 标记当前请求已重试
      originalRequest._retry = true
      
      try {
        const newToken = await safeRefresh()
        
        // 更新请求头
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        
        // 重新发送原始请求
        return gateway(originalRequest)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)