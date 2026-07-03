export interface DailyApiCallCount {
  date: string
  kakaoSuccessCount: number
  kakaoFailureCount: number
  geminiSuccessCount: number
  geminiFailureCount: number
}

export interface TempCourseSummary {
  tempId: string
  title: string
  area: string
  remainingTtlSeconds: number
}

export interface DashboardResponse {
  dailyApiCallCounts: DailyApiCallCount[]
  kakaoTotalCount: number
  geminiTotalCount: number
  temporaryCourses: TempCourseSummary[]
}
