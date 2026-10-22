"""Generate lightweight wall assets from the unchanged numbered originals. Requires Pillow."""
from pathlib import Path
from PIL import Image

wall = Path(__file__).resolve().parents[1] / 'docs' / 'public' / 'wall'
files = sorted(wall.glob('[0-9][0-9].webp'))
thumbs = wall / 'thumbs'
thumbs.mkdir(exist_ok=True)
for source in files:
    with Image.open(source) as image:
        image = image.convert('RGB')
        image.resize((640,360),Image.Resampling.LANCZOS).save(thumbs / source.name,quality=78,method=6)
print(f'{len(files)} thumbnails: {sum(p.stat().st_size for p in thumbs.glob("*.webp")) / 1024:.1f} KiB')
