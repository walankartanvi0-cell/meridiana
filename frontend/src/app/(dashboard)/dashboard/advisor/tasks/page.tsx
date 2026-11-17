import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TasksPanel from "@/components/dashboard/TasksPanel";

export const metadata: Metadata = { title: "Tasks" };

export default function AdvisorTasksPage() {
  return (
    <ProtectedRoute allowedRoles={["advisor"]}>
      <TasksPanel role="advisor" />
    </ProtectedRoute>
  );
}
