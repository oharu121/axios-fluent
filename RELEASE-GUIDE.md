# Release Guide - Answers to Common Questions

## Q1: Should I put this on GitHub before releasing to npm?

**Answer: YES, absolutely.**

### Why?

1. **npm expects it** - Your package.json references `https://github.com/oharu121/axios-fluent.git`
2. **User trust** - Developers check GitHub before installing packages
3. **Issue tracking** - Users need a place to report bugs
4. **Documentation** - GitHub renders README beautifully
5. **Backup** - Version control safety net
6. **Contributions** - Community can submit PRs

### Order of Operations

```bash
# 1. Create GitHub repository
#    Go to: https://github.com/new
#    Name: axios-fluent
#    Public repository
#    Don't initialize with README (you already have one)

# 2. Initialize git locally (if not already)
cd f:\repository\axon
git init

# 3. Add all files
git add .

# 4. Commit
git commit -m "Initial release: axios-fluent v0.1.0"

# 5. Add remote
git remote add origin https://github.com/oharu121/axios-fluent.git

# 6. Push to GitHub
git branch -M main
git push -u origin main

# 7. Wait 5 minutes, verify on GitHub

# 8. THEN publish to npm
npm login
npm publish
```

### After Publishing to npm

Create a GitHub release:
1. Go to your repo > Releases > Create new release
2. Tag: `v0.1.0`
3. Title: `v0.1.0 - Initial Release`
4. Description: Copy from CHANGELOG.md
5. Publish release

---

## Q2: Should I enable CI/CD? How?

**Answer: Good to have, but NOT required for v0.1.0**

### For v0.1.0 (Initial Release)

**Recommendation: Add basic CI, skip auto-publish**

✅ DO add:
- Build verification CI (I've created `.github/workflows/ci.yml`)
- Tests Node 16, 18, 20
- Verifies build succeeds

❌ DON'T add yet:
- Auto-publishing (do manual first)
- Complex test suites (you don't have tests yet)

### What I've Created for You

**1. CI Workflow** (`.github/workflows/ci.yml`)
- Runs on every push/PR
- Tests on Node 16, 18, 20
- Builds the package
- Verifies output files exist

**2. Publish Workflow** (`.github/workflows/publish.yml`)
- Commented out for now
- When ready: creates releases → auto-publishes to npm
- Requires NPM_TOKEN secret

### How to Enable CI

**It's automatic!** When you push to GitHub, it will run.

### How to Enable Auto-Publish (Later)

1. **Get npm token:**
```bash
npm login
cat ~/.npmrc  # On Windows: type %USERPROFILE%\.npmrc
# Copy the token (starts with npm_...)
```

2. **Add to GitHub:**
   - Go to repo Settings
   - Secrets and variables > Actions
   - New repository secret
   - Name: `NPM_TOKEN`
   - Value: Your token

3. **Create releases on GitHub:**
   - The workflow triggers on GitHub releases
   - Not on git tags alone

### Timeline Recommendation

- **v0.1.0 (now)**: Manual publish, basic CI
- **v0.2.0**: Add tests, expand CI
- **v1.0.0**: Enable auto-publish

---

## Q3: Which files should/shouldn't be published to npm?

**Answer: Already configured correctly! But let me explain.**

### What Gets Published ✅

Your `package.json` "files" array controls this:

```json
"files": [
  "dist",
  "README.md",
  "LICENSE"
]
```

**This means ONLY these are published:**

```
axios-fluent/
├── dist/
│   ├── Axon.js          (compiled code)
│   ├── Axon.js.map      (source map)
│   ├── Axon.d.ts        (TypeScript types)
│   └── Axon.d.ts.map    (type source map)
├── README.md            (documentation)
├── LICENSE              (MIT license)
└── package.json         (auto-included)
```

**Package size:** ~10-15 KB compressed ✅

### What Doesn't Get Published ❌

Everything else is excluded:

```
❌ Axon.ts               (source code)
❌ tsconfig.json         (build config)
❌ examples/             (view on GitHub)
❌ dev-notes/            (internal docs)
❌ .github/              (CI/CD workflows)
❌ PUBLISHING.md         (internal guide)
❌ CHANGELOG.md          (not in files array)
❌ All other .md files   (internal docs)
```

### Why This is Good

1. **Small package** - Users download less
2. **Professional** - Only production files
3. **Security** - No dev files leaked
4. **Clean** - Users see only what matters

### How to Verify

```bash
# See what will be published
npm pack --dry-run

# Create actual tarball
npm pack

# Inspect contents
tar -tzf axios-fluent-0.1.0.tgz
```

See [verify-package.md](verify-package.md) for detailed verification steps.

### Your .npmignore is Correct

I've updated it to explicitly exclude:
- `examples/`
- `dev-notes/`
- `PUBLISHING.md`
- `PRE-PUBLISH-CHECKLIST.md`
- `QUICK_START.md`
- `NAMING.md`

This is **belt-and-suspenders** protection. The `"files"` array already excludes them, but .npmignore adds extra safety.

---

## Summary: Your Release Checklist

### Phase 1: GitHub (Do First)
- [x] Code complete and documented
- [x] Build succeeds
- [x] CI/CD workflows created
- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Verify everything looks good

### Phase 2: npm (Do Second)
- [ ] Verify package contents: `npm pack --dry-run`
- [ ] Test locally: `npm pack` then install in test project
- [ ] Login to npm: `npm login`
- [ ] Publish: `npm publish`
- [ ] Verify: `npm info axios-fluent`
- [ ] Test install: `npm install axios-fluent`

### Phase 3: GitHub Release (Do Third)
- [ ] Create GitHub release v0.1.0
- [ ] Tag: `v0.1.0`
- [ ] Copy CHANGELOG to release notes
- [ ] Publish release

### Phase 4: Announce (Optional)
- [ ] Tweet about it
- [ ] Post on Reddit r/javascript
- [ ] Share on dev.to
- [ ] Add npm badge to README

---

## What Files Go Where

### GitHub (Everything)
```
✅ All source code
✅ All documentation
✅ All examples
✅ All dev notes
✅ CI/CD workflows
✅ Everything!
```

### npm (Minimal)
```
✅ dist/ (compiled code only)
✅ README.md
✅ LICENSE
✅ package.json
❌ Everything else
```

### Why Different?

- **GitHub** = Developer experience (exploring, contributing)
- **npm** = User experience (small, fast install)

---

## Quick Reference

```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for release"
git push origin main

# 2. Verify package
npm pack --dry-run

# 3. Publish to npm
npm login
npm publish

# 4. Create GitHub release
# (Do via GitHub web interface)
```

---

## Questions?

- **GitHub not created yet?** Do it first at https://github.com/new
- **Worried about CI?** It's optional for v0.1.0
- **Package too large?** Run `npm pack` to check size
- **Not sure what's included?** Run `npm pack --dry-run`

**You're ready to publish!** 🚀
