import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import MiniCartDrawer from "@/components/MiniCartDrawer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: "thebloomaa — Bloom your day with bloomaa | Macro-Tracked Meal Preps & Living Foods",
  description:
    "Bloom your day with bloomaa. Chef-prepared, macro-tracked fitness meal preps and cellular living foods delivered fresh across Patna every morning between 6:00 AM – 9:00 AM.",
  keywords: [
    "thebloomaa",
    "bloom your day with bloomaa",
    "fitness meals Patna",
    "macro preps",
    "living food vitality",
    "healthy food delivery Patna",
    "gym diet Patna",
  ],
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "thebloomaa — Bloom your day with bloomaa",
    description: "Nourished with motherly care. Macro-calibrated fitness preps and living foods delivered daily in Patna.",
    type: "website",
    images: [
      {
        url: "/logo.jpg",
        width: 1024,
        height: 1024,
        alt: "thebloomaa - Bloom your day with bloomaa",
      },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
          <MiniCartDrawer />
        </AuthProvider>
      </body>
    </html>
  );
}
