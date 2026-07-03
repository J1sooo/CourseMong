import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboardApi'
import Header from '@/components/Header'
import type { DailyApiCallCount, TempCourseSummary } from '@/types/dashboard'

const REFRESH_INTERVAL_MS = 10000

function formatRemainingTime(remainingTtlSeconds: number) {
  if (remainingTtlSeconds <= 0) {
    return '만료됨'
  }

  const hours = Math.floor(remainingTtlSeconds / 3600)
  const minutes = Math.floor((remainingTtlSeconds % 3600) / 60)
  const seconds = Math.floor(remainingTtlSeconds % 60)

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function DailyCountRow({ daily }: { daily: DailyApiCallCount }) {
  return (
    <tr className="border-b border-gray-100 dark:border-zinc-800 last:border-0 text-sm">
      <td className="py-3 px-4 text-center text-black dark:text-white">{daily.date}</td>
      <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
        {daily.kakaoSuccessCount + daily.kakaoFailureCount}
        <span className="text-xs text-gray-400 dark:text-gray-500"> (실패 {daily.kakaoFailureCount})</span>
      </td>
      <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">
        {daily.geminiSuccessCount + daily.geminiFailureCount}
        <span className="text-xs text-gray-400 dark:text-gray-500"> (실패 {daily.geminiFailureCount})</span>
      </td>
    </tr>
  )
}

function TempCourseRow({ course }: { course: TempCourseSummary }) {
  return (
    <tr className="border-b border-gray-100 dark:border-zinc-800 last:border-0 text-sm">
      <td className="py-3 px-4 text-center truncate max-w-0 text-black dark:text-white">{course.title}</td>
      <td className="py-3 px-4 text-center text-gray-500 dark:text-gray-400 max-w-[140px] truncate">{course.area}</td>
      <td className="py-3 px-4 text-center font-mono text-[var(--color-brand)]">
        {formatRemainingTime(course.remainingTtlSeconds)}
      </td>
    </tr>
  )
}

function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getDashboard,
    refetchInterval: REFRESH_INTERVAL_MS,
  })

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />

      <main className="px-4 py-10 max-w-3xl mx-auto flex flex-col gap-10">
        <header className="text-center">
          <h1 className="text-xl font-bold text-black dark:text-white">운영 대시보드</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {REFRESH_INTERVAL_MS / 1000}초마다 자동 새로고침돼요
          </p>
        </header>

        {isLoading && (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-md text-[var(--color-brand)]" />
          </div>
        )}

        {isError && (
          <p className="text-center text-sm text-red-500">대시보드를 불러오지 못했어요</p>
        )}

        {data && (
          <>
            {/* 누적 호출 수 요약 카드 */}
            <section aria-labelledby="summary-heading" className="flex flex-col gap-4">
              <h2 id="summary-heading" className="text-base font-semibold text-black dark:text-white">
                API 누적 호출 수
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-200 dark:border-zinc-700 bg-[var(--color-brand-soft)] dark:bg-zinc-900 p-5 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">카카오</p>
                  <p className="text-2xl font-bold text-[var(--color-brand)] mt-1">
                    {data.kakaoTotalCount.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 dark:border-zinc-700 bg-[var(--color-brand-soft)] dark:bg-zinc-900 p-5 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">제미나이</p>
                  <p className="text-2xl font-bold text-[var(--color-brand)] mt-1">
                    {data.geminiTotalCount.toLocaleString()}
                  </p>
                </div>
              </div>
            </section>

            {/* 일별 호출 수 (최근 30일) */}
            <section aria-labelledby="daily-heading" className="flex flex-col gap-4">
              <h2 id="daily-heading" className="text-base font-semibold text-black dark:text-white">
                일별 호출 수
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] rounded-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-[var(--color-brand-soft)] dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700 text-sm font-semibold text-black dark:text-white">
                      <th className="py-3 px-4 text-center font-semibold">날짜</th>
                      <th className="py-3 px-4 text-center font-semibold">카카오</th>
                      <th className="py-3 px-4 text-center font-semibold">제미나이</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.dailyApiCallCounts.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-16 text-center text-gray-400 text-sm">
                          아직 호출 기록이 없어요
                        </td>
                      </tr>
                    ) : (
                      data.dailyApiCallCounts.map((daily) => <DailyCountRow key={daily.date} daily={daily} />)
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Redis 임시 코스 목록 + 남은 TTL */}
            <section aria-labelledby="temp-heading" className="flex flex-col gap-4">
              <h2 id="temp-heading" className="text-base font-semibold text-black dark:text-white">
                Redis 임시 코스 ({data.temporaryCourses.length}개)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] rounded-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-[var(--color-brand-soft)] dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700 text-sm font-semibold text-black dark:text-white">
                      <th className="py-3 px-4 text-center font-semibold">제목</th>
                      <th className="py-3 px-4 text-center font-semibold w-[120px]">지역</th>
                      <th className="py-3 px-4 text-center font-semibold w-[100px]">남은 TTL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.temporaryCourses.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-16 text-center text-gray-400 text-sm">
                          현재 저장된 임시 코스가 없어요
                        </td>
                      </tr>
                    ) : (
                      data.temporaryCourses.map((course) => <TempCourseRow key={course.tempId} course={course} />)
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

export default DashboardPage
