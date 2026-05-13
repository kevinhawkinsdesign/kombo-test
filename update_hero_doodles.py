#!/usr/bin/env python3
"""Replace hero decorations on all 16 pages with unique, varied combinations.
- Removes hero-arch (circle shape)
- Pulls from hands, white doodles, and arrows-scribbles per page
- Arrows-scribbles get a CSS filter to appear white or neon on dark bg
"""
import re, os

BASE = '/home/user/kombo-test/mockups'

# filter shortcuts used inline on <img>
WHITE = 'style="filter:brightness(0) invert(1)"'
NEON  = 'style="filter:brightness(0) invert(1) sepia(1) saturate(8) hue-rotate(45deg)"'
NONE  = ''

H = './images/Hands/dark mode/'
D = './images/doodles/white/'
A = './images/arrows-scribbles/'

# Each entry: (class, src, top_or_bottom_style, lr_style, width, rotate, delay, opacity, filter)
# top_or_bottom_style examples: 'top:5%'  or 'bottom:6%'
PAGES = {
    'about.html': {
        'items': [
            ('d1', H+'05.png',        'top:5%',    'left:1%',   '158px', '-10deg', '0s',   0.55, NONE),
            ('d2', H+'14.png',        'top:3%',    'right:2%',  '172px',  '8deg',  '0.8s', 0.55, NONE),
            ('d3', A+'icon-3.png',    'top:44%',   'left:1%',   '102px',  '6deg',  '1.2s', 0.45, WHITE),
            ('d4', D+'Group 10.png',  'top:37%',   'right:0%',  '98px',  '-7deg',  '1.6s', 0.40, NONE),
            ('d5', H+'25.png',        'bottom:5%', 'left:3%',   '135px',  '9deg',  '2.0s', 0.50, NONE),
        ],
        'asterisk_top': '17%', 'asterisk_left': '11%',
    },
    'blog.html': {
        'items': [
            ('d1', H+'07.png',        'top:6%',    'left:1%',   '168px',  '-6deg', '0s',   0.55, NONE),
            ('d2', A+'icon-8.png',    'top:5%',    'right:2%',  '118px',   '5deg', '0.6s', 0.45, WHITE),
            ('d3', H+'20.png',        'top:43%',   'left:0%',   '88px',   '12deg', '1.0s', 0.50, NONE),
            ('d4', D+'Group 12.png',  'top:36%',   'right:1%',  '104px',  '-9deg', '1.4s', 0.40, NONE),
            ('d5', A+'icon-61.png',   'bottom:8%', 'right:3%',  '110px',   '4deg', '1.8s', 0.40, NEON),
        ],
        'asterisk_top': '18%', 'asterisk_left': '8%',
    },
    'changelog.html': {
        'items': [
            ('d1', D+'Group 15.png',  'top:7%',    'left:0%',   '96px',   '-5deg', '0s',   0.45, NONE),
            ('d2', H+'09.png',        'top:4%',    'right:1%',  '178px',   '7deg', '0.8s', 0.55, NONE),
            ('d3', A+'icon-15.png',   'top:41%',   'left:2%',   '114px',   '9deg', '1.2s', 0.40, WHITE),
            ('d4', H+'24.png',        'top:35%',   'right:2%',  '140px',  '-8deg', '1.6s', 0.50, NONE),
            ('d5', A+'icon-70.png',   'bottom:7%', 'left:5%',   '94px',   '14deg', '2.0s', 0.40, NEON),
        ],
        'asterisk_top': '14%', 'asterisk_left': '13%',
    },
    'customers.html': {
        'items': [
            ('d1', H+'11.png',        'top:5%',    'left:1%',   '162px',  '-7deg', '0s',   0.55, NONE),
            ('d2', H+'27.png',        'top:3%',    'right:2%',  '174px',   '9deg', '0.7s', 0.55, NONE),
            ('d3', A+'icon-23.png',   'top:40%',   'left:1%',   '120px',   '6deg', '1.1s', 0.45, WHITE),
            ('d4', D+'Group 18.png',  'top:33%',   'right:0%',  '108px', '-11deg', '1.5s', 0.40, NONE),
            ('d5', A+'icon-79.png',   'bottom:6%', 'right:4%',  '106px',   '3deg', '1.9s', 0.40, NEON),
        ],
        'asterisk_top': '17%', 'asterisk_left': '9%',
    },
    'feature-crm-intelligence.html': {
        'items': [
            ('d1', H+'13.png',        'top:6%',    'left:0%',   '154px', '-11deg', '0s',   0.55, NONE),
            ('d2', A+'icon-31.png',   'top:5%',    'right:1%',  '128px',   '4deg', '0.6s', 0.45, NEON),
            ('d3', H+'30.png',        'top:42%',   'left:1%',   '142px',   '8deg', '1.0s', 0.50, NONE),
            ('d4', D+'Group 20.png',  'top:34%',   'right:2%',  '98px',   '-6deg', '1.4s', 0.40, NONE),
            ('d5', A+'icon-85.png',   'bottom:5%', 'right:5%',  '104px',   '3deg', '1.8s', 0.40, WHITE),
        ],
        'asterisk_top': '15%', 'asterisk_left': '12%',
    },
    'feature-email-personalization.html': {
        'items': [
            ('d1', A+'icon-37.png',   'top:7%',    'left:1%',   '116px',  '-8deg', '0s',   0.45, WHITE),
            ('d2', H+'15.png',        'top:3%',    'right:1%',  '168px',   '6deg', '0.7s', 0.55, NONE),
            ('d3', D+'Group 22.png',  'top:44%',   'left:0%',   '92px',   '10deg', '1.1s', 0.40, NONE),
            ('d4', H+'33.png',        'top:37%',   'right:2%',  '148px',  '-9deg', '1.5s', 0.50, NONE),
            ('d5', A+'icon-92.png',   'bottom:6%', 'left:4%',   '108px',   '7deg', '1.9s', 0.40, NEON),
        ],
        'asterisk_top': '16%', 'asterisk_left': '7%',
    },
    'feature-forecasting.html': {
        'items': [
            ('d1', H+'18.png',        'top:5%',    'left:1%',   '172px',  '-9deg', '0s',   0.55, NONE),
            ('d2', D+'Group 9.png',   'top:4%',    'right:1%',  '102px',   '5deg', '0.7s', 0.45, NONE),
            ('d3', A+'icon-44.png',   'top:40%',   'left:2%',   '112px',  '11deg', '1.1s', 0.45, WHITE),
            ('d4', H+'36.png',        'top:36%',   'right:1%',  '152px',  '-7deg', '1.5s', 0.50, NONE),
            ('d5', A+'icon-97.png',   'bottom:7%', 'right:4%',  '98px',    '5deg', '1.9s', 0.40, NEON),
        ],
        'asterisk_top': '14%', 'asterisk_left': '10%',
    },
    'feature-lead-ranking.html': {
        'items': [
            ('d1', H+'21.png',        'top:6%',    'left:1%',   '163px',  '-6deg', '0s',   0.55, NONE),
            ('d2', H+'39.png',        'top:4%',    'right:1%',  '168px',  '10deg', '0.8s', 0.55, NONE),
            ('d3', D+'Group 13.png',  'top:41%',   'left:0%',   '100px',   '7deg', '1.2s', 0.40, NONE),
            ('d4', A+'icon-50.png',   'top:35%',   'right:2%',  '118px',  '-8deg', '1.6s', 0.45, WHITE),
            ('d5', A+'icon-4.png',    'bottom:6%', 'left:6%',   '96px',   '12deg', '2.0s', 0.40, NEON),
        ],
        'asterisk_top': '17%', 'asterisk_left': '11%',
    },
    'feature-revenue-insights.html': {
        'items': [
            ('d1', A+'icon-57.png',   'top:7%',    'left:1%',   '110px', '-12deg', '0s',   0.45, NEON),
            ('d2', H+'23.png',        'top:3%',    'right:2%',  '173px',   '7deg', '0.7s', 0.55, NONE),
            ('d3', H+'42.png',        'top:43%',   'left:1%',   '143px',   '9deg', '1.1s', 0.50, NONE),
            ('d4', D+'Group 16.png',  'top:36%',   'right:1%',  '98px',   '-5deg', '1.5s', 0.40, NONE),
            ('d5', A+'icon-11.png',   'bottom:6%', 'left:5%',   '112px',   '6deg', '1.9s', 0.40, WHITE),
        ],
        'asterisk_top': '15%', 'asterisk_left': '9%',
    },
    'features.html': {
        'items': [
            ('d1', H+'26.png',        'top:5%',    'left:1%',   '158px',  '-8deg', '0s',   0.55, NONE),
            ('d2', A+'icon-63.png',   'top:4%',    'right:2%',  '122px',   '4deg', '0.6s', 0.45, WHITE),
            ('d3', D+'Group 19.png',  'top:40%',   'left:0%',   '104px',  '-7deg', '1.0s', 0.40, NONE),
            ('d4', H+'44.png',        'top:35%',   'right:1%',  '153px',   '8deg', '1.4s', 0.50, NONE),
            ('d5', A+'icon-18.png',   'bottom:8%', 'right:5%',  '98px',  '-11deg', '1.8s', 0.40, NEON),
        ],
        'asterisk_top': '18%', 'asterisk_left': '13%',
    },
    'how-it-works.html': {
        'items': [
            ('d1', H+'28.png',        'top:6%',    'left:1%',   '168px', '-10deg', '0s',   0.55, NONE),
            ('d2', H+'46.png',        'top:3%',    'right:1%',  '178px',   '6deg', '0.8s', 0.55, NONE),
            ('d3', A+'icon-71.png',   'top:42%',   'left:2%',   '118px',   '8deg', '1.2s', 0.45, WHITE),
            ('d4', D+'Group 21.png',  'top:36%',   'right:2%',  '94px',   '-9deg', '1.6s', 0.40, NONE),
        ],
        'asterisk_top': '16%', 'asterisk_left': '8%',
    },
    'integrations.html': {
        'items': [
            ('d1', D+'Group 6.png',   'top:7%',    'left:0%',   '98px',   '-5deg', '0s',   0.45, NONE),
            ('d2', H+'31.png',        'top:4%',    'right:1%',  '173px',   '9deg', '0.7s', 0.55, NONE),
            ('d3', A+'icon-77.png',   'top:41%',   'left:1%',   '108px',  '11deg', '1.1s', 0.45, NEON),
            ('d4', H+'01.png',        'top:35%',   'right:2%',  '153px',  '-8deg', '1.5s', 0.50, NONE),
            ('d5', A+'icon-32.png',   'bottom:5%', 'right:3%',  '104px',   '5deg', '1.9s', 0.40, WHITE),
        ],
        'asterisk_top': '14%', 'asterisk_left': '12%',
    },
    'newsletter.html': {
        'items': [
            ('d1', H+'34.png',        'top:5%',    'left:1%',   '163px',  '-7deg', '0s',   0.55, NONE),
            ('d2', A+'icon-83.png',   'top:4%',    'right:1%',  '123px',   '5deg', '0.6s', 0.45, WHITE),
            ('d3', H+'04.png',        'top:43%',   'left:0%',   '143px',  '10deg', '1.0s', 0.50, NONE),
            ('d4', D+'Group 8.png',   'top:36%',   'right:2%',  '98px',   '-6deg', '1.4s', 0.40, NONE),
            ('d5', A+'icon-39.png',   'bottom:7%', 'left:6%',   '108px',   '8deg', '1.8s', 0.40, NEON),
        ],
        'asterisk_top': '17%', 'asterisk_left': '10%',
    },
    'podcast.html': {
        'items': [
            ('d1', A+'icon-88.png',   'top:7%',    'left:1%',   '113px',  '-9deg', '0s',   0.45, WHITE),
            ('d2', H+'37.png',        'top:3%',    'right:2%',  '168px',   '7deg', '0.8s', 0.55, NONE),
            ('d3', D+'Group 11.png',  'top:42%',   'left:1%',   '94px',   '12deg', '1.2s', 0.40, NONE),
            ('d4', H+'06.png',        'top:34%',   'right:1%',  '153px',  '-8deg', '1.6s', 0.50, NONE),
            ('d5', A+'icon-46.png',   'bottom:5%', 'right:4%',  '118px',   '4deg', '2.0s', 0.40, NEON),
        ],
        'asterisk_top': '15%', 'asterisk_left': '11%',
    },
    'pricing.html': {
        'items': [
            ('d1', H+'40.png',        'top:5%',    'left:1%',   '158px',  '-8deg', '0s',   0.55, NONE),
            ('d2', D+'Group 14.png',  'top:4%',    'right:1%',  '98px',    '6deg', '0.7s', 0.40, NONE),
            ('d3', A+'icon-93.png',   'top:40%',   'left:2%',   '118px',  '10deg', '1.1s', 0.45, WHITE),
            ('d4', H+'10.png',        'top:35%',   'right:2%',  '163px',  '-7deg', '1.5s', 0.50, NONE),
            ('d5', A+'icon-53.png',   'bottom:6%', 'left:4%',   '103px',   '9deg', '1.9s', 0.40, NEON),
        ],
        'asterisk_top': '16%', 'asterisk_left': '9%',
    },
    'team.html': {
        'items': [
            ('d1', H+'43.png',        'top:6%',    'left:1%',   '153px', '-11deg', '0s',   0.55, NONE),
            ('d2', H+'16.png',        'top:4%',    'right:2%',  '173px',   '8deg', '0.8s', 0.55, NONE),
            ('d3', D+'Group 17.png',  'top:41%',   'left:0%',   '98px',    '5deg', '1.2s', 0.40, NONE),
            ('d4', A+'icon-99.png',   'top:36%',   'right:1%',  '113px', '-10deg', '1.6s', 0.45, NEON),
            ('d5', A+'icon-60.png',   'bottom:8%', 'left:3%',   '108px',   '7deg', '2.0s', 0.40, WHITE),
        ],
        'asterisk_top': '14%', 'asterisk_left': '12%',
    },
}

def build_dood_css(items):
    lines = []
    for cls, src, vpos, hpos, width, rotate, delay, opacity, filt in items:
        lines.append(
            f'  .dood.{cls}{{{vpos};{hpos};width:{width};transform:rotate({rotate});'
            f'animation-delay:{delay};opacity:{opacity}}}'
        )
    return '\n'.join(lines)

def build_dood_html(items):
    lines = ['  <div class="hero-doodles" aria-hidden="true">']
    for cls, src, vpos, hpos, width, rotate, delay, opacity, filt in items:
        src_clean = src  # keep as-is (spaces in filenames are fine in html)
        filter_attr = f' {filt}' if filt else ''
        lines.append(
            f'    <img src="{src_clean}" class="dood {cls}" alt="" loading="lazy"{filter_attr}>'
        )
    lines.append('  </div>')
    return '\n'.join(lines)

NEW_CSS_TEMPLATE = """  /* Hero decorations – unique per page */
  .hero{{position:relative;overflow:hidden}}
  .hero .container{{position:relative;z-index:2}}
  .hero-doodles{{position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden}}
  .dood{{position:absolute;animation:dood-float 7s ease-in-out infinite;filter:drop-shadow(0 0 8px rgba(0,0,0,0.3))}}
{dood_positions}
  @keyframes dood-float{{0%,100%{{translate:0 0}}50%{{translate:0 -10px}}}}
  .hero-asterisk{{position:absolute;top:{ast_top};left:{ast_left};font-size:56px;font-weight:900;color:var(--neon);line-height:1;z-index:1;pointer-events:none;animation:dood-float 8s ease-in-out infinite;animation-delay:0.4s;text-shadow:0 0 40px rgba(212,255,0,0.5)}}
  @media(max-width:1180px){{.dood.d3,.dood.d4{{display:none}}.hero-asterisk{{font-size:40px;left:5%}}}}
  @media(max-width:900px){{.hero-doodles,.hero-asterisk{{display:none}}}}
  @media(prefers-reduced-motion:reduce){{.dood,.hero-asterisk{{animation:none}}}}"""

# Pattern to match the existing decoration CSS block
CSS_PATTERN = re.compile(
    r'  /\* Hero decorations.*?@media\(prefers-reduced-motion:reduce\)\{\.dood,\.hero-asterisk\{animation:none\}\}',
    re.DOTALL
)

# Pattern to match the doodles HTML block (doodles div + asterisk + arch)
HTML_PATTERN = re.compile(
    r'  <div class="hero-doodles" aria-hidden="true">.*?</div>\s*\n'
    r'  <div class="hero-asterisk" aria-hidden="true">✳</div>\s*\n'
    r'  <div class="hero-arch" aria-hidden="true"></div>',
    re.DOTALL
)

changed = []
skipped = []

for filename, data in PAGES.items():
    fpath = os.path.join(BASE, filename)
    if not os.path.exists(fpath):
        skipped.append(f'MISSING: {filename}')
        continue

    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Build replacements
    dood_css = build_dood_css(data['items'])
    new_css = NEW_CSS_TEMPLATE.format(
        dood_positions=dood_css,
        ast_top=data['asterisk_top'],
        ast_left=data['asterisk_left'],
    )

    new_html = build_dood_html(data['items']) + '\n  <div class="hero-asterisk" aria-hidden="true">✳</div>'

    # Replace CSS block
    if CSS_PATTERN.search(content):
        content = CSS_PATTERN.sub(new_css.strip(), content)
    else:
        skipped.append(f'CSS block not found: {filename}')
        continue

    # Replace HTML block
    if HTML_PATTERN.search(content):
        content = HTML_PATTERN.sub(new_html, content)
    else:
        skipped.append(f'HTML block not found: {filename}')
        continue

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
    changed.append(filename)

print(f'\nUpdated ({len(changed)}):')
for f in changed:
    print(f'  ✓ {f}')
if skipped:
    print(f'\nSkipped/issues ({len(skipped)}):')
    for s in skipped:
        print(f'  ! {s}')
