import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import CoursePlanner from "./pages/planner/CoursePlanner.tsx";
import CourseResult from "./pages/planner/CourseResult.tsx";
import SavedCourse from "./pages/planner/SavedCourse.tsx";
import MobileFrame from "./components/MobileFrame";
import './App.css'

export default function App() {
    return (
        // PC 배경 흰색
        <div className="w-full min-h-screen flex justify-center bg-white">
            <MobileFrame>
                <div className="flex-1">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/planner" element={<CoursePlanner />} />
                        <Route path="/planner/result" element={<CourseResult />} />
                        <Route path="/planner/saved" element={<SavedCourse />} />
                        <Route path="*" element={<Home />} />
                    </Routes>
                </div>
            </MobileFrame>
        </div>
    );
}