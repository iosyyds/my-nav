import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "我的导航",
  description: "个人网址导航",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
