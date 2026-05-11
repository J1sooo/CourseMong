import { useEffect, useRef } from 'react'
import type { ActivityType } from '@/types/course'

interface MapActivity {
  activityType: ActivityType
  latitude: number
  longitude: number
}

interface KakaoMapProps {
  activities: MapActivity[]
}

const ACTIVITY_ORDER: ActivityType[] = ['MORNING', 'LUNCH', 'AFTERNOON', 'DINNER']

const MARKER_COLORS: Record<ActivityType, string> = {
  MORNING: '#FF5283',
  LUNCH: '#FF93DF',
  AFTERNOON: '#FF5283',
  DINNER: '#E479C4',
}

declare global {
  interface Window {
    kakao: any
  }
}

function KakaoMap({ activities }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  // 좌표 있는 활동만, 순서대로 정렬
  const sorted = [...activities]
    .filter((a) => a.latitude !== 0 && a.longitude !== 0)
    .sort(
      (a, b) =>
        ACTIVITY_ORDER.indexOf(a.activityType) - ACTIVITY_ORDER.indexOf(b.activityType)
    )

  useEffect(() => {
    if (!mapRef.current || sorted.length === 0) return

    const init = () => {
      const { kakao } = window
      if (!kakao?.maps) return

      // 첫 번째 위치를 중심으로
      const center = new kakao.maps.LatLng(sorted[0].latitude, sorted[0].longitude)
      const map = new kakao.maps.Map(mapRef.current, {
        center,
        level: 5,
      })
      mapInstanceRef.current = map

      const coords: any[] = []

      sorted.forEach((activity, idx) => {
        const pos = new kakao.maps.LatLng(activity.latitude, activity.longitude)
        coords.push(pos)

        // 번호 마커 (겹침 방지)
        const content = `
          <div style="
            width: 28px;
            height: 28px;
            background: #ff5283;
            color: white;
            border-radius: 50%;
            font-size: 13px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
            border: 2px solid white;
          ">
            ${idx + 1}
          </div>
        `
        const overlay = new kakao.maps.CustomOverlay({
          position: pos,
          content,
          yAnchor: 1,
        })
        overlay.setMap(map)
      })

      // 점선 연결
      if (coords.length > 1) {
        const polyline = new kakao.maps.Polyline({
          path: coords,
          strokeWeight: 2,
          strokeColor: '#ff5283',
          strokeOpacity: 0.7,
          strokeStyle: 'shortdash',
        })
        polyline.setMap(map)
      }

      // 모든 마커가 보이도록 bounds 조정
      if (coords.length > 1) {
        const bounds = new kakao.maps.LatLngBounds()
        coords.forEach((c) => bounds.extend(c))
        map.setBounds(bounds)
      }
    }

    if (window.kakao?.maps) {
      init()
      return
    }

    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_KEY}&autoload=false`
    script.onload = () => window.kakao.maps.load(init)
    document.head.appendChild(script)
  }, [sorted.length])

  if (sorted.length === 0) return null

  return (
    <div
      ref={mapRef}
      className="w-full rounded-2xl overflow-hidden"
      style={{ height: '280px' }}
    />
  )
}

export default KakaoMap
