$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$outputDirectory = Join-Path $root "submission\.audio"
$toolDirectory = Join-Path $root ".tools\tts-env"
$python = Join-Path $toolDirectory "Scripts\python.exe"
$requirements = Join-Path $PSScriptRoot "requirements-tts.txt"
$timelinePath = Join-Path $PSScriptRoot "narration-timeline.json"
$timeline = Get-Content -Raw -Path $timelinePath | ConvertFrom-Json

if (-not (Test-Path -LiteralPath $python)) {
  python -m venv $toolDirectory
}

& $python -m pip install --disable-pip-version-check --quiet -r $requirements
if ($LASTEXITCODE -ne 0) {
  throw "Unable to install the pinned neural TTS dependency."
}

New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
Get-ChildItem -LiteralPath $outputDirectory -File -ErrorAction SilentlyContinue |
  Where-Object { $_.Extension -in ".mp3", ".wav", ".srt" } |
  Remove-Item -Force

foreach ($clip in $timeline.clips) {
  $path = Join-Path $outputDirectory ("$($clip.id).mp3")
  & $python -m edge_tts `
    --voice $timeline.voice `
    --rate=$($timeline.rate) `
    --volume=$($timeline.volume) `
    --pitch=$($timeline.pitch) `
    --text $clip.text `
    --write-media $path
  if ($LASTEXITCODE -ne 0) {
    throw "Neural TTS failed for narration clip $($clip.id)."
  }
}

Write-Output "Generated $($timeline.clips.Count) sentence-level neural narration clips with $($timeline.voice)."
