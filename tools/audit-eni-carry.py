"""Which deeds are STATE checks, and could a carried empire satisfy them on turn 1?

An EVENT deed (a gossip count with AfterInit) asks what happened THIS AGE, so nothing a player
arrives holding can pre-fill it. A STATE deed asks what you HAVE, and there is no way to Age-scope
one - AfterInit belongs to gossip counts, and requirements like HAS_COMMANDERS_WITH_X_LEVELS or
HAS_X_WARS carry no turn window at all.

So every state deed in EX and MO needs a reason why a carried empire cannot already satisfy it.
Usually that reason is an AGE-STAMPED SUBJECT: a Modern-age building cannot exist before Modern
(the Feudalism/Medieval Walls argument). Where the subject is NOT age-stamped - a war, a resource,
a town focus, a relationship - the deed is exposed.

Antiquity is exempt: it is the first Age, nothing carries in.

Run:  python tools/audit-eni-carry.py
"""
import io, os, re, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'mods', 'eureka-inspiration', 'data')

AGES = (('EX', 'ex-deeds-gameeffects.xml', 'ENI_EX_MARK_'),
        ('MO', 'mo-deeds-gameeffects.xml', 'ENI_MO_MARK_'))

for age, fname, prefix in AGES:
    path = os.path.join(DATA, fname)
    if not os.path.exists(path):
        continue
    src = open(path, encoding='utf-8').read()
    events, states = [], []
    for m in re.finditer(r'<Modifier id="' + prefix + r'([A-Z_0-9]+)".*?</Modifier>', src, re.S):
        name, body = m.group(1), m.group(0)
        if not re.search(r'<SubjectRequirements', body):
            # story deed - its condition lives in a polled set
            st = re.search(r'<RequirementSet id="REQSET_ENI_[A-Z_0-9]*?' + name +
                           r'_DONE">.*?</RequirementSet>', src, re.S)
            body = st.group(0) if st else body
        reqs = [r for r in re.findall(r'<Requirement type="REQUIREMENT_([A-Z_]+)"', body)
                if r != 'GAME_IS_STARTED']
        if 'AfterInit' in body:
            events.append(name)
        else:
            states.append((name, ', '.join(sorted(set(reqs))) or '(none)'))
    print('=== %s ===' % age)
    print('  EVENT (Age-scoped, cannot be pre-filled): %d' % len(events))
    print('    ' + ', '.join(sorted(events)))
    print('  STATE (needs an age-stamped subject to be safe): %d' % len(states))
    for n, r in sorted(states):
        print('    %-26s %s' % (n, r))
    print()
