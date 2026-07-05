import "./globals.css";

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
    <html lang="zh">
      <body className="font-rounded antialiased">
        <div className="relative z-10 min-h-screen">{children}</div>
      </body>
    </html>
  );
}
