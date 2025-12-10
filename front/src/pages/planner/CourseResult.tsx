import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Coffee, Utensils, Trees, Film,
    Footprints, Car, Dog, RefreshCw, Bus, Train, MapPin,
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import NaverMap from "../../components/NaverMap";
import Header from "../../components/Header";
import logo from "../../assets/logo.png";
import type { DateCourseRequest, ActivityType } from "../../types/datecourse";
import PlaceDetailSheet from "../../components/PlaceDetailSheet";

type TransitMode = 'WALK' | 'BUS' | 'SUBWAY' | 'CAR' | 'TAXI';

interface TransitInfo {
    mode: TransitMode;
    duration: number;
    description?: string;
}

export interface ActivityUI extends ActivityType {
    activityType: ActivityType;
    activityName: string;
    activityContent: string;
    location: string;
    latitude: number;
    longitude: number;
    runningTime: number;
    recommendationFoods: { foodName: string; foodPrice: number }[];
    tags?: string[];

    rating?: string;        // 평점
    businessHours?: string; // 영업시간
    tellNumber?: string;    // 전화번호
    nextTransit?: TransitInfo;
}

interface DateCourseUI extends Omit<DateCourseRequest, 'activities'> {
    activities: ActivityUI[];
}

// 아이콘
const getPlaceIcon = (type: ActivityType) => {
    switch (type) {
        case 'CAFE': return <Coffee className="w-6 h-6 text-white" />;
        case 'RESTAURANT': return <Utensils className="w-6 h-6 text-white" />;
        case 'PARK': return <Trees className="w-6 h-6 text-white" />;
        case 'CINEMA': return <Film className="w-6 h-6 text-white" />;
        default: return <MapPin className="w-6 h-6 text-white" />;
    }
};

const getPlaceColor = () => "bg-gradient-to-br from-[#FF9EBF] to-[#FF5E85]";

const getTransitIcon = (mode: TransitMode) => {
    switch (mode) {
        case 'WALK': return <Footprints className="w-3 h-3" />;
        case 'BUS': return <Bus className="w-3 h-3" />;
        case 'SUBWAY': return <Train className="w-3 h-3" />;
        case 'CAR':
        case 'TAXI': return <Car className="w-3 h-3" />;
        default: return <Footprints className="w-3 h-3" />;
    }
};

const getTransitLabel = (mode: TransitMode) => {
    const labels: Record<string, string> = {
        'WALK': '도보', 'BUS': '버스', 'SUBWAY': '지하철', 'CAR': '자차', 'TAXI': '택시'
    };
    return labels[mode] || '이동';
};

const fetchRealTimeTransit = async (
    start: { lat: number, lng: number },
    end: { lat: number, lng: number }
): Promise<TransitInfo> => {
    const distance = Math.sqrt(
        Math.pow(end.lat - start.lat, 2) + Math.pow(end.lng - start.lng, 2)
    );
    const distKm = distance * 111;

    if (distKm < 1.5) {
        return {
            mode: 'WALK',
            duration: Math.ceil(distKm * 15),
            description: `약 ${(distKm * 1000).toFixed(0)}m`
        };
    } else {
        return {
            mode: 'TAXI',
            duration: Math.ceil(distKm * 2) + 5,
            description: `약 ${distKm.toFixed(1)}km`
        };
    }
};

// 네이버 지도 길찾기
const getNaverMapDirectionUrl = (start: {name: string, lat: number, lng: number}, end: {name: string, lat: number, lng: number}) => {
    return `https://map.naver.com/v5/directions/${start.lng},${start.lat},${encodeURIComponent(start.name)}/${end.lng},${end.lat},${encodeURIComponent(end.name)}/-/transit?c=${start.lng},${start.lat},15,0,0,0,dh`;
};


export default function CourseResult() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState("AI가 맞춤형 데이트 코스를 계획 중입니다...");

    const [courseData, setCourseData] = useState<DateCourseUI | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [selectedPlace, setSelectedPlace] = useState<ActivityUI | null>(null);

    const hasFetched = useRef(false);

    const generateCourse = async () => {
        if (!state) return;

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        setIsLoading(true);
        setError(null);
        setLoadingMessage("AI가 맞춤형 데이트 코스를 계획 중입니다...");

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `
                너는 커플 데이트 코스 추천 전문가야. 아래 사용자의 요구사항에 맞춰서 완벽한 데이트 코스를 짜줘.
                
                [사용자 정보]
                - 지역: ${state.city} ${state.district}
                - 날짜: ${state.date}
                - 취미: ${state.hobbySel.join(', ')}
                - 테마: ${state.themeSel.join(', ')}
                - 선호 일정: ${state.prefer.join(', ')}
                - 예산: ${state.budget === -1 ? '상관없음' : state.budget + '원'}
                - 음식 취향: 점심(${state.lunchSel.join(', ')}), 저녁(${state.dinnerSel.join(', ')})

                [조건]
                1. 추천 활동은 최소 3개 이상이어야 해.
                2. 활동 간의 이동 동선을 고려해서 실제 존재하는 장소 이름과 대략적인 위치(위도, 경도)를 포함해줘.
                3. **중요: 응답은 반드시 순수한 JSON 텍스트로만 해줘.** (마크다운 없이)
                4. activityType은 'CAFE', 'RESTAURANT', 'PARK', 'CINEMA', 'ETC' 중 하나.
                5. tags에는 'PARKING'(주차가능), 'PET'(애견동반) 정보를 추측해서 배열로 넣어줘.
                6. 각 장소에 대해 아래 정보도 JSON에 포함해줘.
                   - rating: 평점 (예: "4.5")
                   - businessHours: 영업시간 (예: "10:00 ~ 22:00")
                   - tellNumber: 전화번호 (없으면 없음으로 기재)

                [응답 스키마]
                {
                    "title": "코스 제목 (예: 로맨틱한 강남 데이트)",
                    "startAt": "${state.date}",
                    "endAt": "${state.date}",
                    "activities": [
                        {
                            "activityType": "RESTAURANT",
                            "activityName": "장소명",
                            "activityContent": "한줄 설명",
                            "location": "주소",
                            "latitude": 37.123456,
                            "longitude": 127.123456,
                            "runningTime": 90,
                            "rating": "4.8",
                            "businessHours": "11:00 ~ 21:00",
                            "tellNumber": "02-1234-5678",
                            "tags": ["PARKING"],
                            "recommendationFoods": [{"foodName": "메뉴명", "foodPrice": 10000}]
                        }
                    ]
                }
            `;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            const jsonStr = responseText.replace(/```json|```/g, "").trim();
            const aiData: DateCourseRequest = JSON.parse(jsonStr);

            setLoadingMessage("최적의 이동 경로와 시간을 계산하고 있습니다...");

            const activitiesWithTransit: ActivityUI[] = await Promise.all(aiData.activities.map(async (activity, index) => {
                let nextTransit: TransitInfo | undefined = undefined;

                if (index < aiData.activities.length - 1) {
                    const nextActivity = aiData.activities[index + 1];
                    nextTransit = await fetchRealTimeTransit(
                        { lat: activity.latitude, lng: activity.longitude },
                        { lat: nextActivity.latitude, lng: nextActivity.longitude }
                    );
                }

                return { ...activity, nextTransit } as ActivityUI;
            }));

            setCourseData({ ...aiData, activities: activitiesWithTransit });

        } catch (err) {
            console.error("Course Generation Error:", err);
            setError("코스를 생성하는 중 문제가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!state) {
            alert("잘못된 접근입니다.");
            navigate('/planner');
            return;
        }

        if (!hasFetched.current) {
            generateCourse();
            hasFetched.current = true;
        }
    }, [state, navigate]);

    // 재추천
    const handleReRecommend = () => {
        setSelectedPlace(null);
        generateCourse();
    };

    const handleSaveCourse = async () => {
        if (isSaving || !courseData) return;
        setIsSaving(true);

        try {
            // 임시 저장
            const response = await fetch('/api/date-courses/temporary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(courseData),
            });

            if (!response.ok) {
                throw new Error('코스 저장 실패');
            }

            // tempId 받기
            const tempId = await response.text();

            alert(`코스가 저장되었습니다!`);

            navigate('/planner/saved', {
                state: {
                    courseData: { ...courseData, id: tempId }
                }
            });

        } catch (error) {
            console.error(error);
            alert('저장에 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-full min-h-screen flex flex-col justify-center items-center bg-[#FFF9FA]">
                <div className="loading loading-spinner loading-lg text-[#FF5E85]"></div>
                <p className="mt-4 text-gray-500 font-medium animate-pulse">{loadingMessage}</p>
                <span className="text-xs text-gray-400 mt-2">(약 20~30초 소요됩니다)</span>
            </div>
        );
    }

    if (error || !courseData) {
        return (
            <div className="w-full h-full min-h-screen flex flex-col justify-center items-center bg-[#FFF9FA]">
                <p className="text-gray-500 mb-4 px-6 text-center break-keep font-medium">{error || "데이터가 없습니다."}</p>
                <button
                    onClick={() => { hasFetched.current = false; generateCourse(); }}
                    className="btn bg-[#FF5E85] text-white hover:bg-[#ff3f75] border-none"
                >
                    <RefreshCw className="w-4 h-4 mr-2"/> 다시 시도
                </button>
                <button onClick={() => navigate('/planner')} className="mt-4 text-sm text-gray-400 underline">
                    조건 다시 선택하기
                </button>
            </div>
        );
    }

    const mapPath = courseData.activities.map((act, index) => ({
        id: index,
        lat: act.latitude,
        lng: act.longitude
    }));

    return (
        <div className="min-h-screen w-full bg-white flex justify-center">
            <div className="app-shell w-[430px] min-h-screen bg-[#FFF9FA] relative overflow-hidden flex flex-col">
                <Header
                    title="추천 코스"
                    subtitle="취향에 맞지 않는 코스는 재추천 받아보세요!"
                    sheetWidth={360}
                    sheetContent={
                        <>
                            <div className="px-6 pt-6 pb-3 border-b border-neutral/10">
                                <img src={logo} alt="코스몽" className="h-12 w-auto" />
                            </div>
                            <nav className="px-6 py-4 space-y-5">
                                <button type="button" onClick={() => navigate("/")} className="flex items-center gap-3 text-lg font-semibold">
                                    🏠  홈
                                </button>
                            </nav>
                        </>
                    }
                />

                <main className="flex-1 overflow-y-auto pb-24">
                    {/* 지도 */}
                    <div className="w-full h-[450px] p-5">
                        <NaverMap path={mapPath} />
                    </div>

                    {/* 코스 */}
                    <div className="px-5">
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-pink-50">
                            <h2 className="text-lg font-bold mb-6 text-black">{courseData.title}</h2>
                            <div className="flex flex-col relative">
                                <div className="absolute left-[26px] top-6 bottom-10 w-[2px] bg-pink-100 -z-0"></div>

                                {courseData.activities.map((activity, index) => (
                                    <div key={index} className="relative z-10 mb-2 last:mb-0">
                                        <div className="flex items-start gap-4 mb-2">
                                            <div className={`w-[52px] h-[52px] rounded-full flex items-center justify-center shrink-0 shadow-md ${getPlaceColor()}`}>
                                                {getPlaceIcon(activity.activityType)}
                                            </div>

                                            {/* 장소 */}
                                            <button
                                                onClick={() => setSelectedPlace(activity)}
                                                className="cursor-pointer
 flex-1 text-left pt-3 group relative"
                                            >
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#FF5E85] transition-colors">{activity.activityName}</h3>
                                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                                    {activity.tags?.includes('PARKING') && <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[11px] font-medium text-gray-600">P 주차</span>}
                                                    {activity.tags?.includes('PET') && <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[11px] font-medium text-gray-600"><Dog className="w-3 h-3 inline mr-1"/>애견동반</span>}
                                                </div>
                                            </button>
                                        </div>

                                        {/* 이동 시간 */}
                                        {index < courseData.activities.length - 1 && activity.nextTransit && (
                                            <div className="flex items-center gap-2 ml-[16px] py-3">
                                                <div className="pl-10">
                                                    <div
                                                        className="inline-flex items-center gap-1.5 bg-[#EAEAEA] px-3 py-1 rounded-full text-xs font-medium text-gray-600 cursor-pointer hover:bg-[#FF5E85] hover:text-white transition-colors group"
                                                        onClick={() => {
                                                            const nextActivity = courseData.activities[index + 1];
                                                            const url = getNaverMapDirectionUrl(
                                                                { name: activity.activityName, lat: activity.latitude, lng: activity.longitude },
                                                                { name: nextActivity.activityName, lat: nextActivity.latitude, lng: nextActivity.longitude }
                                                            );
                                                            window.open(url, '_blank');
                                                        }}
                                                        title="네이버 지도 길찾기"
                                                    >
                                                        {getTransitIcon(activity.nextTransit.mode)}
                                                        <span>{getTransitLabel(activity.nextTransit.mode)} {activity.nextTransit.duration}분</span>
                                                        <MapPin className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="px-5 mt-6">
                        <button
                            onClick={handleSaveCourse}
                            disabled={isSaving}
                            className="cursor-pointer w-full bg-[#FF5E85] text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:bg-[#ff4773] active:scale-[0.98] transition-all disabled:bg-gray-400"
                        >
                            {isSaving ? '저장 중...' : '저장하기'}
                        </button>
                    </div>
                </main>
            </div>

            {/* 상세 정보 */}
            <PlaceDetailSheet
                open={!!selectedPlace}
                place={selectedPlace}
                onClose={() => setSelectedPlace(null)}
                onReRecommend={handleReRecommend}
            />
        </div>
    );
}
