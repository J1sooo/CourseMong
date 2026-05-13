import axiosInstance from '@/api/axiosInstance'
import type { DateCourseResponse, DateCourseTempResponse } from '@/types/course'
import type { UpdateActivityRequest } from '@/types/gemini'
import type { ActivityType } from '@/types/course'

export const courseApi = {
  getPublicCourses: () =>
    axiosInstance.get<DateCourseResponse[]>('/date-courses/board').then((res) => res.data),

  getCourseByUuid: (uuid: string) =>
    axiosInstance.get<DateCourseResponse>('/date-courses', { params: { uuid } }).then((res) => res.data),

  getTempCourse: (tempId: string) =>
    axiosInstance.get<DateCourseTempResponse>(`/date-courses/temporary/${tempId}`).then((res) => res.data),

  updateActivity: (tempId: string, activityType: ActivityType, request: UpdateActivityRequest) =>
    axiosInstance
      .patch<DateCourseTempResponse>(`/date-courses/temporary/${tempId}/activities/${activityType}`, request)
      .then((res) => res.data),

  publishCourse: (uuid: string) =>
    axiosInstance.patch<DateCourseResponse>(`/date-courses/${uuid}/publish`).then((res) => res.data),

  saveCourse: (tempId: string, published: boolean, title?: string) =>
    axiosInstance
      .post<DateCourseResponse>(`/date-courses/temporary/${tempId}`, null, {
        params: { published, ...(title ? { title } : {}) },
      })
      .then((res) => res.data),
}
