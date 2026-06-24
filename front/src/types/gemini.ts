import type { ActivityType } from '@/types/course'

export interface ActivityInput {
  type: ActivityType
  category: string
}

export interface GeminiRequest {
  area: string
  relationship: string
  date: string | null
  hobby: string[]
  theme: string
  activities: ActivityInput[]
}

export type UpdateReason = 'TOO_EXPENSIVE' | 'NOT_GOOD' | 'TOO_FAR' | 'ALREADY_BEEN'

export interface UpdateActivityRequest {
  relationship: string
  hobby: string[]
  theme: string
  date: string | null
  activityType: ActivityType
  category: string
  updateReason?: UpdateReason
}

// CreatePage에서 localStorage에 저장하는 원본 요청 데이터
export interface SavedCourseRequest {
  area: string
  relationship: string
  hobby: string[]
  theme: string
  date: string | null
  activities: ActivityInput[]
}
