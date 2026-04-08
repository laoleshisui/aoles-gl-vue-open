import axios from 'axios';
// 创建Axios实例
export const dataServer = axios.create({
  baseURL: import.meta.env.VITE_API_DATA_SERVER,
  timeout: 3600000 // 1000ms * 60 * 60 = 1h
})

// 存储当前刷新令牌的Promise（防止并发刷新）
let refreshPromise: Promise<string> | null = null
let isRefreshing = false;

// 获取当前Token
export const getAccessToken = (): string | null => {
  return localStorage.getItem('access_token')
}

// 存储Token（根据安全要求选择存储方式）
const setAccessToken = (token: string): void => {
  localStorage.setItem('access_token', token)
}

// 删除Token（退出登录时）
const clearTokens = (): void => {
  console.warn("clearTokens");
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

const getRefreshToken = (): string | null => {
  return localStorage.getItem('refresh_token')
}
const setRefreshToken = (token: string): void => {
  localStorage.setItem('refresh_token', token)
}

export function logout(){
  clearTokens();
}

export async function signup(credentials){
  const url = "/api/rest-auth/registration/";

  try{
    const payload = {
      "email": credentials.email,
      "phone": credentials.phone,
      "username": credentials.username,
      "password1": credentials.password,
      "password2": credentials.confirmPassword,
    }

    const response = await dataServer.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.status === 201) {
      // const newToken = response.data.access
      // setAccessToken(newToken)

      // console.log("access: ", response.data.access);
      // console.log("user: ", response.data.user);

      //ElMessage.success('注册成功');
      return true;
    } else {
      //ElMessage.error('注册失败');
      return false;
    }
  }catch(error){
    //ElMessage.error('注册失败');
    return false;
  }
}

export async function loginByCode(credentials) {
  const url = `/aauth/phone-register-user/`;

  try{
    const payload = {
      "phone": credentials.phone,
      "verification_code": credentials.verificationCode,
      ...(credentials.sharer > 0 ?  {"sharer": credentials.sharer} : {}),
    }

    const response = await dataServer.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    setAccessToken(response.data.access)
    setRefreshToken(response.data.refresh)

    console.log("access: ", response.data.access);
    console.log("refresh: ", response.data.refresh);

    //ElMessage.success('登陆成功');
    return true;
  } catch (error){
    //ElMessage.error('登陆失败');
    return false;
  }
}

export async function loginByWeixin(credentials) {
  const url = `/aauth/weixin-register-user/`;

  try{
    const payload = {
      "access_token": credentials.access_token,
      "openid": credentials.openid,
      ...(credentials.sharer > 0 ?  {"sharer": credentials.sharer} : {}),
    }

    const response = await dataServer.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    setAccessToken(response.data.access)
    setRefreshToken(response.data.refresh)

    console.log("access: ", response.data.access);
    console.log("refresh: ", response.data.refresh);

    //ElMessage.success('登陆成功');
    return true;
  } catch (error){
    //ElMessage.error('登陆失败');
    return false;
  }
}

export async function login(credentials){
  const url = "/api/token/";

  try{
    const payload = {
      "username": credentials.username,
      "password": credentials.password,
    }

    const response = await dataServer.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    setAccessToken(response.data.access)
    setRefreshToken(response.data.refresh)

    console.log("access: ", response.data.access);
    console.log("refresh: ", response.data.refresh);

    //ElMessage.success('登陆成功');
    return true;
  } catch (error){
    //ElMessage.error('登陆失败');
    return false;
  }
}

export async function verityToken(retry=1){
  const url = "/token/verify/";

  try{
    const payload = {
      "token": getAccessToken()
    }
    console.log("verify payload:", payload);

    const response = await dataServer.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    return true;
  } catch (error){
    //ElMessage.error('登陆失败');
    if(retry > 0){
      await refreshAccessToken();
      return verityToken(retry - 1);
    }else{
      return false;
    }
  }
}

// 刷新Token的函数
const refreshAccessToken = async (): Promise<string> => {
  try {
    const payload = {
      "refresh": getRefreshToken()
    }
    console.log("refresh payload:", payload);
    const response = await dataServer.post('/token/refresh/', payload, { 
      withCredentials: true,
      headers: {
          'Content-Type': 'application/json',
      }
    })
    console.log("refresh response:", response.data);
    const newToken = response.data.access
    setAccessToken(newToken)
    return newToken
  } catch (error) {
    console.log("refresh response:", error);
    // 刷新失败处理
    clearTokens()
    
    throw error
  }
}

// 请求拦截器：注入当前Token
// 需要排除的路径列表
const excludedPaths = ['/token/refresh/', '/login/', '/token/verify/'];

dataServer.interceptors.request.use((config: AxiosRequestConfig) => {
  // 获取请求路径（去掉查询参数）
  const requestPath = config.url?.split('?')[0] || '';

  // 检查是否在排除列表中
  const isExcluded = excludedPaths.some(path => 
    path === requestPath || 
    requestPath.startsWith(path + '/')
  );

  // 排除路径直接返回，不添加token
  if (isExcluded) {
    console.log("isExcluded:", config.headers)
    return config;
  }

  // 非排除路径添加token
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log("headers:",config.headers)
  
  return config;
});

export const safeRefresh = async () => {
  if (!isRefreshing) {
    isRefreshing = true; // 加锁
    refreshPromise = refreshAccessToken().finally(() => {
      isRefreshing = false; // 解锁
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

// 响应拦截器：处理Token过期
dataServer.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config
    
    // 401错误且未重试过 && 不是刷新请求本身
    if (error.response?.status === 401 && 
        !originalRequest._retry &&
        originalRequest.url !== '/token/refresh/') {
      
      // 标记当前请求已重试
      originalRequest._retry = true
      
      try {
        const newToken = await safeRefresh();
        
        // 更新请求头
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        
        // 重新发送原始请求
        return dataServer(originalRequest)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// 定时刷新Token（可选）
const startTokenRefreshTimer = () => {
  setInterval(async () => {
    if (!getAccessToken() || document.hidden) return
    
    try {
      const token = getAccessToken()
      if (token) {
        // 简单检查Token是否即将过期（如剩余时间小于5分钟）
        const payload = JSON.parse(atob(token.split('.')[1]))
        const expireTime = payload.exp * 1000
        const now = Date.now()
        
        if (expireTime - now < 5 * 60 * 1000) { // 5分钟
          await safeRefresh()
          console.log('Token自动刷新成功')
        }
      }
    } catch (error) {
      console.error('自动刷新Token失败:', error)
    }
  }, 300000) // 每5分钟检查一次
}

startTokenRefreshTimer();

// const newToken = await safeRefresh();
// console.log("test:", newToken);