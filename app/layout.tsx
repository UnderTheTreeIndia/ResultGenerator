import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Under The Tree — Result Cum Certificate",
  description:
    "Generate, store, and verify academic Result Cum Certificates for Under The Tree (UTT).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen bg-[#F4F1E8] text-utt-ink antialiased">
        {children}
      </body>
    </html>
  );
}
