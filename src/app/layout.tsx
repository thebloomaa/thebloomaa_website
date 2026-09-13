import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import MiniCartDrawer from "@/components/MiniCartDrawer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: "thebloomaa — Bloom your life with BlooMaa | Macro-Tracked Diet Preps & Fresh Nutrition",
  description:
    "Bloom your life with BlooMaa. Chef-prepared, macro-tracked fitness diet preps and fresh raw nutrition delivered fresh across Patna every morning between 6:00 AM – 9:00 AM.",
  keywords: [
    "thebloomaa",
    "bloom your life with BlooMaa",
    "fitness diets Patna",
    "macro preps",
    "fresh raw nutrition",
    "healthy food delivery Patna",
    "gym diet Patna",
  ],
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "thebloomaa — Bloom your life with BlooMaa",
    description: "Nourished with motherly care. Macro-calibrated fitness preps and fresh raw nutrition delivered daily in Patna.",
    type: "website",
    images: [
      {
        url: "/logo.jpg",
        width: 1024,
        height: 1024,
        alt: "Bloom your life with BlooMaa",
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
