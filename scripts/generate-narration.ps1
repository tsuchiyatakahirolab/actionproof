$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Speech

$outputDirectory = Join-Path $PSScriptRoot "..\submission\.audio"
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

$segments = @(
  "The agent did everything right. The result was still wrong. This is ActionProof for Web M C P.",
  "The human selects only Order ten forty-two. ActionProof generates an Effect Contract: cancel this order; leave every unselected order unchanged.",
  "The page exposes one context-matched native Web M C P tool. Its schema binds the argument to the visible selection.",
  "The tool returns success. At the invocation layer, everything passed.",
  "But application state, observed independently of the return, shows two orders changed. The seeded handler also cancelled unselected Order ten forty-three.",
  "ActionProof separates those facts: tool call passed; real-world effect failed. Requested one, changed two.",
  "After repairing only the handler, we rerun the identical generated contract and arguments. The retained regression passes.",
  "The same verification core catches the same defect class in permission changes, then passes the identical repair regression.",
  "Evals accepted both correct calls and rejected both wrong controls, while both effect defects remained. ActionProof generated state checks from two bindings.",
  "Correct call. Wrong effect."
)

$synthesizer = New-Object System.Speech.Synthesis.SpeechSynthesizer
$preferredVoice = $synthesizer.GetInstalledVoices() |
  ForEach-Object { $_.VoiceInfo } |
  Where-Object { $_.Culture.Name -eq "en-US" -and $_.Name -match "Mark|David|Zira" } |
  Select-Object -First 1
if ($preferredVoice) {
  $synthesizer.SelectVoice($preferredVoice.Name)
}
$synthesizer.Rate = 1
$synthesizer.Volume = 100

for ($index = 0; $index -lt $segments.Count; $index += 1) {
  $path = Join-Path $outputDirectory ("{0:D2}.wav" -f $index)
  $synthesizer.SetOutputToWaveFile($path)
  $synthesizer.Speak($segments[$index])
  $synthesizer.SetOutputToNull()
}

$synthesizer.Dispose()
Write-Output "Generated $($segments.Count) narration segments with voice $($preferredVoice.Name)."
