import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { courseApi } from '@/api/courseApi'
import type { ActivityTempResponse, ActivityType } from '@/types/course'

// ─── 상수 ────────────────────────────────────────────────────────────────────

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  MORNING: '오전 활동',
  LUNCH: '점심 식사',
  AFTERNOON: '오후 활동',
  DINNER: '저녁 식사',
}

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  MORNING: '☀️',
  LUNCH: '🍽️',
  AFTERNOON: '🌤️',
  DINNER: '🌙',
}

const ACTIVITY_ORDER: ActivityType[] = ['MORNING', 'LUNCH', 'AFTERNOON', 'DINNER']

// ─── 활동 카드 컴포넌트 ───────────────────────────────────────────────────────

interface ActivityCardProps {
  activity: ActivityTempResponse
  isLast: boolean
}

function ActivityCard({ activity, isLast }: ActivityCardProps) {
  const type = activity.activityType

  return (
    <li className="flex flex-col">
      {/* 카드 */}
      <div className="bg-[#ffeef3] dark:bg-zinc-800 rounded-2xl p-4 flex gap-3">
        {/* 아이콘 */}
        <div className="flex flex-col items-center gap-0 shrink-0">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#fddbf2] to-[#e479c4] flex items-center justify-center text-2xl">
            {ACTIVITY_ICONS[type]}
          </div>
          {!isLast && <div className="w-0.5 h-6 bg-[#f5bee5] mt-1" />}
        </div>

        {/* 내용 */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="text-xs font-medium text-[#ff5283]">
            {ACTIVITY_LABELS[type]}
          </span>
          <h3 className="text-base font-semibold text-black dark:text-white truncate">
            {activity.locationName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {activity.locationContent}
          </p>
          {activity.address && (
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
              📍 {activity.address}
            </p>
          )}

          {/* 버튼 */}
          <div className="flex gap-2 mt-2">
            {activity.locationUrl && (
              <a
                href={activity.locationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 rounded-xl bg-[#ff5283] text-white text-xs font-medium hover:opacity-90 transition-opacity"
              >
                상세 보기
              </a>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}

// ─── 스켈레톤 ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-[#ffeef3] dark:bg-zinc-800 rounded-2xl p-4 flex gap-3 animate-pulse">
      <div className="w-14 h-14 rounded-full bg-pink-200 dark:bg-zinc-700 shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3 w-16 bg-pink-200 dark:bg-zinc-700 rounded" />
        <div className="h-5 w-32 bg-pink-200 dark:bg-zinc-700 rounded" />
        <div className="h-4 w-full bg-pink-200 dark:bg-zinc-700 rounded" />
        <div className="h-4 w-3/4 bg-pink-200 dark:bg-zinc-700 rounded" />
      </div>
    </div>
  )
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

function ResultPage() {
  const { tempId } = useParams<{ tempId: string }>()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tempCourse', tempId],
    queryFn: () => courseApi.getTempCourse(tempId!),
    enabled: !!tempId,
  })

  // 활동 정렬 (MORNING → LUNCH → AFTERNOON → DINNER 순)
  const sortedActivities = data?.activities
    ? [...data.activities].sort(
        (a, b) =>
          ACTIVITY_ORDER.indexOf(a.activityType) -
          ACTIVITY_ORDER.indexOf(b.activityType)
      )
    : []

  return (
    <div className="min-h-screen bg-white dark:bg-black">

      {/* 헤더 */}
      <header className="flex justify-center items-center py-6 bg-white dark:bg-black border-b border-gray-100 dark:border-zinc-800">
        <img src="/favicon.png" alt="코스몽 로고" className="w-16 h-16 object-contain" />
      </header>

      <main className="px-5 py-8 max-w-lg mx-auto flex flex-col gap-6">

        {/* 에러 */}
        {isError && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-gray-500">코스를 불러오지 못했어요 😥</p>
            <button
              type="button"
              onClick={() => navigate('/create')}
              className="px-6 py-3 rounded-full bg-[#ff5283] text-white font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity"
            >
              다시 만들기
            </button>
          </div>
        )}

        {/* 코스 정보 */}
        {(isLoading || data) && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-5 flex flex-col gap-5 shadow-sm">

            {/* 코스 제목 / 지역 */}
            {isLoading ? (
              <div className="flex flex-col gap-2 animate-pulse">
                <div className="h-7 w-48 bg-gray-200 dark:bg-zinc-700 rounded" />
                <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-700 rounded" />
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-extrabold text-black dark:text-white">
                  {data?.title}
                </h1>
                <p className="text-sm text-gray-400">{data?.area}</p>
              </div>
            )}

            {/* 활동 카드 목록 */}
            <ul className="flex flex-col gap-3">
              {isLoading
                ? Array.from({ length: 3 }, (_, i) => <SkeletonCard key={i} />)
                : sortedActivities.map((activity, idx) => (
                    <ActivityCard
                      key={activity.activityType}
                      activity={activity}
                      isLast={idx === sortedActivities.length - 1}
                    />
                  ))}
            </ul>
          </div>
        )}

        {/* 하단 버튼 */}
        {!isLoading && data && (
          <div className="flex flex-col gap-3 pb-8">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-4 rounded-full bg-[#ff5283] text-white font-bold text-base hover:opacity-90 transition-opacity cursor-pointer"
            >
              확정하기
            </button>
            <button
              type="button"
              onClick={() => navigate('/create')}
              className="w-full py-4 rounded-full border-2 border-[#ea85a2] text-[#ff5283] font-bold text-base bg-white dark:bg-black hover:bg-[#fff5f7] dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              다시 만들기
            </button>
          </div>
        )}

      </main>
    </div>
  )
}

export default ResultPage
