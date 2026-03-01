import { Inter, Playfair_Display, Space_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "Type Racer Competition",
  description: "Compete with friends in a typing race",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} ${spaceMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
