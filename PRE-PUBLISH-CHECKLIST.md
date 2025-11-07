# Pre-Publish Checklist for axios-fluent

Use this checklist before publishing to npm.

## ✅ Code Quality

- [x] All TypeScript files compile without errors
- [x] Security: `allowInsecure` defaults to `false`
- [x] All HTTP methods implemented (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- [x] Generic typing for type-safe responses
- [x] JSDoc comments on all public methods
- [x] No unused imports or variables

## ✅ Package Configuration

- [x] Package name: `axios-fluent` (confirmed available)
- [x] Version: `0.1.0` (appropriate for initial release)
- [x] Description: Clear and accurate
- [x] Author: oharu121 <jefflin1201@gmail.com>
- [x] License: MIT
- [x] Main entry: `dist/Axon.js`
- [x] Types: `dist/Axon.d.ts`
- [x] Keywords: Relevant for discovery

## ✅ Documentation

- [x] README.md with:
  - [x] Installation instructions
  - [x] Quick start examples
  - [x] Full API reference
  - [x] Common use cases
  - [x] Security warnings
- [x] LICENSE file (MIT)
- [x] CHANGELOG.md
- [x] Example files in `examples/`

## ✅ Build System

- [x] tsconfig.json configured correctly
- [x] Build script works: `npm run build`
- [x] .npmignore excludes source files
- [x] .gitignore for development files

## 🔲 Repository Setup (TODO)

Before publishing, you need to:

- [ ] Create or rename GitHub repository to `axios-fluent`
- [ ] Push code to GitHub
- [ ] Add a description on GitHub
- [ ] Add topics/tags: `axios`, `http`, `fluent-api`, `typescript`
- [ ] Enable GitHub Issues (for support)

## 🔲 Pre-Flight Testing (TODO)

Before first publish:

### 1. Test Local Build
```bash
cd f:\repository\axon
npm run build
```

### 2. Test Package Locally
```bash
npm pack
# Creates axios-fluent-0.1.0.tgz
```

### 3. Test in Another Project
```bash
# In a test project
mkdir test-axios-fluent
cd test-axios-fluent
npm init -y
npm install ../path/to/axios-fluent-0.1.0.tgz

# Create test.js
echo "const Axon = require('axios-fluent'); console.log(Axon);" > test.js
node test.js
```

### 4. Test TypeScript Import
```typescript
import Axon from 'axios-fluent';

const client = Axon.new()
  .baseUrl('https://api.example.com')
  .bearer('token')
  .json();

// Check that TypeScript types work
const response = await client.get<{ id: number }>('/users/1');
console.log(response.data.id); // Should be type-safe
```

## 🔲 npm Account Setup (TODO)

- [ ] Create npm account at https://www.npmjs.com/signup
- [ ] Verify email address
- [ ] Enable 2FA (highly recommended)
- [ ] Login locally: `npm login`

## 🔲 Publishing Steps (TODO)

### 1. Final Check
```bash
# What will be published?
npm pack --dry-run

# Check package info
npm publish --dry-run
```

### 2. Publish to npm
```bash
npm publish
```

### 3. Verify Publication
```bash
npm info axios-fluent
npm install axios-fluent
```

### 4. Post-Publish
- [ ] Test installing from npm registry
- [ ] Create GitHub release (tag: v0.1.0)
- [ ] Share on social media/communities (optional)
- [ ] Add npm badge to README

## 🎯 Publishing Command Summary

```bash
# 1. Build
npm run build

# 2. Test locally
npm pack
npm install ./axios-fluent-0.1.0.tgz

# 3. Login to npm (first time only)
npm login

# 4. Publish
npm publish

# 5. Verify
npm info axios-fluent
```

## 🚨 Important Notes

1. **Can't unpublish**: Once published, you can't easily remove it. Only deprecate.
2. **Version is permanent**: Can't re-publish same version number.
3. **Check name**: Double-check package name before publishing.
4. **Test first**: Always test with `npm pack` before real publish.

## 📊 Expected Results

After publishing, users will be able to:

```bash
npm install axios-fluent
```

```typescript
import Axon from 'axios-fluent';

const api = Axon.new()
  .baseUrl('https://api.example.com')
  .bearer('token')
  .timeout(5000);

const users = await api.get('/users');
```

## 🎉 Ready to Publish?

If all checkboxes above are complete, you're ready to publish!

Run:
```bash
npm login
npm publish
```

Good luck! 🚀

---

Need help? See [PUBLISHING.md](./PUBLISHING.md) for detailed instructions.
