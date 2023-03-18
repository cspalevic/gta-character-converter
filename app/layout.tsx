import { Open_Sans } from "next/font/google";
import "./globals.css";

export const metadata = {
  title: "The GTA Person Converter",
};

const notoSans = Open_Sans({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={notoSans.className}>{children}</body>
    </html>
  );
}
