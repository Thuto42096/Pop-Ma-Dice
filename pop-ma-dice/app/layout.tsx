import "./theme.css";
import "@coinbase/onchainkit/styles.css";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL;
  return {
    title: "Pop Ma Dice - Roll the Dice Game",
    description: "A fun dice game on the Base network. Roll the dice, test your luck, and win big! Play offchain or onchain with crypto stakes.",
    keywords: ["dice game", "crypto", "Base network", "blockchain", "gambling", "onchain"],
    authors: [{ name: "Pop Ma Dice" }],
    icons: {
      icon: "/pop-ma-dice-logo.png",
      shortcut: "/pop-ma-dice-logo.png",
      apple: "/pop-ma-dice-logo.png",
    },
    openGraph: {
      title: "Pop Ma Dice - Roll the Dice Game",
      description: "A fun dice game on the Base network. Roll the dice, test your luck, and win big!",
      url: URL,
      siteName: "Pop Ma Dice",
      images: [
        {
          url: `${URL}/pop-ma-dice-logo.png`,
          width: 1024,
          height: 1024,
          alt: "Pop Ma Dice Logo",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Pop Ma Dice - Roll the Dice Game",
      description: "A fun dice game on the Base network. Roll the dice, test your luck, and win big!",
      images: [`${URL}/pop-ma-dice-logo.png`],
    },
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
        button: {
          title: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME}`,
          action: {
            type: "launch_frame",
            name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
            url: URL,
            splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE,
            splashBackgroundColor:
              process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/pop-ma-dice-logo.png" />
        <link rel="apple-touch-icon" href="/pop-ma-dice-logo.png" />
        <meta name="theme-color" content="#16a34a" />
      </head>
      <body className="bg-background">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
