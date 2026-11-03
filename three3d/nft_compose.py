"""Puts each 3D NFT render on its background as a 1:1 token image, plus a grid."""
import json, os
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(__file__), '..', 'out', '3d')
os.makedirs(os.path.join(OUT, 'nft'), exist_ok=True)
tiles = []
for s in json.load(open(os.path.join(OUT, 'nft-set.json'))):
    art = Image.open(os.path.join(OUT, f"nft-{s['id']}-front.png")).convert('RGBA')
    side = art.height  # 1280 (rendered at 2x)
    tok = Image.new('RGBA', (side, side), s['bg'])
    # soft floor shadow under the character
    sh = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    ImageDraw.Draw(sh).ellipse([side * 0.3, side * 0.79, side * 0.7, side * 0.85], fill=(0, 0, 0, 40))
    tok.alpha_composite(sh)
    tok.alpha_composite(art, ((side - art.width) // 2, 0))
    tok = tok.convert('RGB').resize((1024, 1024), Image.LANCZOS)
    tok.save(os.path.join(OUT, 'nft', f"{s['id']}.png"))
    tiles.append(tok)
n, t, gap = len(tiles), 340, 16
cols = 3
rows = (n + cols - 1) // cols
grid = Image.new('RGB', (cols * t + (cols + 1) * gap, rows * t + (rows + 1) * gap), '#ffffff')
for i, im in enumerate(tiles):
    grid.paste(im.resize((t, t), Image.LANCZOS), (gap + (i % cols) * (t + gap), gap + (i // cols) * (t + gap)))
grid.save(os.path.join(OUT, 'nft-grid.png'))
print('nft grid:', n)
