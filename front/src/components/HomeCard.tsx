import { Link } from "react-router-dom";
import clsx from "clsx";

type Props = {
    image: string;
    title: string;
    subtitle: string;
    to?: string;
    imgPos?: string;
    imgClassName?: string;
};

export default function HomeCard({ image, title, subtitle, to, imgPos, imgClassName }: Props) {
    return (
        <article className="w-[360px] bg-white rounded-[32px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] overflow-hidden relative transition-transform hover:scale-[1.01]">
            <figure className="h-[200px] w-full overflow-hidden bg-[#FFF0E6]">
                <img
                    src={image}
                    alt={title}
                    className={clsx("h-full w-full object-cover", imgClassName)}
                    style={imgPos ? { objectPosition: imgPos } : undefined}
                    loading="lazy"
                    decoding="async"
                />
            </figure>

            <div className="px-6 pt-5 pb-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-[26px] leading-tight font-bold text-gray-900 tracking-tight">
                            {title}
                        </h3>
                        <p className="mt-2 text-[15px] text-gray-500 font-medium">
                            {subtitle}
                        </p>
                    </div>
                    {/* 하트 아이콘 */}
                    <div className="mt-1 text-[#FF789D]">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor"/>
                            <path d="M7 9H9L10 12L13 6L15 9H17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                </div>

                {/* 하러가기 */}
                <div className="mt-6">
                    {to ? (
                        <Link
                            to={to}
                            className="inline-flex items-center gap-1 text-[#FF5283] text-[16px] font-bold leading-none no-underline hover:opacity-80 transition-opacity"
                        >
                            하러가기
                            <svg width="20" height="20" viewBox="0 0 24 24" className="fill-current translate-y-[1px]" aria-hidden="true">
                                <path d="M12 4l1.41 1.41L8.83 10H20v2H8.83l4.58 4.59L12 18l-8-8 8-8z" transform="scale(-1,1) translate(-24,0)" />
                            </svg>
                        </Link>
                    ) : (
                        <span className="text-[#FF5283] text-[16px] font-bold leading-none">하러가기</span>
                    )}
                </div>
            </div>
        </article>
    );
}