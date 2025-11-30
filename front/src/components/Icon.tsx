type IconProps = {
    className?: string;
};

// 공통
const IconBase = ({ d, className = "" }: { d: string; className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        className={`inline-block align-middle text-[#FF8FB1] ${className}`}
        width="24"
        height="24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
    >
        <path d={d} />
    </svg>
);

// 헤더 메뉴
export const MenuIcon = ({ className = "" }: IconProps) => (
    <IconBase
        className={`text-[#FF5C8A] ${className}`}
        d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z"
    />
);

// 지역
export const LocationIcon = ({ className }: IconProps) => (
    <IconBase
        className={className}
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87 3.13-7 7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
    />
);

// 달력
export const CalendarIcon = ({ className }: IconProps) => (
    <IconBase
        className={className}
        d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z"
    />
);

// 공통 취미
export const FolderHeartIcon = ({ className = "" }: IconProps) => (
    <svg
        viewBox="0 0 24 24"
        className={`inline-block align-middle text-[#FF8FB1] ${className}`}
        width="24"
        height="24"
        fill="currentColor"
    >
        <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2.08 5.92l-1.75 1.75-1.75-1.75c-.49-.49-1.28-.49-1.77 0-.49.49-.49 1.28 0 1.77l2.63 2.63c.39.39 1.02.39 1.41 0l2.63-2.63c.49-.49.49-1.28 0-1.77-.48-.49-1.27-.49-1.76 0z" />
    </svg>
);

// 테마
export const PaletteIcon = ({ className }: IconProps) => (
    <IconBase
        className={className}
        d="M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
    />
);

// 추천받고 싶은 활동
export const StarBoxIcon = ({ className = "" }: IconProps) => (
    <svg
        viewBox="0 0 24 24"
        className={`inline-block align-middle text-[#FF8FB1] ${className}`}
        width="24"
        height="24"
        fill="currentColor"
    >
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 12.5l-2.6 1.6.7-3-2.3-2 3-.2 1.2-2.9 1.2 2.9 3 .2-2.3 2 .7 3L12 15.5z" />
    </svg>
);

// 수저
export const UtensilsIcon = ({ className }: IconProps) => (
    <IconBase
        className={className}
        d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"
    />
);