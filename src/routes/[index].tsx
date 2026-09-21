import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/index")({
  component: IndexRedirect,
});

function IndexRedirect() {
  return <Navigate to="/" replace />;
}
