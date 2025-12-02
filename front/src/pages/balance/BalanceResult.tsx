import React from 'react';
import { Share2, Clover, AlertTriangle, Gamepad2 } from 'lucide-react';
import Header from "../../components/Header";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";

// 결과 이미지
import R1 from '../../assets/balanceresult_1.png';
import R2 from '../../assets/balanceresult_2.png';
import R3 from '../../assets/balanceresult_3.png';
import R4 from '../../assets/balanceresult_4.png';
import R5 from '../../assets/balanceresult_5.png';
import R6 from '../../assets/balanceresult_6.png';
import R7 from '../../assets/balanceresult_7.png';
import R8 from '../../assets/balanceresult_8.png';

interface ResultData {
    id: number;
    code: string;
    name: string;
    summary: string;
    hashtags: string[];
    best_match: number[];
    worst_match: number[];
    percentage?: number;         // 유형 비율
    totalParticipants?: number;  // 전체 참여자 수
}

// 이미지 매핑
const TYPE_IMAGES: Record<number, string> = {
    1: R1, 2: R2, 3: R3, 4: R4,
    5: R5, 6: R6, 7: R7, 8: R8
};

const TYPE_NAMES: Record<number, string> = {
    1: '철벽 플래너',
    2: '조용한 안정러',
    3: '담장 안의 솔직토커',
    4: '로맨틱 슬로우쿠커',
    5: '오픈 액티브 플래너',
    6: '사교적 안정형',
    7: '자유 토커',
    8: '바람같은 낭만러',
};

interface ResultScreenProps {
    resultData: ResultData;
    onRestart: () => void;
    onGoHome: () => void;
}

const BalanceResult: React.FC<ResultScreenProps> = ({ resultData, onRestart }) => {
    const nav = useNavigate();

    if (!resultData) return null;

    const {
        id,
        name,
        summary,
        hashtags,
        percentage,
        best_match,
        worst_match,
        totalParticipants,
    } = resultData;

    const displayImage = TYPE_IMAGES[id] || R1;

    const bestMatchText = best_match?.map(id => TYPE_NAMES[id] || '').join(', ') || '없음';
    const worstMatchText = worst_match?.map(id => TYPE_NAMES[id] || '').join(', ') || '없음';

    const safePercentage =
        typeof percentage === 'number' ? Number(percentage.toFixed(1)) : 0;
    const safeTotalParticipants =
        typeof totalParticipants === 'number' ? totalParticipants : 0;

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `밸런스게임 테스트`,
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
            }
        } catch (err) {
            console.error(err);
        }
    };


    return (
        <div className="min-h-screen w-full bg-white flex justify-center">
            <div className="app-shell w-[430px] min-h-screen bg-[#FFF9FA] relative overflow-hidden flex flex-col">
                <Header
                    title="밸런스 게임"
                    subtitle="당신의 선택은?"
                    sheetWidth={360}
                    sheetContent={
                        <>
                            <div className="px-6 pt-6 pb-3 border-b border-neutral/10">
                                <img src={logo} alt="코스몽" className="h-12 w-auto" />
                            </div>
                            <nav className="px-6 py-4 space-y-5">
                                <button
                                    type="button"
                                    onClick={() => nav("/")}
                                    className="flex items-center gap-3 text-lg font-semibold"
                                >
                                    🏠  홈
                                </button>
                            </nav>
                        </>
                    }
                />

                <main className="flex-1 overflow-y-auto bg-[#FFF5F8] px-5 pt-6 pb-20">
                    {/* 결과 */}
                    <div className="bg-white rounded-[2rem] shadow-lg overflow-hidden mb-8">
                        <div className="bg-[#FF5E85] pt-10 pb-8 px-6 flex flex-col items-center text-center rounded-t-[2rem]">
                            <div className="w-32 h-32 rounded-full bg-white p-1 shadow-inner mb-5 overflow-hidden relative">
                                <img src={displayImage} alt={name} className="w-full h-full object-cover rounded-full"/>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">{name}</h2>
                            <div className="bg-white/90 px-5 py-1.5 rounded-full shadow-sm">
                                <span className="text-[#FF5E85] text-sm font-bold">
                                    전체 결과중 {safePercentage}% 차지
                                </span>
                            </div>
                        </div>

                        <div className="bg-white px-6 py-8 flex flex-col items-center">
                            <p className="text-gray-700 text-[0.95rem] leading-relaxed text-center mb-8 break-keep font-medium">
                                {summary}
                            </p>

                            <div className="w-full flex flex-col items-center mb-8">
                                <h3 className="text-black font-bold text-base mb-4">나의 특징</h3>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {hashtags?.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-1.5 rounded-full border border-[#FF5E85]/30 bg-[#FFF9FA] text-[#FF5E85] text-xs font-semibold shadow-[0_2px_8px_rgba(255,94,133,0.1)]"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full grid grid-cols-2 gap-3">
                                <div className="bg-[#FFF0F5] rounded-2xl p-4 flex flex-col items-center text-center shadow-sm border border-pink-50">
                                    <div className="w-10 h-10 rounded-full bg-[#FF7CA0] flex items-center justify-center text-white mb-2 shadow-sm">
                                        <Clover className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold text-black mb-1">잘 맞는</span>
                                    <span className="text-sm font-bold text-[#FF5E85] break-keep leading-tight">
                                        {bestMatchText}
                                    </span>
                                </div>
                                <div className="bg-[#EBF5FF] rounded-2xl p-4 flex flex-col items-center text-center shadow-sm border border-blue-50">
                                    <div className="w-10 h-10 rounded-full bg-[#6AAFFF] flex items-center justify-center text-white mb-2 shadow-sm">
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold text-black mb-1">잘 안 맞는</span>
                                    <span className="text-sm font-bold text-[#528BCC] break-keep leading-tight">
                                        {worstMatchText}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 mb-8 px-1">
                        <button onClick={handleShare} className="cursor-pointer w-full bg-[#FF5E85] text-white py-4 rounded-2xl font-bold text-lg shadow-md hover:bg-[#ff4773] transition flex items-center justify-center gap-2">
                            <Share2 className="w-5 h-5" />친구들에게 자랑하기
                        </button>
                        <button
                            onClick={onRestart}
                            className="cursor-pointer w-full bg-white border border-[#FF5E85] text-[#FF5E85] py-4 rounded-2xl font-bold text-lg shadow-sm hover:bg-pink-50 transition"
                        >
                            다시 하기
                        </button>
                    </div>
                    <div className="text-center mb-8">
                        <p className="text-gray-500 text-sm flex items-center justify-center gap-1.5">
                            <Gamepad2 className="w-4 h-4 text-gray-400" />
                            지금까지{' '}
                            <span className="text-[#FF5E85] font-bold">
                                {safeTotalParticipants.toLocaleString()}명
                            </span>
                            이 참여했어요!
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default BalanceResult;
