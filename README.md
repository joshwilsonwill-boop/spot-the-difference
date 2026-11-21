# Lagos Market: Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/joshwilsonwill-boop/spot-the-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/joshwilsonwill-boop/spot-the-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A spot the difference game set in Lagos, made for the
[best spot the difference game bounty](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
on make.fun. All three pictures are original art drawn procedurally on canvas 2D:
a market stall, a danfo bus stop at dusk, and a lagoon sunset. No images, fonts or
sounds are downloaded; everything is drawn and synthesized in the game itself, and
the game runs from static files with zero network requests.

## How to play

Two near-identical pictures sit side by side. Seven differences hide between them
in each scene. Click or tap a difference in either picture to mark it with a green
ring. Find all seven to clear the scene, then move to the next one. Clear all three
scenes to win.

- Mouse or touch: click a difference to mark it.
- Keyboard: arrow keys move the cursor, Enter or Space marks the spot under it.
- P pauses. A wrong click costs 25 points; each difference found is worth 100, and
  clearing a scene fast earns a time bonus.

## Run it

Serve the `game/` folder with any static server and open it in a desktop browser,
for example:

```
python3 -m http.server 8123 --directory game
```

Then open http://127.0.0.1:8123/ in Chrome.

## Hand it in

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `game/` and `screenshots/` to `out/` and writes `out/dossier.json`.

## License

MIT. See LICENSE.
