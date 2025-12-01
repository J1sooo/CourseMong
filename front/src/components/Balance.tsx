import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameScreen from '../pages/balance/BalanceQuestion';
import ResultScreen from '../pages/balance/BalanceResult';

// 이미지
import Q1A from '../assets/Q1_A.png'; import Q1B from '../assets/Q1_B.png';
import Q2A from '../assets/Q2_A.png'; import Q2B from '../assets/Q2_B.png';
import Q3A from '../assets/Q3_A.png'; import Q3B from '../assets/Q3_B.png';
import Q4A from '../assets/Q4_A.png'; import Q4B from '../assets/Q4_B.png';
import Q5A from '../assets/Q5_A.png'; import Q5B from '../assets/Q5_B.png';
import Q6A from '../assets/Q6_A.png'; import Q6B from '../assets/Q6_B.png';
import Q7A from '../assets/Q7_A.png'; import Q7B from '../assets/Q7_B.png';
import Q8A from '../assets/Q8_A.png'; import Q8B from '../assets/Q8_B.png';
import Q9A from '../assets/Q9_A.png'; import Q9B from '../assets/Q9_B.png';
import Q10A from '../assets/Q10_A.png'; import Q10B from '../assets/Q10_B.png';
import Q11A from '../assets/Q11_A.png'; import Q11B from '../assets/Q11_B.png';
import Q12A from '../assets/Q12_A.png'; import Q12B from '../assets/Q12_B.png';
import Q13A from '../assets/Q13_A.png'; import Q13B from '../assets/Q13_B.png';
import Q14A from '../assets/Q14_A.png'; import Q14B from '../assets/Q14_B.png';
import Q15A from '../assets/Q15_A.png'; import Q15B from '../assets/Q15_B.png';

export interface QuestionData {
    id: number;
    title: string;
    optionA: string;
    optionB: string;
    imgA: string;
    imgB: string;
}

export interface CalculatedResult {
    id: number;
    code: string;
    name: string;
    summary: string;
    hashtags: string[];
    best_match: number[];
    worst_match: number[];
    percentage?: number;
}

const QUESTION_IMAGES: Record<number, { A: string; B: string }> = {
    1: { A: Q1A, B: Q1B }, 2: { A: Q2A, B: Q2B }, 3: { A: Q3A, B: Q3B },
    4: { A: Q4A, B: Q4B }, 5: { A: Q5A, B: Q5B }, 6: { A: Q6A, B: Q6B },
    7: { A: Q7A, B: Q7B }, 8: { A: Q8A, B: Q8B }, 9: { A: Q9A, B: Q9B },
    10: { A: Q10A, B: Q10B }, 11: { A: Q11A, B: Q11B }, 12: { A: Q12A, B: Q12B },
    13: { A: Q13A, B: Q13B }, 14: { A: Q14A, B: Q14B }, 15: { A: Q15A, B: Q15B },
};

function normalizeQuestion(raw: any): QuestionData | null {
    if (!raw || typeof raw !== 'object') return null;

    const rawId = raw.question_id ?? raw.questionId ?? raw.id;
    const id =
        typeof rawId === 'string'
            ? parseInt(rawId, 10)
            : typeof rawId === 'number'
                ? rawId
                : NaN;
    if (!Number.isFinite(id)) return null;

    const title =
        (raw.question_content ??
            raw.questionContent ??
            raw.title ??
            '') as string;

    const optionA =
        (raw.answer_a ??
            raw.answerA ??
            raw.optionA ??
            '') as string;

    const optionB =
        (raw.answer_b ??
            raw.answerB ??
            raw.optionB ??
            '') as string;

    return {
        id,
        title: title.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        imgA: QUESTION_IMAGES[id]?.A ?? '',
        imgB: QUESTION_IMAGES[id]?.B ?? '',
    };
}

const Balance: React.FC = () => {
    const navigate = useNavigate();

    const [questions, setQuestions] = useState<QuestionData[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<number>(1);
    const [screenState, setScreenState] = useState<'loading_questions' | 'game' | 'loading_result' | 'result'>('loading_questions');
    const [answers, setAnswers] = useState<Map<number, string>>(new Map());
    const [calculatedResult, setCalculatedResult] = useState<CalculatedResult | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await fetch('/api/balance-game/questions');
                if (!res.ok) {
                    const text = await res.text().catch(() => '');
                    console.error('Fetch failed', res.status, res.statusText, text);
                    throw new Error(`질문 불러오기 실패: ${res.status}`);
                }

                const json = await res.json();
                console.log('[Balance] raw response =>', json);

                const arr = Array.isArray(json) ? json : json.questions ?? json.data ?? [];
                const merged = arr
                    .map((q: any) => normalizeQuestion(q))
                    .filter((q: QuestionData | null): q is QuestionData => !!q);

                if (merged.length === 0) {
                    throw new Error('질문 데이터 매핑 실패');
                }

                setQuestions(merged);
                setScreenState('game');
            } catch (err) {
                console.error(err);
                alert('질문을 불러오지 못했습니다.');
                navigate('/');
            }
        };
        fetchQuestions();
    }, [navigate]);

    const totalQuestions = useMemo(() => questions.length, [questions]);

    const submitAnswers = async (finalAnswers: Map<number, string>) => {
        setScreenState('loading_result');
        try {
            const answersObject = Object.fromEntries(finalAnswers);
            const response = await fetch('/api/balance-game/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: answersObject }),
            });

            if (!response.ok) throw new Error(`채점 실패: ${response.status}`);

            const data = await response.json();

            const resultData: CalculatedResult = {
                ...data.type,
                percentage: typeof data.type?.percentage === 'number'
                    ? data.type.percentage
                    : Math.floor(Math.random() * 30) + 10,
            };

            setCalculatedResult(resultData);
            setScreenState('result');
        } catch (error) {
            console.error(error);
            alert('결과 채점 중 오류가 발생했습니다.');
            handleRestart();
        }
    };

    const handleNextQuestion = (selection: 'A' | 'B') => {
        const q = questions[currentQuestion - 1];
        if (!q) return;

        const nextAnswers = new Map(answers).set(q.id, selection);
        setAnswers(nextAnswers);

        if (currentQuestion < totalQuestions) {
            setCurrentQuestion((prev) => prev + 1);
        } else {
            submitAnswers(nextAnswers);
        }
    };

    const handleRestart = () => {
        setCurrentQuestion(1);
        setScreenState('game');
        setAnswers(new Map());
        setCalculatedResult(null);
    };

    const handleGoHome = () => {
        navigate('/');
    };

    if (screenState === 'loading_questions') {
        return <div className="min-h-screen flex justify-center items-center">질문 로딩 중...</div>;
    }

    if (screenState === 'loading_result') {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-[#FFF9FA]">
                <div className="loading loading-spinner loading-lg text-[#FF5E85]" />
                <p className="mt-4 text-gray-500">결과 분석 중...</p>
            </div>
        );
    }

    if (screenState === 'result' && calculatedResult) {
        return (
            <ResultScreen
                resultData={calculatedResult}
                onRestart={handleRestart}
                onGoHome={handleGoHome}
            />
        );
    }

    const currentData = questions[currentQuestion - 1];

    return (
        <GameScreen
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
            questions={questions}
            currentData={currentData}
            onNextQuestion={handleNextQuestion}
            onSelectQuestion={setCurrentQuestion}
        />
    );
};

export default Balance;
