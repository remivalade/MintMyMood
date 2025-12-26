# Test Files

This folder contains test files and demos for development and debugging.

## HTML Test Files

### preview-demo.html
**Purpose:** Preview NFT SVG rendering in the browser.

**Usage:** Open in browser to test SVG generation locally.

### test_all_svgs.html
**Purpose:** Comprehensive test suite for all SVG variations.

**Usage:** Open in browser to see all possible SVG combinations (chains, moods, styles).

### test_svg_refactor.html
**Purpose:** Testing SVG refactoring changes.

**Usage:** Open in browser to compare old vs new SVG implementations.

## Test Data Files

### temp_decoded.txt
**Purpose:** Decoded base64 data for testing.

### token_uri.txt
**Purpose:** Raw token URI data from contracts for testing.

---

## Running Tests

Most tests are browser-based HTML files. Simply open them in your browser:

```bash
open tests/preview-demo.html
open tests/test_all_svgs.html
```

For smart contract tests, see `contracts/test/` directory.
