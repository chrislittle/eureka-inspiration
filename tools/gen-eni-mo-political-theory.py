r"""Regenerate Modern / Political Theory's "unique civics" deed.

SCOPE - this script rewrites exactly one delimited block in data/mo-deeds-gameeffects.xml
(between the GENERATED / END GENERATED sentinels) holding one marker plus one attach wrapper per
civ-unique Modern civics tree. It touches nothing else in that file and no other file at all.
Re-run tools/gen-eni-mo-boosts.py afterwards: it discovers the ENI_MO_MARK_POLITICAL_THEORY_*
keys by sweeping the deeds file, mirrors a boost onto each and writes the bind rows.

⚠⚠ TWO SHAPES ALREADY FAILED IN PLAY. Do not go back to either.
  1. A NAMED RequirementSet of all 53 roots reached through REQUIREMENT_REQUIREMENTSET_IS_MET
     (2026-08-06, America): the node read depth=1 state=5 in a FireTuner probe, marker stayed 0.
  2. The same 53 roots INLINE under <SubjectRequirements type="REQUIREMENTSET_TEST_ANY">
     (2026-08-08, America again): still nothing.
  What both had in common was SIZE, and a sweep of the installed game settles it - the base game
  ships 38 TEST_ANY blocks and THE LARGEST HOLDS 4 REQUIREMENTS. 53 is far outside anything
  Firaxis exercises. The attribute itself is fine (22 inline uses on SubjectRequirements), so the
  fix is not a different mechanism, it is SMALLER SETS.

HOW THE DEED IS SPLIT NOW
Every marker writes the SAME key, so whichever one fires earns the boost, and a player can only
ever satisfy one of them - which is what keeps the deed from paying twice.
  - A per-civ tree (1 or 2 roots) gets ONE marker. Two roots means a 2-requirement TEST_ANY,
    comfortably inside the base game's precedent. One marker per tree also means a civ with two
    entry nodes cannot pay twice by researching both.
  - A tree with MORE than 2 roots gets one marker PER ROOT, each with a single requirement and no
    OR at all. Today that is only TREE_CIVICS_MO_TEST_OF_TIME, which is not one civ's tree - it is
    a shared tree holding one "<Civ> Modernization" root for each of 32 Test-of-Time civs, and a
    player can reach exactly one of them. Splitting it is therefore double-pay-safe.
    ⚠ That safety rests on a >2-root tree being shared across civs. If a DLC ever ships a single
    civ a tree with three parallel entry nodes, this rule would let that civ earn the boost twice;
    the fix then is to group it like the 2-root civs and accept a 3-requirement TEST_ANY.

WHY IT MUST BE GENERATED
The deed is "research a node in your civilization's unique civics tree". The requirement can only
name a node by *id* - there is no wildcard, no "any node in tree X" filter, and no tag - so the
deed has to enumerate every civ's entry node. That list is NOT a constant: it spans Base AND DLC,
and every future civ DLC adds more. A civ whose ids are missing simply cannot earn the boost - no
error, no log line, it silently never fires. Hence a generator plus a drift check.

HOW THE SET IS DERIVED
  1. Sweep Base\modules AND DLC for progression-trees-culture*.xml. The glob is deliberately
     WIDE: the Test-of-Time tree is declared in ...-tot-common.xml, which no '-unique' glob
     matches. Filtering on the tree NAME below is what keeps the set correct.
  2. Keep ProgressionTrees whose type starts with TREE_CIVICS_ (plural) and whose AgeType is
     AGE_MODERN. The plural is load-bearing: TREE_CIVIC_ (singular) is the MAIN civic tree and
     the ideology branches, which must NOT be included.
  3. Collect every node belonging to those trees.
  4. Keep only ROOTS - nodes that never appear as a `Node` with a `PrereqNode`. The trees chain,
     so holding any node implies holding its root; listing roots covers every path in.

USAGE
    python tools/gen-eni-mo-political-theory.py
    python tools/gen-eni-mo-political-theory.py --count     # print the root count only

Re-run after any civ DLC. check-eni-drift.py compares the emitted ids against the installed game.
"""
import os
import re
import sys
import glob

GAME = r"C:\Program Files (x86)\Steam\steamapps\common\Sid Meier's Civilization VII"
DEEDS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..',
                     'mods', 'eureka-inspiration', 'data', 'mo-deeds-gameeffects.xml')

TREE_PREFIX = 'TREE_CIVICS_'          # plural - unique civ trees only
AGE = 'AGE_MODERN'
KEY = 'ENI_BOOST_NODE_CIVIC_MO_MAIN_POLITICAL_THEORY'
# Above this many roots a tree is treated as SHARED and split one marker per root - see the
# header. Two is also the largest TEST_ANY this deed will ever emit.
SHARED_TREE_ROOTS = 2
# Deliberately WIDE: the Test-of-Time tree is declared in progression-trees-culture-tot-common.xml,
# which no '-unique' glob would ever match. The TREE_CIVICS_/AgeType filter below does the real
# work, so widening here is safe and survives future file-naming changes.
GLOB = 'progression-trees-culture*.xml'

BEGIN = '\t<!-- ==================== GENERATED: Political Theory ==================== -->\n'
END = '\t<!-- ================== END GENERATED: Political Theory ================== -->\n'


def _attrs(row):
    return dict(re.findall(r'(\w+)="([^"]*)"', row))


def collect():
    """Return (sorted root node ids, {tree: [roots]}) swept from Base + DLC."""
    roots_of = {}
    trees, nodes, has_prereq = set(), {}, set()

    searched = []
    for area in ('Base', 'DLC'):
        base = os.path.join(GAME, area)
        if not os.path.isdir(base):
            continue
        searched.append(area)
        for path in glob.glob(os.path.join(base, '**', GLOB), recursive=True):
            try:
                raw = open(path, encoding='utf-8').read()
            except OSError:
                continue
            for row in re.findall(r'<Row ([^>]*)/>', raw):
                a = _attrs(row)
                t = a.get('ProgressionTreeType')
                if t and t.startswith(TREE_PREFIX) and a.get('AgeType') == AGE:
                    trees.add(t)
                n = a.get('ProgressionTreeNodeType')
                if n and 'Cost' in a and 'ProgressionTree' in a:
                    nodes[n] = a['ProgressionTree']
                nn = a.get('Node')
                if nn and 'PrereqNode' in a:
                    has_prereq.add(nn)

    if not searched:
        sys.exit('ERROR: game not found at %s' % GAME)
    if not trees:
        sys.exit('ERROR: no %s* trees found for %s - has the data layout changed?' % (TREE_PREFIX, AGE))

    for n, t in nodes.items():
        if t in trees and n not in has_prereq:
            roots_of.setdefault(t, []).append(n)
    return sorted(n for ns in roots_of.values() for n in ns), roots_of


def groups(by_tree):
    """[(key suffix, [node ids])] - one entry per marker. See the header for the split rule."""
    out = []
    for tree in sorted(by_tree):
        roots = sorted(by_tree[tree])
        if len(roots) <= SHARED_TREE_ROOTS:
            out.append((tree[len(TREE_PREFIX) + 3:], roots))       # strip TREE_CIVICS_MO_
        else:
            for n in roots:
                out.append((re.sub(r'_MODERNIZATION$', '', n[len('NODE_CIVIC_MO_'):]), [n]))
    seen = {}
    for suffix, roots in out:
        if suffix in seen:
            sys.exit('ERROR: two markers would share the id POLITICAL_THEORY_%s (%s vs %s)'
                     % (suffix, seen[suffix], roots))
        seen[suffix] = roots
    return out


def marker(suffix, roots):
    # MinDepth is NOT optional. REQUIREMENT_PLAYER_HAS_COMPLETED_PROGRESSION_TREE_NODE silently
    # never fires without it - no error, no log line - and 100 of the 108 base-game uses include
    # it. Leaving it off would make this deed unearnable for EVERY civ, which is the exact failure
    # class this generator exists to prevent.
    reqs = '\n'.join(
        '\t\t\t<Requirement type="REQUIREMENT_PLAYER_HAS_COMPLETED_PROGRESSION_TREE_NODE">\n'
        '\t\t\t\t<Argument name="ProgressionTreeNodeType">%s</Argument>\n'
        '\t\t\t\t<Argument name="MinDepth">1</Argument>\n'
        '\t\t\t</Requirement>' % n for n in roots)
    # ⛔ NO REQUIREMENT_GAME_IS_STARTED in the multi-root form: it is an OR-set, and a requirement
    # that is always true would satisfy the whole thing on turn 1.
    open_tag = ('<SubjectRequirements type="REQUIREMENTSET_TEST_ANY">' if len(roots) > 1
                else '<SubjectRequirements>')
    return ('\t<Modifier id="ENI_MO_MARK_POLITICAL_THEORY_%s" collection="COLLECTION_OWNER"'
            ' effect="EFFECT_PLAYER_PROPERTY" permanent="true" run-once="true">\n'
            '\t\t%s\n%s\n'
            '\t\t</SubjectRequirements>\n'
            '\t\t<Argument name="Key">%s</Argument>\n'
            '\t\t<Argument name="Value">1</Argument>\n'
            '\t\t<Argument name="Operation">CHANGE</Argument>\n'
            '\t</Modifier>\n' % (suffix, open_tag, reqs, KEY))


def wrapper(suffix):
    return ('\t<Modifier id="ENI_MO_ATTACH_POLITICAL_THEORY_%s" collection="COLLECTION_MAJOR_PLAYERS"'
            ' effect="EFFECT_ATTACH_MODIFIERS" permanent="true">\n'
            '\t\t<Argument name="ModifierId">ENI_MO_MARK_POLITICAL_THEORY_%s,'
            ' ENI_MO_BOOST_POLITICAL_THEORY_%s</Argument>\n'
            '\t</Modifier>\n' % (suffix, suffix, suffix))


HEADER = """\t<!-- Political Theory: research a node in your OWN civilization's unique civics tree.
\t     ✅ PROVEN IN PLAY 2026-08-08 after two failures. The split below is what fixed it, and the
\t     size law it rests on is now confirmed: an oversized OR-set fires nothing and says nothing.
\t     ⚠ EVERYTHING BETWEEN THE SENTINELS IS GENERATED - re-run
\t     tools/gen-eni-mo-political-theory.py after any civ DLC and do not hand-edit it. A civ whose
\t     id is missing simply never earns this, with no error and no log line; check-eni-drift.py is
\t     what catches that.
\t     ONE MARKER PER CIV TREE, all writing the same key. Two earlier shapes - a named 53-row set
\t     reached by REQUIREMENT_REQUIREMENTSET_IS_MET, then the same 53 rows inline under TEST_ANY -
\t     BOTH FAILED TO FIRE IN PLAY. The base game ships 38 TEST_ANY blocks and the largest holds
\t     FOUR requirements, so 53 was far outside anything Firaxis exercises. Nothing here exceeds
\t     two. A player can satisfy only one marker, so the boost cannot pay twice. -->
"""


def main():
    roots, by_tree = collect()
    if '--count' in sys.argv:
        print(len(roots))
        return
    gs = groups(by_tree)
    block = (BEGIN + HEADER
             + ''.join(marker(s, r) for s, r in gs)
             + ''.join(wrapper(s) for s, _ in gs)
             + END)

    src = open(DEEDS, encoding='utf-8').read()
    pat = re.compile(re.escape(BEGIN) + '.*?' + re.escape(END), re.S)
    if not pat.search(src):
        # first migration off the single-modifier form
        pat = re.compile(r'\t<!-- Political Theory:.*?<Modifier id="ENI_MO_MARK_POLITICAL_THEORY".*?</Modifier>\n', re.S)
    if not pat.search(src):
        sys.exit('FAILED: neither the generated block nor ENI_MO_MARK_POLITICAL_THEORY found in %s'
                 % os.path.basename(DEEDS))
    open(DEEDS, 'w', encoding='utf-8', newline='\n').write(pat.sub(lambda m: block, src, count=1))

    split = sum(1 for t in by_tree if len(by_tree[t]) > SHARED_TREE_ROOTS)
    print('gen-eni-mo-political-theory: %d root nodes across %d unique civic trees -> %d markers'
          % (len(roots), len(by_tree), len(gs)))
    for t in sorted(by_tree):
        n = len(by_tree[t])
        note = '  SHARED - split one marker per root' if n > SHARED_TREE_ROOTS else ''
        print('   %-34s %d root%s%s' % (t.replace(TREE_PREFIX, ''), n, '' if n == 1 else 's', note))
    print('-> spliced %d markers + %d wrappers into %s (%d shared tree%s split)'
          % (len(gs), len(gs), os.path.basename(DEEDS), split, '' if split == 1 else 's'))
    print('   now re-run tools/gen-eni-mo-boosts.py so the boosts and bind rows follow')


if __name__ == '__main__':
    main()
