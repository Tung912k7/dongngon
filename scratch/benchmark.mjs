// benchmark.mjs — Full Performance Benchmark for dongngon
import { execSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'fs';
import { extname, join } from 'path';

const CWD = 'D:/Projects/Website/dongngon';
const results = {};

function timeCmd(label, cmd) {
  console.log(`\n[${label}] Running: ${cmd}`);
  const start = Date.now();
  try {
    execSync(cmd, { cwd: CWD, stdio: 'pipe', timeout: 300000 });
    const ms = Date.now() - start;
    console.log(`  ✓ ${(ms / 1000).toFixed(2)}s`);
    return ms;
  } catch (e) {
    const ms = Date.now() - start;
    console.log(`  ⚠ ${(ms / 1000).toFixed(2)}s (exit code: ${e.status})`);
    return ms;
  }
}

function walkDir(dir, ext) {
  let files = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(walkDir(full, ext));
      } else if (!ext || extname(entry.name) === ext) {
        files.push({ path: full, size: statSync(full).size });
      }
    }
  } catch {}
  return files;
}

console.log('========================================');
console.log('  DONGNGON — FULL PERFORMANCE BENCHMARK');
console.log('========================================\n');

// 1. Cold Build
results.build_cold_ms = timeCmd('Cold Build', 'npm run build');
results.build_cold_seconds = +(results.build_cold_ms / 1000).toFixed(2);

// 2. TypeScript Check
results.tsc_check_ms = timeCmd('TSC Check', 'npx tsc --noEmit');
results.tsc_check_seconds = +(results.tsc_check_ms / 1000).toFixed(2);

// 3. Lint
results.lint_ms = timeCmd('ESLint', 'npm run lint');
results.lint_seconds = +(results.lint_ms / 1000).toFixed(2);

// 4. Tests
results.test_ms = timeCmd('Vitest', 'npm run test:unit');
results.test_seconds = +(results.test_ms / 1000).toFixed(2);

// 5. Bundle Analysis
console.log('\n[Bundle Analysis] Scanning .next output...');

const staticDir = join(CWD, '.next', 'static');
const serverDir = join(CWD, '.next', 'server');
const nextDir = join(CWD, '.next');

// JS files
const jsFiles = walkDir(staticDir, '.js');
results.js_total_bytes = jsFiles.reduce((s, f) => s + f.size, 0);
results.js_total_kb = +(results.js_total_bytes / 1024).toFixed(1);
results.js_file_count = jsFiles.length;

// CSS files
const cssFiles = walkDir(staticDir, '.css');
results.css_total_bytes = cssFiles.reduce((s, f) => s + f.size, 0);
results.css_total_kb = +(results.css_total_bytes / 1024).toFixed(1);
results.css_file_count = cssFiles.length;

// Static total
const allStatic = walkDir(staticDir);
results.static_total_bytes = allStatic.reduce((s, f) => s + f.size, 0);
results.static_total_kb = +(results.static_total_bytes / 1024).toFixed(1);

// Server total
const allServer = walkDir(serverDir);
results.server_total_bytes = allServer.reduce((s, f) => s + f.size, 0);
results.server_total_kb = +(results.server_total_bytes / 1024).toFixed(1);

// .next total
const allNext = walkDir(nextDir);
results.next_total_bytes = allNext.reduce((s, f) => s + f.size, 0);
results.next_total_mb = +(results.next_total_bytes / 1048576).toFixed(2);

// Top 10 largest JS chunks
const topJS = jsFiles.sort((a, b) => b.size - a.size).slice(0, 10);
results.top_js_chunks = topJS.map(f => ({
  name: f.path.split(/[\\/]/).pop(),
  size_kb: +(f.size / 1024).toFixed(1)
}));

// Top 5 largest CSS
const topCSS = cssFiles.sort((a, b) => b.size - a.size).slice(0, 5);
results.top_css_chunks = topCSS.map(f => ({
  name: f.path.split(/[\\/]/).pop(),
  size_kb: +(f.size / 1024).toFixed(1)
}));

// Dependencies count
try {
  const pkg = JSON.parse(execSync('type package.json', { cwd: CWD, encoding: 'utf8' }).replace(/^\s*/, ''));
  results.dep_count = Object.keys(pkg.dependencies || {}).length;
  results.devDep_count = Object.keys(pkg.devDependencies || {}).length;
} catch {}

// Node/Next versions
try { results.node_version = execSync('node -v', { encoding: 'utf8' }).trim(); } catch {}
results.next_version = '16.2.6';
results.timestamp = new Date().toISOString();

// Print summary
console.log('\n========================================');
console.log('  RESULTS SUMMARY');
console.log('========================================');
console.log(`  Cold Build:     ${results.build_cold_seconds}s`);
console.log(`  TSC Check:      ${results.tsc_check_seconds}s`);
console.log(`  Lint:           ${results.lint_seconds}s`);
console.log(`  Tests:          ${results.test_seconds}s`);
console.log('  ---');
console.log(`  JS Bundle:      ${results.js_total_kb} KB (${results.js_file_count} files)`);
console.log(`  CSS Bundle:     ${results.css_total_kb} KB (${results.css_file_count} files)`);
console.log(`  Static Total:   ${results.static_total_kb} KB`);
console.log(`  Server Total:   ${results.server_total_kb} KB`);
console.log(`  .next Total:    ${results.next_total_mb} MB`);
console.log('  ---');
console.log('  Top JS Chunks:');
results.top_js_chunks.forEach(c => console.log(`    ${c.size_kb} KB  ${c.name}`));
console.log('  Top CSS:');
results.top_css_chunks.forEach(c => console.log(`    ${c.size_kb} KB  ${c.name}`));
console.log('========================================\n');

// Save baseline
const baselineDir = join(CWD, '.ecc', 'benchmarks');
if (!existsSync(baselineDir)) mkdirSync(baselineDir, { recursive: true });

const ts = results.timestamp.replace(/[:.]/g, '-');
writeFileSync(join(baselineDir, `baseline_${ts}.json`), JSON.stringify(results, null, 2));
writeFileSync(join(baselineDir, 'latest.json'), JSON.stringify(results, null, 2));
console.log(`Baseline saved to: .ecc/benchmarks/latest.json`);
