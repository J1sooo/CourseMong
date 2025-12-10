import { useEffect, useRef } from 'react';

declare global {
    interface Window {
        naver: any;
    }
}

interface Location {
    id: number;
    lat: number;
    lng: number;
}

interface NaverMapProps {
    path?: Location[];
}

export default function NaverMap({ path = [] }: NaverMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);

    useEffect(() => {
        const initMap = () => {
            if (!mapRef.current || !window.naver) return;

            // 지도 초기화
            const center = path.length > 0
                ? new window.naver.maps.LatLng(path[0].lat, path[0].lng)
                : new window.naver.maps.LatLng(37.5665, 126.9780);

            const mapOptions = {
                center: center,
                zoom: 14,
                scaleControl: false,
                logoControl: false,
                mapDataControl: false,
            };

            const map = new window.naver.maps.Map(mapRef.current, mapOptions);
            mapInstance.current = map;

            // 경로
            if (path.length > 0) {
                const pathCoords: any[] = [];

                path.forEach((loc) => {
                    const position = new window.naver.maps.LatLng(loc.lat, loc.lng);
                    pathCoords.push(position);

                    new window.naver.maps.Marker({
                        position: position,
                        map: map,
                        icon: {
                            content: `
                                <div style="display:flex; justify-content:center; align-items:center;">
                                    <div style="background-color:#FF5E85; width:20px; height:20px; border-radius:50%; display:flex; justify-content:center; align-items:center; box-shadow:0 2px 4px rgba(0,0,0,0.3);">
                                        <div style="background-color:white; width:6px; height:6px; border-radius:50%;"></div>
                                    </div>
                                    <div style="position:absolute; bottom:-5px; width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-top:6px solid #FF5E85;"></div>
                                </div>
                            `,
                            anchor: new window.naver.maps.Point(10, 25),
                        }
                    });
                });

                // 경로 선
                new window.naver.maps.Polyline({
                    map: map,
                    path: pathCoords,
                    strokeColor: '#333333',
                    strokeOpacity: 0.8,
                    strokeWeight: 2,
                    strokeStyle: 'shortdash',
                });
            }
        };

        const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;

        const scriptId = 'naver-map-script';
        if (document.getElementById(scriptId)) {
            if (window.naver) initMap();
            return;
        }

        if (NAVER_CLIENT_ID) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_CLIENT_ID}`;
            script.async = true;
            script.onload = () => {
                if (window.naver) initMap();
            };
            document.head.appendChild(script);
        } else {
            console.warn("네이버 지도 Client ID가 설정되지 않았습니다.");
        }

    }, [path]);

    return (
        <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
        </div>
    );
}