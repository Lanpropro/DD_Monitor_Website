"""Generate lightweight wall assets from the unchanged numbered originals. Requires Pillow."""
from pathlib import Path
from PIL import Image

wall = Path(__file__).resolve().parents[1] / 'docs' / 'public' / 'wall'
files = sorted(wall.glob('[0-9][0-9].webp'))
thumbs = wall / 'thumbs'
thumbs.mkdir(exist_ok=True)
sheet = Image.new('RGB', (7 * 64, 8 * 36))
for index, source in enumerate(files):
    with Image.open(source) as image:
        image = image.convert('RGB')
        image.resize((640,360),Image.Resampling.LANCZOS).save(thumbs / source.name,quality=78,method=6)
        sheet.paste(image.resize((64,36),Image.Resampling.LANCZOS),((index % 7) * 64,(index // 7) * 36))
sheet.save(wall / 'preview.webp',quality=35,method=6)
print(f'{len(files)} thumbnails: {sum(p.stat().st_size for p in thumbs.glob("*.webp")) / 1024:.1f} KiB')
print(f'Preview sheet: {(wall / "preview.webp").stat().st_size / 1024:.1f} KiB')
