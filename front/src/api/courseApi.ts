import axios from 'axios'
import type { DateCourseResponse, DateCourseTempResponse } from '@/types/course'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
})

export const courseApi = {
  getPublicCourses: () =>
    api.get<DateCourseResponse[]>('/date-courses/board').then((res) => res.data),

  getCourseByUuid: (uuid: string) =>
    api.get<DateCourseResponse>('/date-courses', { params: { uuid } }).then((res) => res.data),

  getTempCourse: (tempId: string) =>
    api.get<DateCourseTempResponse>(`/date-courses/temporary/${tempId}`).then((res) => res.data),
}
