import axiosInstance from '@/api/axiosInstance'
import type { GeminiRequest } from '@/types/gemini'
import type { DateCourseTempResponse } from '@/types/course'

export const geminiApi = {
  recommend: (request: GeminiRequest) =>
    axiosInstance.post<DateCourseTempResponse>('/gemini', request).then((res) => res.data),
}
