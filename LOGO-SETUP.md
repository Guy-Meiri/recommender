# App Logo Setup Guide

## 📁 Logo Files Needed

To make your Batata Time logo work perfectly across all platforms, create these versions of your logo and place them in the `public` folder:

### Required Logo Sizes:
- `logo.png` - **512x512** (main logo, high resolution)
- `logo-192.png` - **192x192** (PWA icon)
- `logo-180.png` - **180x180** (iPhone/iPad icon)
- `logo-152.png` - **152x152** (iPad icon)
- `logo-120.png` - **120x120** (iPhone icon)
- `logo-76.png` - **76x76** (iPad mini icon)
- `favicon.ico` - **32x32, 16x16** (browser tab icon)

## 🎨 How to Create Different Sizes

### Option 1: Online Tools
1. **Favicon.io** (https://favicon.io/favicon-converter/)
   - Upload your main logo
   - Downloads all sizes automatically
   - Perfect for favicon creation

2. **App Icon Generator** (https://appicon.co/)
   - Upload high-res logo (1024x1024 recommended)
   - Generates all iOS/Android sizes

### Option 2: macOS Preview (Built-in)
1. Open your logo in Preview
2. Tools → Adjust Size...
3. Set width/height to desired size
4. Export as PNG for each size

### Option 3: Command Line (if you have ImageMagick)
```bash
# Install ImageMagick (if not installed)
brew install imagemagick

# Convert to different sizes
convert logo-original.png -resize 512x512 public/logo.png
convert logo-original.png -resize 192x192 public/logo-192.png
convert logo-original.png -resize 180x180 public/logo-180.png
convert logo-original.png -resize 152x152 public/logo-152.png
convert logo-original.png -resize 120x120 public/logo-120.png
convert logo-original.png -resize 76x76 public/logo-76.png
convert logo-original.png -resize 32x32 public/favicon.ico
```

## ✅ What This Setup Provides

1. **Browser Tab Icon** - Your logo appears in browser tabs
2. **PWA Installation** - Users can "Add to Home Screen" with your logo
3. **iOS App Icon** - Perfect icons when saved to iPhone/iPad home screen
4. **Android App Icon** - Proper icons for Android devices
5. **Large App Bar Logo** - Bigger, more prominent logo in navigation (40x40px display)

## 🚀 After Adding Logo Files

1. Place all logo files in `/public/` folder
2. Restart your development server
3. Your logo will appear:
   - ✅ Larger in the app navigation bar
   - ✅ As browser favicon
   - ✅ When users install the app (PWA)
   - ✅ On mobile home screens

## 🎯 Pro Tips

- **Use PNG with transparency** for best results
- **Keep design simple** for small sizes (16x16, 32x32)
- **Test on different devices** to ensure it looks good
- **Consider dark/light themes** - your carrot logo should work well on both

Your carrot-film logo will look amazing across all these platforms! 🥕🎬
