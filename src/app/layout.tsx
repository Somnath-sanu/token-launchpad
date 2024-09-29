import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster"

import "./globals.css";
import { IBM_Plex_Sans } from "next/font/google";

const inter = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Solana Token Launchpad - Create and Manage Your Solana Tokens",
  description:
    "Easily create, manage, and transfer Solana tokens with our comprehensive Solana Token Launchpad. Airdrop and send Solana tokens effortlessly.",
  keywords:
    "Solana, Token, Launchpad, Create Token, Manage Token, Airdrop Solana, Send Solana, Cryptocurrency, Blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main>
        {children}
        </main>
        <Toaster/>
      </body>
    </html>
  );
}
