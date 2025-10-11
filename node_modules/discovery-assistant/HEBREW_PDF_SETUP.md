# Hebrew PDF Generation Setup

## Problem
The default pdfMake fonts (Roboto) **do not include Hebrew glyphs**. This causes Hebrew text to show as boxes or blank spaces in generated PDFs.

## Solution
Use **Rubik font** which has full Hebrew Unicode support + BiDi text processing.

---

## STEP 1: Download Hebrew Fonts

Run these commands in PowerShell or Command Prompt:

```powershell
cd discovery-assistant

# Create fonts directory
mkdir public\fonts

# Download Rubik fonts (supports Hebrew)
curl -L "https://github.com/googlefonts/rubik/raw/main/fonts/ttf/Rubik-Regular.ttf" -o public/fonts/Rubik-Regular.ttf
curl -L "https://github.com/googlefonts/rubik/raw/main/fonts/ttf/Rubik-Bold.ttf" -o public/fonts/Rubik-Bold.ttf
curl -L "https://github.com/googlefonts/rubik/raw/main/fonts/ttf/Rubik-Italic.ttf" -o public/fonts/Rubik-Italic.ttf
curl -L "https://github.com/googlefonts/rubik/raw/main/fonts/ttf/Rubik-BoldItalic.ttf" -o public/fonts/Rubik-BoldItalic.ttf
```

**Verify files downloaded:**
```powershell
ls public\fonts
```

You should see 4 files:
- Rubik-Regular.ttf
- Rubik-Bold.ttf
- Rubik-Italic.ttf
- Rubik-BoldItalic.ttf

---

## STEP 2: Convert Fonts to Base64

Run the font converter script:

```bash
node scripts/convertFontToBase64.js
```

**This will:**
1. Read the .ttf files from `public/fonts/`
2. Convert them to base64
3. Generate `src/utils/hebrewFonts.ts` with embedded fonts

**Expected output:**
```
🔄 Converting Hebrew fonts to base64...
✅ Rubik-Regular.ttf: 149.23 KB
✅ Rubik-Bold.ttf: 152.45 KB
✅ Rubik-Italic.ttf: 150.12 KB
✅ Rubik-BoldItalic.ttf: 153.89 KB

✅ Generated: src/utils/hebrewFonts.ts
📦 Total size: 612.34 KB

🎉 Done! You can now use Hebrew fonts in PDF generation.
```

---

## STEP 3: Rebuild the App

```bash
npm run build
```

---

## STEP 4: Test Hebrew PDF Generation

1. Start the dev server: `npm run dev`
2. Navigate to the Proposal module
3. Select some services
4. Click "Generate PDF"

**Expected result:**
- Hebrew text renders correctly (not boxes)
- Text flows right-to-left (RTL)
- Professional appearance

---

## How It Works

### Font Loading
- `getPdfMake()` merges Hebrew fonts into pdfMake's VFS
- Automatically uses Rubik if available, fallback to Roboto

### BiDi Text Processing
- All Hebrew text is processed through `processHebrewForPDF()`
- Reverses Hebrew character order for proper RTL display
- Handles mixed Hebrew/English/Numbers correctly

### Example:
```typescript
// Input (logical order):
"שלום עולם"

// After BiDi processing (visual order for PDF):
"םלוע םולש"

// Renders as:
שלום עולם  (correctly RTL)
```

---

## Troubleshooting

### Fonts not loading
**Check console for:**
```
✡️  Hebrew fonts loaded: true
```

If `false`:
1. Verify font files exist in `public/fonts/`
2. Re-run: `node scripts/convertFontToBase64.js`
3. Check `src/utils/hebrewFonts.ts` is not empty

### Hebrew still shows boxes
**Possible causes:**
1. Fonts not converted: Run Step 2 again
2. App not rebuilt: Run `npm run build`
3. Browser cache: Hard refresh (Ctrl+Shift+R)

### Text still backwards
**This means:**
- Fonts ARE loading
- But BiDi processing is NOT applied

**Check:**
- All Hebrew text uses `h()` wrapper in exportProposalPDF.ts

---

## File Size Note

The Hebrew fonts add ~600KB to your bundle. This is normal and necessary for proper Hebrew support.

**Optimization:**
- Fonts are lazy-loaded (only when generating PDF)
- Not included in initial page load
- Acceptable trade-off for Hebrew support

---

## Alternative Fonts

If Rubik doesn't work, try **Alef**:

```powershell
curl -L "https://github.com/googlefonts/alef/raw/main/fonts/ttf/Alef-Regular.ttf" -o public/fonts/Rubik-Regular.ttf
curl -L "https://github.com/googlefonts/alef/raw/main/fonts/ttf/Alef-Bold.ttf" -o public/fonts/Rubik-Bold.ttf
```

Then re-run Step 2.
