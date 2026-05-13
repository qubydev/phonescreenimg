import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "iScreenshot — 3D iPhone Mockup Generator",
  description:
    "Create stunning 3D iPhone mockups from your screenshots. Customize device angle, background, and export high-res PNGs. No signup required.",
  keywords: [
    "iphone mockup",
    "screenshot generator",
    "3d phone mockup",
    "app store screenshot",
    "phone frame",
    "device mockup",
    "iscreenshot",
    "iphone mockup generator",
    "screenshot to mockup",
    "app screenshot maker",
    "3D iPhone mockup",
    "Angled iPhone Mockup"
  ],
  openGraph: {
    title: "iScreenshot — 3D iPhone Mockup Generator",
    description:
      "Create stunning 3D iPhone mockups from your screenshots. Customize device angle, background, and export high-res PNGs.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "iPhoneShot — 3D iPhone Mockup Generator",
    description:
      "Create stunning 3D iPhone mockups from your screenshots. No signup required.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.className} h-full antialiased`}
    >
      <head>
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="fd14dca1-fbcf-41c8-a713-a141472ea24d"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}