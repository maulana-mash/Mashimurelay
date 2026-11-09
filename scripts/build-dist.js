/**
 * scripts/build-dist.js
 * Automated build & minification pipeline for Mashimurelay
 * Compiles and protects production assets from simurelay-web into dist/ and simurelay-windows/dist/
 * Preserves clean source files in simurelay-web/src_dev
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE_DIR = path.resolve(__dirname, '..');
const WEB_DIST_DIR = path.resolve(BASE_DIR, 'dist');
const WIN_DIST_DIR = path.resolve(BASE_DIR, '..', 'simurelay-windows', 'dist');

console.log('====================================================');
console.log('      MASHIMURELAY PRODUCTION BUILD & MINIFIER      ');
console.log('====================================================\n');

// 1. Ensure target directories exist
[WEB_DIST_DIR, WIN_DIST_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const jsDir = path.join(dir, 'js');
  const cssDir = path.join(dir, 'css');
  if (!fs.existsSync(jsDir)) fs.mkdirSync(jsDir, { recursive: true });
  if (!fs.existsSync(cssDir)) fs.mkdirSync(cssDir, { recursive: true });
});

// 2. Copy static files
const staticFiles = ['index.html', 'manifest.json', 'components.json', 'sw.js'];
staticFiles.forEach(file => {
  const src = path.join(BASE_DIR, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(WEB_DIST_DIR, file));
    fs.copyFileSync(src, path.join(WIN_DIST_DIR, file));
    console.log(`[OK Static] ${file}`);
  }
});

// 3. Copy CSS
const cssSrc = path.join(BASE_DIR, 'css', 'style.css');
if (fs.existsSync(cssSrc)) {
  fs.copyFileSync(cssSrc, path.join(WEB_DIST_DIR, 'css', 'style.css'));
  fs.copyFileSync(cssSrc, path.join(WIN_DIST_DIR, 'css', 'style.css'));
  console.log(`[OK CSS] style.css (${fs.statSync(cssSrc).size} bytes)`);
}

// 4. Minify JavaScript files
const jsSrcDir = path.join(BASE_DIR, 'js');
const jsFiles = fs.readdirSync(jsSrcDir).filter(f => f.endsWith('.js'));

console.log(`\nMinifying ${jsFiles.length} JavaScript files...`);

jsFiles.forEach(file => {
  const srcPath = path.join(jsSrcDir, file);
  const webDstPath = path.join(WEB_DIST_DIR, 'js', file);
  const winDstPath = path.join(WIN_DIST_DIR, 'js', file);

  const originalSize = fs.statSync(srcPath).size;

  try {
    // Run terser with toplevel:false and drop_debugger:true, comments:false
    // This minifies internal function scopes while strictly preserving all global variables
    const cmd = `cmd.exe /c npx terser "${srcPath}" --compress dead_code=true,drop_debugger=true --mangle toplevel=false --format comments=false -o "${webDstPath}"`;
    execSync(cmd, { stdio: 'pipe' });

    // Copy minified to windows dist
    fs.copyFileSync(webDstPath, winDstPath);

    const minSize = fs.statSync(webDstPath).size;
    const ratio = Math.round((1 - (minSize / originalSize)) * 100);
    console.log(`  ✓ ${file.padEnd(25)} ${originalSize.toLocaleString()} B -> ${minSize.toLocaleString()} B (${ratio}% smaller, comments stripped)`);
  } catch (err) {
    console.warn(`  ! Fallback for ${file}: copying unminified due to:`, err.message);
    fs.copyFileSync(srcPath, webDstPath);
    fs.copyFileSync(srcPath, winDstPath);
  }
});

// 5. Sync assets directory
const assetsSrcDir = path.join(BASE_DIR, 'assets');
const copyDirRecursive = (src, dst) => {
  if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
};

if (fs.existsSync(assetsSrcDir)) {
  copyDirRecursive(assetsSrcDir, path.join(WEB_DIST_DIR, 'assets'));
  copyDirRecursive(assetsSrcDir, path.join(WIN_DIST_DIR, 'assets'));
  console.log(`\n[OK Assets] Synced assets folder to dist`);
}

console.log('\n====================================================');
console.log('✓ Build & Protected Distribution complete!');
console.log('====================================================\n');
