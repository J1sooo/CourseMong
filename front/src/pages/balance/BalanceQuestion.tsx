import React from 'react';
import { Heart } from 'lucide-react';
import type { QuestionData } from '../../components/Balance';
import Header from "../../components/Header";
import {useNavigate} from "react-router-dom";
import logo from "../../assets/logo.png";

interface GameScreenProps {
    currentQuestion: number;
    totalQuestions: number;
    questions: QuestionData[];
    currentData: QuestionData;
    onNextQuestion: (selection: 'A' | 'B') => void;
    onSelectQuestion: (step: number) => void;
    onGoHome: () => void;
}

const BalanceQuestion: React.FC<GameScreenProps> = ({
                                                        currentQuestion,
                                                        totalQuestions,
                                                        questions,
                                                        currentData,
                                                        onNextQuestion,
                                                        onSelectQuestion,
                                                    }) => {
    useNavigate();
    const nav = useNavigate();
    return (
        <div className="min-h-screen w-full bg-white flex justify-center">
            <div className="app-shell w-[430px] min-h-screen bg-[#FFF9FA] relative overflow-hidden">

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
                                <button type="button" onClick={() => nav("/")} className="cursor-pointer flex items-center gap-3 text-lg font-semibold">
                                    🏠  홈
                                </button>
                            </nav>
                        </>
                    }
                />

                <div className="flex justify-center items-center gap-2 mb-6 px-6 flex-wrap mt-10">
                </div>

                <main className="flex-1 flex flex-col px-6 items-center">

                    {/* 문제 점 */}
                    <div className="flex justify-center items-center gap-2 mb-6 px-6 flex-wrap -mt-8">
                        {questions.map((_, index) => {
                            const step = index + 1;
                            const isActive = step === currentQuestion;
                            return (
                                <button
                                    key={index}
                                    onClick={() => onSelectQuestion(step)}
                                    type="button"
                                    className={`rounded-full transition-all duration-300 cursor-pointer hover:brightness-90 ${
                                        isActive
                                            ? 'w-3 h-3 bg-[#FF6B95] scale-110 shadow-sm' 
                                            : 'w-2.5 h-2.5 bg-[#FFD1E0]'                
                                    }`}
                                    aria-label={`Go to question ${step}`}
                                />
                            );
                        })}
                    </div>

                    {/* 이미지 */}
                    <div className="flex gap-4 w-full mb-10 justify-between mt-4">
                        <div className="w-1/2 aspect-square rounded-[2rem] overflow-hidden shadow-md bg-[#FFF0F5]">
                            <img src={currentData.imgA} alt="Option A" className="w-full h-full object-cover sepia-[0.3] opacity-90 transition-transform duration-500"/>
                        </div>
                        <div className="w-1/2 aspect-square rounded-[2rem] overflow-hidden shadow-md bg-[#FFF0F5]">
                            <img src={currentData.imgB} alt="Option B" className="w-full h-full object-cover sepia-[0.3] opacity-90 transition-transform duration-500"/>
                        </div>
                    </div>

                    {/* 질문 */}
                    <div className="relative mb-10 text-center">
                        <h2 className="text-[1.35rem] font-bold text-black tracking-tight flex items-center justify-center gap-1">{currentData.title}</h2>
                        <Heart className="w-3.5 h-3.5 text-[#FFB6C1] fill-[#FFB6C1] absolute -bottom-3 left-1/2 transform -translate-x-1/2" />
                    </div>

                    {/* 버튼 */}
                    <div className="w-full relative flex flex-col gap-6 mb-8">
                        {/* A */}
                        <button onClick={() => onNextQuestion('A')} className="w-full bg-white h-[5.5rem] rounded-[1.5rem] shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center px-4 border border-white">
                            <span className="cursor-pointer text-gray-800 text-[1.05rem] font-medium tracking-tight whitespace-pre-wrap text-center leading-tight">{currentData.optionA}</span>
                        </button>

                        {/* VS */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                            <div className="bg-[#FF6B95] w-[3.5rem] h-[3.5rem] rounded-full flex items-center justify-center shadow-md border-[6px] border-[#FFF9FA]">
                                <span className="text-white font-black text-lg leading-none pt-0.5">VS</span>
                            </div>
                        </div>

                        {/* B */}
                        <button onClick={() => onNextQuestion('B')} className="w-full bg-white h-[5.5rem] rounded-[1.5rem] shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center px-4 border border-white">
                            <span className="cursor-pointer text-gray-800 text-[1.05rem] font-medium tracking-tight whitespace-pre-wrap text-center leading-tight">{currentData.optionB}</span>
                        </button>
                    </div>

                </main>

                <footer className="pb-12 text-center">
                    <span className="text-gray-300 text-xs font-light tracking-[0.2em]">{currentQuestion} / {totalQuestions}</span>
                </footer>
            </div>
        </div>
    );
};

export default BalanceQuestion;