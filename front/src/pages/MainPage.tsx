import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { courseApi } from '@/api/courseApi'
import Header from '@/components/Header'
import type { DateCourseResponse } from '@/types/course'

const PAGE_SIZE = 10

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function MainPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['publicCourses'],
    queryFn: courseApi.getPublicCourses,
  })

  const totalPages = Math.max(1, Math.ceil(courses.length / PAGE_SIZE))
  const paginated = [...courses]
    .sort((a, b) => b.id - a.id)
    .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleCourseClick = (course: DateCourseResponse) => {
    navigate(`/course/${course.courseUuid}`)
  }

  const scrollToBoard = () => {
    window.scrollTo({
      top: document.getElementById('board')?.offsetTop ?? 0,
      behavior: 'smooth',
    })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">

      <Header />

      {/* 히어로 섹션 — 뷰포트 높이로 꽉 채워서 아래에 뭔가 있다는 걸 유도 */}
      <section className="bg-[#fff5f7] dark:bg-zinc-900 px-6 flex flex-col items-center justify-center text-center gap-5"
        style={{ minHeight: 'calc(100vh - 144px)' }}
      >
        <h1 className="text-2xl font-bold text-black dark:text-white leading-snug">
          AI가 짜주는 꿈만 같은 코스
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          AI를 활용해 연인과 데이트 코스를 편하게 계획하세요!
        </p>
        <div className="flex flex-col items-center gap-3 mt-2 w-full max-w-[220px]">
          <button
            type="button"
            onClick={() => navigate('/create')}
            className="w-full py-3 rounded-2xl bg-[#ff5283] text-white font-bold text-base hover:opacity-90 transition-opacity cursor-pointer"
          >
            하러가기
          </button>
          <button
            type="button"
            onClick={scrollToBoard}
            className="w-full py-3 rounded-2xl border-2 border-[#ff5283] text-[#ff5283] font-bold text-base bg-white dark:bg-black hover:bg-[#fff0f4] dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            공개된 코스 보러가기
          </button>
        </div>

        {/* 아래로 스크롤 유도 화살표 */}
        <div className="absolute bottom-6 animate-bounce text-[#ff5283] opacity-60 text-xl">
          ↓
        </div>
      </section>

      {/* 게시판 섹션 */}
      <section id="board" className="px-4 py-14 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-black dark:text-white mb-2">
          사용자들이 공개한 코스
        </h2>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
          사용자가 추천 받은 코스를 공개하였습니다! 참고하세요
        </p>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-md text-[#ff5283]" />
          </div>
        ) : (
          <>
            {/* 테이블 */}
            <table className="w-full rounded-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden border-separate border-spacing-0">
              <thead>
                <tr className="bg-[#fff5f7] dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-700 text-sm font-semibold text-black dark:text-white">
                  <th className="py-3 px-4 text-center font-semibold">제목</th>
                  <th className="py-3 px-4 text-center font-semibold w-[100px]">생성일</th>
                  <th className="py-3 px-4 text-center font-semibold w-[140px]">지역</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-16 text-center text-gray-400 text-sm">
                      아직 공개된 코스가 없어요
                    </td>
                  </tr>
                ) : (
                  paginated.map((course) => (
                    <tr
                      key={course.id}
                      onClick={() => handleCourseClick(course)}
                      className="border-b border-gray-100 dark:border-zinc-800 last:border-0 text-sm hover:bg-[#fff5f7] dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 text-center truncate max-w-0 text-black dark:text-white">{course.title}</td>
                      <td className="py-3 px-4 text-center text-gray-500 dark:text-gray-400">{formatDate(course.createdAt)}</td>
                      <td className="py-3 px-4 text-center text-gray-500 dark:text-gray-400 max-w-[140px] truncate">{course.area}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                      p === page
                        ? 'bg-[#ff5283] text-white'
                        : 'text-black dark:text-white hover:bg-[#fff0f4] dark:hover:bg-zinc-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default MainPage
