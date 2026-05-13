import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { courseApi } from '@/api/courseApi'
import Header from '@/components/Header'
import { tempCourseStorage, viewedCourseStorage, myCourseStorage } from '@/utils/storage'

type Row = { key: string; label: string; area: string; date: number }

function formatDate(timestamp: number) {
  const date = new Date(timestamp)
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

interface CourseTableProps {
  title: string
  subtitle?: string
  rows: Row[]
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
            <th className="py-3 px-4 text-center font-semibold w-[140px]">지역</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={3} className="py-8 text-center text-gray-400 text-sm">불러오는 중...</td></tr>
          ) : rows.length === 0 ? (
            <tr><td colSpan={3} className="py-8 text-center text-gray-400 text-sm">{emptyMessage ?? '아직 없어요'}</td></tr>
          ) : (
            rows.map((row) => (
              <tr key={row.key} onClick={() => onRowClick(row.key)}
                className="border-b border-gray-100 dark:border-zinc-800 last:border-0 text-sm hover:bg-[#fff5f7] dark:hover:bg-zinc-900 transition-colors cursor-pointer">
                <td className="py-3 px-4 text-center truncate max-w-0 text-black dark:text-white">{row.label}</td>
                <td className="py-3 px-4 text-center text-gray-500 dark:text-gray-400">{formatDate(row.date)}</td>
                <td className="py-3 px-4 text-center text-gray-500 dark:text-gray-400 truncate max-w-[140px]">{row.area}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  )
}

function MenuPage() {
  const navigate = useNavigate()

  const [tempRows, setTempRows] = useState<Row[]>([])
  const [tempLoading, setTempLoading] = useState(true)
  const [viewedRows, setViewedRows] = useState<Row[]>([])
  const [viewedLoading, setViewedLoading] = useState(true)
  const [myRows, setMyRows] = useState<Row[]>([])
  const [myLoading, setMyLoading] = useState(true)

  // 저장 전 코스 — TTL 필터 후 API 검증
  useEffect(() => {
    const verify = async () => {
      const valid = tempCourseStorage.filterExpired()
      const results = await Promise.allSettled(
        valid.map((item) => courseApi.getTempCourse(item.tempId).then((data) => ({ item, data })))
      )
      const alive: Row[] = []
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

  // 마지막으로 본 코스 — API 검증 후 404면 제거
  useEffect(() => {
    const verify = async () => {
      const stored = viewedCourseStorage.getAll()
      const results = await Promise.allSettled(
        stored.map((item) => courseApi.getCourseByUuid(item.uuid).then(() => item))
      )
      const alive: Row[] = []
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          const c = result.value
          alive.push({ key: c.uuid, label: c.title, area: c.area, date: c.createdAt })
        } else {
          const list = viewedCourseStorage.getAll().filter((c) => c.uuid !== stored[idx].uuid)
          localStorage.setItem('viewedCourses', JSON.stringify(list))
        }
      })
      setViewedRows(alive)
      setViewedLoading(false)
    }
    verify()
  }, [])

  // 내가 짠 코스 — API 검증 후 404면 제거
  useEffect(() => {
    const verify = async () => {
      const stored = myCourseStorage.getAll()
      const results = await Promise.allSettled(
        stored.map((item) => courseApi.getCourseByUuid(item.uuid).then(() => item))
      )
      const alive: Row[] = []
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
        <CourseTable
          title="저장 전 코스"
          subtitle="⏳ 생성 후 6시간이 지나면 자동으로 사라져요"
          rows={tempRows}
          onRowClick={(tempId) => navigate(`/result/${tempId}`)}
          isLoading={tempLoading}
          emptyMessage="저장 전 코스가 없어요"
        />
        <CourseTable
          title="마지막으로 본 코스"
          rows={viewedRows}
          onRowClick={(uuid) => navigate(`/course/${uuid}`)}
          isLoading={viewedLoading}
          emptyMessage="최근에 본 코스가 없어요"
        />
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
