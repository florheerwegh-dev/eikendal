# Eikendal Open Wereld

Een fantasy-middeleeuwse 3D open wereld. Speel in je browser via GitHub Pages; multiplayer loopt via een server op Render.

## 1. Het spel op GitHub zetten
1. Maak op github.com een nieuwe repository, bijvoorbeeld `eikendal` (Public).
2. Zet deze map erin. Met de Terminal, in deze map:
   ```
   git remote add origin https://github.com/JOUW-NAAM/eikendal.git
   git push -u origin main
   ```
   (of sleep de map in GitHub Desktop).
3. Op GitHub: **Settings → Pages → Branch: main, map: / (root) → Save**. Na een minuutje staat het spel op
   `https://JOUW-NAAM.github.io/eikendal/`.

## 2. De multiplayer-server op Render
1. Log in op render.com (kan met je GitHub-account).
2. **New → Blueprint**, kies de repository `eikendal` en klik **Apply**. Render leest `render.yaml` en start de server.
3. Bovenaan de service staat het adres, bijvoorbeeld `https://eikendal-mp.onrender.com`.
4. Is dat adres anders, open dan `mp-config.js` op GitHub (potloodje), zet jouw adres erin en klik **Commit changes**.

## 3. Samen spelen
Open het spel via de GitHub-link, kies **Multiplayer** en dezelfde servernaam als je vrienden.
De gratis server slaapt als er een tijd niemand speelt: de eerste keer kan verbinden tot een minuut duren.
