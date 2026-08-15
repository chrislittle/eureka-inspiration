"""Which deeds ask for a COUNT but show the player no progress?

A deed whose requirement carries a threshold above 1 is invisible while it is part-done: the engine
counts internally and the marker property only flips at completion. The dashboard can only draw an
"N / M" for nodes listed in ENI_MULTIPART, so anything counted and NOT listed there is a deed the
player watches sit at nothing until it suddenly completes - the exact gap that made The Wheel fire
with no warning and made Tactics' failure undiagnosable.

This lists them per Age so the gap can be seen whole instead of one deed at a time.

Run:  python tools/audit-eni-counters.py
"""
import io, os, re, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MOD = os.path.join(ROOT, 'mods', 'eureka-inspiration')
DATA = os.path.join(MOD, 'data')

# args that express "how many" - anything else is a type, a flag or an id
COUNT_ARGS = ('DuplicateCount', 'Amount', 'Count', 'RequiredCount', 'RuralPopulation',
              'UrbanPopulation', 'TotalPopulation', 'MinDepth', 'TurnsAgo', 'PlotsRevealed',
              'AdjacencyBonus', 'LevelCount', 'CommanderCount', 'GoldSpentThreshold')
# thresholds that are NOT a countable progression the player accumulates
IGNORE = {'MinDepth'}

ui = open(os.path.join(MOD, 'ui', 'eni-core.js'), encoding='utf-8').read()
tracked = set(re.findall(r'\n    (NODE_[A-Z_0-9]+): \{', ui))

AGES = (('AQ', 'aq-deeds-gameeffects.xml', 'ENI_MARK_'),
        ('EX', 'ex-deeds-gameeffects.xml', 'ENI_EX_MARK_'),
        ('MO', 'mo-deeds-gameeffects.xml', 'ENI_MO_MARK_'))

print('%-4s %-26s %-8s %s' % ('AGE', 'DEED', 'ASKS', 'PROGRESS SHOWN?'))
print('-' * 78)
gaps = []
for age, fname, prefix in AGES:
    path = os.path.join(DATA, fname)
    if not os.path.exists(path):
        continue
    src = open(path, encoding='utf-8').read()
    # a deed's condition may sit inline on the marker OR in a polled set for story deeds
    for m in re.finditer(r'<Modifier id="' + prefix + r'([A-Z_0-9]+)".*?</Modifier>', src, re.S):
        name, body = m.group(1), m.group(0)
        node = re.search(r'<Argument name="Key">ENI_BOOST_(NODE_[A-Z_0-9]+)</Argument>', body)
        if not node:
            continue
        node = node.group(1)
        if not re.search(r'<SubjectRequirements', body):      # story deed - read its polled set
            st = re.search(r'<RequirementSet id="REQSET_ENI_[A-Z_0-9]*?' + name +
                           r'_DONE">.*?</RequirementSet>', src, re.S)
            body = st.group(0) if st else body
        counts = [(a, int(v)) for a, v in
                  re.findall(r'<Argument name="(' + '|'.join(COUNT_ARGS) + r')">(\d+)</Argument>', body)
                  if a not in IGNORE]
        biggest = max((v for _, v in counts), default=0)
        if biggest <= 1:
            continue
        shown = node in tracked
        arg = next((a for a, v in counts if v == biggest), '?')
        print('%-4s %-26s %-8s %s' % (age, name[:26], '%s %d' % (arg[:5], biggest),
                                      'yes' if shown else '**NO**'))
        if not shown:
            gaps.append((age, name, arg, biggest))

print()
if gaps:
    print('%d counted deed(s) show the player NOTHING while part-done:' % len(gaps))
    for age, name, arg, n in gaps:
        print('   %s %-24s asks %d (%s)' % (age, name, n, arg))
else:
    print('Every counted deed has a progress readout.')
