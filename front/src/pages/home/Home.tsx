import { useState } from "react";
import { Link } from "react-router-dom";
import { MenuIcon } from "../../components/Icon";
import RightSheet from "../../components/RightSheet";
import HomeCard from "../../components/HomeCard";
import logo from "../../assets/logo.png";
import planner from "../../assets/planner-image.png";
import balance from "../../assets/balance-game-image.png";

export default function Home() {
    const [open, setOpen] = useState(false);

    return (
        <main className="relative h-full px-4 pb-10 pt-0 overflow-hidden bg-[#FFF9FA]">

            {/* 상단 바 */}
            <section className="-mx-4 bg-white border-b border-neutral/10 relative z-10">
                <div className="px-6 pt-6 pb-3 flex items-center justify-center">
                    <img src={logo} alt="코스몽" className="h-16 w-auto" />
                    {/* 우측 상단 슬라이드*/}
                    <button
                        aria-label="메뉴 열기"
                        onClick={() => setOpen(true)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center rounded-full hover:bg-pink-50 transition-colors"
                    >
                        <MenuIcon className="w-7 h-7" />
                    </button>
                </div>
                <p className="text-center text-neutral/70 pb-3">한번의 픽으로 완성되는 코스</p>
            </section>

            <RightSheet open={open} onClose={() => setOpen(false)} width={360}>
                <div className="px-6 pt-6 pb-3 border-b border-neutral/10 flex justify-center">
                    <img src={logo} alt="코스몽" className="h-12 w-auto" />
                </div>
                <nav className="px-6 py-4 space-y-5">
                    <Link
                        to="/"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 text-lg font-semibold text-gray-800 transition-colors"
                    >
                        🏠 홈
                    </Link>
                </nav>
            </RightSheet>

            <div className="flex flex-col items-center space-y-10 pt-6 overflow-y-auto pb-20">
                <HomeCard
                    image={planner}
                    title="코스 플래너"
                    subtitle="데이트 코스 추천"
                    to="/planner"
                    imgClassName="object-[50%_28%] scale-105"
                />
                <HomeCard
                    image={balance}
                    title="밸런스 게임"
                    subtitle="서로의 취향 알아가기"
                    to="/balance"
                    imgClassName="object-top"
                />
            </div>
        </main>
    );
}