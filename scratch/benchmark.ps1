# benchmark.ps1 — Full Performance Benchmark for dongngon
$ErrorActionPreference = "Continue"
$results = @{}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DONGNGON — FULL PERFORMANCE BENCHMARK" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Cold Build
Write-Host "[1/5] Cold Build..." -ForegroundColor Yellow
$buildTime = Measure-Command { npm run build 2>&1 | Out-Null }
$results["build_cold_seconds"] = [math]::Round($buildTime.TotalSeconds, 2)
Write-Host "  -> $($results['build_cold_seconds'])s" -ForegroundColor Green

# 2. TypeScript Check
Write-Host "[2/5] TypeScript Check..." -ForegroundColor Yellow
$tscTime = Measure-Command { npx tsc --noEmit 2>&1 | Out-Null }
$results["tsc_check_seconds"] = [math]::Round($tscTime.TotalSeconds, 2)
Write-Host "  -> $($results['tsc_check_seconds'])s" -ForegroundColor Green

# 3. Lint
Write-Host "[3/5] ESLint..." -ForegroundColor Yellow
$lintTime = Measure-Command { npm run lint 2>&1 | Out-Null }
$results["lint_seconds"] = [math]::Round($lintTime.TotalSeconds, 2)
Write-Host "  -> $($results['lint_seconds'])s" -ForegroundColor Green

# 4. Test Suite
Write-Host "[4/5] Vitest..." -ForegroundColor Yellow
$testTime = Measure-Command { npm run test:unit 2>&1 | Out-Null }
$results["test_seconds"] = [math]::Round($testTime.TotalSeconds, 2)
Write-Host "  -> $($results['test_seconds'])s" -ForegroundColor Green

# 5. Bundle Analysis — Measure .next output
Write-Host "[5/5] Bundle Analysis..." -ForegroundColor Yellow

# .next/static total size
$staticPath = ".next\static"
if (Test-Path $staticPath) {
    $staticSize = (Get-ChildItem -Recurse -File $staticPath | Measure-Object -Property Length -Sum).Sum
    $results["static_total_bytes"] = $staticSize
    $results["static_total_kb"] = [math]::Round($staticSize / 1024, 1)

    # JS chunks
    $jsFiles = Get-ChildItem -Recurse -File $staticPath -Include "*.js"
    $jsSize = ($jsFiles | Measure-Object -Property Length -Sum).Sum
    $results["js_total_bytes"] = if ($jsSize) { $jsSize } else { 0 }
    $results["js_total_kb"] = [math]::Round($results["js_total_bytes"] / 1024, 1)
    $results["js_file_count"] = if ($jsFiles) { $jsFiles.Count } else { 0 }

    # CSS chunks
    $cssFiles = Get-ChildItem -Recurse -File $staticPath -Include "*.css"
    $cssSize = ($cssFiles | Measure-Object -Property Length -Sum).Sum
    $results["css_total_bytes"] = if ($cssSize) { $cssSize } else { 0 }
    $results["css_total_kb"] = [math]::Round($results["css_total_bytes"] / 1024, 1)
    $results["css_file_count"] = if ($cssFiles) { $cssFiles.Count } else { 0 }
}

# .next/server size
$serverPath = ".next\server"
if (Test-Path $serverPath) {
    $serverSize = (Get-ChildItem -Recurse -File $serverPath | Measure-Object -Property Length -Sum).Sum
    $results["server_total_bytes"] = $serverSize
    $results["server_total_kb"] = [math]::Round($serverSize / 1024, 1)
}

# Total .next size
$nextPath = ".next"
if (Test-Path $nextPath) {
    $totalSize = (Get-ChildItem -Recurse -File $nextPath | Measure-Object -Property Length -Sum).Sum
    $results["next_total_bytes"] = $totalSize
    $results["next_total_mb"] = [math]::Round($totalSize / 1048576, 2)
}

# Top 10 largest JS chunks
Write-Host "`n--- Top 10 Largest JS Chunks ---" -ForegroundColor Cyan
if ($jsFiles -and $jsFiles.Count -gt 0) {
    $jsFiles | Sort-Object -Property Length -Descending | Select-Object -First 10 | ForEach-Object {
        $sizeKb = [math]::Round($_.Length / 1024, 1)
        Write-Host "  $sizeKb KB  $($_.Name)"
    }
} else {
    Write-Host "  (no JS chunks found)"
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Cold Build:     $($results['build_cold_seconds'])s"
Write-Host "  TSC Check:      $($results['tsc_check_seconds'])s"
Write-Host "  Lint:           $($results['lint_seconds'])s"
Write-Host "  Tests:          $($results['test_seconds'])s"
Write-Host "  ---"
Write-Host "  JS Bundle:      $($results['js_total_kb']) KB ($($results['js_file_count']) files)"
Write-Host "  CSS Bundle:     $($results['css_total_kb']) KB ($($results['css_file_count']) files)"
Write-Host "  Static Total:   $($results['static_total_kb']) KB"
Write-Host "  Server Total:   $($results['server_total_kb']) KB"
Write-Host "  .next Total:    $($results['next_total_mb']) MB"
Write-Host "========================================`n" -ForegroundColor Cyan

# Save baseline JSON
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$results["timestamp"] = $timestamp
$results["node_version"] = (node -v)
$results["next_version"] = "16.2.6"

$baselineDir = ".ecc\benchmarks"
if (-not (Test-Path $baselineDir)) {
    New-Item -ItemType Directory -Path $baselineDir -Force | Out-Null
}

$baselineFile = "$baselineDir\baseline_$timestamp.json"
$results | ConvertTo-Json -Depth 3 | Out-File -Encoding utf8 $baselineFile
Write-Host "Baseline saved to: $baselineFile" -ForegroundColor Green

# Also save as latest
$results | ConvertTo-Json -Depth 3 | Out-File -Encoding utf8 "$baselineDir\latest.json"
Write-Host "Latest baseline: $baselineDir\latest.json" -ForegroundColor Green
