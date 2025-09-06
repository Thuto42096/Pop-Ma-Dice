# Logo Setup Instructions

## 🎯 Quick Setup

To use your custom Pop Ma Dice logo, you need to save the image file you provided as:

```
pop-ma-dice/public/pop-ma-dice-logo.png
```

## 📁 Steps:

1. **Save the image**: Take the Pop Ma Dice logo image you provided and save it as `pop-ma-dice-logo.png` in the `pop-ma-dice/public/` directory.

2. **Verify the file**: Make sure the file is named exactly `pop-ma-dice-logo.png` (case-sensitive).

3. **Build and deploy**: Once the image is in place, the app will automatically use it as:
   - Hero logo on the main page
   - Favicon/icon in browser tabs
   - Splash screen image
   - Social media preview image
   - App icon for Farcaster frames

## 🎨 What's Already Configured:

✅ **Hero Section**: Large logo display with hover effects and fallback
✅ **Metadata**: Updated title, description, and SEO tags
✅ **Favicon**: Browser tab icon configuration
✅ **Social Media**: Open Graph and Twitter card images
✅ **Farcaster Frame**: Splash and hero images for MiniKit
✅ **Fallback**: Text-based logo if image fails to load

## 🔧 Technical Details:

The logo will be displayed at:
- **Hero size**: 320px width (responsive)
- **Format**: PNG with transparency support
- **Effects**: Drop shadow, hover scale, rounded corners
- **Fallback**: Styled text version if image unavailable

## 🚀 After Setup:

Once you've added the image file, run:
```bash
npm run build
git add .
git commit -m "Add Pop Ma Dice logo"
git push
vercel --prod
```

The logo will then appear throughout your app!
