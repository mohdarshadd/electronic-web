import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export const metadata: Metadata = {
  title: "VoltCart – Sensors, Boards, Motors, DIY Kits | Student Electronics Store",
  description: "India's student-first electronics components store. Buy sensors, Arduino, ESP32, motors, robot kits and more with UPI payments, COD and student discounts.",
  keywords: ["electronics", "sensors", "arduino", "esp32", "diy", "robotics", "hackathon", "student", "online store", "India"],
  openGraph: {
    title: "VoltCart – Your ideas. Our parts.",
    description: "India's student-first electronics components store. UPI, Cards, COD, Student discounts.",
    type: "website",
    locale: "en_IN",
    siteName: "VoltCart",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-gray-50 text-gray-900 antialiased">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}