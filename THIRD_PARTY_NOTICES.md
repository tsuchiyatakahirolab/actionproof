# Third-party tooling and dependency notice

ExactDelta source code is licensed under MIT. The authoritative dependency graph and versions are in `package-lock.json`; each installed package's own license remains controlling.

## Runtime

- `react` and `react-dom` — MIT

No external API, model, database, analytics service, authentication provider, or customer system is required by the running demo.

## Development, testing, and build

- TypeScript, `tsx`, Vite, Vitest, Playwright, WebMCP types/evals, and their transitive dependencies are development tooling under the licenses declared by their packages.
- `@axe-core/playwright` and `axe-core` declare MPL-2.0 and are used only for automated development/test accessibility checks.
- `lightningcss` declares MPL-2.0.
- `ffmpeg-static` declares GPL-3.0-or-later and is invoked as a separate local process only to encode the demo video. Its binary and `node_modules` are not committed or distributed in this repository.
- `edge-tts` 7.2.8 was used as an online, third-party build tool to generate the English narration clips. It is not an ExactDelta runtime dependency; the generated audio is embedded in the final demo MP4.

## Repository boundary

The repository does not track `node_modules`, Vite `dist`, local Vercel state, raw narration clips, raw browser recordings, or video-audit frames. The final MP4, screenshots, and thumbnail are submission assets.

This notice is an engineering inventory, not legal advice. Before redistribution outside this hackathon submission, re-check the exact dependency and service terms applicable at that time.
