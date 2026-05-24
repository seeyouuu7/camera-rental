import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/app/context/CartContext";
import Header from "@/app/components/Header";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "방광대여 - 촬영장비 대여",
  description: "카메라, 렌즈, 조명 등 촬영 장비를 쉽고 빠르게 대여하세요.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50 font-sans">
        <CartProvider>
          <Header />
          <div className="flex-1">{children}</div>
        </CartProvider>
      </body>
    </html>
  );
}
