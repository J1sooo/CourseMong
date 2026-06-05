import axiosInstance from './axiosInstance'

export const kakaoApi = {
  searchPlace: (query: string, size = 5): Promise<string[]> =>
    axiosInstance.get('/kakao/place', { params: { query, size } }).then((r) => r.data),

  searchAddress: (query: string, size = 5): Promise<string[]> =>
    axiosInstance.get('/kakao/address', { params: { query, size } }).then((r) => r.data),
}
