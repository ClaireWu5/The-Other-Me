import "./globals.css";
import { Quicksand } from "next/font/google";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-quicksand",
  display: "swap",
});

export const metadata = {
  title: "oOM · The Other Me",
  description: "与另一个我对话，完成自我整合。",
};

export const viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh" className={quicksand.variable}>
      <body className="font-rounded antialiased">
        {/* 背景由各页面自行挂载：首页用 WatercolorBackground，对话页用 AuraBackground */}
        <div className="relative z-10 min-h-screen">{children}</div>
      </body>
    </html>
  );
}
