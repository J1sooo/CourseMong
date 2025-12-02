import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import PlannerPage from "./pages/planner/Planner.tsx";
import Balance from "./components/Balance.tsx";
import MobileFrame from "./components/MobileFrame";
import { useRef, useEffect } from 'react'
import './App.css'

export default function App() {
    return (
        // PC 배경 흰색
        <div className="w-full min-h-screen flex justify-center bg-white">
            <MobileFrame>
                <div className="flex-1">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/planner" element={<PlannerPage />} />
                        <Route path="/balance" element={<Balance />} />
                        <Route path="*" element={<Home />} />
                    </Routes>
                </div>
            </MobileFrame>
        </div>
    );
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
