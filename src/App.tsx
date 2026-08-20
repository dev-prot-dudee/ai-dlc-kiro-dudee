import { Navigate, Route, Routes } from "react-router-dom";
import { Sidebar } from "./shared/components/Sidebar";
import { RequirementBoard } from "./modules/requirements/RequirementBoard";
import { TaskBoard } from "./modules/tasks/TaskBoard";
import { DefectBoard } from "./modules/defects/DefectBoard";
import { useData } from "./shared/DataContext";

export function App() {
  const { requirements, tasks, defects, currentUserId, setCurrentUserId } = useData();

  return (
    <div className="app-shell">
      <Sidebar
        counts={{
          requirements: requirements.length,
          tasks: tasks.length,
          defects: defects.length,
        }}
        currentUserId={currentUserId}
        onChangeUser={setCurrentUserId}
      />
      <main className="main">
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
