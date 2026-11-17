import type { Metadata } from "next";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import TasksPanel from "@/components/dashboard/TasksPanel";

export const metadata: Metadata = { title: "Tasks" };

export default function SellerTasksPage() {
  return (
    <ProtectedRoute allowedRoles={["seller"]}>
      <TasksPanel role="seller" />
    </ProtectedRoute>
  );
}
