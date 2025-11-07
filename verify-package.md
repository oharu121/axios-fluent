# Package Verification Guide

This document helps you verify what will be published to npm.

## Quick Check: What Gets Published?

Run this command to see exactly what will be in your npm package:

```bash
npm pack --dry-run
```

This shows all files that will be included without actually creating the tarball.

## Expected Files in npm Package

Based on your current configuration:

### ✅ WILL be published:
```
axios-fluent/
├── dist/
│   ├── Axon.js            # Compiled JavaScript
│   ├── Axon.js.map        # Source map
│   ├── Axon.d.ts          # TypeScript definitions
│   └── Axon.d.ts.map      # Definition source map
├── README.md              # Main documentation
├── LICENSE                # MIT License
└── package.json           # Package metadata (auto-included)
```

### ❌ Will NOT be published:
```
- Axon.ts                  # Source TypeScript (excluded)
- tsconfig.json            # Build config (excluded)
- examples/                # Examples (excluded - see on GitHub)
- dev-notes/               # Development notes (excluded)
- .github/                 # CI/CD workflows (excluded)
- PUBLISHING.md            # Publishing guide (excluded)
- PRE-PUBLISH-CHECKLIST.md # Checklist (excluded)
- QUICK_START.md           # Quick start (excluded)
- NAMING.md                # Naming rationale (excluded)
- CHANGELOG.md             # NOT in files array (excluded)
- node_modules/            # Dependencies (excluded)
- *.log                    # Logs (excluded)
```

## Verification Steps

### 1. Create Test Package

```bash
npm pack
```

This creates `axios-fluent-0.1.0.tgz`

### 2. Inspect Package Contents

```bash
tar -tzf axios-fluent-0.1.0.tgz
```

Or on Windows:
```bash
tar -xzf axios-fluent-0.1.0.tgz
cd package
dir /s
```

### 3. Test Installation Locally

Create a test project:

```bash
mkdir test-install
cd test-install
npm init -y
npm install ../axios-fluent-0.1.0.tgz
```

### 4. Test Import

Create `test.js`:

```javascript
const Axon = require('axios-fluent');
console.log('Imported successfully:', typeof Axon);

const client = Axon.new();
console.log('Created client:', typeof client);
console.log('Has get method:', typeof client.get);
```

Run it:
```bash
node test.js
```

### 5. Test TypeScript Types

Create `test.ts`:

```typescript
import Axon from 'axios-fluent';

const client = Axon.new()
  .baseUrl('https://api.example.com')
  .bearer('token')
  .json();

// This should have TypeScript autocomplete and type checking
const response = await client.get<{ id: number }>('/users/1');
console.log(response.data.id); // Should be typed as number
```

Compile it:
```bash
npx tsc test.ts --noEmit
```

## Package Size Check

Check the package size:

```bash
# On Linux/Mac
du -sh axios-fluent-0.1.0.tgz

# On Windows
powershell Get-Item axios-fluent-0.1.0.tgz | Select-Object Length
```

**Expected size:** ~10-15 KB (compressed)

## Common Issues

### Issue: Package too large

**Check:**
```bash
npm pack --dry-run | grep -v node_modules
```

**Fix:** Add unwanted files to `.npmignore`

### Issue: Missing files

**Check:** Verify `"files"` array in package.json

**Fix:** Add required files to the array

### Issue: TypeScript definitions not working

**Check:**
```bash
test -f dist/Axon.d.ts && echo "Types exist" || echo "Types missing"
```

**Fix:** Run `npm run build` before packing

## Automated Verification Script

Create `scripts/verify-package.sh`:

```bash
#!/bin/bash
set -e

echo "Building package..."
npm run build

echo "Creating tarball..."
npm pack

echo "Extracting tarball..."
tar -xzf axios-fluent-*.tgz

echo "Verifying contents..."
test -f package/dist/Axon.js || (echo "ERROR: Axon.js missing" && exit 1)
test -f package/dist/Axon.d.ts || (echo "ERROR: Axon.d.ts missing" && exit 1)
test -f package/README.md || (echo "ERROR: README.md missing" && exit 1)
test -f package/LICENSE || (echo "ERROR: LICENSE missing" && exit 1)

echo "Checking unwanted files are excluded..."
test ! -f package/Axon.ts || (echo "ERROR: Source file Axon.ts should not be included" && exit 1)
test ! -d package/examples || (echo "ERROR: examples/ should not be included" && exit 1)

echo "✓ Package verification passed!"
rm -rf package axios-fluent-*.tgz
```

Make it executable:
```bash
chmod +x scripts/verify-package.sh
./scripts/verify-package.sh
```

## Final Checklist Before Publishing

- [ ] `npm run build` succeeds
- [ ] `npm pack --dry-run` shows only expected files
- [ ] Package size is reasonable (<100KB)
- [ ] Test package installs locally
- [ ] TypeScript types work
- [ ] No source files (.ts) in package
- [ ] No dev files (examples/, dev-notes/, etc.) in package
- [ ] README.md and LICENSE are included

## After Publishing

Verify the published package:

```bash
# Check package info
npm info axios-fluent

# Install from npm
npm install axios-fluent

# Check installed files
ls node_modules/axios-fluent/
```

## Comparison: Files vs .npmignore

Your setup uses BOTH mechanisms:

1. **`package.json` "files"** (WHITELIST) - Only these are considered
2. **`.npmignore`** (BLACKLIST) - Further excludes from whitelist

**Why both?**
- `"files"` = Explicit control, safer
- `.npmignore` = Backup protection, catches wildcards

This is the **recommended approach** for maximum safety.
