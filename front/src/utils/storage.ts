const TTL_MS = 6 * 60 * 60 * 1000 // 6시간

// ─── 타입 ─────────────────────────────────────────────────────────────────────

export interface StoredTempCourse {
  tempId: string
  area: string
  createdAt: number
}

export interface StoredCourse {
  uuid: string
  title: string
  area: string
  createdAt: number
}

// ─── 저장 전 코스 (tempCourses) ───────────────────────────────────────────────

export const tempCourseStorage = {
  getAll: (): StoredTempCourse[] => {
    try {
      const raw = localStorage.getItem('tempCourses')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },

  save: (item: Omit<StoredTempCourse, 'createdAt'>) => {
    const list = tempCourseStorage.getAll()
    const existing = list.find((c) => c.tempId === item.tempId)
    if (existing) return // 이미 있으면 createdAt 유지
    const next = [{ ...item, createdAt: Date.now() }, ...list]
    localStorage.setItem('tempCourses', JSON.stringify(next))
  },

  // 6시간 지난 것 제거
  filterExpired: (): StoredTempCourse[] => {
    const list = tempCourseStorage.getAll()
    const valid = list.filter((c) => Date.now() - c.createdAt < TTL_MS)
    localStorage.setItem('tempCourses', JSON.stringify(valid))
    return valid
  },

  remove: (tempId: string) => {
    const list = tempCourseStorage.getAll()
    const next = list.filter((c) => c.tempId !== tempId)
    localStorage.setItem('tempCourses', JSON.stringify(next))
  },
}

// ─── 마지막으로 본 코스 (viewedCourses) ──────────────────────────────────────

const MAX_VIEWED = 10

export const viewedCourseStorage = {
  getAll: (): StoredCourse[] => {
    try {
      const raw = localStorage.getItem('viewedCourses')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },

  save: (item: Omit<StoredCourse, 'createdAt'>) => {
    const list = viewedCourseStorage.getAll()
    const filtered = list.filter((c) => c.uuid !== item.uuid)
    const next = [{ ...item, createdAt: Date.now() }, ...filtered].slice(0, MAX_VIEWED)
    localStorage.setItem('viewedCourses', JSON.stringify(next))
  },
}

// ─── 내가 짠 코스 (myCourses) ────────────────────────────────────────────────

export const myCourseStorage = {
  getAll: (): StoredCourse[] => {
    try {
      const raw = localStorage.getItem('myCourses')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  },

  save: (item: Omit<StoredCourse, 'createdAt'>) => {
    const list = myCourseStorage.getAll()
    const filtered = list.filter((c) => c.uuid !== item.uuid)
    const next = [{ ...item, createdAt: Date.now() }, ...filtered]
    localStorage.setItem('myCourses', JSON.stringify(next))
  },
}
