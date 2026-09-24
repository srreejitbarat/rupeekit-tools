"""Read Google Translate's downloaded XLSX; retain drafts for review only.

Uses only ZIP/XML readers. Never evaluates formulas or changes live catalogs.
"""
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

folder = Path('artifacts/google-translation')
locale = sys.argv[2] if len(sys.argv) > 2 else 'bn'
assert locale in ('bn', 'hi')
language = 'bengali' if locale == 'bn' else 'hindi'
source_rows = json.loads((folder / f'{language}-source-map.json').read_text(encoding='utf-8'))
sources = {str(row['id']): row['source'] for row in source_rows}
ns = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
digits = str.maketrans('০১২৩৪৫৬৭৮৯०१२३४५६७८९', '01234567890123456789')

with zipfile.ZipFile(sys.argv[1]) as archive:
    strings = []
    if 'xl/sharedStrings.xml' in archive.namelist():
        strings = [''.join(item.itertext()) for item in ET.fromstring(archive.read('xl/sharedStrings.xml'))]
    sheet = ET.fromstring(archive.read('xl/worksheets/sheet1.xml'))
    translations = {}
    for row in sheet.findall('.//s:row', ns):
        cells = {}
        for cell in row.findall('s:c', ns):
            column = re.sub(r'\d+', '', cell.attrib['r'])
            if cell.find('s:f', ns) is not None:
                raise ValueError(f'Unexpected formula in {cell.attrib["r"]}')
            value = cell.findtext('s:v', '', ns)
            if cell.attrib.get('t') == 's':
                value = strings[int(value)]
            elif cell.attrib.get('t') == 'inlineStr':
                value = ''.join(cell.find('s:is', ns).itertext())
            cells[column] = value
        identifier = cells.get('A', '').translate(digits)
        if identifier not in sources:
            continue
        if identifier in translations:
            raise ValueError(f'Duplicate ID {identifier}')
        translations[identifier] = cells.get('B', '').translate(digits).strip()

if set(translations) != set(sources):
    raise ValueError(f'Row mismatch: {len(translations)} translations for {len(sources)} sources')

drafts, review = {}, []
for identifier, target in translations.items():
    source = sources[identifier]
    reasons = []
    if not target:
        reasons.append('empty')
    if sorted(re.findall(r'ZXQ\d+QXZ', source)) != sorted(re.findall(r'ZXQ\d+QXZ', target)):
        reasons.append('placeholder-mismatch')
    alphabet = r'[\u0980-\u09ff]' if locale == 'bn' else r'[\u0904-\u0939\u0958-\u0961]'
    if not re.search(alphabet, target):
        reasons.append(f'no-{language}')
    links = lambda text: sorted(re.findall(r'\]\(([^)]+)\)', text))
    if links(source) != links(target):
        reasons.append('markdown-link-review')
    def numbers(text):
        text = re.sub(r'ZXQ\d+QXZ', '', text)
        return sorted(re.findall(r'\d+(?:[.,]\d+)*', text))
    if numbers(source) != numbers(target):
        reasons.append('number-review')
    if len(target) < len(source) * 0.22 and len(source) > 80:
        reasons.append('possible-truncation')
    drafts[source] = target
    if reasons:
        review.append({'id': identifier, 'source': source, 'target': target, 'reasons': reasons})

(folder / f'{language}-google-drafts.json').write_text(json.dumps(drafts, ensure_ascii=False, indent=2), encoding='utf-8')
(folder / f'{language}-google-review.json').write_text(json.dumps(review, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'drafts': len(drafts), 'review': len(review), 'live_catalog_changed': False}))
