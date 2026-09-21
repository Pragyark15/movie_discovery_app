import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Movie Discovery",
  description: "Discover movies to watch",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">
        <nav className="sticky top-0 z-10 bg-neutral-900 border-b border-neutral-800 px-4 sm:px-8 py-3 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold tracking-tight">
            🎬 Movie Discovery
          </Link>
          <div className="flex gap-4 text-sm font-medium">
  <Link href="/" className="text-amber-400 hover:text-amber-300 transition">
    Browse
  </Link>
  <Link href="/wishlist" className="text-amber-400 hover:text-amber-300 transition">
    Wishlist
  </Link>
</div>
        </nav>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}