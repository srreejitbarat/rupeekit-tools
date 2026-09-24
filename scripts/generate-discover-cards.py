"""Generate brand-styled 1600x900 Discover cards for calculators that lack one.

Matches the existing Discover image spec: 1600x900 WEBP, RupeeKit navy/green
palette, horizontal logo lockup. Run with the slugs that need a card.
"""
from __future__ import annotations
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import sys

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/images/discover'
LOGO = ROOT / 'public/brand/rupeekit_logo_horizontal_transparent.png'
NAVY, DEEP, GREEN, SOFT = '#003080', '#002070', '#43A047', '#F8FAFC'
W, H = 1600, 900

CARDS = {
 'mutual-fund-calculator-india': ('Mutual Fund Calculator', 'SIP and lumpsum growth, side by side'),
 'retirement-calculator-india': ('Retirement Calculator', 'Corpus needed and the monthly SIP to get there'),
 'stock-portfolio-calculator-india': ('Stock Portfolio Calculator', 'Returns, annualised gains and dividend yield'),
}

def font(size, bold=True):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold
              else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',):
        try: return ImageFont.truetype(p, size)
        except OSError: pass
    return ImageFont.load_default(size)

def wrap(draw, text, f, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if draw.textlength(t, font=f) <= maxw: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def build(slug, title, subtitle):
    im = Image.new('RGB', (W, H), NAVY)
    d = ImageDraw.Draw(im)
    for y in range(H):  # vertical navy gradient
        r = y / H
        d.line([(0, y), (W, y)], fill=(
            int(0x00*(1-r)+0x00*r), int(0x30*(1-r)+0x20*r), int(0x80*(1-r)+0x70*r)))
    d.rectangle([0, H-14, W, H], fill=GREEN)          # brand keyline
    d.rectangle([96, 168, 96+96, 168+10], fill=GREEN)  # accent rule

    tf, sf = font(84), font(40, bold=False)
    y = 232
    for ln in wrap(d, title, tf, W-192):
        d.text((96, y), ln, font=tf, fill=SOFT); y += 104
    y += 18
    for ln in wrap(d, subtitle, sf, W-192):
        d.text((96, y), ln, font=sf, fill='#C7D6F2'); y += 56

    if LOGO.exists():
        logo = Image.open(LOGO).convert('RGBA')
        lw = 300; logo = logo.resize((lw, int(logo.height*lw/logo.width)))
        im.paste(logo, (96, H-logo.height-72), logo)

    dst = OUT / f'{slug}.webp'
    im.save(dst, 'WEBP', quality=88, method=6)
    return dst, dst.stat().st_size

if __name__ == '__main__':
    slugs = sys.argv[1:] or list(CARDS)
    for s in slugs:
        t, sub = CARDS[s]
        p, size = build(s, t, sub)
        print(f'{p.relative_to(ROOT)}  {size//1024} KB')
