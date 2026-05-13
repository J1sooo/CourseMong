import { useNavigate } from 'react-router-dom'

function Header() {
  const navigate = useNavigate()

  return (
    <header className="relative flex justify-center items-center py-6 bg-white dark:bg-black border-b border-gray-100 dark:border-zinc-800">
      <img
        src="/favicon.png"
        alt="코스몽 로고"
        className="w-24 h-24 object-contain cursor-pointer"
        onClick={() => navigate('/')}
      />
      <button
        type="button"
        onClick={() => navigate('/menu')}
        className="absolute right-5 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-[#fff5f7] dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        aria-label="메뉴"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="6" width="18" height="2" rx="1" fill="currentColor" className="text-black dark:text-white" />
          <rect x="3" y="11" width="18" height="2" rx="1" fill="currentColor" className="text-black dark:text-white" />
          <rect x="3" y="16" width="18" height="2" rx="1" fill="currentColor" className="text-black dark:text-white" />
        </svg>
      </button>
    </header>
  )
}

export default Header
