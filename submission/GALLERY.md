# Devpost image gallery

Upload in this order. All five images are deterministic 1440×900 captures of the held native-Chrome build with fictional staging data and seeded defects.

1. **`gallery-01-effect-trace.png`**  
   Caption: **Correct call. Wrong effect. Release blocked.**  
   The opening image contains the complete hook: native WebMCP, `success: true`, requested one, observed two, and the blocked release decision.

2. **`gallery-02-failure-proof.png`**  
   Caption: **The selected order changed—and so did one that was never selected.**  
   Human intent, exact tool call, successful return, independently observed state, collateral mutation, and split verdict remain visible together.

3. **`gallery-03-identical-repair.png`**  
   Caption: **Repair the handler. Rerun the identical regression. Pass.**  
   The same target, action contract, regression identity, and UI prove the repaired one-record effect.

4. **`gallery-04-same-core-permissions.png`**  
   Caption: **One verification core, a second action class.**  
   The permission workflow detects Bob's unrequested role change using the same Effect Contract pipeline.

5. **`gallery-05-measured-comparison.png`**  
   Caption: **Evals accepted both correct calls. The collateral effects remained.**  
   The image closes on the identical permission regression PASS and the bounded Evals + Playwright comparison.

Regenerate and console-check the set with:

```bash
npm run submission:images
```
