import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Music Square - Interactive Sound Canvas",
  description: "An interactive music sequencer with draggable boxes - create melodies by positioning colored blocks on a canvas",
};

export default function MusicSquareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
