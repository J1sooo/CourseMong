export type ActivityType = 'MORNING' | 'LUNCH' | 'AFTERNOON' | 'DINNER'

export interface ActivityResponse {
  activityId: number
  activityType: ActivityType
  locationName: string
  locationContent: string
  locationUrl: string
  address: string | null
  latitude: number
  longitude: number
}

export interface DateCourseResponse {
  id: number
  title: string
  area: string
  published: boolean
  courseUuid: string
  createdAt: string
  lastViewedAt: string
  activities: ActivityResponse[]
}

export interface ActivityTempResponse {
  activityType: ActivityType
  locationName: string
  locationContent: string
  locationUrl: string
  address: string | null
  latitude: number
  longitude: number
}

export interface DateCourseTempResponse {
  tempId: string
  title: string
  area: string
  activities: ActivityTempResponse[]
}
