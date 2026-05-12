import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { courseApi } from '@/api/courseApi'
import Header from '@/components/Header'
import {
  tempCourseStorage,
  viewedCourseStorage,
  myCourseStorage,
} from '@/utils/storage'

// ─── 날짜 포맷 ────────────────────────────────────────────────────────────────

function formatDate(timestamp: number) {
  const date = new Date(timestamp)
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// ─── 섹션 테이블 ─────────────────────────────────────────────────────────────

interface CourseTableProps {
  title: string
  subtitle?: string
  rows: { key: string; label: string; area: string; date: number }[]
  onRowClick: (key: string) => void
  isLoading?: boolean
  emptyMessage?: string
}

function CourseTable({ title, subtitle, rows, onRowClick, isLoading, emptyMessage }: CourseTableProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-2xl font-bold text-center text-black dark:text-white">{title}</h2>
      {subtitle && <p className="text-xs text-amber-500 text-center">{subtitle}</p>}
      <table className="w-full rounded-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden border-separate border-spacing-0">
        <thead>
          <tr className="bg-[#fff5f7] dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700 text-sm font-semibold text-black dark:text-white">
            <th className="py-3 px-4 text-center font-semibold">제목</th>
            <th className="py-3 px-4 text-center font-semibold w-[100px]">생성일</th>
            <th className="py-3 px-4 text-center font-semibold w-[120px]">지역</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={3} className="py-8 text-center text-gray-400 text-sm">
                불러오는 중...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={3} className="py-8 text-center text-gray-400 text-sm">
                {emptyMessage ?? '아직 없어요'}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.key}
                onClick={() => onRowClick(row.key)}
                className="border-b border-gray-100 dark:border-zinc-800 last:border-0 text-sm hover:bg-[#fff5f7] dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <td className="py-3 px-4 text-center truncate max-w-0 text-black dark:text-white">
                  {row.label}
                </td>
                <td className="py-3 px-4 text-center text-gray-500 dark:text-gray-400">
                  {formatDate(row.date)}
                </td>
                <td className="py-3 px-4 text-center text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                  {row.area.split(' ').slice(-1)[0]}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  )
}

// ─── 메인 페이지 ─────────────────────────────────────────────────────────────

function MenuPage() {
  const navigate = useNavigate()

  const [tempRows, setTempRows] = useState<{ key: string; label: string; area: string; date: number }[]>([])
  const [tempLoading, setTempLoading] = useState(true)

  const viewedRows = viewedCourseStorage.getAll().map((c) => ({
    key: c.uuid,
    label: c.title,
    area: c.area,
    date: c.createdAt,
  }))

  const [myRows, setMyRows] = useState<{ key: string; label: string; area: string; date: number }[]>([])
  const [myLoading, setMyLoading] = useState(true)

  // 저장 전 코스 — TTL 필터 후 API 검증
  useEffect(() => {
    const verify = async () => {
      setTempLoading(true)
      const valid = tempCourseStorage.filterExpired()

      const results = await Promise.allSettled(
        valid.map((item) => courseApi.getTempCourse(item.tempId).then((data) => ({ item, data })))
      )

      const alive: { key: string; label: string; area: string; date: number }[] = []
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          const { item, data } = result.value
          alive.push({ key: item.tempId, label: data.title, area: item.area, date: item.createdAt })
        } else {
          tempCourseStorage.remove(valid[idx].tempId)
        }
      })
      setTempRows(alive)
      setTempLoading(false)
    }

    verify()
  }, [])

  // 내가 짠 코스 — API 검증 후 404면 제거
  useEffect(() => {
    const verify = async () => {
      setMyLoading(true)
      const stored = myCourseStorage.getAll()

      const results = await Promise.allSettled(
        stored.map((item) => courseApi.getCourseByUuid(item.uuid).then(() => item))
      )

      const alive: { key: string; label: string; area: string; date: number }[] = []
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          const c = result.value
          alive.push({ key: c.uuid, label: c.title, area: c.area, date: c.createdAt })
        } else {
          const list = myCourseStorage.getAll().filter((c) => c.uuid !== stored[idx].uuid)
          localStorage.setItem('myCourses', JSON.stringify(list))
        }
      })

      setMyRows(alive)
      setMyLoading(false)
    }

    verify()
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-black">

      <Header />

      <main className="px-4 py-8 max-w-2xl mx-auto flex flex-col gap-10">

        {/* 저장 전 코스 */}
        <CourseTable
          title="저장 전 코스"
          subtitle="⏳ 생성 후 6시간이 지나면 자동으로 사라져요"
          rows={tempRows}
          onRowClick={(tempId) => navigate(`/result/${tempId}`)}
          isLoading={tempLoading}
          emptyMessage="저장 전 코스가 없어요"
        />

        {/* 마지막으로 본 코스 */}
        <CourseTable
          title="마지막으로 본 코스"
          rows={viewedRows}
          onRowClick={(uuid) => navigate(`/course/${uuid}`)}
          emptyMessage="최근에 본 코스가 없어요"
        />

        {/* 내가 짠 코스 */}
        <CourseTable
          title="내가 짠 코스"
          rows={myRows}
          onRowClick={(uuid) => navigate(`/course/${uuid}`)}
          isLoading={myLoading}
          emptyMessage="내가 짠 코스가 없어요"
        />

      </main>
    </div>
  )
}

export default MenuPage
