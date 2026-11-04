import { Metadata } from "next";
import { Inter } from "next/font/google";
import { ElectionsPage } from "@/components/ElectionsPage";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Elecciones Flashcore",
  description: "Elecciones en tiempo real: sindicatos, universidades, magistratura y clubes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
