import axiosInstance from '@/api/axiosInstance'
import type { DashboardResponse } from '@/types/dashboard'

export const dashboardApi = {
  getDashboard: () =>
    axiosInstance.get<DashboardResponse>('/dashboard').then((res) => res.data),
}
