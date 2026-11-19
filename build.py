"""Builds index.html (the installable app) from src/page.html.

src/page.html is the page body used by the hosted version. This script wraps it in a
complete HTML document with the tags iPhone, iPad and desktop browsers need to install it.
Run it after changing src/page.html:  python3 build.py
"""
import re
from pathlib import Path

root = Path(__file__).parent
page = (root / 'src' / 'page.html').read_text(encoding='utf-8')

# head-only parts of the page (title, meta, links, styles) move into <head>
head_parts = []
def take(pattern):
    global page
    for m in re.findall(pattern, page, flags=re.S):
        head_parts.append(m)
    page = re.sub(pattern, '', page, flags=re.S)

take(r'<title>.*?</title>')
take(r'<meta [^>]*>')
head_parts[:] = [h for h in head_parts if 'claude:' not in h]
take(r'<link [^>]*>')
take(r'<style>.*?</style>')

head = '\n'.join([
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">',
    '<meta name="theme-color" content="#760B98">',
    '<meta name="mobile-web-app-capable" content="yes">',
    '<meta name="apple-mobile-web-app-capable" content="yes">',
    '<meta name="apple-mobile-web-app-title" content="NoteTip">',
    '<meta name="apple-mobile-web-app-status-bar-style" content="default">',
    '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui,-apple-system,"Segoe UI",sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>',
    *head_parts,
])
import json
pkg = json.loads((root / 'package.json').read_text(encoding='utf-8'))
version = pkg['version']
page = page.replace('<script src="js/standalone.js"></script>', f'<script>window.NT_VERSION = "{version}";</script>\n<script src="js/standalone.js"></script>', 1)
(root / 'version.json').write_text(json.dumps({'version': version, 'notes': pkg.get('releaseNotes', [])}, indent=2) + '\n', encoding='utf-8')
sw = (root / 'sw.js').read_text(encoding='utf-8')
sw = re.sub(r"const VERSION = '[^']*';", f"const VERSION = 'notetime-{version}';", sw)
if "'js/updates.js'" not in sw: sw = sw.replace("'js/extras.js'", "'js/extras.js', 'js/updates.js'")
(root / 'sw.js').write_text(sw, encoding='utf-8')
html = f'<!doctype html>\n<html lang="en">\n<head>\n{head}\n</head>\n<body>\n{page.strip()}\n</body>\n</html>\n'
(root / 'index.html').write_text(html, encoding='utf-8')
print('Wrote index.html')
