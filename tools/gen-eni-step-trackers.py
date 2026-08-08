r"""Generate the step trackers that give counted deeds a visible N / M in the dashboard.

WHY THIS EXISTS
A deed whose requirement carries a threshold above 1 is INVISIBLE while it is part-done: the engine
counts internally and the marker property only flips at completion. The player watches the card sit
at nothing until it suddenly finishes - the gap that made Antiquity's Wheel complete with no warning
and made Tactics' failure undiagnosable. A tracker is the deed's OWN requirement at a lower
threshold, writing its own property, so the dashboard can draw progress.

WHY GENERATED rather than hand-written
The first batch of trackers WAS hand-written, and the requirement had to be retyped for each one - a
drifted filter counts the wrong thing and reads in-game as a UI bug with no error anywhere. This
clones the parent marker's requirement verbatim and only edits the threshold, so a tracker can never
disagree with the deed it tracks. tools/check-eni-drift.py fails the build if one is defined but not
wrapped, not bound, or not read by the UI.

WHAT IT REFUSES TO TRACK, and why - all three would show the player a WRONG number
  FLIGHT        the requirement is proven NOT to evaluate below its threshold (dark at 93.3% and at
                99.71%, fired only at 100%), so lower-threshold clones would sit dark forever and
                report no progress on a map that is nearly revealed.
  PROGRESSIVISM war support is an OSCILLATING differential. Trackers are run-once and permanent, so
                "3 of 4" would stay lit after you fell back to -2 - it would claim you were nearly
                there while you were losing.
  RADICALISM    two wars AT ONCE. "1 of 2" would persist after the war ended, reading as halfway to
                something that has to be held simultaneously.
The remaining 18 all count things that in practice only go up (buildings, works, resources, met
civs, settlements). Where a quantity can technically drop - a trade route ending, a resource
unassigned - the counter reads as best-progress-so-far, which is the same semantic every other
tracker in the mod already has.

BUCKETING
Five parts maximum, so a 10-count deed draws five pips rather than ten. Thresholds are spaced evenly
and always end on the deed's own number; each part carries `at`, which eniPartsDone() reads to report
the real count rather than a pip tally.

Run:  python tools/gen-eni-step-trackers.py
Then: python tools/gen-eni-mo-boosts.py   (MO bind rows are swept from the deeds file)
      python tools/check-eni-drift.py
"""
import io
import os
import re
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MOD = os.path.join(ROOT, 'mods', 'eureka-inspiration')
DATA = os.path.join(MOD, 'data')
CORE = os.path.join(MOD, 'ui', 'eni-core.js')

MAX_PARTS = 5

# (age, deed, node, unit shown on the card, singular/plural noun for a part label)
# Nouns are taken from the deed text word for word - "Kilns in 3 settlements" gives "settlements",
# not "buildings" - because the card sits next to the deed and must not use a second vocabulary.
DEEDS = [
    ('AQ', 'WRITING',         'NODE_TECH_AQ_WRITING',              'civilizations', 'met'),
    ('AQ', 'BRONZE_WORKING',  'NODE_TECH_AQ_BRONZE_WORKING',       'Iron',          'Iron'),
    ('AQ', 'LITERACY',        'NODE_CIVIC_AQ_MAIN_LITERACY',       'Codices',       'Codices'),
    ('AQ', 'COMMERCE',        'NODE_CIVIC_AQ_MAIN_COMMERCE',       'civilizations', 'civilizations'),
    ('AQ', 'MATHEMATICS',     'NODE_TECH_AQ_MATHEMATICS',          'settlements',   'settlements'),
    ('EX', 'EDUCATION',       'NODE_TECH_EX_EDUCATION',            'settlements',   'settlements'),
    ('EX', 'ARCHITECTURE',    'NODE_TECH_EX_ARCHITECTURE',         'settlements',   'settlements'),
    ('EX', 'METAL_CASTING',   'NODE_TECH_EX_METAL_CASTING',        'settlements',   'settlements'),
    ('EX', 'URBAN_PLANNING',  'NODE_TECH_EX_URBAN_PLANNING', 'Cities',        'Cities'),
    ('EX', 'REFORMATION',     'NODE_CIVIC_EX_BRANCH_REFORMATION',    'settlements',   'settlements'),
    ('EX', 'INSPIRATION',     'NODE_CIVIC_EX_MAIN_INSPIRATION',    'Relics',        'Relics'),
    ('EX', 'COLONIALISM',     'NODE_CIVIC_EX_MAIN_COLONIALISM',    'Resources',     'Resources'),
    ('EX', 'SOCIAL_CLASS',    'NODE_CIVIC_EX_MAIN_SOCIAL_CLASS',   'settlements',   'settlements'),
    ('EX', 'SOVEREIGNTY',     'NODE_CIVIC_EX_MAIN_SOVEREIGNTY',    'settlements',   'settlements'),
    ('MO', 'ELECTRICITY',     'NODE_TECH_MO_ELECTRICITY',          'Resources',     'Resources'),
    ('MO', 'URBANIZATION',    'NODE_TECH_MO_URBANIZATION',         'settlements',   'settlements'),
    ('MO', 'MASS_PRODUCTION', 'NODE_TECH_MO_MASS_PRODUCTION',      'settlements',   'settlements'),
    ('MO', 'HEGEMONY',        'NODE_CIVIC_MO_MAIN_HEGEMONY',       'Museums',       'Museums'),
]

AGES = {'AQ': ('aq-deeds-gameeffects.xml', 'ENI_MARK_', 'ENI_AQ_STEP_', 'ENI_AQ_ATTACH_STEPS',
               'aq-deeds-bind.xml'),
        'EX': ('ex-deeds-gameeffects.xml', 'ENI_EX_MARK_', 'ENI_EX_STEP_', 'ENI_EX_ATTACH_STEPS',
               'ex-deeds-bind.xml'),
        'MO': ('mo-deeds-gameeffects.xml', 'ENI_MO_MARK_', 'ENI_MO_STEP_', 'ENI_MO_ATTACH_STEPS',
               None)}                      # MO binds are swept by gen-eni-mo-boosts.py

COUNT_ARGS = ('DuplicateCount', 'Amount', 'Count')

BEGIN = '\t<!-- ============== GENERATED: progress trackers ============== -->\n'
END = '\t<!-- ============ END GENERATED: progress trackers ============ -->\n'
JS_BEGIN = '    // ===== GENERATED by tools/gen-eni-step-trackers.py - do not hand-edit =====\n'
JS_END = '    // ===== END GENERATED =====\n'

HEADER = """\t<!-- Progress trackers: each one is its deed's OWN requirement at a lower threshold,
\t     writing its own key so the dashboard can draw an N / M. GENERATED by
\t     tools/gen-eni-step-trackers.py - the requirement is CLONED from the marker, never retyped,
\t     because a drifted filter counts the wrong thing and reads in-game as a UI bug with no error.
\t     A deed needs only (need - 1) trackers: the last part IS the deed's own marker property.
\t     Wrappers are 2-item comma lists ON PURPOSE - one long list silently attaches NOTHING. -->
"""


def thresholds(need):
    """At most MAX_PARTS evenly spaced steps, always ending on `need`, excluding the last."""
    if need <= MAX_PARTS:
        return list(range(1, need))
    return sorted({max(1, round(need * i / MAX_PARTS)) for i in range(1, MAX_PARTS)} - {need})


def marker_block(src, prefix, deed):
    m = re.search(r'<Modifier id="' + prefix + deed + r'".*?</Modifier>', src, re.S)
    if not m:
        sys.exit('FAILED: no marker %s%s' % (prefix, deed))
    req = re.search(r'<SubjectRequirements.*?</SubjectRequirements>', m.group(0), re.S)
    if not req:
        sys.exit('FAILED: %s%s has no inline requirements to clone' % (prefix, deed))
    return req.group(0)


def retarget(req, need, want):
    """The marker's requirements with the single countable threshold moved to `want`."""
    hits = [(a, v) for a, v in
            re.findall(r'<Argument name="(' + '|'.join(COUNT_ARGS) + r')">(\d+)</Argument>', req)
            if int(v) == need]
    if len(hits) != 1:
        sys.exit('FAILED: expected exactly one threshold of %d, found %d' % (need, len(hits)))
    arg = hits[0][0]
    return req.replace('<Argument name="%s">%d</Argument>' % (arg, need),
                       '<Argument name="%s">%d</Argument>' % (arg, want), 1)


def indent(block, extra='\t'):
    return '\n'.join((extra + ln if ln.strip() else ln) for ln in block.split('\n'))


js_entries = []
for age in ('AQ', 'EX', 'MO'):
    fname, mark_pre, step_pre, wrap_pre, bind = AGES[age]
    path = os.path.join(DATA, fname)
    src = open(path, encoding='utf-8').read()

    # strip any previous run so re-running is idempotent
    src = re.sub(re.escape(BEGIN) + '.*?' + re.escape(END), '', src, flags=re.S)

    # keep numbering clear of the hand-written wrappers already in the file
    used = [int(n) for n in re.findall(re.escape(wrap_pre) + r'(\d+)"', src)]
    nxt = (max(used) + 1) if used else 1

    trackers, wrappers, made = [], [], []
    for a, deed, node, unit, noun in DEEDS:
        if a != age:
            continue
        req = marker_block(src, mark_pre, deed)
        need = max(int(v) for _, v in
                   re.findall(r'<Argument name="(' + '|'.join(COUNT_ARGS) + r')">(\d+)</Argument>', req))
        steps = thresholds(need)
        keys = []
        for t in steps:
            key = '%s%s_%d' % (step_pre, deed, t)
            keys.append((key, t))
            trackers.append(
                '\t<Modifier id="%s" collection="COLLECTION_OWNER" effect="EFFECT_PLAYER_PROPERTY"'
                ' permanent="true" run-once="true">\n'
                '%s\n'
                '\t\t<Argument name="Key">%s</Argument>\n'
                '\t\t<Argument name="Value">1</Argument>\n'
                '\t\t<Argument name="Operation">CHANGE</Argument>\n'
                '\t</Modifier>\n' % (key, indent(retarget(req, need, t)), key))
        made.append((node, need, unit, noun, keys))

        ids = [k for k, _ in keys]
        for i in range(0, len(ids), 2):
            wrappers.append(
                '\t<Modifier id="%s%d" collection="COLLECTION_MAJOR_PLAYERS"'
                ' effect="EFFECT_ATTACH_MODIFIERS" permanent="true">\n'
                '\t\t<Argument name="ModifierId">%s</Argument>\n'
                '\t</Modifier>\n' % (wrap_pre, nxt, ', '.join(ids[i:i + 2])))
            nxt += 1

    if trackers:
        block = BEGIN + HEADER + ''.join(trackers) + ''.join(wrappers) + END
        src = src.replace('</GameEffects>', block + '</GameEffects>')
    open(path, 'w', encoding='utf-8', newline='\n').write(src)

    # AQ and EX bind files are hand-written; MO's is swept by gen-eni-mo-boosts.py
    if bind and wrappers:
        bp = os.path.join(DATA, bind)
        b = open(bp, encoding='utf-8').read()
        b = re.sub(re.escape(BEGIN) + '.*?' + re.escape(END), '', b, flags=re.S)
        rows = BEGIN + ''.join(
            '\t\t<Row ModifierId="%s"/>\n' % re.search(r'id="([A-Z_0-9]+)"', w).group(1)
            for w in wrappers) + END
        b = b.replace('\t</GameModifiers>', rows + '\t</GameModifiers>', 1)
        open(bp, 'w', encoding='utf-8', newline='\n').write(b)

    for node, need, unit, noun, keys in made:
        parts = ''.join("            { key: '%s', at: %d, label: '%d %s' },\n" % (k, t, t, noun)
                        for k, t in keys)
        parts += ("            { key: 'ENI_BOOST_%s', at: %d, label: '%d %s' },\n"
                  % (node, need, need, noun))
        js_entries.append('    %s: {\n        need: %d,\n        unit: %r,\n        parts: [\n%s'
                          '        ],\n    },\n' % (node, need, unit, parts))
    print('%s  %d tracker(s), %d wrapper(s), %d deed(s)' % (age, len(trackers), len(wrappers), len(made)))

core = open(CORE, encoding='utf-8').read()
core = re.sub(re.escape(JS_BEGIN) + '.*?' + re.escape(JS_END), '', core, flags=re.S)
anchor = 'export const ENI_MULTIPART = {\n'
core = core.replace(anchor, anchor + JS_BEGIN + ''.join(js_entries).replace("'", "'") + JS_END, 1)
open(CORE, 'w', encoding='utf-8', newline='\n').write(core)
print('ui/eni-core.js  %d ENI_MULTIPART entries' % len(js_entries))
print('-> now run gen-eni-mo-boosts.py (MO binds) then check-eni-drift.py')
