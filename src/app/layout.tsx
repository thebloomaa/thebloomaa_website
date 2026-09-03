import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "TheBlooMaa — Macro-Tracked Meal Preps Delivered Daily",
  description:
    "Subscription-based fitness meal prep service. Choose your macro targets, subscribe for 7, 15 or 30 days, and get fresh meals delivered to your door at your exact preferred time.",
  keywords: ["meal prep", "fitness meals", "macro tracking", "healthy food delivery", "gym diet", "Patna"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
