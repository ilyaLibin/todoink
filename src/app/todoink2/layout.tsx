import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TodoInk 2 - Vertical E-Ink Todo List",
  description: "A vertical e-ink todo list with cursor navigation and voice input",
};

export default function Todoink2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
