import { useRef, useEffect } from 'react'
import './App.css'

function App() {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    useEffect(() => {
        const showMap = () => {
            // 중복 생성 방지
            if (!window.naver || !mapRef.current || mapInstanceRef.current) {
                return;
            }

            const mapOptions = {
                center: new window.naver.maps.LatLng(37.3595704, 127.105399),
                zoom: 10
            };

        mapInstanceRef.current = new window.naver.maps.Map(mapRef.current, mapOptions);
    };

        const script = document.createElement("script");
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${import.meta.env.VITE_NAVER_MAP_CLIENT_ID}`;
        script.onload = showMap;
        document.head.appendChild(script);

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <div ref={mapRef} style={{ width: "400px", height: "400px" }} />
    );
}

export default App
