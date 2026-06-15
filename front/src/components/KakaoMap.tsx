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

declare global {
  interface Window {
    kakao: any
  }
}

function KakaoMap({ activities }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const overlaysRef = useRef<any[]>([])
  const polylineRef = useRef<any>(null)

  const sorted = [...activities]
    .filter((a) => a.latitude !== 0 && a.longitude !== 0)
    .sort((a, b) => ACTIVITY_ORDER.indexOf(a.activityType) - ACTIVITY_ORDER.indexOf(b.activityType))

  // 좌표 변경 감지용 key — 위/경도가 바뀌면 이펙트 재실행
  const coordKey = sorted.map((a) => `${a.activityType}:${a.latitude},${a.longitude}`).join('|')

  useEffect(() => {
    if (!mapRef.current || sorted.length === 0) return

    const draw = (map: any) => {
      // 기존 마커 제거
      overlaysRef.current.forEach((o) => o.setMap(null))
      overlaysRef.current = []

      // 기존 폴리라인 제거
      polylineRef.current?.setMap(null)
      polylineRef.current = null

      const { kakao } = window
      const coords: any[] = []

      sorted.forEach((activity, idx) => {
        const pos = new kakao.maps.LatLng(activity.latitude, activity.longitude)
        coords.push(pos)

        const content = `
          <div style="
            width: 28px; height: 28px;
            background: #ff5283; color: white;
            border-radius: 50%; font-size: 13px; font-weight: bold;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.25); border: 2px solid white;
          ">${idx + 1}</div>
        `
        const overlay = new kakao.maps.CustomOverlay({ position: pos, content, yAnchor: 1 })
        overlay.setMap(map)
        overlaysRef.current.push(overlay)
      })

      if (coords.length > 1) {
        const polyline = new kakao.maps.Polyline({
          path: coords,
          strokeWeight: 2,
          strokeColor: '#ff5283',
          strokeOpacity: 0.7,
          strokeStyle: 'shortdash',
        })
        polyline.setMap(map)
        polylineRef.current = polyline

        const bounds = new kakao.maps.LatLngBounds()
        coords.forEach((c) => bounds.extend(c))
        map.setBounds(bounds)
      }
    }

    const init = () => {
      const { kakao } = window
      // mapRef.current null 이중 체크 (StrictMode 재마운트 타이밍 대응)
      if (!kakao?.maps || !mapRef.current) return

      if (!mapInstanceRef.current) {
        const center = new kakao.maps.LatLng(sorted[0].latitude, sorted[0].longitude)
        mapInstanceRef.current = new kakao.maps.Map(mapRef.current, { center, level: 5 })
      }

      draw(mapInstanceRef.current)
    }

    if (window.kakao?.maps) {
      init()
    } else if (!document.querySelector('script[src*="dapi.kakao.com"]')) {
      const script = document.createElement('script')
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAO_MAP_KEY}&autoload=false`
      script.onload = () => window.kakao.maps.load(init)
      document.head.appendChild(script)
    } else {
      window.kakao?.maps?.load(init)
    }

    return () => {
      mapInstanceRef.current = null
      overlaysRef.current = []
      polylineRef.current = null
    }
  }, [coordKey])

  if (sorted.length === 0) return null

  return (
    <div ref={mapRef} className="w-full rounded-2xl overflow-hidden" style={{ height: '280px' }} />
  )
}

export default KakaoMap
