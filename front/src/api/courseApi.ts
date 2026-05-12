import axios from 'axios'
import type { DateCourseResponse, DateCourseTempResponse } from '@/types/course'
import type { UpdateActivityRequest } from '@/types/gemini'
import type { ActivityType } from '@/types/course'

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

  // PATCH /api/date-courses/temporary/{tempId}/activities/{activityType}
  updateActivity: (tempId: string, activityType: ActivityType, request: UpdateActivityRequest) =>
    api
      .patch<DateCourseTempResponse>(`/date-courses/temporary/${tempId}/activities/${activityType}`, request)
      .then((res) => res.data),

  // POST /api/date-courses/temporary/{tempId}?published=true/false
  publishCourse: (uuid: string) =>
    api.patch<DateCourseResponse>(`/date-courses/${uuid}/publish`).then((res) => res.data),

  saveCourse: (tempId: string, published: boolean, title?: string) =>
    api
      .post<DateCourseResponse>(`/date-courses/temporary/${tempId}`, null, {
        params: { published, ...(title ? { title } : {}) },
      })
      .then((res) => res.data),
}
