#!/usr/bin/env node

/**
 * Release script for archcss
 * 
 * Usage:
 *   bun run scripts/release.js patch    # 0.1.0-alpha.1 → 0.1.0-alpha.2
 *   bun run scripts/release.js minor    # 0.1.0-alpha.1 → 0.2.0-alpha.1
 *   bun run scripts/release.js major    # 0.1.0-alpha.1 → 1.0.0-alpha.1
 *   bun run scripts/release.js alpha    # 0.1.0-alpha.1 → 0.1.0-alpha.2
 *   bun run scripts/release.js beta     # 0.1.0-alpha.1 → 0.1.0-beta.1
 *   bun run scripts/release.js stable   # 0.1.0-alpha.1 → 0.1.0
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Get command line arguments
const [,, type] = process.argv;

if (!type || !['patch', 'minor', 'major', 'alpha', 'beta', 'stable'].includes(type)) {
  console.error('Usage: bun run scripts/release.js <type>');
  console.error('Types: patch, minor, major, alpha, beta, stable');
  process.exit(1);
}

// Read current version from package.json
const packageJsonPath = join(rootDir, 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

console.log(`Current version: ${currentVersion}`);

// Parse version
const versionRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([^.]+)\.(\d+))?$/;
const match = currentVersion.match(versionRegex);

if (!match) {
  console.error(`Invalid version format: ${currentVersion}`);
  process.exit(1);
}

const [, major, minor, patch, prerelease, prereleaseNumber] = match;

let newVersion;

switch (type) {
  case 'patch':
    if (prerelease) {
      newVersion = `${major}.${minor}.${patch}-${prerelease}.${parseInt(prereleaseNumber) + 1}`;
    } else {
      newVersion = `${major}.${parseInt(minor) + 1}.0`;
    }
    break;
    
  case 'minor':
    if (prerelease) {
      newVersion = `${major}.${parseInt(minor) + 1}.0-${prerelease}.1`;
    } else {
      newVersion = `${major}.${parseInt(minor) + 1}.0`;
    }
    break;
    
  case 'major':
    if (prerelease) {
      newVersion = `${parseInt(major) + 1}.0.0-${prerelease}.1`;
    } else {
      newVersion = `${parseInt(major) + 1}.0.0`;
    }
    break;
    
  case 'alpha':
    if (prerelease === 'alpha') {
      newVersion = `${major}.${minor}.${patch}-alpha.${parseInt(prereleaseNumber) + 1}`;
    } else {
      newVersion = `${major}.${minor}.${patch}-alpha.1`;
    }
    break;
    
  case 'beta':
    if (prerelease === 'beta') {
      newVersion = `${major}.${minor}.${patch}-beta.${parseInt(prereleaseNumber) + 1}`;
    } else {
      newVersion = `${major}.${minor}.${patch}-beta.1`;
    }
    break;
    
  case 'stable':
    if (prerelease) {
      newVersion = `${major}.${minor}.${patch}`;
    } else {
      console.error('Version is already stable');
      process.exit(1);
    }
    break;
}

console.log(`New version: ${newVersion}`);

// Update package.json files
const packages = [
  'package.json',
  'packages/parser/package.json'
];

for (const pkg of packages) {
  const pkgPath = join(rootDir, pkg);
  const pkgJson = JSON.parse(readFileSync(pkgPath, 'utf8'));
  pkgJson.version = newVersion;
  writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + '\n');
  console.log(`Updated ${pkg} to ${newVersion}`);
}

// Update CHANGELOG.md
const changelogPath = join(rootDir, 'CHANGELOG.md');
const changelog = readFileSync(changelogPath, 'utf8');

const today = new Date().toISOString().split('T')[0];
const newChangelog = changelog.replace(
  '## [Unreleased]',
  `## [Unreleased]

## [${newVersion}] - ${today}`
);

writeFileSync(changelogPath, newChangelog);
console.log(`Updated CHANGELOG.md`);

// Git operations
try {
  execSync('git add .', { cwd: rootDir, stdio: 'inherit' });
  execSync(`git commit -m "chore: bump version to ${newVersion}"`, { cwd: rootDir, stdio: 'inherit' });
  execSync(`git tag v${newVersion}`, { cwd: rootDir, stdio: 'inherit' });
  console.log(`Created git tag v${newVersion}`);
} catch (error) {
  console.error('Git operations failed:', error.message);
  process.exit(1);
}

// Build packages
try {
  execSync('bun run build', { cwd: rootDir, stdio: 'inherit' });
  console.log('Built packages successfully');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

// Publish to npm (if not alpha/beta)
if (type === 'stable' || type === 'patch' || type === 'minor' || type === 'major') {
  const tag = prerelease ? prerelease : 'latest';
  try {
    execSync(`npm publish --tag ${tag}`, { cwd: join(rootDir, 'packages/parser'), stdio: 'inherit' });
    console.log(`Published to npm with tag ${tag}`);
  } catch (error) {
    console.error('NPM publish failed:', error.message);
    process.exit(1);
  }
} else {
  console.log('Skipping npm publish for pre-release');
}

console.log(`\n✅ Release ${newVersion} completed successfully!`);
console.log(`\nNext steps:`);
console.log(`1. Push changes: git push origin main --tags`);
console.log(`2. Create GitHub release: https://github.com/archcss/archcss/releases/new`);
console.log(`3. Update documentation if needed`);
