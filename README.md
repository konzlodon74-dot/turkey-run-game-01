# Gobble Dash: The Great Escape

![make.fun](https://make.fun/badge/turkey-run-game-01.svg)
![rank](https://make.fun/badge/turkey-run-game-01/konzlodon74-dot/turkey-run-game-01/rank.svg)
![reward](https://make.fun/badge/turkey-run-game-01/konzlodon74-dot/turkey-run-game-01/reward.svg)

Entry for the make.fun bounty [Make the best turkey escape game](https://make.fun/c/turkey-run-game-01).

## The game

Thanksgiving is coming and you are the main course. Play a turkey sprinting
through the farmyard, the barn, and the dreaded kitchen while the farmer
gains on you from behind. Jump fences, hay bales, crates and ovens; duck
under flying carving knives; grab corn for score and breathing room; hide
in haystacks to shake the farmer off. You have 3 feathers (lives) — lose
them all, or let the farmer close the gap, and it's "CAUGHT! On the menu…".
Reach 1500 m and you're free range forever.

- Controls: SPACE / ↑ / click to jump, ↓ to duck and hide, P/Esc to pause,
  mute button under the game. All art is canvas shapes, all sound is
  WebAudio generated in code — fully offline, no network requests.

## Layout

- `game/index.html` + `game/style.css` — page shell
- `game/js/game.js` — game loop, input, HUD, screens
- `game/js/art.js` — canvas drawing: turkey, farmer, obstacles, corn
- `game/js/stages.js` — farmyard → barn → kitchen stage definitions
- `game/js/audio.js` — generated WebAudio bleeps
- `main.ts` — hand-in program (Node 22): copies `game/` + `screenshots/`
  to the output dir and writes `dossier.json` via `vendor/makefun-game.ts`
- `screenshots/` — real renders of the game (first by name is the cover)

Run locally: `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`, then
serve `game/` with any static server and open it in Chrome.

## License

MIT — see `LICENSE`.
