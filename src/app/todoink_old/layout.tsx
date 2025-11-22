import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TodoInk - E-Ink Todo List",
  description: "A physical e-ink todo list prototype with voice input and button controls",
};

export default function TodoinkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
