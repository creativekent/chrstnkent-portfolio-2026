"""Create web-sized copies without changing source images."""
from pathlib import Path
from PIL import Image, ImageOps
import re, hashlib
from urllib.parse import unquote
root=Path(__file__).resolve().parents[1]
out=root/'assets/optimized';out.mkdir(exist_ok=True)
if 'assets/optimized/' in (root/'index.html').read_text():
 raise SystemExit('Already optimized. Run against source HTML with original image paths only.')
cache={}; before=after=0
def optimize(src):
 global before,after
 src=unquote(src).lstrip('/');p=root/src
 if src in cache:return cache[src]
 if not p.exists():raise ValueError(src)
 key=p.stem.lower().replace(' ','-')+'-'+hashlib.sha1(src.encode()).hexdigest()[:8]
 with Image.open(p) as original:
  im=ImageOps.exif_transpose(original).convert('RGBA' if 'A' in original.getbands() else 'RGB')
  sizes=[]
  for width in [640,1280]:
   copy=im.copy();copy.thumbnail((width,width));dest=out/f'{key}-{width}.webp';copy.save(dest,'WEBP',quality=84,method=6)
   sizes.append((dest.relative_to(root).as_posix(),copy.width,copy.height));after+=dest.stat().st_size
 before+=p.stat().st_size;cache[src]=sizes;return sizes
for name in ['index.html','about.html','contact.html']:
 p=root/name;s=p.read_text()
 def image(m):
  tag=m[0];src=re.search(r'src="([^"]+)"',tag)
  if not src:return tag
  variants=optimize(src[1]);small,large=variants
  tag=tag.replace(src[0],f'src="{large[0]}" srcset="{small[0]} {small[1]}w, {large[0]} {large[1]}w" sizes="(max-width: 768px) 92vw, 600px" width="{large[1]}" height="{large[2]}" decoding="async"')
  if 'class="brand"' not in s[max(0,m.start()-100):m.start()] and 'Christian Kent' not in tag:tag=tag.replace('<img','<img loading="lazy"',1)
  if 'alt="CK"' in tag:tag=re.sub(r'sizes="[^"]*"','sizes="56px"',tag)
  return tag
 s=re.sub(r'<img\b[^>]*>',image,s)
 def background(m):return "url('"+optimize(m[1])[-1][0]+"')"
 s=re.sub(r"url\(['\"]([^'\"]+)['\"]\)",background,s)
 s=re.sub(r'<script src="https://unpkg.com/lucide@latest"></script>','',s).replace('  lucide.createIcons();','')
 s=s.replace('<script src="https://player.vimeo.com/api/player.js"></script>','')
 s=re.sub(r'<iframe\b', '<iframe loading="lazy"',s);s=s.replace('loading="lazy" loading="lazy"','loading="lazy"')
 if name=='index.html':
  s=re.sub(r'(<iframe\b[^>]*?)\bsrc=',r'\1data-src=',s)
  s=s.replace("albumGrid.dataset.activeAlbum = shouldOpen ? id : '';", "albumGrid.dataset.activeAlbum = shouldOpen ? id : '';\n    if (shouldOpen) selectedPanel.querySelectorAll('iframe[data-src]').forEach(frame => { frame.src = frame.dataset.src; frame.removeAttribute('data-src'); });")
 if name=='about.html':
  start=s.index("const cursorRing =");end=s.index('</script>',start);s=s[:start]+s[end:]
  # Hidden slides have no network source until selected.
  def track(m):
   count=0
   def defer(i):
    nonlocal count
    count+=1
    return i[0] if count==1 else i[0].replace(' src=',' data-src=').replace(' srcset=',' data-srcset=')
   return re.sub(r'<img\b[^>]*>',defer,m[0])
  s=re.sub(r'<div class="slider-track">.*?</div>',track,s,flags=re.S)
  s=s.replace('  function moveToSlide(nextIndex) {','  function moveToSlide(nextIndex) {\n    const slide = track.children[nextIndex];\n    if (slide?.dataset.src) { slide.srcset = slide.dataset.srcset; slide.src = slide.dataset.src; delete slide.dataset.src; delete slide.dataset.srcset; }')
 if name=='contact.html':s=re.sub(r'<script>\s*const cursorRing.*?</script>','',s,flags=re.S)
 s=re.sub(r'href="assets/logo/favicon.svg\?v=ck1"','href="assets/optimized/favicon.png?v=ck2"',s).replace('type="image/svg+xml"','type="image/png"')
 p.write_text(s)
# Small favicon rather than a raster embedded in a large SVG.
with Image.open(root/'assets/logo/CK.png') as logo:
 logo=logo.convert('RGBA');logo.thumbnail((50,38));canvas=Image.new('RGBA',(64,64),'#191a18');canvas.alpha_composite(logo,((64-logo.width)//2,(64-logo.height)//2));canvas.convert('RGB').save(out/'favicon.png',optimize=True)
print(f'{len(cache)} source assets: {before/1e6:.1f} MB -> {after/1e6:.1f} MB for BOTH responsive sizes combined')
