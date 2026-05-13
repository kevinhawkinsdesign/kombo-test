#!/usr/bin/env python3
"""Replace all doodles/white images with unique arrows-scribbles."""
import re, os

BASE = '/home/user/kombo-test/mockups'
WHITE = 'style="filter:brightness(0) invert(1)"'

# Already-used icons (from hero doodles on all pages) — avoid these
USED = {3,4,7,8,11,15,18,19,23,31,32,37,39,44,46,50,53,56,57,59,
        60,61,63,68,70,71,77,79,83,85,88,91,92,93,97,99}

# Pick fresh icons not in USED — one per replacement
# 20 replacements needed
FRESH = [n for n in range(1,110) if n not in USED]
# Take 20 spread across the range
import random; random.seed(42)
chosen = sorted(random.sample(FRESH, 20))
print("Chosen icons:", chosen)

# Map: (file, old_src_fragment) -> new icon number
REPLACEMENTS = [
    # about.html
    ('about.html',                      'doodles/white/Group 10.png',  chosen[0]),
    # blog.html
    ('blog.html',                       'doodles/white/Group 12.png',  chosen[1]),
    # changelog.html
    ('changelog.html',                  'doodles/white/Group 15.png',  chosen[2]),
    # customers.html
    ('customers.html',                  'doodles/white/Group 18.png',  chosen[3]),
    # feature-crm-intelligence.html
    ('feature-crm-intelligence.html',   'doodles/white/Group 20.png',  chosen[4]),
    # feature-email-personalization.html
    ('feature-email-personalization.html','doodles/white/Group 22.png',chosen[5]),
    # feature-forecasting.html
    ('feature-forecasting.html',        'doodles/white/Group 9.png',   chosen[6]),
    # feature-lead-ranking.html
    ('feature-lead-ranking.html',       'doodles/white/Group 13.png',  chosen[7]),
    # feature-revenue-insights.html
    ('feature-revenue-insights.html',   'doodles/white/Group 16.png',  chosen[8]),
    # features.html
    ('features.html',                   'doodles/white/Group 19.png',  chosen[9]),
    # how-it-works.html
    ('how-it-works.html',               'doodles/white/Group 21.png',  chosen[10]),
    # integrations.html
    ('integrations.html',               'doodles/white/Group 6.png',   chosen[11]),
    # newsletter.html
    ('newsletter.html',                 'doodles/white/Group 8.png',   chosen[12]),
    # podcast.html
    ('podcast.html',                    'doodles/white/Group 11.png',  chosen[13]),
    # pricing.html
    ('pricing.html',                    'doodles/white/Group 14.png',  chosen[14]),
    # team.html
    ('team.html',                       'doodles/white/Group 17.png',  chosen[15]),
    # v9_glass_cathedral.html x4
    ('v9_glass_cathedral.html',         'doodles/white/Group 7.png',   chosen[16]),
    ('v9_glass_cathedral.html',         'doodles/white/Group 11.png',  chosen[17]),
    ('v9_glass_cathedral.html',         'doodles/white/Group 14.png',  chosen[18]),
    ('v9_glass_cathedral.html',         'doodles/white/Group 9.png',   chosen[19]),
]

# Pattern matches an <img> tag containing the given src fragment
def replace_in_file(fpath, old_frag, new_icon):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_src = f'./images/arrows-scribbles/icon-{new_icon}.png'

    # Match the full <img ...> tag containing old_frag
    pattern = re.compile(
        r'(<img\s[^>]*src="[^"]*' + re.escape(old_frag) + r'[^"]*"[^>]*>)',
        re.IGNORECASE
    )
    match = pattern.search(content)
    if not match:
        return False, 'not found'

    old_tag = match.group(1)

    # Update src
    new_tag = re.sub(r'src="[^"]*"', f'src="{new_src}"', old_tag)

    # Add/replace filter style — if tag already has style=, merge; else add
    if 'style=' in new_tag:
        # replace existing style value with filter prepended
        def merge_style(m):
            existing = m.group(1)
            if 'filter' in existing:
                return f'style="{existing}"'
            return f'style="filter:brightness(0) invert(1);{existing}"'
        new_tag = re.sub(r'style="([^"]*)"', merge_style, new_tag)
    else:
        new_tag = new_tag.replace('<img ', '<img style="filter:brightness(0) invert(1)" ', 1)

    content = content.replace(old_tag, new_tag, 1)

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
    return True, f'→ icon-{new_icon}'

for filename, old_frag, new_icon in REPLACEMENTS:
    fpath = os.path.join(BASE, filename)
    ok, msg = replace_in_file(fpath, old_frag, new_icon)
    status = '✓' if ok else '!'
    print(f'  {status} {filename}: {old_frag.split("/")[-1]} {msg}')
