import React, { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Choice from "../../components/Choice.tsx";
import Header from "../../components/Header";
import logo from "../../assets/logo.png";

import {
    LocationIcon,
    CalendarIcon,
    FolderHeartIcon,
    PaletteIcon,
    StarBoxIcon,
    UtensilsIcon
} from "../../components/Icon";

const LOCATIONS: Record<string, string[]> = {
    "서울": ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"],
    "경기": ["수원시", "성남시", "의정부시", "안양시", "부천시", "광명시", "평택시", "동두천시", "안산시", "고양시", "과천시", "구리시", "남양주시", "오산시", "시흥시", "군포시", "의왕시", "하남시", "용인시", "파주시", "이천시", "안성시", "김포시", "화성시", "광주시", "양주시", "포천시", "여주시", "연천군", "가평군", "양평군"],
    "부산": ["강서구", "금정구", "기장군", "남구", "동구", "동래구", "부산진구", "북구", "사상구", "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구"],
    "대구": ["군위군", "남구", "달서구", "달성군", "동구", "북구", "서구", "수성구", "중구"],
    "인천": ["강화군", "계양구", "남동구", "동구", "미추홀구", "부평구", "서구", "연수구", "옹진군", "중구"],
    "광주": ["광산구", "남구", "동구", "북구", "서구"],
    "대전": ["대덕구", "동구", "서구", "유성구", "중구"],
    "울산": ["남구", "동구", "북구", "울주군", "중구"],
    "세종": ["세종시"],
    "강원": ["강릉시", "동해시", "삼척시", "속초시", "원주시", "춘천시", "태백시", "고성군", "양구군", "양양군", "영월군", "인제군", "정선군", "철원군", "평창군", "홍천군", "화천군", "횡성군"],
    "충북": ["제천시", "청주시", "충주시", "괴산군", "단양군", "보은군", "영동군", "옥천군", "음성군", "증평군", "진천군"],
    "충남": ["계룡시", "공주시", "논산시", "당진시", "보령시", "서산시", "아산시", "천안시", "금산군", "부여군", "서천군", "예산군", "청양군", "태안군", "홍성군"],
    "전북": ["군산시", "김제시", "남원시", "익산시", "전주시", "정읍시", "고창군", "무주군", "부안군", "순창군", "완주군", "임실군", "장수군", "진안군"],
    "전남": ["광양시", "나주시", "목포시", "순천시", "여수시", "강진군", "고흥군", "곡성군", "구례군", "담양군", "무안군", "보성군", "신안군", "영광군", "영암군", "완도군", "장성군", "장흥군", "진도군", "함평군", "해남군", "화순군"],
    "경북": ["경산시", "경주시", "구미시", "김천시", "문경시", "상주시", "안동시", "영주시", "영천시", "포항시", "고령군", "봉화군", "성주군", "영덕군", "영양군", "예천군", "울릉군", "울진군", "의성군", "청도군", "청송군", "칠곡군"],
    "경남": ["거제시", "김해시", "밀양시", "사천시", "양산시", "진주시", "창원시", "통영시", "거창군", "고성군", "남해군", "산청군", "의령군", "창녕군", "하동군", "함안군", "함양군", "합천군"],
    "제주": ["서귀포시", "제주시"]
};

type PreferKey = "MORNING" | "LUNCH" | "AFTERNOON" | "DINNER";
const HOBBIES = ["영화","게임","요리","드라이브","스포츠","쇼핑","맛집탐방","자연","여행","캠핑","그림","보드게임"];
const THEMES  = ["로맨틱","액티브","힐링","기념일","여유","재미"];
const MEALS   = ["아무거나","맛집","한식","중식","일식","양식","술집","카페 · 디저트"];
const fmt = (iso: string) => (iso ? iso.replaceAll("-", ".") : "");

export default function PlannerPage() {
    const nav = useNavigate();

    const [city, setCity] = useState("");
    const [district, setDistrict] = useState("");

    const [date, setDate] = useState("");
    const [hobbySel, setHobbySel] = useState<string[]>([]);
    const [themeSel, setThemeSel] = useState<string[]>([]);
    const [prefer, setPrefer] = useState<PreferKey[]>([]);
    const [budget, setBudget] = useState(30000);
    const [ignore, setIgnore] = useState(false);

    const [lunchSel, setLunchSel] = useState<string[]>([]);
    const [dinnerSel, setDinnerSel] = useState<string[]>([]);

    const showLunch  = useMemo(() => prefer.includes("LUNCH"), [prefer]);
    const showDinner = useMemo(() => prefer.includes("DINNER"), [prefer]);

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCity(e.target.value);
        setDistrict("");
    };

    const toggle = useCallback(<T,>(list: T[], v: T, set: (s: T[]) => void) => {
        set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
    }, []);

    const handleReset = useCallback(() => {
        setCity(""); setDistrict(""); setDate("");
        setHobbySel([]); setThemeSel([]); setPrefer([]);
        setLunchSel([]); setDinnerSel([]);
        setBudget(30000); setIgnore(false);
    }, []);

    const handleSeeCourse = useCallback(() => nav("/planner"), [nav]);

    // 날짜 인풋
    const hiddenDateRef = useRef<HTMLInputElement>(null);
    const openCalendar = useCallback(() => {
        const el = hiddenDateRef.current;
        if (!el) return;
        if (el.showPicker) el.showPicker(); else { el.focus(); el.click(); }
    }, []);
    const onDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setDate(e.target.value);
        e.target.blur();
    }, []);

    return (
        <div className="min-h-screen w-full bg-white flex justify-center">
            <div className="app-shell w-[430px] min-h-screen bg-[#FFF9FA] relative overflow-hidden">
                <Header
                    title="코스 플래너"
                    subtitle="취향에 맞는 완벽한 데이트 코스를 찾아보세요"
                    sheetWidth={360}
                    sheetContent={
                        <>
                            <div className="px-6 pt-6 pb-3 border-b border-neutral/10">
                                <img src={logo} alt="코스몽" className="h-12 w-auto" />
                            </div>
                            <nav className="px-6 py-4 space-y-5">
                                <button type="button" onClick={() => nav("/")} className="cursor-pointer flex items-center gap-3 text-lg font-semibold">
                                    🏠  홈
                                </button>
                            </nav>
                        </>
                    }
                />

                <main className="px-5 pb-28 pt-2">
                    {/* 지역 */}
                    <div className="mt-4">
                        <TitleRow icon={<LocationIcon />} title="지역" />
                        <div className="flex gap-3 mt-2">
                            {/* 시/도 */}
                            <select
                                value={city}
                                onChange={handleCityChange}
                                className="select w-full h-11 rounded-xl text-[16px] border-[#FF8FB1] text-[#FF5C8A] focus:outline-none focus:border-[#FF8FB1] bg-white"
                            >
                                <option value="" disabled>시/도 선택</option>
                                {Object.keys(LOCATIONS).map((loc) => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>

                            {/* 군/구 */}
                            <select
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                                className="select w-full h-11 rounded-xl text-[16px] border-[#FF8FB1] text-[#FF5C8A] focus:outline-none focus:border-[#FF8FB1] bg-white"
                                disabled={!city}
                            >
                                <option value="" disabled>군/구 선택</option>
                                {city && LOCATIONS[city]?.map((dist) => (
                                    <option key={dist} value={dist}>{dist}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 날짜 */}
                    <div className="mt-8">
                        <TitleRow icon={<CalendarIcon />} title="날짜" />
                        <div className="relative mt-2">
                            <input
                                type="text"
                                readOnly
                                value={fmt(date)}
                                placeholder="날짜 선택"
                                onClick={openCalendar}
                                className="input w-full h-11 rounded-xl text-[16px] pr-12 pl-4 cursor-pointer border-[#FF8FB1] text-[#FF5C8A] bg-white placeholder:text-[#FF5C8A]/60 focus:outline-none focus:border-[#FF8FB1]"
                            />
                            <button
                                type="button"
                                onClick={openCalendar}
                                className="absolute inset-y-0 right-3 my-auto grid place-items-center text-[#FF5C8A]"
                            >
                                <CalendarIcon />
                            </button>
                            <input
                                ref={hiddenDateRef}
                                type="date"
                                value={date}
                                onChange={onDateChange}
                                className="native-date"
                            />
                        </div>
                    </div>

                    {/* 공통 취미 */}
                    <div className="mt-8">
                        <TitleRow icon={<FolderHeartIcon />} title="공통 취미" />
                        <div className="flex flex-wrap gap-2.5 mt-2">
                            {HOBBIES.map((h) => (
                                <Choice
                                    key={h}
                                    label={h}
                                    selected={hobbySel.includes(h)}
                                    onClick={() => toggle(hobbySel, h, setHobbySel)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 테마 */}
                    <div className="mt-8">
                        <TitleRow icon={<PaletteIcon />} title="테마" />
                        <div className="flex flex-wrap gap-2.5 mt-2">
                            {THEMES.map((t) => (
                                <Choice
                                    key={t}
                                    label={t}
                                    selected={themeSel.includes(t)}
                                    onClick={() => toggle(themeSel, t, setThemeSel)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 추천받고 싶은 활동 */}
                    <div className="mt-8">
                        <TitleRow icon={<StarBoxIcon />} title="추천받고 싶은 활동" />
                        <div className="flex flex-wrap gap-2.5 mt-2">
                            <Choice label="오전 활동"  selected={prefer.includes("MORNING")}   onClick={() => toggle(prefer, "MORNING", setPrefer)} />
                            <Choice label="점심 식사"  selected={prefer.includes("LUNCH")}     onClick={() => toggle(prefer, "LUNCH", setPrefer)} />
                            <Choice label="오후 활동"  selected={prefer.includes("AFTERNOON")} onClick={() => toggle(prefer, "AFTERNOON", setPrefer)} />
                            <Choice label="저녁 식사"  selected={prefer.includes("DINNER")}    onClick={() => toggle(prefer, "DINNER", setPrefer)} />
                        </div>
                    </div>

                    {/* 점심 식사 */}
                    {showLunch && (
                        <div className="mt-8 animate-fade-in-down">
                            <TitleRow icon={<UtensilsIcon />} title="점심 식사" />
                            <div className="flex flex-wrap gap-2.5 mt-2">
                                {MEALS.map((m) => (
                                    <Choice
                                        key={`lunch-${m}`}
                                        label={m}
                                        selected={lunchSel.includes(m)}
                                        onClick={() => toggle(lunchSel, m, setLunchSel)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 저녁 식사 */}
                    {showDinner && (
                        <div className="mt-8 animate-fade-in-down">
                            <TitleRow icon={<UtensilsIcon />} title="저녁 식사" />
                            <div className="flex flex-wrap gap-2.5 mt-2">
                                {MEALS.map((m) => (
                                    <Choice
                                        key={`dinner-${m}`}
                                        label={m}
                                        selected={dinnerSel.includes(m)}
                                        onClick={() => toggle(dinnerSel, m, setDinnerSel)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 예산 */}
                    <div className="mt-10 rounded-[24px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] px-6 py-7">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[18px] font-bold text-black">예산</h3>
                            <span className="text-[20px] font-bold text-[#FF5283]">
                                {budget.toLocaleString()} 원
                            </span>
                        </div>

                        <div className="px-1">
                            <input
                                type="range"
                                min={30000}
                                max={300000}
                                step={10000}
                                value={budget}
                                onChange={(e) => setBudget(+e.target.value)}
                                className="range range-pink w-full"
                                disabled={ignore}
                            />
                            <div className="mt-2 flex justify-between text-xs text-gray-400 font-medium">
                                <span>3만원</span><span>30만원</span>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center">
                            <label className="inline-flex items-center gap-2 cursor-pointer select-none group">
                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${ignore ? 'bg-[#FF5283] border-[#FF5283]' : 'bg-white border-[#F3AEC1]'}`}>
                                    {ignore && (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={ignore}
                                    onChange={(e) => setIgnore(e.target.checked)}
                                />
                                <span className={`text-[16px] font-bold ${ignore ? 'text-[#FF5283]' : 'text-black'}`}>
                                    상관없음
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* 버튼 */}
                    <div className="mt-8 space-y-3">
                        <button
                            type="button"
                            className="cursor-pointer w-full h-[56px] rounded-[28px] bg-[#FF5283] text-white text-[18px] font-bold shadow-[0_4px_12px_rgba(255,82,131,0.3)] hover:bg-[#ff3f75] active:scale-[0.98] transition-transform"
                            onClick={handleSeeCourse}
                        >
                            코스 보기
                        </button>
                        <button
                            type="button"
                            className="cursor-pointer w-full h-[56px] rounded-[28px] bg-white border border-[#FF5283] text-[#FF5283] text-[18px] font-bold hover:bg-pink-50 active:scale-[0.98] transition-transform"
                            onClick={handleReset}
                        >
                            조건 초기화
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}

function TitleRow({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="mb-1 flex items-center gap-2">
            <h3 className="text-[20px] font-bold text-black">{title}</h3>
            <div className="text-[#FF8FB1] translate-y-[1px]">
                {icon}
            </div>
        </div>
    );
}