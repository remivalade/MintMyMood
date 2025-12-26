#!/bin/bash

# SVG Testing Script for OnChainJournal
# Run this script to generate baseline SVGs for testing optimizations

echo "🎨 Generating SVG Samples..."
echo ""
echo "Running Foundry script..."
echo ""

forge script script/GenerateSVGSamples.s.sol -vv 2>&1 | grep -E "(START:|END:|<svg|</svg)" > test/svg-output.txt

echo ""
echo "✅ SVG samples generated!"
echo ""
echo "📋 Next steps:"
echo "1. Check test/svg-output.txt for the SVG code"
echo "2. Copy each SVG section into test/svg-preview.html"
echo "3. Open test/svg-preview.html in your browser"
echo "4. Make optimizations to src/OnChainJournal.sol"
echo "5. Run this script again and compare visually"
echo ""
echo "💡 Tip: Use 'open test/svg-preview.html' to open in default browser"
