
import type { Metadata } from "next";
import { CartProvider } from "@/app/context/CartContext";

import Header from "@/app/components/shared/Header";
import Footer from "@/app/components/shared/Footer";
import "./globals.css";
import { Montserrat } from "next/font/google";
import { Providers } from "./providers/SessionProvider";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Furniro",
  description: "Best Furniture in the Town",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

      <html lang="en">
        <body
          className={`${montserrat.className} antialiased`}
        >
          <Providers>
            <CartProvider>
            <Header />
            {children}
            <Footer />
          </CartProvider>
          </Providers>
        </body>
      </html>

  );
}
