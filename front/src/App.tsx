import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import MainPage from '@/pages/MainPage'
import CreatePage from '@/pages/CreatePage'
import ResultPage from '@/pages/ResultPage'
import CoursePage from '@/pages/CoursePage'
import MenuPage from '@/pages/MenuPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/result/:tempId" element={<ResultPage />} />
          <Route path="/course/:uuid" element={<CoursePage />} />
          <Route path="/menu" element={<MenuPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
