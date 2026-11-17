import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TasksPanel from "@/components/dashboard/TasksPanel";

export const metadata: Metadata = { title: "Tasks" };

export default function AdminTasksPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <TasksPanel role="admin" />
    </ProtectedRoute>
  );
}
