import React, { useEffect, useState } from "react";
import clsx from "clsx";

interface RightSheetProps {
    open: boolean;
    onClose: () => void;
    width?: number;
    children: React.ReactNode;
    className?: string;
}

export default function RightSheet({
                                       open,
                                       onClose,
                                       width = 300,
                                       children,
                                       className,
                                   }: RightSheetProps) {
    const [isVisible, setIsVisible] = useState(open);

    useEffect(() => {
        if (open) setIsVisible(true);
        else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [open]);

    if (!isVisible) return null;

    return (
        <div className={clsx("absolute inset-0 z-50 overflow-hidden", className)}>

            {/* 배경 */}
            <div
                className={clsx(
                    "absolute inset-0 bg-black/40 transition-opacity duration-300",
                    open ? "opacity-100" : "opacity-0"
                )}
                onClick={onClose}
            />

            {/* 슬라이드 */}
            <div
                style={{ width: `${width}px` }}
                className={clsx(
                    "absolute top-0 right-0 h-full bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col",
                    open ? "translate-x-0" : "translate-x-full"
                )}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}