import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Star, MapPin, Clock, Phone, Utensils, X, RefreshCw } from 'lucide-react';
import type { ActivityUI } from '../pages/planner/CourseResult';

interface Props {
    open: boolean;
    place: ActivityUI | null;
    onClose: () => void;
    onReRecommend: () => void;
}

export default function PlaceDetailSheet({ open, place, onClose, onReRecommend }: Props) {
    const [shouldRender, setShouldRender] = useState(open);
    const [isVisible, setIsVisible] = useState(false);
    const [host, setHost] = useState<Element | null>(null);

    // 이미지 URL
    const [placeImageUrl, setPlaceImageUrl] = useState<string>("");

    useEffect(() => {
        const target = document.querySelector('.app-shell');
        if (target) setHost(target);
    }, []);

    useEffect(() => {
        if (open) {
            setShouldRender(true);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setIsVisible(true));
            });

            if (place) {
                fetchNaverImage(place.activityName);
            }
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setShouldRender(false), 300);
            return () => clearTimeout(timer);
        }
    }, [open, place]);

    // 이미지 검색 api
    const fetchNaverImage = async (query: string) => {
        setPlaceImageUrl("");

        const CLIENT_ID = import.meta.env.VITE_NAVER_SEARCH_CLIENT_ID;
        const CLIENT_SECRET = import.meta.env.VITE_NAVER_SEARCH_CLIENT_SECRET;

        try {
            const response = await fetch(`/naver-search/v1/search/image?query=${encodeURIComponent(query)}&display=1&sort=sim`, {
                method: 'GET',
                headers: {
                    'X-Naver-Client-Id': CLIENT_ID,
                    'X-Naver-Client-Secret': CLIENT_SECRET,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.items && data.items.length > 0) {
                    setPlaceImageUrl(data.items[0].link); // 첫 번째 이미지 사용
                }
            }
        } catch (error) {
            console.error("이미지 검색 실패:", error);
        }
    };

    if (!shouldRender || !place || !host) return null;

    const displayImage = placeImageUrl || `https://placehold.co/600x400/FFE5EE/FF5E85?text=${encodeURIComponent(place.activityName)}`;

    return createPortal(
        <div className="absolute inset-0 z-[100] flex flex-col justify-end overflow-hidden">

            <div
                className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ease-in-out ${
                    isVisible ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={onClose}
            />

            <div
                className={`relative w-full bg-white rounded-t-[32px] shadow-[0_-4px_20px_rgba(0,0,0,0.1)] flex flex-col max-h-[85%] transition-transform duration-300 ease-out ${
                    isVisible ? 'translate-y-0' : 'translate-y-full'
                }`}
            >
                {/* 헤더 */}
                <div className="px-6 pt-7 pb-4 flex justify-between items-start shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                            {place.activityName}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* 컨텐츠 영역 */}
                <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">

                    <div className="w-full aspect-video bg-gray-100 rounded-2xl mb-5 overflow-hidden shadow-inner relative">
                        {/* 이미지 */}
                        <img
                            src={displayImage}
                            alt={place.activityName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://placehold.co/600x400/FFE5EE/FF5E85?text=${encodeURIComponent(place.activityName)}`;
                            }}
                        />
                        {place.rating && (
                            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                <span className="text-xs font-bold text-gray-800">{place.rating}</span>
                            </div>
                        )}
                    </div>

                    <p className="text-gray-600 text-[15px] leading-relaxed mb-6 font-medium">
                        {place.activityContent}
                    </p>

                    {/* 대표 메뉴 */}
                    {place.recommendationFoods && place.recommendationFoods.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                                <Utensils className="w-4 h-4 text-[#FF5E85]" />
                                대표 메뉴
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {place.recommendationFoods.map((food, idx) => (
                                    <div key={idx} className="bg-[#F8F9FA] px-4 py-3 rounded-xl flex flex-col justify-center">
                                        <span className="text-sm font-medium text-gray-800 mb-0.5">{food.foodName}</span>
                                        <span className="text-sm font-bold text-[#FF5E85]">
                                            {food.foodPrice.toLocaleString()}원
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-50 rounded-2xl p-5 space-y-4 border border-gray-100">
                        <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                            <div>
                                <span className="block text-xs font-bold text-gray-400 mb-0.5">주소</span>
                                <span className="text-sm text-gray-700 font-medium">{place.location}</span>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-3 border-t border-gray-200/50">
                            <div className="flex-1 flex items-start gap-3">
                                <Clock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                    <span className="block text-xs font-bold text-gray-400 mb-0.5">영업시간</span>
                                    <span className="text-sm text-gray-700 font-medium">
                                        {place.businessHours || "정보 없음"}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 flex items-start gap-3">
                                <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                <div>
                                    <span className="block text-xs font-bold text-gray-400 mb-0.5">전화번호</span>
                                    <span className="text-sm text-gray-700 font-medium">
                                        {place.tellNumber || "정보 없음"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-5 bg-white border-t border-gray-100 flex flex-col gap-3 shrink-0 pb-8">
                    <button
                        onClick={onReRecommend}
                        className="cursor-pointer w-full h-[52px] bg-[#FF5E85] text-white rounded-2xl font-bold text-[17px] shadow-md hover:bg-[#ff4773] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5" />
                        재추천받기
                    </button>
                    <button
                        onClick={onClose}
                        className="cursor-pointer w-full h-[52px] bg-white border border-gray-200 text-gray-500 rounded-2xl font-bold text-[17px] hover:bg-gray-50 active:scale-[0.98] transition-all"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>,
        host
    );
}