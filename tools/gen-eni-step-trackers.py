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
  COLONIALISM   the 7 Resources are the cargo of ONE trade route, not seven things collected. Pips
                read as a checklist of separate achievements, and if that route ends the lit ones
                keep claiming progress that is gone. RULE: pips suit a count of SEPARATE objects;
                a single object's climbing property is not that (Chris, from the card in play).
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

# (age, deed, node, unit shown on the card, plural part-noun, singular part-noun)
# Nouns are taken from the deed text word for word - "Kilns in 3 settlements" gives "settlements",
# not "buildings" - because the card sits next to the deed and must not use a second vocabulary.
# The singular exists because "1 settlements" is the kind of small wrongness a player notices
# immediately and a developer never does.
# ⚠ THE PIP NAMES THE BUILDING, THE DEED SENTENCE SAYS SETTLEMENTS - deliberate, not drift
# (Chris, 2026-08-08, from the Urbanization card in play). The sentence says "in 3 settlements"
# because REQUIREMENT_PLAYER_HAS_AT_LEAST_NUM_BUILDINGS counts TOWNS as well as cities and players
# would otherwise read it as cities-only. The pip has no such job, and "3 City Parks" is what the
# player is actually doing. The two never disagree numerically: these buildings are one per
# settlement.
# MATHEMATICS and EDUCATION say "staffed Library/Observatory" rather than the bare building because
# the requirement needs a SPECIALIST ASSIGNED to that tile - a pip reading "1 Observatory" would
# promise something building it does not deliver.
DEEDS = [
    ('AQ', 'WRITING',         'NODE_TECH_AQ_WRITING',              'civilizations', 'met', 'met'),
    ('AQ', 'BRONZE_WORKING',  'NODE_TECH_AQ_BRONZE_WORKING',       'Iron',          'Iron', 'Iron'),
    ('AQ', 'LITERACY',        'NODE_CIVIC_AQ_MAIN_LITERACY',       'Codices',       'Codices', 'Codex'),
    ('AQ', 'COMMERCE',        'NODE_CIVIC_AQ_MAIN_COMMERCE',       'civilizations', 'civilizations', 'civilization'),
    ('AQ', 'MATHEMATICS',     'NODE_TECH_AQ_MATHEMATICS',          'staffed Libraries', 'staffed Libraries', 'staffed Library'),
    ('EX', 'EDUCATION',       'NODE_TECH_EX_EDUCATION',            'staffed Observatories', 'staffed Observatories', 'staffed Observatory'),
    ('EX', 'ARCHITECTURE',    'NODE_TECH_EX_ARCHITECTURE',         'Kilns',         'Kilns', 'Kiln'),
    ('EX', 'METAL_CASTING',   'NODE_TECH_EX_METAL_CASTING',        'Armorers',      'Armorers', 'Armorer'),
    ('EX', 'URBAN_PLANNING',  'NODE_TECH_EX_URBAN_PLANNING',       'Cities',        'Cities', 'City'),
    ('EX', 'REFORMATION',     'NODE_CIVIC_EX_BRANCH_REFORMATION',  'Temples',       'Temples', 'Temple'),
    ('EX', 'INSPIRATION',     'NODE_CIVIC_EX_MAIN_INSPIRATION',    'Relics',        'Relics', 'Relic'),
    ('EX', 'SOCIAL_CLASS',    'NODE_CIVIC_EX_MAIN_SOCIAL_CLASS',   'Taverns',       'Taverns', 'Tavern'),
    ('EX', 'SOVEREIGNTY',     'NODE_CIVIC_EX_MAIN_SOVEREIGNTY',    'settlements',   'settlements', 'settlement'),
    ('MO', 'ELECTRICITY',     'NODE_TECH_MO_ELECTRICITY',          'Resources',     'Resources', 'Resource'),
    ('MO', 'URBANIZATION',    'NODE_TECH_MO_URBANIZATION',         'City Parks',    'City Parks', 'City Park'),
    ('MO', 'MASS_PRODUCTION', 'NODE_TECH_MO_MASS_PRODUCTION',      'settlements',   'settlements', 'settlement'),
    ('MO', 'HEGEMONY',        'NODE_CIVIC_MO_MAIN_HEGEMONY',       'Museums',       'Museums', 'Museum'),
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


# Deeds that are TWO THINGS rather than a count of one. A numeric pip row misframes them, so they
# get named parts instead - the dashboard already supports that (Antiquity's Irrigation uses it).
# Each part names the requirement it stands for; the LAST part is always the deed's own marker, so
# the final label describes whatever the earlier parts do not cover.
SPLITS = {
    # "Meet 2 civilizations and request Open Borders with one of them." Counting to 2 hid the second
    # half entirely: the old "1 met" pip also demanded the Open Borders gossip.
    ('AQ', 'WRITING'): {
        'unit': 'steps',
        'parts': [('CIVS', ('REQUIREMENT_PLAYER_MET_NUM_CIVS',), '2 civilizations met'),
                  ('BORDERS', ('REQUIREMENT_PLAYER_HAS_AT_LEAST_NUM_GOSSIPS',),
                   'Open Borders requested')],
    },
}
# ⛔ EVERY PART OF A SPLIT IS ITS OWN TRACKER. Do NOT key the last part to the deed's own marker,
# however natural that feels after the numeric deeds where the final pip genuinely IS completion.
# The first attempt did exactly that (2026-08-08) and reproduced the bug it was written to kill:
# the pip read "Open Borders requested" while its key demanded 2 civilizations met AS WELL, so
# requesting Open Borders could never light it. A part's key must test ONLY what its label claims.
# Parts carry no `at`, so each counts 1 - the same shape as Antiquity's Irrigation, which has nine
# parts and none of them the boost key.


def keep_only(req, types):
    """The marker's requirements with every substantive requirement dropped except `types`.
    REQUIREMENT_GAME_IS_STARTED is always kept - it is a guard, not a condition."""
    keep = set(types) | {'REQUIREMENT_GAME_IS_STARTED'}
    out, drop = [], False
    for ln in req.split('\n'):
        m = re.search(r'<Requirement type="(REQUIREMENT_[A-Z_]+)"', ln)
        if m:
            drop = m.group(1) not in keep
            if drop and ln.rstrip().endswith('/>'):
                continue                      # self-closing: this single line is the whole thing
        if not drop:
            out.append(ln)
        if drop and '</Requirement>' in ln:
            drop = False
    kept = [t for t in re.findall(r'<Requirement type="(REQUIREMENT_[A-Z_]+)"', '\n'.join(out))
            if t != 'REQUIREMENT_GAME_IS_STARTED']
    if sorted(kept) != sorted(types):
        sys.exit('FAILED: keep_only kept %s, expected %s' % (kept, list(types)))
    return '\n'.join(out)


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
    for a, deed, node, unit, noun, one in DEEDS:
        if a != age:
            continue
        req = marker_block(src, mark_pre, deed)

        # ⛔ THE MULTI-REQUIREMENT GUARD. A tracker is the marker's requirements with ONE threshold
        # lowered - which is only honest when the deed has ONE axis. Where a marker carries a second
        # substantive requirement, the clone silently demands that too: Antiquity's Writing shipped a
        # pip labelled "1 met" that also required the Open Borders gossip, so meeting your first
        # civilization did not light it. The pip promised LESS than it demanded, which is the exact
        # opposite of the job. Such deeds must declare how they split, or the build stops here.
        substantive = [t for t in re.findall(r'<Requirement type="(REQUIREMENT_[A-Z_]+)"', req)
                       if t != 'REQUIREMENT_GAME_IS_STARTED']
        if len(substantive) > 1 and (a, deed) not in SPLITS:
            sys.exit('FAILED: %s %s has %d substantive requirements (%s). A cloned tracker would '
                     'demand ALL of them while its label names only the counted one. Add an entry '
                     'to SPLITS saying which requirement each part represents.'
                     % (a, deed, len(substantive), ', '.join(substantive)))

        if (a, deed) in SPLITS:
            spec = SPLITS[(a, deed)]
            keys = []
            for i, (suffix, keep, label) in enumerate(spec['parts'], start=1):
                key = '%s%s_%s' % (step_pre, deed, suffix)
                keys.append((key, i, label))
                trackers.append(
                    '\t<Modifier id="%s" collection="COLLECTION_OWNER" effect="EFFECT_PLAYER_PROPERTY"'
                    ' permanent="true" run-once="true">\n'
                    '%s\n'
                    '\t\t<Argument name="Key">%s</Argument>\n'
                    '\t\t<Argument name="Value">1</Argument>\n'
                    '\t\t<Argument name="Operation">CHANGE</Argument>\n'
                    '\t</Modifier>\n' % (key, indent(keep_only(req, keep)), key))
            made.append((node, len(spec['parts']), spec['unit'], None, None, keys))
            ids = [k for k, _, _ in keys]
            for i in range(0, len(ids), 2):
                wrappers.append(
                    '\t<Modifier id="%s%d" collection="COLLECTION_MAJOR_PLAYERS"'
                    ' effect="EFFECT_ATTACH_MODIFIERS" permanent="true">\n'
                    '\t\t<Argument name="ModifierId">%s</Argument>\n'
                    '\t</Modifier>\n' % (wrap_pre, nxt, ', '.join(ids[i:i + 2])))
                nxt += 1
            continue

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
        made.append((node, need, unit, noun, one, keys))

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

    for node, need, unit, noun, one, keys in made:
        if noun is None:
            # a SPLIT deed: authored labels, one tracker per part, and NO `at` - each part counts
            # 1, so the card reads "1 / 2" the moment either half is done
            # `split: true` suppresses the N / M line. On a split deed the part count collides with
            # a number in the deed's own sentence - "0 / 2" beside "Meet 2 civilizations" reads as
            # civilizations met, not steps done (Chris, from the card in play). The chips say what
            # they are, so the number adds nothing but the misreading.
            parts = ''.join("            { key: '%s', label: '%s' },\n" % (k, lbl)
                            for k, _, lbl in keys)
        else:
            parts = ''.join("            { key: '%s', at: %d, label: '%d %s' },\n"
                            % (k, t, t, one if t == 1 else noun) for k, t in keys)
            parts += ("            { key: 'ENI_BOOST_%s', at: %d, label: '%d %s' },\n"
                      % (node, need, need, one if need == 1 else noun))
        js_entries.append('    %s: {\n        need: %d,\n        unit: %r,\n%s        parts: [\n%s'
                          '        ],\n    },\n'
                          % (node, need, unit, '        split: true,\n' if noun is None else '',
                             parts))
    print('%s  %d tracker(s), %d wrapper(s), %d deed(s)' % (age, len(trackers), len(wrappers), len(made)))

core = open(CORE, encoding='utf-8').read()
core = re.sub(re.escape(JS_BEGIN) + '.*?' + re.escape(JS_END), '', core, flags=re.S)
anchor = 'export const ENI_MULTIPART = {\n'
core = core.replace(anchor, anchor + JS_BEGIN + ''.join(js_entries).replace("'", "'") + JS_END, 1)
open(CORE, 'w', encoding='utf-8', newline='\n').write(core)
print('ui/eni-core.js  %d ENI_MULTIPART entries' % len(js_entries))
print('-> now run gen-eni-mo-boosts.py (MO binds) then check-eni-drift.py')
