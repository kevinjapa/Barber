 import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlvaBarber | Gestión de barbería",
  description: "Operaciones Diarias para tu barbería.",
  icons: {
    icon: "/assets/alvaberber_icon.png",
    shortcut: "/assets/alvaberber_icon.png",
    apple: "/assets/alvaberber_icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
