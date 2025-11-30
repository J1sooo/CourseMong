import React from "react";

type Props = { children: React.ReactNode; className?: string };

export default function MobileFrame({ children, className = "" }: Props) {
    return (
        <div
            className={[
                "w-full max-w-[390px] md:max-w-[430px] min-h-screen bg-[#FFF9FA]",

                "md:shadow-[0_0_40px_rgba(0,0,0,0.08)]",

                "overflow-hidden",
                "flex flex-col",
                className,
            ].join(" ")}
        >
            {children}
        </div>
    );
}