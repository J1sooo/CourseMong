import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import PlannerPage from "./pages/planner/Planner.tsx";
import Balance from "./components/Balance.tsx";
import MobileFrame from "./components/MobileFrame";

export default function App() {
    return (
        // PC 배경 흰색
        <div className="w-full min-h-screen flex justify-center bg-white">
            <MobileFrame>
                <div className="flex-1">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/planner" element={<PlannerPage />} />
                        <Route path="/balance" element={<Balance />} />
                        <Route path="*" element={<Home />} />
                    </Routes>
                </div>
            </MobileFrame>
        </div>
    );
}