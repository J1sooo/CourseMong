import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { geminiApi } from '@/api/geminiApi'
import { kakaoApi } from '@/api/kakaoApi'
import Header from '@/components/Header'
import type { ActivityType } from '@/types/course'
import type { ActivityInput, SavedCourseRequest } from '@/types/gemini'

// ─── 상수 ────────────────────────────────────────────────────────────────────

const RELATIONSHIPS = [
  '혼자(남)', '혼자(녀)',
  '친구(여/여)', '친구(남/여)', '친구(남/남)', '친구 단체',
  '가족', '연인',
]

const HOBBIES = [
  '맛집탐방', '영화', '게임', '요리', '드라이브', '쇼핑',
  '스포츠', '자연', '여행', '캠핑', '그림',
  '독서', '감상', '사진', '관람',
]

const THEMES = [
  '로맨틱', '기념일', '액티브', '힐링', '재미', '여유',
  '감성', '여행', '먹방', '탐방',
]

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  MORNING: '오전 활동',
  LUNCH: '점심 식사',
  AFTERNOON: '오후 활동',
  DINNER: '저녁 식사',
}

const ACTIVITY_ORDER: ActivityType[] = ['MORNING', 'LUNCH', 'AFTERNOON', 'DINNER']

const ACTIVITY_CATEGORIES: Record<ActivityType, string[]> = {
  MORNING: ['산책', '카페', '영화관', '미술관', '공연', '전시회', '볼링장', '노래방', '쇼핑몰', '북카페', '방탈출', '보드게임'],
  LUNCH: ['맛집', '한식', '중식', '일식', '양식', '카페·디저트', '이탈리안', '브런치카페'],
  AFTERNOON: ['산책', '카페', '영화관', '미술관', '공연', '전시회', '볼링장', '노래방', '쇼핑몰', '북카페', '방탈출', '보드게임'],
  DINNER: ['맛집', '한식', '중식', '일식', '양식', '술집', '이탈리안', '와인바'],
}

// ─── 공통 칩 컴포넌트 ─────────────────────────────────────────────────────────

interface ChipProps {
  label: string
  selected: boolean
  onClick: () => void
}

function Chip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 rounded-full text-sm border transition-colors cursor-pointer whitespace-nowrap ${
        selected
          ? 'bg-[#ff5283] border-[#ff5283] text-white'
          : 'bg-white dark:bg-black border-[#ea85a2] text-[#ff5283] hover:bg-[#fff5f7] dark:hover:bg-zinc-900'
      }`}
    >
      {label}
    </button>
  )
}

// ─── 지역 검색 컴포넌트 ───────────────────────────────────────────────────────

type AreaTab = 'place' | 'address'

interface AreaSearchProps {
  value: string
  onChange: (value: string) => void
}

function AreaSearch({ value, onChange }: AreaSearchProps) {
  const [tab, setTab] = useState<AreaTab>('place')
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [noResults, setNoResults] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSuggestions([])
        setNoResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleTabChange = (next: AreaTab) => {
    setTab(next)
    setInput('')
    setSuggestions([])
    setNoResults(false)
  }

  const handleInput = (val: string) => {
    setInput(val)
    onChange('')
    setNoResults(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (val.trim().length < 2) { setSuggestions([]); return }
    debounceRef.current = setTimeout(() => {
      const fn = tab === 'place' ? kakaoApi.searchPlace : kakaoApi.searchAddress
      fn(val)
        .then((results) => {
          setSuggestions(results)
          setNoResults(results.length === 0)
        })
        .catch(() => setNoResults(true))
    }, 1000)
  }

  const handleSelect = (name: string) => {
    setInput(name)
    onChange(name)
    setSuggestions([])
    setNoResults(false)
  }

  const handleClear = () => {
    setInput('')
    onChange('')
    setSuggestions([])
    setNoResults(false)
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-2">
      {/* 탭 */}
      <div className="flex gap-2">
        {(['place', 'address'] as AreaTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => handleTabChange(t)}
            className={`px-4 py-2 rounded-full text-sm border transition-colors cursor-pointer ${
              tab === t
                ? 'bg-[#ff5283] border-[#ff5283] text-white'
                : 'bg-white dark:bg-black border-[#ea85a2] text-[#ff5283] hover:bg-[#fff5f7] dark:hover:bg-zinc-900'
            }`}
          >
            {t === 'place' ? '장소로 찾기' : '주소로 찾기'}
          </button>
        ))}
      </div>

      {/* 입력 */}
      <div className="relative">
        <input
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          placeholder={tab === 'place' ? '장소명을 입력하세요 (예: 강남역, 롯데월드)' : '주소를 입력하세요 (예: 서울 강남구)'}
          className={`w-full px-4 py-2.5 pr-10 rounded-full border text-sm bg-white dark:bg-black text-[#ff5283] outline-none transition-colors ${
            value ? 'border-[#ff5283]' : 'border-[#ea85a2]'
          }`}
        />
        {input && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#ea85a2] hover:text-[#ff5283] text-lg leading-none cursor-pointer"
          >
            ×
          </button>
        )}

        {/* 드롭다운 */}
        {suggestions.length > 0 && (
          <ul className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-black border border-[#ea85a2] rounded-2xl shadow-md z-10 overflow-hidden">
            {suggestions.map((name) => (
              <li
                key={name}
                onMouseDown={() => handleSelect(name)}
                className="px-4 py-3 text-sm text-black dark:text-white cursor-pointer hover:bg-[#fff5f7] dark:hover:bg-zinc-900 border-b border-[#fce4ec] last:border-0"
              >
                {name}
              </li>
            ))}
          </ul>
        )}
        {noResults && (
          <p className="absolute top-full left-0 right-0 mt-1 px-4 py-3 text-sm text-gray-400 bg-white dark:bg-black border border-[#ea85a2] rounded-2xl shadow-md z-10">
            찾을 수 없습니다
          </p>
        )}
      </div>

      {/* 선택 완료 표시 */}
      {value && (
        <p className="text-xs text-[#ff5283] px-1">선택된 지역: {value}</p>
      )}
    </div>
  )
}

// ─── 섹션 헤더 컴포넌트 ──────────────────────────────────────────────────────

interface SectionTitleProps {
  children: React.ReactNode
  badge?: '필수' | '선택'
}

function SectionTitle({ children, badge }: SectionTitleProps) {
  return (
    <div className="flex items-center gap-2">
      <h2 className="text-xl font-semibold text-black dark:text-white">{children}</h2>
      {badge && (
        <span className={`text-xs font-normal ${badge === '필수' ? 'text-[#ff5283]' : 'text-gray-400'}`}>
          {badge}
        </span>
      )}
    </div>
  )
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

function CreatePage() {
  const navigate = useNavigate()

  // 지역
  const [area, setArea] = useState('')

  // 날짜
  const [date, setDate] = useState('')

  // 관계
  const [relationship, setRelationship] = useState('')

  // 취미 (다중 선택)
  const [hobbies, setHobbies] = useState<string[]>([])

  // 테마 (단일 선택)
  const [theme, setTheme] = useState('')

  // 활동 (type → category 맵)
  const [activities, setActivities] = useState<Map<ActivityType, string>>(new Map())

  // ─── 취미 핸들러 ───────────────────────────────────────────────────────────
  const toggleHobby = (hobby: string) => {
    setHobbies((prev) => {
      if (prev.includes(hobby)) return prev.filter((h) => h !== hobby)
      if (prev.length >= 3) return prev
      return [...prev, hobby]
    })
  }

  // ─── 활동 핸들러 ───────────────────────────────────────────────────────────
  const toggleActivity = (type: ActivityType) => {
    setActivities((prev) => {
      const next = new Map(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.set(type, '')
      }
      return next
    })
  }

  const selectCategory = (type: ActivityType, category: string) => {
    setActivities((prev) => {
      const next = new Map(prev)
      next.set(type, category)
      return next
    })
  }

  // ─── 초기화 ────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setArea('')
    setDate('')
    setRelationship('')
    setHobbies([])
    setTheme('')
    setActivities(new Map())
  }

  // ─── 제출 ──────────────────────────────────────────────────────────────────
  const { mutate, isPending } = useMutation({
    mutationFn: geminiApi.recommend,
    onSuccess: (data) => {
      const savedRequest: SavedCourseRequest = {
        area,
        relationship,
        hobby: hobbies,
        theme,
        activities: [...activities.entries()].map(([type, category]) => ({ type, category })),
      }
      localStorage.setItem('courseRequest', JSON.stringify(savedRequest))
      navigate(`/result/${data.tempId}`)
    },
  })

  const handleSubmit = () => {
    if (!area) return alert('지역을 선택해주세요.')
    if (!relationship) return alert('관계를 선택해주세요.')
    if (activities.size === 0) return alert('활동을 1개 이상 선택해주세요.')

    const hasEmptyCategory = [...activities.entries()].some(([, cat]) => cat === '')
    if (hasEmptyCategory) return alert('선택한 활동의 세부 항목을 선택해주세요.')

    const activityList: ActivityInput[] = [...activities.entries()].map(([type, category]) => ({
      type,
      category,
    }))

    mutate({
      area,
      relationship,
      date: date || null,
      hobby: hobbies,
      theme,
      activities: activityList,
    })
  }

  // ─── 렌더 ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white dark:bg-black">

      <Header />

      <main className="px-5 py-8 max-w-lg mx-auto flex flex-col gap-8">

        {/* 지역 */}
        <section className="flex flex-col gap-3">
          <SectionTitle badge="필수">지역</SectionTitle>
          <AreaSearch value={area} onChange={setArea} />
        </section>

        {/* 날짜 */}
        <section className="flex flex-col gap-3">
          <SectionTitle badge="선택">날짜</SectionTitle>
          <label htmlFor="date" className="sr-only">날짜 선택</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-full border border-[#ea85a2] text-sm text-[#ff5283] bg-white dark:bg-black outline-none appearance-none cursor-pointer"
          />
        </section>

        {/* 관계 */}
        <section className="flex flex-col gap-3">
          <SectionTitle badge="필수">관계</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {RELATIONSHIPS.map((rel) => (
              <Chip
                key={rel}
                label={rel}
                selected={relationship === rel}
                onClick={() => setRelationship(rel)}
              />
            ))}
          </div>
        </section>

        {/* 공통 취미 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <SectionTitle badge="선택">공통 취미</SectionTitle>
            <span className="text-sm text-gray-400">{hobbies.length}/3</span>
          </div>
          <p className="text-xs text-gray-400">최대 3개까지 선택할 수 있어요</p>
          <div className="flex flex-wrap gap-2">
            {HOBBIES.map((hobby) => (
              <Chip
                key={hobby}
                label={hobby}
                selected={hobbies.includes(hobby)}
                onClick={() => toggleHobby(hobby)}
              />
            ))}
          </div>
        </section>

        {/* 테마 */}
        <section className="flex flex-col gap-3">
          <SectionTitle badge="선택">테마</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <Chip
                key={t}
                label={t}
                selected={theme === t}
                onClick={() => setTheme(theme === t ? '' : t)}
              />
            ))}
          </div>
        </section>

        {/* 추천받고 싶은 활동 */}
        <section className="flex flex-col gap-4">
          <SectionTitle badge="필수">추천받고 싶은 활동</SectionTitle>

          {/* 활동 타입 선택 */}
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_ORDER.map((type) => (
              <Chip
                key={type}
                label={ACTIVITY_LABELS[type]}
                selected={activities.has(type)}
                onClick={() => toggleActivity(type)}
              />
            ))}
          </div>

          {/* 선택된 활동의 카테고리 */}
          {ACTIVITY_ORDER.filter((type) => activities.has(type)).map((type) => (
            <div key={type} className="flex flex-col gap-2 p-4 rounded-2xl bg-[#fff5f7] dark:bg-zinc-900">
              <p className="text-sm font-semibold text-black dark:text-white">{ACTIVITY_LABELS[type]}</p>
              <div className="flex flex-wrap gap-2">
                {ACTIVITY_CATEGORIES[type].map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    selected={activities.get(type) === cat}
                    onClick={() => selectCategory(type, cat)}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* 버튼 */}
        <div className="flex flex-col gap-3 pb-8">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full py-4 rounded-full bg-[#ff5283] text-white font-bold text-base hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60"
          >
            {isPending ? '코스 생성 중...' : '코스 보기'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="w-full py-4 rounded-full border-2 border-[#ea85a2] text-[#ff5283] font-bold text-base bg-white dark:bg-black hover:bg-[#fff5f7] dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            조건 초기화
          </button>
        </div>

      </main>
    </div>
  )
}

export default CreatePage
