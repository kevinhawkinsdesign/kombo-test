#!/usr/bin/env python3
"""Remove color filters and drop-shadows from hero decoration images."""
import re, os, glob

BASE = '/home/user/kombo-test/mockups'

PAGES = [
    'v9_glass_cathedral.html',
    'about.html',
    'blog.html',
    'changelog.html',
    'customers.html',
    'case-study-acme.html',
    'feature-crm-intelligence.html',
    'feature-email-personalization.html',
    'feature-forecasting.html',
    'feature-lead-ranking.html',
    'feature-revenue-insights.html',
    'features.html',
    'how-it-works.html',
    'integrations.html',
    'newsletter.html',
    'podcast.html',
    'pricing.html',
    'team.html',
]

def strip_filters(content):
    changes = 0

    # 1. Remove filter:drop-shadow from .dood CSS rule
    # Matches things like: filter:drop-shadow(0 0 8px rgba(0,0,0,0.3));
    # Could be standalone property or inside a rule
    new_content, n = re.subn(
        r'\s*filter\s*:\s*drop-shadow\([^)]*\)\s*;',
        '',
        content
    )
    changes += n

    # 2. Remove inline style="filter:brightness(0) invert(1)" (plain white version)
    # Also handles style="filter:brightness(0) invert(1);..." (with extra properties)
    # And neon version: filter:brightness(0) invert(1) sepia(1) saturate(8) hue-rotate(45deg)
    # Strategy: for <img> tags with class containing "dood", remove filter from style attr

    def clean_img_style(m):
        nonlocal changes
        tag = m.group(0)
        # Remove filter:... value from style attribute
        def remove_filter_from_style(sm):
            nonlocal changes
            style_content = sm.group(1)
            # Remove filter property (everything up to ; or end of style)
            cleaned = re.sub(r'filter\s*:[^;]*(;|$)', '', style_content).strip().strip(';').strip()
            if cleaned != style_content:
                changes += 1
            if not cleaned:
                return ''  # remove style attr entirely
            return f'style="{cleaned}"'
        new_tag = re.sub(r'style="([^"]*)"', remove_filter_from_style, tag)
        return new_tag

    # Match <img> tags that have class containing "dood"
    new_content = re.sub(
        r'<img\s[^>]*class="[^"]*dood[^"]*"[^>]*>',
        clean_img_style,
        new_content
    )

    return new_content, changes

total = 0
for page in PAGES:
    fpath = os.path.join(BASE, page)
    if not os.path.exists(fpath):
        print(f'  - SKIP (not found): {page}')
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        original = f.read()
    cleaned, n = strip_filters(original)
    if cleaned != original:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(cleaned)
        print(f'  ✓ {page}: {n} change(s)')
        total += n
    else:
        print(f'  · {page}: no changes')

print(f'\nDone. Total changes: {total}')
