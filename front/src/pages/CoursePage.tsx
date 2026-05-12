import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { courseApi } from '@/api/courseApi'
import KakaoMap from '@/components/KakaoMap'
import Header from '@/components/Header'
import type { ActivityResponse, ActivityType } from '@/types/course'
import { viewedCourseStorage } from '@/utils/storage'

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

// ─── 활동 카드 ────────────────────────────────────────────────────────────────

interface ActivityCardProps {
  activity: ActivityResponse
  isLast: boolean
}

function ActivityCard({ activity, isLast }: ActivityCardProps) {
  const type = activity.activityType
  return (
    <li className="flex flex-col">
      <div className="bg-[#ffeef3] dark:bg-zinc-800 rounded-2xl p-4 flex gap-3">
        <div className="flex flex-col items-center shrink-0">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#fddbf2] to-[#e479c4] flex items-center justify-center text-2xl">
            {ACTIVITY_ICONS[type]}
          </div>
          {!isLast && <div className="w-0.5 h-6 bg-[#f5bee5] mt-1" />}
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="text-xs font-medium text-[#ff5283]">{ACTIVITY_LABELS[type]}</span>
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
          {activity.locationUrl && (
            <div className="mt-2">
              <a
                href={activity.locationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 rounded-xl bg-[#ff5283] text-white text-xs font-medium hover:opacity-90 transition-opacity"
              >
                상세 보기
              </a>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

// ─── 스켈레톤 ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <li className="bg-[#ffeef3] dark:bg-zinc-800 rounded-2xl p-4 flex gap-3 animate-pulse">
      <div className="w-14 h-14 rounded-full bg-pink-200 dark:bg-zinc-700 shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3 w-16 bg-pink-200 dark:bg-zinc-700 rounded" />
        <div className="h-5 w-32 bg-pink-200 dark:bg-zinc-700 rounded" />
        <div className="h-4 w-full bg-pink-200 dark:bg-zinc-700 rounded" />
        <div className="h-4 w-3/4 bg-pink-200 dark:bg-zinc-700 rounded" />
      </div>
    </li>
  )
}

// ─── 토스트 ───────────────────────────────────────────────────────────────────

interface ToastProps {
  message: string
}

function Toast({ message }: ToastProps) {
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-black/80 dark:bg-white/90 text-white dark:text-black text-sm font-medium px-5 py-3 rounded-full shadow-lg animate-bounce">
      {message}
    </div>
  )
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

function CoursePage() {
  const { uuid } = useParams<{ uuid: string }>()
  const navigate = useNavigate()
  const [toast, setToast] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['course', uuid],
    queryFn: () => courseApi.getCourseByUuid(uuid!),
    enabled: !!uuid,
  })

  // 마지막으로 본 코스 저장
  useEffect(() => {
    if (data && uuid) {
      viewedCourseStorage.save({ uuid, title: data.title, area: data.area })
    }
  }, [data, uuid])

  const sortedActivities: ActivityResponse[] = data?.activities
    ? [...data.activities].sort(
        (a, b) =>
          ACTIVITY_ORDER.indexOf(a.activityType) - ACTIVITY_ORDER.indexOf(b.activityType)
      )
    : []

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  const handleShare = async () => {
    const url = window.location.href
    const title = data?.title ?? '코스몽 데이트 코스'
    const text = `코스몽에서 "${title}" 코스를 확인해보세요!`

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch {
        // 사용자가 공유 취소한 경우 무시
      }
    } else {
      await navigator.clipboard.writeText(url)
      showToast('링크가 복사됐어요! 🔗')
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">

      {toast && <Toast message={toast} />}

      {/* 헤더 */}
      <Header />

      <main className="px-5 py-8 max-w-lg mx-auto flex flex-col gap-6">

        {/* 에러 */}
        {isError && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-gray-500">코스를 불러오지 못했어요 😥</p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-full bg-[#ff5283] text-white font-bold text-sm cursor-pointer"
            >
              홈으로
            </button>
          </div>
        )}

        {/* 코스 내용 */}
        {(isLoading || data) && (
          <div className="flex flex-col gap-5">

            {/* 카카오맵 */}
            {!isLoading && sortedActivities.length > 0 && (
              <KakaoMap activities={sortedActivities} />
            )}

            {/* 코스 카드 */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-5 flex flex-col gap-5 shadow-sm">
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

              <ul className="flex flex-col gap-3">
                {isLoading
                  ? Array.from({ length: 3 }, (_, i) => <SkeletonCard key={i} />)
                  : sortedActivities.map((activity, idx) => (
                      <ActivityCard
                        key={activity.id}
                        activity={activity}
                        isLast={idx === sortedActivities.length - 1}
                      />
                    ))}
              </ul>
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        {!isLoading && data && (
          <div className="flex flex-col gap-3 pb-8">
            <button
              type="button"
              onClick={handleShare}
              className="w-full py-4 rounded-full bg-[#ff5283] text-white font-bold text-base hover:opacity-90 transition-opacity cursor-pointer"
            >
              공유하기
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-4 rounded-full border-2 border-[#ea85a2] text-[#ff5283] font-bold text-base bg-white dark:bg-black hover:bg-[#fff5f7] dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              홈으로
            </button>
          </div>
        )}

      </main>
    </div>
  )
}

export default CoursePage
