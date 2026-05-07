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
