import React from "react";
import clsx from "clsx";

type ChipProps = {
    label: string;
    selected?: boolean;
    onClick?: () => void;
    className?: string;
};

function ChoiceBase({ label, selected, onClick, className = "" }: ChipProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={!!selected}
            className={clsx(
                "h-10 px-4 rounded-full border text-[16px] leading-[18px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8FB1]/50",
                selected
                    ? "bg-[#FFF0F4] border-[#FF8FB1] text-[#ff4f7f]"
                    : "bg-white border-[#F3AEC1] text-[#d65f86] hover:bg-[#FFF5F7]",
                className
            )}
        >
            {label}
        </button>
    );
}

export default React.memo(ChoiceBase);
