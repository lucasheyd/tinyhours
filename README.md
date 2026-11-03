# Tiny Hours

Very small creatures at a 24h corner store called Tiny Hours, open all night.

The project starts with short videos for TikTok, Reels and Shorts. A collection may come later.

## Cast (`art/cast.js`)

| | Who |
|---|---|
| **Pomu** | The night-shift clerk. Always sleepy, always polite. Wakes up for every door chime. |
| **Lumi** | A regular who cannot resist the drink fridge light. Or any light, really. |
| **Gloop** | Comes in at 3am for snacks and stays to read every magazine. Slightly melty. |
| **Hop** | The delivery rider. Always in a hurry, always on the phone, never late (almost). |

## How it is drawn (`art/creatures.js`)

Everything is SVG drawn by code:
- Hand-inked lines, heavier on the shadow side, with a slight tremble that "boils" on twos in video.
- Cel shading with hatching, a pastel palette and paper grain.

There are 8 species, 11 kinds of eyes, 7 mouths, outfits, things to hold and 5 store scenes.

## Videos (`video/`)

```text
npm install
node video/render.js            # every clip -> out/<id>.mp4 (1080x1920, 24 fps), cover .png, post text .txt
node video/render.js 02         # one clip
node video/render.js 02 --still 100   # one frame, to check a pose
```

Each clip is a file in `video/clips/`, with a `draw(frame)` that returns the frame as SVG. The building blocks live in `video/frame.js`:
- **Captions:** a caption box and speech bubbles.
- **Effects:** comic words (DING!), floating Zs, hearts.
- **Branding:** the Tiny Hours logo.

The videos have no sound: add a trending sound in the app when posting.

`out/` is not versioned. Social setup: [`docs/SOCIAIS.md`](docs/SOCIAIS.md).
