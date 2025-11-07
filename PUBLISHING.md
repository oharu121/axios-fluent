# Publishing to NPM

This guide walks you through publishing Axon to the npm registry.

## Pre-Publishing Checklist

- [x] Code is complete and tested
- [x] All TypeScript files compile without errors
- [x] package.json metadata is complete
- [x] README.md with comprehensive documentation
- [x] LICENSE file (MIT)
- [x] CHANGELOG.md with version history
- [x] .npmignore properly configured
- [ ] Update author field in package.json
- [ ] Update repository URL in package.json
- [ ] Choose a unique package name (if "axon" is taken)
- [ ] Test the package locally

## Before First Publish

### 1. Update Package Metadata

Edit `package.json` and fill in:

```json
{
  "name": "axon", // Change if taken on npm
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/axon.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/axon/issues"
  },
  "homepage": "https://github.com/yourusername/axon#readme"
}
```

### 2. Check Package Name Availability

```bash
npm search axon
```

If "axon" is taken, consider alternatives:
- `@yourscope/axon`
- `axon-http`
- `axon-client`
- Choose a unique name

### 3. Test Package Locally

Build and test the package:

```bash
npm run build
npm pack
```

This creates a `.tgz` file. Test it in another project:

```bash
# In another project
npm install /path/to/axon-0.1.0.tgz

# Test the import
node -e "const Axon = require('axon'); console.log(Axon)"
```

## Publishing Steps

### 1. Create npm Account

If you don't have one:
```bash
npm adduser
```

Or login:
```bash
npm login
```

### 2. Verify Package Contents

Check what will be published:
```bash
npm pack --dry-run
```

This shows which files will be included.

### 3. Publish to npm

For first release:
```bash
npm publish
```

If using a scoped package:
```bash
npm publish --access public
```

### 4. Verify Publication

```bash
npm info axon
```

Test installation:
```bash
npm install axon
```

## Version Management

### Updating Versions

Use semantic versioning:

```bash
# Patch release (0.1.0 -> 0.1.1) - bug fixes
npm version patch

# Minor release (0.1.0 -> 0.2.0) - new features, backward compatible
npm version minor

# Major release (0.1.0 -> 1.0.0) - breaking changes
npm version major
```

This automatically:
- Updates version in package.json
- Creates a git tag
- Commits the change

Then publish:
```bash
npm publish
```

### Pre-release Versions

For beta/alpha releases:
```bash
npm version prerelease --preid=beta
# 0.1.0 -> 0.1.1-beta.0

npm publish --tag beta
```

Install with:
```bash
npm install axon@beta
```

## Post-Publishing

### 1. Update CHANGELOG

Add the new version to CHANGELOG.md with:
- Date
- Changes made
- Migration notes (if any)

### 2. Create GitHub Release

1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Tag version: `v0.1.0`
4. Release title: `v0.1.0 - Initial Release`
5. Description: Copy from CHANGELOG.md
6. Publish release

### 3. Update Documentation

If you have external docs, update them with new features.

## Troubleshooting

### Error: Package name already taken

Choose a different name or use a scope:
```json
{
  "name": "@yourscope/axon"
}
```

### Error: No permission to publish

Make sure you're logged in:
```bash
npm whoami
npm login
```

### Error: 402 Payment Required

Your package name might be reserved. Choose a different name.

### Files Missing in Published Package

Check `.npmignore` and `package.json` `files` field.

## Best Practices

1. **Semantic Versioning**: Follow semver strictly
2. **Test Before Publishing**: Always test with `npm pack`
3. **Keep CHANGELOG**: Document all changes
4. **Tag Releases**: Use git tags for versions
5. **Deprecate Properly**: Use `npm deprecate` for old versions
6. **Security**: Never publish secrets or credentials

## Continuous Deployment

For automated publishing with GitHub Actions, create `.github/workflows/publish.yml`:

```yaml
name: Publish to NPM

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm test
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Add your npm token to GitHub Secrets as `NPM_TOKEN`.

## Support

For npm publishing issues:
- [npm Documentation](https://docs.npmjs.com/)
- [npm Support](https://www.npmjs.com/support)

Good luck with your package! 🚀
