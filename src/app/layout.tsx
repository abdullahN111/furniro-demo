import type { Metadata } from "next";
import { CartProvider } from "@/app/context/CartContext";
import { ToastProvider } from "@/app/context/ToastContext";
import { FavoritesProvider } from "@/app/context/FavoritesContext";

import Header from "@/app/components/shared/Header";
import Footer from "@/app/components/shared/Footer";
import ChatbotWidget from "@ai/components/ChatbotWidget";
import "./globals.css";
import { Montserrat } from "next/font/google";
import { Providers } from "./providers/SessionProvider";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Furniro — Modern Furniture & Home Decor",
  description:
    "Discover stylish, high-quality furniture crafted to bring comfort and elegance to your home.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} antialiased text-gray-900 bg-white`}>
        <Providers>
          <ToastProvider>
            <FavoritesProvider>
              <CartProvider>
                <Header />
                {children}
                <ChatbotWidget />
                <Footer />
              </CartProvider>
            </FavoritesProvider>
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
