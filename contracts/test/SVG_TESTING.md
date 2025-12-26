# SVG Testing Workflow

This guide shows you how to safely test SVG optimizations before deploying to the blockchain.

## 🎯 Goal

Test SVG generation changes locally to ensure:
- ✅ Visual design stays identical
- ✅ All text renders correctly
- ✅ Special characters are properly escaped
- ✅ Different text lengths work
- ✅ Both styles (Native & Classic) render properly

## 📁 Files

| File | Purpose |
|------|---------|
| `script/GenerateSVGSamples.s.sol` | Foundry script that generates 6 test SVGs |
| `test/svg-preview.html` | HTML file for side-by-side visual comparison |
| `test-svg.sh` | Bash script to automate SVG generation |

---

## 🚀 Quick Start

### Step 1: Generate Baseline SVGs (Current Version)

```bash
cd contracts
./test-svg.sh
```

This generates SVGs from your **current contract code** and saves them to `test/svg-output.txt`.

### Step 2: Copy SVGs to Preview File

Open `test/svg-output.txt` and copy each SVG block into the corresponding section in `test/svg-preview.html`:

- Look for `<!-- START: sample1_short_native -->`
- Copy the `<svg>...</svg>` block
- Paste into the "Current Version" section in `svg-preview.html`
- Repeat for all 6 samples

### Step 3: View in Browser

```bash
open test/svg-preview.html
```

You should see all 6 samples rendered. Take screenshots or notes of how they look.

### Step 4: Make Optimizations

Edit `src/OnChainJournal.sol` and apply optimizations (e.g., shorter IDs, removed chain names).

### Step 5: Generate Optimized SVGs

```bash
./test-svg.sh
```

Now copy the **new** SVG output into the "Optimized Version" columns in `svg-preview.html`.

### Step 6: Compare Visually

Refresh `svg-preview.html` in your browser. You should see:
- Left column: Original version
- Right column: Optimized version

**Check that they look identical!**

---

## 🧪 Test Cases

The script generates **12 samples** across 4 chain styles:

### Base Chain (Blue Gradient)
1. **Short text** - Basic rendering with blue gradient
2. **Medium text** - Text wrapping with blue gradient
3. **Special characters** - XML escaping: `<>"'&`

### Bob Chain (Orange Gradient)
4. **Short text** - Basic rendering with orange gradient
5. **Medium text** - Text wrapping with orange gradient
6. **Special characters** - XML escaping with orange theme

### Ink Chain (Purple + Wave Pattern)
7. **Short text** - Basic rendering with Ink's unique wave background
8. **Medium text** - Text wrapping with purple theme
9. **Special characters** - XML escaping with Ink styling

### Classic Style (Paper Texture)
10. **Short text** - Paper-style rendering
11. **Medium text** - Classic style text wrapping
12. **Long text (near 400 bytes)** - Max length handling with classic style

---

## ⚙️ Manual Testing (Alternative)

If the automated script doesn't work, you can test manually:

1. **Deploy contract locally:**
   ```bash
   forge script script/Deploy.s.sol --fork-url http://localhost:8545
   ```

2. **Call generateSVG in Foundry console:**
   ```bash
   forge test --match-test testGenerateSVG -vvvv
   ```

3. **Copy SVG output from logs**

4. **Save to .svg file and open in browser**

---

## 📊 What to Look For

### ✅ Visual Checks
- [ ] Gradients render smoothly
- [ ] Text is centered and readable
- [ ] Mood emoji appears in top-right
- [ ] Block number shows in top-left
- [ ] Chain name in bottom-left
- [ ] "MintMyMood" in bottom-right
- [ ] Text shadow/effects intact
- [ ] No text overflow or clipping
- [ ] Special characters display correctly (not raw entities)

### ✅ Size Checks
Before and after optimization, check SVG file size:

```bash
# Count characters in SVG output
wc -c test/svg-output.txt
```

Expected savings: **~7-8% reduction** (e.g., 4500 bytes → 4200 bytes)

---

## 🔧 Troubleshooting

### "forge: command not found"

Install Foundry:
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### SVGs don't render in browser

- Make sure you copied the **complete** `<svg>...</svg>` block
- Check browser console for errors
- Try opening the HTML file directly (not via file://)

### Colors look wrong

- Verify you're testing with the right chain colors
- The test script uses Base colors (#0052FF) by default
- Edit `GenerateSVGSamples.s.sol` to test other chains

---

## 📝 Optimization Checklist

When making changes, verify:

1. [ ] **Unchanged**: Visual design (colors, layout, fonts)
2. [ ] **Unchanged**: Text rendering and wrapping
3. [ ] **Unchanged**: Special character escaping
4. [ ] **Reduced**: SVG size in bytes
5. [ ] **Reduced**: Gas cost (test with `forge test --gas-report`)
6. [ ] **Passing**: All Foundry tests still pass

---

## 🎨 Adding More Test Cases

Edit `script/GenerateSVGSamples.s.sol` to add custom test cases:

```solidity
_generateSample(
    journal,
    "Your custom text here",
    unicode"🎨",  // Your emoji
    0,            // 0 = Native, 1 = Classic
    "my_test_case"
);
```

Then add a corresponding section in `svg-preview.html`.

---

## 💡 Pro Tips

1. **Use browser dev tools** - Right-click SVG → Inspect to see the actual markup
2. **Test on mobile** - Resize browser window to test responsive rendering
3. **Export to PNG** - Right-click SVG → Save As → test in NFT marketplaces
4. **Automated diffing** - Use image diff tools to catch subtle visual changes
5. **Gas reporting** - Always run `forge test --gas-report` after optimizations

---

Happy testing! 🚀
