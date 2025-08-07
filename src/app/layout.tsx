import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import localFont from "next/font/local";


const satoshi = localFont({
  src: [
    {
      path: "../fonts/satoshi/Satoshi-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/satoshi/Satoshi-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Padi Pay - Save Better, Together",
  description: "Reinventing àjọ for the digital age. With Padi-Pay, enjoy trusted group savings, smart investments, crowdfunding, AI insights, and stress-free money transfers — all in one app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${satoshi.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      
   <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}



