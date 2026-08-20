import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Sidebar } from "./shared/components/Sidebar";
import { RequirementBoard } from "./modules/requirements/RequirementBoard";
import { TaskBoard } from "./modules/tasks/TaskBoard";
import { DefectBoard } from "./modules/defects/DefectBoard";
import { useData } from "./shared/DataContext";

export function App() {
  const { requirements, tasks, defects, currentUserId, setCurrentUserId } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-full">
      <Sidebar
        counts={{
          requirements: requirements.length,
          tasks: tasks.length,
          defects: defects.length,
        }}
        currentUserId={currentUserId}
        onChangeUser={setCurrentUserId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Mobile top bar with hamburger */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-neutral-100 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
          <button
            type="button"
            className="w-10 h-10 flex items-center justify-center rounded text-neutral-600 hover:bg-black/5"
            onClick={() => setSidebarOpen(true)}
            aria-label="เปิดเมนู"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>
          <span className="font-display font-semibold text-body text-neutral-600">PM Tool</span>
        </header>

        <Routes>
          <Route path="/" element={<Navigate to="/requirements" replace />} />
          <Route path="/requirements" element={<RequirementBoard />} />
          <Route path="/tasks" element={<TaskBoard />} />
          <Route path="/defects" element={<DefectBoard />} />
          <Route path="*" element={<Navigate to="/requirements" replace />} />
        </Routes>
      </main>
    </div>
  );
}
