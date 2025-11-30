import { type ReactNode, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MenuIcon } from "./Icon";

type TopBarProps = {
    title: string;
    subtitle?: string;
    onRightClick?: () => void;
    sticky?: boolean;
    withDivider?: boolean;
    rightNode?: ReactNode;
    sheetContent?: ReactNode;
    sheetWidth?: number;
};

export default function TopBar({
                                   title,
                                   subtitle,
                                   onRightClick,
                                   sticky = true,
                                   withDivider = true,
                                   rightNode,
                                   sheetContent,
                                   sheetWidth = 360,
                               }: TopBarProps) {
    const [open, setOpen] = useState(false);
    const [host, setHost] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        if (open) document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open]);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return setHost(document.querySelector(".app-shell"));
    }, []);

    const handleRight = () => {
        if (sheetContent) setOpen(true);
        else onRightClick?.();
    };

    return (
        <header
            className={[
                "bg-white z-10",
                sticky ? "sticky top-0" : "",
                withDivider ? "border-b border-neutral/10" : "",
            ].join(" ")}
        >
            <div className="px-5 pt-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-[26px] font-bold">{title}</h1>

                    {rightNode ? (
                        <div className="shrink-0">{rightNode}</div>
                    ) : (
                        <button
                            aria-label="menu"
                            onClick={handleRight}
                            className="h-9 w-9 grid place-items-center rounded-full hover:bg-pink-50"
                        >
                            <MenuIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>

                {subtitle && (
                    <p className="mt-2 mb-3 text-[15px] text-black/70">{subtitle}</p>
                )}
            </div>

            {sheetContent && host &&
                createPortal(
                    <>
                        <button
                            aria-hidden
                            onClick={() => setOpen(false)}
                            className={[
                                "absolute inset-0 z-40 bg-black/60 transition-opacity",
                                open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
                            ].join(" ")}
                        />
                        <aside
                            role="dialog"
                            aria-modal="true"
                            className={[
                                "absolute inset-y-0 right-0 z-50 h-full bg-white transition-transform",
                                open ? "shadow-2xl" : "shadow-none",
                            ].join(" ")}
                            style={{
                                width: Math.min(sheetWidth, 430),
                                transform: open ? "translateX(0)" : "translateX(100%)",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {sheetContent}
                        </aside>
                    </>,
                    host
                )}
        </header>
    );
}
