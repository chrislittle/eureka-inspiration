"""Fail if any Eureka & Inspiration BOOST requirement has drifted from its MARKER.

Every Age mirrors marker requirements into its boosts via a generator (gen-eni-aq-boosts.py,
gen-eni-ex-boosts.py, gen-eni-mo-boosts.py), and publish-eni.ps1 re-runs all of them before it
exports - so a boost drifts only when a marker is edited and the generator is NOT re-run. The UI
would then track one condition while the boost paid on another. This check exists because exactly
that happened while re-cutting Currency (2026-08-02), and it caught the same class again on
2026-08-15 during the Public Life town-exemption fix.
⚠ CORRECTED 2026-08-15: this note used to say Antiquity's aq-boosts-40.xml was "hand-maintained".
It is not - it carries a do-not-edit header and gen-eni-aq-boosts.py owns it. Hand-editing it works
until the next publish silently regenerates the file over your change. Edit the MARKER, re-run the
generator.
⚠ The comparison is a whitespace-normalised STRING match on the whole <SubjectRequirements> block,
so an XML comment placed INSIDE that block reads as drift. Keep commentary outside it.
Run it after editing any Antiquity deed.

SECOND CHECK - Modern / Political Theory's unique-civics set.
That deed enumerates one node id per civ, so it goes STALE when a civ DLC ships: the new civ's
ids are simply absent and its players can never earn the boost - no error, no log line, it just
never fires. This compares the ids in the generated file against the roots actually present in
the installed game (Base + DLC) and fails when they disagree, turning a silent gameplay bug into
a loud build failure. Fix by re-running tools/gen-eni-mo-political-theory.py.
Skipped cleanly if the file has not been generated yet, or if the game is not installed here.

THIRD CHECK - story-delivered deeds (Antiquity's Wheel, Mysticism, Discipline, Tactics; Modern's
Absolutism). These have no marker/boost requirement pair to compare, because their condition lives
in a POLLED RequirementSet the narrative story reads - so the first check is blind to them, and
every way they break is silent in play. This validates the wiring instead:
  - RequirementSetId and ActivationRequirementSetId both resolve to a real RequirementSet
    (a typo here means the deed can NEVER fire, with no error anywhere)
  - each Name / Description / Completion tag exists in that Age's text file
  - each story reward resolves to a real modifier (markers live in the deeds file, boosts in the
    generated boosts file - both are scanned)
  - a story-delivered marker or boost carries NO inline SubjectRequirements: the condition belongs
    in the polled set, and an inline copy would silently double-gate the deed
Proven to catch a broken set id and a broken text tag (2026-08-04).
"""
import os, re, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'mods', 'eureka-inspiration', 'data')
PAIRS = [('aq-deeds-gameeffects.xml', 'aq-boosts-40.xml', 'ENI_MARK_', 'ENI_BOOST_'),
         ('ex-deeds-gameeffects.xml', 'ex-boosts-40.xml', 'ENI_EX_MARK_', 'ENI_EX_BOOST_'),
         ('mo-deeds-gameeffects.xml', 'mo-boosts-40.xml', 'ENI_MO_MARK_', 'ENI_MO_BOOST_')]
RX = r'<Modifier id="%s([A-Z_]+)"[^>]*>\s*(<SubjectRequirements[^>]*>.*?</SubjectRequirements>)'

def norm(x):
    return re.sub(r'\s+', ' ', x).strip()

bad = []
for deeds, boosts, mp, bp in PAIRS:
    d = open(os.path.join(ROOT, deeds), encoding='utf-8').read()
    b = open(os.path.join(ROOT, boosts), encoding='utf-8').read()
    marks = dict(re.findall(RX % mp, d, re.S))
    boos = dict(re.findall(RX % bp, b, re.S))
    for k, req in marks.items():
        if k in boos and norm(req) != norm(boos[k]):
            bad.append('%s: %s' % (deeds.split('-')[0].upper(), k))
    print('%-30s %d markers, %d boosts compared' % (deeds, len(marks), len(boos)))

# Political Theory is one marker per civ-unique civics tree (re-cut 2026-08-08 after BOTH a named
# 53-row set and a 53-row inline TEST_ANY failed to fire in play - the base game's largest TEST_ANY
# holds 4). Sweep every generated marker, not one block.
POLTH = os.path.join(ROOT, 'mo-deeds-gameeffects.xml')
if os.path.exists(POLTH):
    import importlib.util
    _g = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'gen-eni-mo-political-theory.py')
    _s = importlib.util.spec_from_file_location('_polth', _g)
    _m = importlib.util.module_from_spec(_s)
    try:
        _s.loader.exec_module(_m)
        live = set(_m.collect()[0])
    except SystemExit:
        live = None                     # game not installed / layout changed - generator explained why
    if live is not None:
        _blks = re.findall(r'<Modifier id="ENI_MO_MARK_POLITICAL_THEORY_[A-Z_]+".*?</Modifier>',
                           open(POLTH, encoding='utf-8').read(), re.S)
        have = set(re.findall(r'<Argument name="ProgressionTreeNodeType">([A-Z_]+)</Argument>',
                              '\n'.join(_blks)))
        if not _blks:
            bad.append('POLITICAL THEORY: no ENI_MO_MARK_POLITICAL_THEORY_* markers found '
                       '-> run tools/gen-eni-mo-political-theory.py')
        for _b in _blks:
            _id = re.search(r'id="([A-Z_]+)"', _b).group(1)
            _n = len(re.findall(r'<Requirement ', _b))
            # SIZE IS THE WHOLE POINT OF THE RE-CUT. The base game ships 38 TEST_ANY blocks and the
            # largest holds 4; two shapes at 53 both failed silently in play. Nothing here may grow.
            if _n > 2:
                bad.append('POLITICAL THEORY: %s holds %d requirements - the re-cut caps a marker at '
                           '2, and oversized OR-sets are exactly what failed to fire twice' % (_id, _n))
            if _n > 1 and 'REQUIREMENTSET_TEST_ANY' not in _b:
                bad.append('POLITICAL THEORY: %s has %d requirements but no TEST_ANY - as a plain '
                           'AND-set it would need BOTH entry nodes, so most players never earn it'
                           % (_id, _n))
            if _n > 1 and 'GAME_IS_STARTED' in _b:
                bad.append('POLITICAL THEORY: %s has REQUIREMENT_GAME_IS_STARTED inside an OR-set - '
                           'it is always true, so the deed would fire on turn 1 for everyone' % _id)
        print('%-30s %d markers, %d node ids, %d live in game'
              % ('Political Theory', len(_blks), len(have), len(live)))
        missing, extra = sorted(live - have), sorted(have - live)
        if missing:
            bad.append('POLITICAL THEORY: %d civ node(s) MISSING - %s%s'
                       % (len(missing), ', '.join(missing[:4]), ' ...' if len(missing) > 4 else ''))
        if extra:
            bad.append('POLITICAL THEORY: %d node(s) no longer in game - %s%s'
                       % (len(extra), ', '.join(extra[:4]), ' ...' if len(extra) > 4 else ''))
        if missing or extra:
            bad.append('   -> re-run tools/gen-eni-mo-political-theory.py')

STORY_AGES = [('aq-stories.xml', 'aq-deeds-gameeffects.xml', 'aq-boosts-40.xml', '../text/aq-text.xml'),
              ('mo-stories.xml', 'mo-deeds-gameeffects.xml', 'mo-boosts-40.xml', '../text/mo-text.xml')]

def _read(name):
    p = os.path.join(ROOT, name)
    return open(p, encoding='utf-8').read() if os.path.exists(p) else None

for stories, effects, boosts, text in STORY_AGES:
    st = _read(stories)
    if st is None:
        continue
    eff, txt = _read(effects) or '', _read(text) or ''
    # the marker lives in the deeds file, the boost in the generated boosts file - scan both, or
    # every story reward looks like a dangling reference.
    both = eff + (_read(boosts) or '')
    age = stories.split('-')[0].upper()
    sets = set(re.findall(r'<RequirementSet id="([A-Z_0-9]+)"', eff))
    mods = set(re.findall(r'<Modifier id="([A-Z_0-9]+)"', both))
    tags = set(re.findall(r'Tag="(LOC_[A-Z_0-9]+)"', txt))
    rewards = dict(re.findall(r'<Row NarrativeRewardType="([A-Z_0-9]+)" ModifierID="([A-Z_0-9]+)"', st))
    rows = re.findall(r'<Row NarrativeStoryType="([A-Z_0-9]+)"([^/]*)/>', st)
    n = 0
    for story, attrs in rows:
        if 'RequirementSetId' not in attrs:
            continue                        # a NarrativeStory_Rewards row, not a story definition
        n += 1
        a = dict(re.findall(r'(\w+)="([^"]*)"', attrs))
        for field in ('RequirementSetId', 'ActivationRequirementSetId'):
            rs = a.get(field)
            if rs and rs not in sets:
                bad.append('%s STORY %s: %s="%s" resolves to NOTHING - the deed can never fire'
                           % (age, story, field, rs))
        for field in ('Name', 'Description', 'Completion'):
            tg = a.get(field)
            if tg and tg not in tags:
                bad.append('%s STORY %s: %s tag %s is missing from the text file' % (age, story, field, tg))
        # every reward this story grants must point at a modifier that exists...
        granted = re.findall(r'<Row NarrativeStoryType="%s" NarrativeRewardType="([A-Z_0-9]+)"' % story, st)
        for g in granted:
            mid = rewards.get(g)
            if mid is None:
                bad.append('%s STORY %s: reward %s has no NarrativeRewards row' % (age, story, g))
            elif mid not in mods:
                bad.append('%s STORY %s: reward %s points at missing modifier %s' % (age, story, g, mid))
            # ...and a story-delivered marker/boost must NOT carry its own requirements: the
            # condition belongs in the POLLED set, and inline ones would double-gate it silently.
            elif re.search(r'<Modifier id="%s"[^>]*>\s*<SubjectRequirements' % mid, both):
                bad.append('%s STORY %s: %s carries inline SubjectRequirements - move them to the '
                           'polled RequirementSet' % (age, story, mid))
    print('%-30s %d stor%s wired' % (stories, n, 'y' if n == 1 else 'ies'))

# ---------------------------------------------------------------------------
# 4. Step trackers. A tracker defined but never attached is dead code that shows up as a
#    counter frozen at 0 / N - no error anywhere. So is a UI part reading a key nothing
#    writes. Both are silent, so both are checked here.
UI = open(os.path.join(ROOT, '..', 'ui', 'eni-core.js'), encoding='utf-8').read()
for age, deeds, bind in (('AQ', 'aq-deeds-gameeffects.xml', 'aq-deeds-bind.xml'),
                         ('EX', 'ex-deeds-gameeffects.xml', 'ex-deeds-bind.xml'),
                         ('MO', 'mo-deeds-gameeffects.xml', 'mo-deeds-bind.xml')):
    dpath = os.path.join(ROOT, deeds)
    if not os.path.exists(dpath):
        continue
    dx = open(dpath, encoding='utf-8').read()
    bpath = os.path.join(ROOT, bind)
    bx = open(bpath, encoding='utf-8').read() if os.path.exists(bpath) else ''
    trackers = set(re.findall(r'<Modifier id="(ENI_%s_STEP_[A-Z_0-9]+)"' % age, dx))
    if not trackers:
        continue
    wrapped = set()
    for wid, arg in re.findall(r'<Modifier id="(ENI_%s_ATTACH_STEPS\d+)"[^>]*>\s*'
                               r'<Argument name="ModifierId">([^<]*)</Argument>' % age, dx):
        ids = [x.strip() for x in arg.split(',') if x.strip()]
        if len(ids) > 2:
            bad.append('%s TRACKERS: wrapper %s lists %d modifiers - a list longer than 2 '
                       'silently attaches NOTHING' % (age, wid, len(ids)))
        wrapped.update(ids)
        if ('ModifierId="%s"' % wid) not in bx:
            bad.append('%s TRACKERS: wrapper %s is never bound in %s - its trackers never run'
                       % (age, wid, bind))
    for t in sorted(trackers - wrapped):
        bad.append('%s TRACKERS: %s is in no wrapper - dead code, reads as a frozen counter' % (age, t))
    written = set(re.findall(r'<Argument name="Key">(ENI_[A-Z_0-9]+)</Argument>', dx))
    for key in sorted(set(re.findall(r"key: '(ENI_%s_STEP_[A-Z_0-9]+)'" % age, UI))):
        if key not in written:
            bad.append('%s TRACKERS: the dashboard reads %s but no modifier writes it' % (age, key))
    print('%-30s %d step trackers, all wrapped and bound' % (deeds, len(trackers)))

# ---------------------------------------------------------------------------
# 5. The UI modules must parse AS MODULES. Learned the hard way 2026-08-06: a generator
#    emitted a doubled closing brace in ENI_MULTIPART, `node --check` passed because it
#    parses a .js file as a SCRIPT where the wreckage reads as labelled blocks, and the
#    dashboard silently vanished in-game - every surface imports eni-core.js, so one bad
#    module takes the whole UI layer down. Copying to .mjs forces module parsing.
import shutil, subprocess, tempfile
UIDIR = os.path.join(ROOT, '..', 'ui')
if shutil.which('node'):
    tmp = tempfile.mkdtemp()
    n = 0
    for js in sorted(os.listdir(UIDIR)):
        if not js.endswith('.js'):
            continue
        mjs = os.path.join(tmp, js[:-3] + '.mjs')
        shutil.copyfile(os.path.join(UIDIR, js), mjs)
        r = subprocess.run(['node', '--check', mjs], capture_output=True, text=True)
        if r.returncode:
            lines = [x.strip() for x in r.stderr.splitlines() if x.strip()]
            # the useful line names the error; the tail is node's version banner
            msg = next((x for x in lines if 'Error' in x), lines[0] if lines else 'parse error')
            where = next((x for x in lines if js[:-3] + '.mjs:' in x), '')
            bad.append('UI: %s does not parse as a module - %s%s'
                       % (js, msg, ('  [' + where.split(os.sep)[-1] + ']') if where else ''))
        n += 1
    shutil.rmtree(tmp, ignore_errors=True)
    print('%-30s %d UI modules parse' % ('ui/', n))

# Every ENI_MULTIPART node must be a node some marker actually writes. A wrong id here is SILENT:
# the dashboard simply never matches the card to its counter, and the deed goes back to showing
# nothing while part-done - the exact gap the trackers exist to close. Caught two bad ids on
# 2026-08-08 (URBAN_PLANNING is a TECH node, REFORMATION a BRANCH) that the audit found only
# because it happened to be re-run.
_ui = os.path.join(ROOT, '..', 'ui', 'eni-core.js')
if os.path.exists(_ui):
    _src = open(_ui, encoding='utf-8').read()
    _mp = _src[_src.index('ENI_MULTIPART = {'):] if 'ENI_MULTIPART = {' in _src else ''
    _nodes = re.findall(r'\n    (NODE_[A-Z_0-9]+): \{', _mp)
    _written = set()
    for _f in ('aq-deeds-gameeffects.xml', 'ex-deeds-gameeffects.xml', 'mo-deeds-gameeffects.xml'):
        _p = os.path.join(ROOT, _f)
        if os.path.exists(_p):
            _written |= set(re.findall(r'<Argument name="Key">ENI_BOOST_(NODE_[A-Z_0-9]+)</Argument>',
                                       open(_p, encoding='utf-8').read()))
    _orphans = [x for x in _nodes if x not in _written]
    for x in _orphans:
        bad.append('UI: ENI_MULTIPART names %s, which no marker writes - the card would show no '
                   'progress. Check the node id against the boost generator.' % x)
    print('%-30s %d dashboard counters, all match a real node'
          % ('ui/eni-core.js', len(_nodes) - len(_orphans)))
else:
    print('%-30s node not found - UI modules NOT checked' % 'ui/')

if bad:
    print('\nFAILED - a deed cannot fire, or a boost does not match its marker:')
    for x in bad:
        print('   ' + x)
    sys.exit(1)
print('\nOK - boosts match their markers, and every story deed is fully wired.')
