import { Rubik_Wet_Paint } from "next/font/google";
import "./globals.css";

const nabla = Rubik_Wet_Paint({ subsets: ['latin'], weight: '400' })

export const metadata = {
  title: "CoinForge",
  description: "create token listings",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${nabla.className}`}>
        {children}
      </body>
    </html>
  );
}
