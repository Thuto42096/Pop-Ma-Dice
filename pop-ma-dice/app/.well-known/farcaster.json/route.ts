function withValidProperties(
  properties: Record<string, undefined | string | string[] | boolean>,
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === 'boolean') {
        return true; // Include boolean values
      }
      return !!value;
    }),
  );
}

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL || 'https://pop-ma-dice.vercel.app';

  return Response.json({
    accountAssociation: withValidProperties({
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    }),
    baseBuilder: withValidProperties({
      allowedAddresses: process.env.BASE_BUILDER_ALLOWED_ADDRESSES ?
        process.env.BASE_BUILDER_ALLOWED_ADDRESSES.split(',') : [],
    }),
    frame: withValidProperties({
      version: "1",
      name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "Pop Ma Dice",
      homeUrl: URL,
      iconUrl: process.env.NEXT_PUBLIC_APP_ICON || `${URL}/pop-ma-dice-logo.png`,
      splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE || `${URL}/pop-ma-dice-logo.png`,
      splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "#16a34a",
      webhookUrl: `${URL}/api/webhook`,
      subtitle: process.env.NEXT_PUBLIC_APP_SUBTITLE || "Roll the dice game",
      description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "A fun dice game on the Base network. Roll the dice, test your luck, and win big!",
      screenshotUrls: [],
      primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY || "games",
      tags: ["dice", "game", "crypto", "base", "gambling"],
      heroImageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE || `${URL}/pop-ma-dice-logo.png`,
      tagline: process.env.NEXT_PUBLIC_APP_TAGLINE || "Roll the dice and win!",
      ogTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE || "Pop Ma Dice - Roll the Dice Game",
      ogDescription: process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION || "A fun dice game on the Base network. Roll the dice, test your luck, and win big!",
      ogImageUrl: process.env.NEXT_PUBLIC_APP_OG_IMAGE || `${URL}/pop-ma-dice-logo.png`,
      requiredChains: ["eip155:8453"], // Base mainnet
      noindex: false, // Set to true for development
    }),
  });
}
