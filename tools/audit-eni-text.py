"""Does each deed's PLAYER-FACING text describe the requirement the engine actually checks?

THE GAP THIS FILLS. Nothing else looks at text and mechanics together:
  check-eni-drift.py   compares MARKER to BOOST - mechanics against mechanics - and separately
                       checks that text tags EXIST. It never reads what they say.
  audit-eni-counters.py asks whether a counted deed shows the player its progress.
So a deed could describe an action it does not check, and every tool would pass. Three shipped
that way, all found the first time this audit was run (2026-08-15):
    Armor        said "an enemy Air unit shot down"  - the deed checks IsDyingUnitCommander
    Urbanization said "on a Breathtaking tile"       - the deed only counts 3 City Parks
    Radicalism   said "against an opposing Ideology" - the deed checks 2 wars with majors
In each the requirement was right and the text had drifted. A player who reads the wrong thing
does the wrong thing, so this is a gameplay bug wearing a copy-editing costume.

HOW TO READ THE OUTPUT. It cannot decide correctness - it prints the deed's text beside its real
requirement so a human can compare them. Look for a requirement that names a different action,
building or number from the text.

⚠ [ANY (or)] / [ALL (and)] IS LOAD-BEARING. SubjectRequirements defaults to ALL, so an OR-deed like
Entertainment ("Build a Villa or an Arena") reads as if it demanded both unless the mode is shown.
The first version of this audit omitted it and produced exactly that false alarm.

BLIND SPOTS, all by design - a deed listed with no requirement is NOT broken:
  - story-delivered deeds (AQ Wheel, Mysticism, Discipline, Tactics; MO Liberalism, Absolutism)
    keep their condition in a polled RequirementSet the narrative story reads, not on the marker
  - the per-civ Political Theory markers and Metallurgy's _UNIQUE marker have no text rows

Run:  python tools/audit-eni-text.py            (all three Ages)
      python tools/audit-eni-text.py mo         (one Age)
"""
import io, os, re, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MOD = os.path.join(ROOT, 'mods', 'eureka-inspiration')
DATA = os.path.join(MOD, 'data')
TEXT = os.path.join(MOD, 'text')

# marker id prefix differs by Age: Antiquity has none
AGES = [('aq', 'ENI_MARK_'), ('ex', 'ENI_EX_MARK_'), ('mo', 'ENI_MO_MARK_')]

# ⚠ THE LAZY `*?` IS LOAD-BEARING. With a greedy `[^>]*` the trailing slash of a self-closing
# `<Requirement type="..."/>` gets eaten, the `>` branch matches instead, and that requirement
# swallows everything up to the NEXT `</Requirement>` - so GAME_IS_STARTED (always first, always
# self-closing) consumed the real requirement and the deed reported as having none at all.
RX_REQ = r'<Requirement type="REQUIREMENT_([A-Z_]+)"[^>]*?(?:/>|>(.*?)</Requirement>)'

want = [a for a in sys.argv[1:] if not a.startswith('-')]
if want:
    AGES = [a for a in AGES if a[0] in want]


def read(path):
    return open(path, encoding='utf-8').read()


def args_of(block):
    """name=value pairs in declaration order, so a threshold is visible."""
    return ['%s=%s' % (n, v.strip())
            for n, v in re.findall(r'<Argument name="([^"]+)"[^>]*>(.*?)</Argument>', block, re.S)]


def requirement_sets(src):
    """id -> readable one-line summary, so a delegated set can be expanded inline."""
    out = {}
    for m in re.finditer(r'<RequirementSet id="([^"]+)"([^>]*)>(.*?)</RequirementSet>', src, re.S):
        rid, attrs, body = m.group(1), m.group(2), m.group(3)
        parts = []
        for rq in re.finditer(RX_REQ, body, re.S):
            a = args_of(rq.group(2) or '')
            parts.append(rq.group(1) + ('(' + ','.join(a) + ')' if a else ''))
        out[rid] = ' + '.join(parts) + ('   [ANY]' if 'REQUIREMENTSET_TEST_ANY' in attrs else '')
    return out


problems = 0
for age, prefix in AGES:
    eff = read(os.path.join(DATA, '%s-deeds-gameeffects.xml' % age))
    txt = read(os.path.join(TEXT, '%s-text.xml' % age))
    loc = dict(re.findall(r'<Row Tag="([^"]+)"><Text>(.*?)</Text></Row>', txt, re.S))
    sets = requirement_sets(eff)

    print('=== %s ===' % age.upper())
    for m in re.finditer(r'<Modifier id="%s([A-Z_0-9]+)"[^>]*>(.*?)</Modifier>' % prefix, eff, re.S):
        key, body = m.group(1), m.group(2)
        tag = 'LOC_ENI_%s_%s_DESC' % (age.upper(), key)
        if tag not in loc:
            continue  # per-civ / _UNIQUE markers carry no text row of their own

        sr = re.search(r'<SubjectRequirements([^>]*)>(.*?)</SubjectRequirements>', body, re.S)
        mode = 'ANY (or)' if sr and 'REQUIREMENTSET_TEST_ANY' in sr.group(1) else 'ALL (and)'
        lines = []
        for rq in re.finditer(RX_REQ,
                              sr.group(2) if sr else '', re.S):
            name, inner = rq.group(1), rq.group(2) or ''
            if name == 'GAME_IS_STARTED':
                continue
            a = args_of(inner)
            line = name + ('(' + ','.join(a) + ')' if a else '')
            sid = re.search(r'<Argument name="RequirementSetId"[^>]*>(.*?)</Argument>', inner, re.S)
            if sid and sid.group(1).strip() in sets:
                line += '  ->  ' + sets[sid.group(1).strip()]
            lines.append(line)

        print('%-22s [%s]' % (key, mode))
        print('   TEXT : ' + loc[tag])
        if not lines:
            print('   REQ  : (none on the marker - story-delivered deed; condition lives in a polled set)')
        for l in lines:
            print('   REQ  : ' + l)
        print('')

print('Compare each TEXT against its REQ. This audit reports, it does not judge.')
