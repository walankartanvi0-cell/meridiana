import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TasksPanel from "@/components/dashboard/TasksPanel";

export const metadata: Metadata = { title: "Tasks" };

export default function BuyerTasksPage() {
  return (
    <ProtectedRoute allowedRoles={["buyer"]}>
      <TasksPanel role="buyer" />
    </ProtectedRoute>
  );
}
