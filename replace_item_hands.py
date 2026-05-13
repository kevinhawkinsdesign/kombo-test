#!/usr/bin/env python3
"""Replace all hands-holding-items with gesture-only alternatives."""
import re, os

BASE = '/home/user/kombo-test/mockups'

# (file, old_hand_number, new_hand_number)
# Each new_hand is a gesture-only image not already on that page.
REPLACEMENTS = [
    # about.html: 14 (cards) → 33 (grab)
    ('about.html', '14', '33'),
    # blog.html: 07 (pen) → 17 (point down), 20 (pencil) → 34 (shaka)
    ('blog.html', '07', '17'),
    ('blog.html', '20', '34'),
    # changelog.html: 09 (cup) → 16 (crossed fingers)
    ('changelog.html', '09', '16'),
    # customers.html: 11 (dice) → 23 (open wave)
    ('customers.html', '11', '23'),
    # feature-crm-intelligence.html: 13 (gift) → 31 (ILY)
    ('feature-crm-intelligence.html', '13', '31'),
    # feature-lead-ranking.html: 39 (unknown, replace to be safe) → 45 (4-finger spread)
    ('feature-lead-ranking.html', '39', '45'),
    # feature-revenue-insights.html: 42 (phone horiz) → 44 (fist-thumb out)
    ('feature-revenue-insights.html', '42', '44'),
    # how-it-works.html: 46 (watch) → 30 (4-finger spread)
    ('how-it-works.html', '46', '30'),
    # podcast.html: 37 (credit card) → 43 (stop/open palm)
    ('podcast.html', '37', '43'),
    # pricing.html: 10 (puzzle) → 21 (peace alt), 40 (unknown) → 26 (open hand)
    ('pricing.html', '10', '21'),
    ('pricing.html', '40', '26'),
    # v9_glass_cathedral.html: 08 (phone) → 16, 12 (diamond) → 36, 22 (camera) → 35
    ('v9_glass_cathedral.html', '08', '16'),
    ('v9_glass_cathedral.html', '12', '36'),
    ('v9_glass_cathedral.html', '22', '35'),
]

def replace_hand(fpath, old_num, new_num):
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Match src containing Hands/dark mode/NN.png (with zero-padded number)
    old_padded = old_num.zfill(2)
    new_padded = new_num.zfill(2)
    old_src = f'Hands/dark mode/{old_padded}.png'
    new_src = f'Hands/dark mode/{new_padded}.png'

    if old_src not in content:
        return False, 'not found'

    new_content = content.replace(old_src, new_src, 1)
    if new_content == content:
        return False, 'no change'

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    return True, f'{old_padded} → {new_padded}'

total = 0
for filename, old_num, new_num in REPLACEMENTS:
    fpath = os.path.join(BASE, filename)
    if not os.path.exists(fpath):
        print(f'  - SKIP: {filename}')
        continue
    ok, msg = replace_hand(fpath, old_num, new_num)
    if ok:
        total += 1
        print(f'  ✓ {filename}: {msg}')
    else:
        print(f'  ! {filename}: {msg}')

print(f'\nDone. {total} replacements made.')
