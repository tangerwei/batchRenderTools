// 基础响应类型
interface BaseResponse<T> {
  code: number;
  data: {
    data: T;
    total?: number;
  };
}

// 解析响应数据的工具函数
export function parseApiResponse<T>(response: BaseResponse<T>): T {
  if (response.code !== 200) {
    throw new Error(`API request failed with code ${response.code}`);
  }

  return response.data.data;
}