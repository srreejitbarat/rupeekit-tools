"""Generate reviewable missing-catalog drafts with local Argos/CTranslate2 models.

Models must already be downloaded under node_modules/.cache/local-translation.
No text or repository data is sent over the network. Existing entries are kept.
Drafts stay in artifacts until reviewed; never write to the live catalogs here.
"""
import collections
import json
import pathlib
import re
import sys
import time
import ctranslate2
import sentencepiece

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'artifacts/local-translation'
OUT.mkdir(parents=True, exist_ok=True)
SOURCES = json.loads((ROOT / 'lib/i18n/catalogs/sources.json').read_text(encoding='utf-8'))
DIGITS = str.maketrans('०१२३४५६७८९০১২৩৪৫৬৭৮৯', '01234567890123456789')

def numbers(text):
    return collections.Counter(re.findall(r'\d+(?:[,.]\d+)*', re.sub(r'ZXQ\d+QXZ', '', text).translate(DIGITS)))

for locale in sys.argv[1:] or ['hi', 'bn']:
    catalog = json.loads((ROOT / f'lib/i18n/catalogs/{locale}.json').read_text(encoding='utf-8'))
    output = OUT / f'{locale}-drafts.json'
    drafts = json.loads(output.read_text(encoding='utf-8')) if output.exists() else {}
    rejected = {}
    model = ROOT / 'node_modules/.cache/local-translation' / ('en_hi' if locale == 'hi' else 'translate-en_bn-1_9')
    translator = ctranslate2.Translator(str(model / 'model'), compute_type='int8', intra_threads=2)
    tokenizer = sentencepiece.SentencePieceProcessor(model_file=str(model / 'sentencepiece.model'))
    pending = [s for s in SOURCES if s not in catalog and s not in drafts]
    started = time.time()
    for index in range(0, len(pending), 32):
        batch = pending[index:index+32]
        # Keep sentences intact; avoid the model's input truncation limit.
        pieces = [re.split(r'(?<=[.!?])\s+(?=[A-Z])', s) for s in batch]
        flat = [p for group in pieces for p in group]
        tokens = [tokenizer.encode(p, out_type=str) for p in flat]
        results = translator.translate_batch(tokens, beam_size=1, max_input_length=512, max_decoding_length=512)
        decoded = iter(tokenizer.decode(r.hypotheses[0]).translate(DIGITS) for r in results)
        for source, group in zip(batch, pieces):
            target = ' '.join(next(decoded) for _ in group)
            issues = []
            if any(len(tokenizer.encode(p)) > 512 for p in group): issues.append('input-too-long')
            if sorted(re.findall(r'ZXQ\d+QXZ',source)) != sorted(re.findall(r'ZXQ\d+QXZ',target)):
                issues.append('placeholders')
            if numbers(source) != numbers(target): issues.append('numbers')
            if not re.search('[\u0900-\u097f]' if locale == 'hi' else '[\u0980-\u09ff]', target):
                issues.append('no-target-script')
            if issues: rejected[source] = {'target': target, 'issues': issues}
            else: drafts[source] = target
        output.write_text(json.dumps(drafts, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
        (OUT / f'{locale}-rejected.json').write_text(json.dumps(rejected, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
        print(f'{locale}: {min(index+32,len(pending))}/{len(pending)}, {len(drafts)} drafts, {len(rejected)} rejected, {time.time()-started:.0f}s', flush=True)
