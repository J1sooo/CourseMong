import axios from 'axios'
import type { GeminiRequest } from '@/types/gemini'
import type { DateCourseTempResponse } from '@/types/course'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
})

export const geminiApi = {
  recommend: (request: GeminiRequest) =>
    api.post<DateCourseTempResponse>('/gemini', request).then((res) => res.data),
}
