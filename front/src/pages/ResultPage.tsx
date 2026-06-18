import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseApi } from '@/api/courseApi'
import KakaoMap from '@/components/KakaoMap'
import Header from '@/components/Header'
import type { ActivityTempResponse, ActivityType } from '@/types/course'
import type { SavedCourseRequest, UpdateReason } from '@/types/gemini'
import { tempCourseStorage, myCourseStorage } from '@/utils/storage'

// ─── 상수 ────────────────────────────────────────────────────────────────────

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  MORNING: '오전 활동', LUNCH: '점심 식사', AFTERNOON: '오후 활동', DINNER: '저녁 식사',
}
const ACTIVITY_ICONS: Record<ActivityType, string> = {
  MORNING: '☀️', LUNCH: '🍽️', AFTERNOON: '🌤️', DINNER: '🌙',
}
const ACTIVITY_ORDER: ActivityType[] = ['MORNING', 'LUNCH', 'AFTERNOON', 'DINNER']
const UPDATE_REASONS: { label: string; value: UpdateReason }[] = [
  { label: '💸 비싸요', value: 'TOO_EXPENSIVE' },
  { label: '😕 별로예요', value: 'NOT_GOOD' },
  { label: '📍 너무 멀어요', value: 'TOO_FAR' },
  { label: '✅ 가봤어요', value: 'ALREADY_BEEN' },
]

const isFailed = (activity: ActivityTempResponse) =>
  activity.latitude === 0 && activity.longitude === 0

// ─── 재추천 모달 ──────────────────────────────────────────────────────────────

interface RecommendModalProps {
  activity: ActivityTempResponse
  onSelect: (reason: UpdateReason) => void
  onClose: () => void
}

function RecommendModal({ activity, onSelect, onClose }: RecommendModalProps) {
  const [isClosing, setIsClosing] = useState(false)

  const handleSelect = (reason: UpdateReason) => {
    setIsClosing(true)
    setTimeout(() => onSelect(reason), 300)
  }
  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => onClose(), 300)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={handleClose}>
      <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`} />
      <div
        className={`relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl p-6 flex flex-col gap-4 transition-transform duration-300 ${isClosing ? 'translate-y-full' : 'translate-y-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto" />
        <p className="text-base font-semibold text-black dark:text-white text-center">
          <span className="text-[#ff5283]">{activity.locationName}</span>을 바꾸려는 이유는?
        </p>
        <div className="flex flex-col gap-2">
          {UPDATE_REASONS.map(({ label, value }) => (
            <button key={value} type="button" onClick={() => handleSelect(value)}
              className="w-full py-3.5 rounded-2xl border border-[#ea85a2] text-[#ff5283] font-medium text-sm hover:bg-[#fff5f7] dark:hover:bg-zinc-800 transition-colors cursor-pointer">
              {label}
            </button>
          ))}
        </div>
        <button type="button" onClick={handleClose}
          className="w-full py-3 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 text-sm font-medium cursor-pointer">
          취소
        </button>
      </div>
    </div>
  )
}

// ─── 제목 수정 모달 ───────────────────────────────────────────────────────────

interface TitleModalProps {
  title: string
  onConfirm: (title: string) => void
  onClose: () => void
  isSaving: boolean
}

function TitleModal({ title: defaultTitle, onConfirm, onClose, isSaving }: TitleModalProps) {
  const [value, setValue] = useState('')
  const handleConfirm = () => onConfirm(value.trim() || defaultTitle)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto" />
        <p className="text-base font-semibold text-black dark:text-white text-center">코스 제목 설정</p>
        <div className="flex flex-col gap-1">
          <label htmlFor="course-title" className="text-xs text-gray-400">제목</label>
          <input id="course-title" type="text" value={value} placeholder={defaultTitle}
            onChange={(e) => setValue(e.target.value)} maxLength={20}
            className="w-full px-4 py-3 rounded-2xl border border-[#ea85a2] text-sm text-black dark:text-white bg-white dark:bg-zinc-800 outline-none focus:border-[#ff5283] placeholder:text-gray-300 dark:placeholder:text-zinc-600" />
          <p className="text-xs text-gray-400 text-right">{value.length}/20</p>
        </div>
        <p className="text-xs text-gray-400 text-center">
          그냥 확정하기를 누르면 기존 제목 <span className="text-[#ff5283] font-medium">"{defaultTitle}"</span>으로 저장돼요
        </p>
        <button type="button" onClick={handleConfirm} disabled={isSaving}
          className="w-full py-4 rounded-full bg-[#ff5283] text-white font-bold text-base hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60">
          {isSaving ? '저장 중...' : '확정하기'}
        </button>
        <button type="button" onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 text-sm font-medium cursor-pointer">
          취소
        </button>
      </div>
    </div>
  )
}

// ─── 다시 만들기 모달 ────────────────────────────────────────────────────────

interface LeaveModalProps {
  remaining: string
  onLeave: () => void
  onMenu: () => void
  onClose: () => void
}

function LeaveModal({ remaining, onLeave, onMenu, onClose }: LeaveModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-3xl p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto" />
        <p className="text-base font-semibold text-black dark:text-white text-center">
          이 코스는 메뉴의 저장 전 코스에서<br />
          <span className="text-[#ff5283]">{remaining}</span> 동안 다시 확인할 수 있어요
        </p>
        <button type="button" onClick={onLeave}
          className="w-full py-4 rounded-full bg-[#ff5283] text-white font-bold text-base cursor-pointer hover:opacity-90 transition-opacity">
          새 코스 만들기
        </button>
        <button type="button" onClick={onMenu}
          className="w-full py-3 rounded-2xl border-2 border-[#ea85a2] text-[#ff5283] font-bold text-sm cursor-pointer hover:bg-[#fff5f7] dark:hover:bg-zinc-900 transition-colors">
          메뉴에서 확인하기
        </button>
      </div>
    </div>
  )
}

// ─── 활동 카드 ────────────────────────────────────────────────────────────────

interface ActivityCardProps {
  activity: ActivityTempResponse
  isLast: boolean
  isUpdating: boolean
  onRecommend: (activity: ActivityTempResponse) => void
  onRetry: (activity: ActivityTempResponse) => void
}

function ActivityCard({ activity, isLast, isUpdating, onRecommend, onRetry }: ActivityCardProps) {
  const type = activity.activityType
  const failed = isFailed(activity)

  return (
    <li className="flex flex-col">
      <div className="relative bg-[#ffeef3] dark:bg-zinc-800 rounded-2xl p-4 flex gap-3">
        {isUpdating && (
          <div className="absolute inset-0 rounded-2xl bg-white/70 dark:bg-black/70 flex items-center justify-center z-10">
            <span className="loading loading-spinner loading-md text-[#ff5283]" />
          </div>
        )}
        {failed && !isUpdating && (
          <button
            type="button"
            onClick={() => onRetry(activity)}
            className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#ff5283] text-white text-xs font-medium hover:opacity-80 transition-opacity cursor-pointer z-10"
          >
            재시도
          </button>
        )}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#fddbf2] to-[#e479c4] flex items-center justify-center text-2xl">
            {ACTIVITY_ICONS[type]}
          </div>
          {!isLast && <div className="w-0.5 h-6 bg-[#f5bee5] mt-1" />}
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="text-xs font-medium text-[#ff5283]">{ACTIVITY_LABELS[type]}</span>
          <h3 className="text-base font-semibold text-black dark:text-white truncate">{activity.locationName}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{activity.locationContent}</p>
          {activity.address && (
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">📍 {activity.address}</p>
          )}
          {!failed && (
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={() => onRecommend(activity)} disabled={isUpdating}
                className="px-4 py-1.5 rounded-xl bg-[#eaeaea] dark:bg-zinc-700 text-black dark:text-white text-xs font-medium hover:opacity-80 transition-opacity cursor-pointer disabled:opacity-50">
                재추천 받기
              </button>
              {activity.locationUrl && (
                <a href={activity.locationUrl} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-1.5 rounded-xl bg-[#ff5283] text-white text-xs font-medium hover:opacity-90 transition-opacity">
                  상세 보기
                </a>
              )}
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

// ─── 메인 ────────────────────────────────────────────────────────────────────

function ResultPage() {
  const { tempId } = useParams<{ tempId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [selectedActivity, setSelectedActivity] = useState<ActivityTempResponse | null>(null)
  const [updatingType, setUpdatingType] = useState<ActivityType | null>(null)
  const [showTitleModal, setShowTitleModal] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [remaining, setRemaining] = useState('')
  const [published, setPublished] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  const savedRequest: SavedCourseRequest | null = (() => {
    try {
      const raw = localStorage.getItem(`courseRequest:${tempId}`)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tempCourse', tempId],
    queryFn: () => courseApi.getTempCourse(tempId!),
    enabled: !!tempId,
  })

  useEffect(() => {
    if (data && tempId) tempCourseStorage.save({ tempId, area: data.area })
  }, [data, tempId])

  useEffect(() => {
    const stored = tempCourseStorage.getAll().find((c) => c.tempId === tempId)
    if (!stored) return
    const expiresAt = stored.createdAt + 6 * 60 * 60 * 1000
    const tick = () => {
      const diff = expiresAt - Date.now()
      if (diff <= 0) { setRemaining('만료됨'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setRemaining(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [tempId, data?.area])

  const { mutate: updateActivity } = useMutation({
    mutationFn: ({ activity, reason }: { activity: ActivityTempResponse; reason?: UpdateReason }) => {
      const originalActivity = savedRequest?.activities.find((a) => a.type === activity.activityType)
      return courseApi.updateActivity(tempId!, activity.activityType, {
        relationship: savedRequest?.relationship ?? '',
        hobby: savedRequest?.hobby ?? [],
        theme: savedRequest?.theme ?? '',
        activityType: activity.activityType,
        category: originalActivity?.category ?? '',
        updateReason: reason,
      })
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['tempCourse', tempId], updated)
      setUpdatingType(null)
    },
    onError: () => {
      setUpdatingType(null)
      showToast('AI 요청이 많습니다. 잠시 후 다시 눌러주세요 🙏')
    },
  })

  const { mutate: saveCourse, isPending: isSaving } = useMutation({
    mutationFn: (title: string) => courseApi.saveCourse(tempId!, published, title),
    onSuccess: (saved) => {
      localStorage.removeItem(`courseRequest:${tempId}`)
      tempCourseStorage.remove(tempId!)
      myCourseStorage.save({ uuid: saved.courseUuid, title: saved.title, area: saved.area })
      navigate(`/course/${saved.courseUuid}`)
    },
  })

  const sortedActivities = data?.activities
    ? [...data.activities].sort((a, b) => ACTIVITY_ORDER.indexOf(a.activityType) - ACTIVITY_ORDER.indexOf(b.activityType))
    : []

  const handleReasonSelect = (reason: UpdateReason) => {
    if (!selectedActivity) return
    setUpdatingType(selectedActivity.activityType)
    setSelectedActivity(null)
    updateActivity({ activity: selectedActivity, reason })
  }

  const handleRetry = (activity: ActivityTempResponse) => {
    setUpdatingType(activity.activityType)
    updateActivity({ activity })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-zinc-800 text-white text-sm font-medium shadow-lg whitespace-nowrap">
          {toast}
        </div>
      )}

      {isSaving && (
        <div className="fixed inset-0 z-50 bg-white/80 dark:bg-black/80 flex flex-col items-center justify-center gap-4">
          <span className="loading loading-spinner loading-lg text-[#ff5283]" />
          <p className="text-sm text-gray-500">저장 중이에요...</p>
        </div>
      )}

      {selectedActivity && (
        <RecommendModal activity={selectedActivity} onSelect={handleReasonSelect} onClose={() => setSelectedActivity(null)} />
      )}

      {showTitleModal && (
        <TitleModal title={data?.title ?? ''} onConfirm={(title) => saveCourse(title)}
          onClose={() => setShowTitleModal(false)} isSaving={isSaving} />
      )}

      {showLeaveModal && (
        <LeaveModal remaining={remaining} onLeave={() => navigate('/create')}
          onMenu={() => navigate('/menu')} onClose={() => setShowLeaveModal(false)} />
      )}

      <Header />

      <main className="px-5 py-8 max-w-lg mx-auto flex flex-col gap-6">

        {isError && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-gray-500">코스를 불러오지 못했어요 😥</p>
            <button type="button" onClick={() => navigate('/create')}
              className="px-6 py-3 rounded-full bg-[#ff5283] text-white font-bold text-sm cursor-pointer">
              다시 만들기
            </button>
          </div>
        )}

        {(isLoading || data) && (
          <div className="flex flex-col gap-5">
            {!isLoading && sortedActivities.length > 0 && <KakaoMap activities={sortedActivities} />}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-5 flex flex-col gap-5 shadow-sm">
              {isLoading ? (
                <div className="flex flex-col gap-2 animate-pulse">
                  <div className="h-7 w-48 bg-gray-200 dark:bg-zinc-700 rounded" />
                  <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-700 rounded" />
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl font-extrabold text-black dark:text-white">{data?.title}</h1>
                  <p className="text-sm text-gray-400">{data?.area}</p>
                </div>
              )}
              <ul className="flex flex-col gap-3">
                {isLoading
                  ? Array.from({ length: 3 }, (_, i) => <SkeletonCard key={i} />)
                  : sortedActivities.map((activity, idx) => (
                    <ActivityCard key={activity.activityType} activity={activity}
                      isLast={idx === sortedActivities.length - 1}
                      isUpdating={updatingType === activity.activityType}
                      onRecommend={setSelectedActivity}
                      onRetry={handleRetry} />
                  ))}
              </ul>
            </div>
          </div>
        )}

        {!isLoading && data && (
          <div className="flex flex-col items-center gap-5 pb-8">
            <div className="flex flex-col items-center gap-1">
              <button type="button" onClick={() => setPublished((prev) => !prev)}
                className="flex items-center gap-2 text-base font-semibold text-black dark:text-white cursor-pointer hover:opacity-80 transition-opacity">
                모두에게 공개하기
                <span className={`text-xl ${published ? 'text-[#ff5283]' : 'text-gray-300 dark:text-zinc-600'}`}>
                  {published ? '●' : '○'}
                </span>
              </button>
              <p className="text-xs text-gray-400 text-center">
                {published ? '게시판에 공개돼요 🎉 다른 사람들에게 자랑해보세요!' : '눌러서 코스를 공개하고 다른 사람들과 공유해보세요'}
              </p>
            </div>
            <p className="text-xs text-amber-500 text-center">
              ⏳ {remaining || '시간 계산 중...'} 후에 사라져요
            </p>
            <div className="flex flex-col gap-3 w-full mt-2">
              <button type="button" onClick={() => setShowTitleModal(true)} disabled={isSaving}
                className="w-full py-4 rounded-full bg-[#ff5283] text-white font-bold text-base hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60">
                확정하기
              </button>
              <button type="button" onClick={() => setShowLeaveModal(true)}
                className="w-full py-4 rounded-full border-2 border-[#ea85a2] text-[#ff5283] font-bold text-base bg-white dark:bg-black hover:bg-[#fff5f7] dark:hover:bg-zinc-900 transition-colors cursor-pointer">
                다시 만들기
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default ResultPage
