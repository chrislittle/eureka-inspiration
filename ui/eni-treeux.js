/**
 * Eureka & Inspiration — tree overlays: card badges + tooltip percentage pill + deed box.
 * v4: the tooltip resolves its node from ITS OWN HEADER NAME (works on the full trees AND
 * both research choosers — no hover dependency), and the percentage anchors on the real
 * Cost element, never the advisor row.
 */
import { ENI_DEEDS, eniNodeFromName, ENI_MULTIPART, eniPartDone, eniPartsDone, eniBoostEarned, eniNodeState, eniLoc, eniInjectStyle } from 'fs://game/eureka-inspiration/ui/eni-core.js';

const CARD_SEL = 'tree-card-v2[type]';
const BADGE_CLASSES = ['eni-b-t', 'eni-e-t', 'eni-b-c', 'eni-e-c'];

const HASH2TYPE = {};
try {
    for (const key of Object.keys(ENI_DEEDS)) {
        try { HASH2TYPE[String(Database.makeHash(key))] = key; } catch (e) { /* skip one */ }
    }
} catch (e) { /* dormant */ }

function resolveNode(attrType) {
    if (!attrType) return null;
    if (ENI_DEEDS[attrType]) return attrType;
    return HASH2TYPE[attrType] ?? null;
}

// Card progress by node, harvested during badge refresh (feeds tooltip pct on tree screens).
const cardPct = {};

// MA-proven (mad-boost-glow.js): the pill class goes on the card's VISIBLE BAR, not the
// tree-card-v2 host (the host wraps the mastery-II row too - pinning there floats the pill
// between the rows). Completion = depthUnlocked >= 1 with Number() coercion - the engine
// RESETS node.progress to 0 at completion (MA GitHub #27), so progress can never signal it.
// Anchor on .tree-card-hitbox with an INSET, CENTERED glyph - the exact MA-pill idiom
// (top:50% / right:0.7778rem / translateY), the only placement that ships aligned in MA and
// rendered on-card here. Edge-hugging geometry is unimplementable (art is inset in every
// layout box) - banked in skill ui-modding.md.
function barTarget(el) {
    try { return el.querySelector('.tree-card-hitbox') || el; } catch (e) { return el; }
}

function nodeCompleted(attrType) {
    try {
        const n = Game.ProgressionTrees.getNode(GameContext.localPlayerID, Number(attrType));
        return ((n && n.depthUnlocked) || 0) >= 1;
    } catch (e) { return false; }
}

function refreshCards() {
    let cards;
    try { cards = document.querySelectorAll(CARD_SEL); } catch (e) { return; }
    for (const card of cards) {
        try {
            // Mastery-II cards are separate tree-card-v2 elements with the SAME node type -
            // never decorate them (they caused the stray marks under the II rows).
            if (card.classList.contains('tree-card--mastery') ||
                card.firstElementChild?.classList?.contains('tree-card--mastery')) continue;
            const attrType = card.getAttribute('type');
            const nodeKey = resolveNode(attrType);
            let want = null;
            if (nodeKey) {
                const d = ENI_DEEDS[nodeKey];
                const p = parseFloat(card.getAttribute('progress'));
                if (!Number.isNaN(p)) cardPct[nodeKey] = Math.max(0, Math.min(100, Math.round(p)));
                if (!nodeCompleted(attrType)) {
                    const earned = eniBoostEarned(nodeKey);
                    want = d.tree === 'tech' ? (earned ? 'eni-e-t' : 'eni-b-t') : (earned ? 'eni-e-c' : 'eni-b-c');
                }
            }
            const bar = barTarget(card);
            const have = BADGE_CLASSES.find(c => bar.classList.contains(c)) ?? null;
            if (want === have) continue;
            bar.classList.remove('eni-b', ...BADGE_CLASSES);
            if (want) bar.classList.add('eni-b', want);
        } catch (e) { /* this card only */ }
    }
}

/* ⭐⭐ THE HOVERED CARD NAMES THE NODE, THE HEADER TEXT DOES NOT (2026-09-06, French, confirmed in
   play). The tooltip is a Solid component with no node id on it, so v4 read its header text and
   mapped that - which made the whole overlay ENGLISH-ONLY and silently absent everywhere else.
   `tree-card-v2` and both chooser items carry `type` as an attribute, and refreshCards already
   resolves it by HASH in every language: that is the same path, reused. A single capture-phase
   mouseover on body covers the full trees and both research choosers, the same way the base UI
   itself decides what the tooltip is for. */
let hoveredNode = null;

/* ⚠ document.body IS NOT GUARANTEED AT UISCRIPT LOAD - binding blind threw into a silent catch and
   left hover tracking dead for the session. Retry the same way watchTooltips does. */
function watchHover() {
    try {
        if (!document.body) { setTimeout(watchHover, 2000); return; }
        document.body.addEventListener('mouseover', (ev) => {
            try {
                const t = ev.target;
                if (!t || typeof t.closest !== 'function') return;
                /* ⚠ TWO DIFFERENT ATTRIBUTES, and only one of them is `type`. The full trees use
                   `tree-card-v2[type]`; the tech/civic research CHOOSERS put the node on
                   `[node-id]` instead. A single broad `[type]` selector both missed every chooser
                   and risked matching unrelated elements inside the tooltip itself. */
                let raw = null;
                const chooser = t.closest('[node-id]');
                if (chooser) raw = chooser.getAttribute('node-id');
                else {
                    const card = t.closest(CARD_SEL);
                    /* Mastery-II cards repeat their parent's node type; that is still the right
                       ANSWER here (same node), so unlike refreshCards there is nothing to skip. */
                    if (card) raw = card.getAttribute('type');
                }
                if (!raw) return;
                const key = resolveNode(raw);
                if (key) hoveredNode = key;
            } catch (e) { /* keep the last known node */ }
        }, true);
    } catch (e) { /* no hover tracking - the text fallback still answers */ }
}

function nodeFromTooltip(tooltip) {
    /* The hash answer first, and it is the one that works in every language. */
    if (hoveredNode) return hoveredNode;
    /* ⚠ FALLBACK ONLY. Now locale-aware (eniNodeFromName carries the game's own localised names),
       and it KEEPS SCANNING instead of giving up on the first short leaf - the old version returned
       on its first candidate whether or not it matched, so anything another mod inserted above the
       header killed resolution outright. */
    try {
        for (const el of tooltip.querySelectorAll('*')) {
            if (el.childElementCount) continue;
            const t = (el.textContent ?? '').trim();
            if (t.length < 3 || t.length > 26) continue;
            const hit = eniNodeFromName(t);
            if (hit) return hit;
        }
    } catch (e) { /* unresolved */ }
    return null;
}

/* ⛔ NEVER THE LITERAL WORD "Cost" (2026-09-06). The base tooltip renders LOC_CARD_COST, which ships
   as "Kosten:" (de), "Coût :" (fr), "Coste:" (es), "Стоимость:" (ru) - so an English regex found
   nothing, costEl came back null, and the deed box was BUILT AND THEN NEVER INSERTED, because the
   insert deliberately refuses to run without its anchor. That was the second half of the
   French-overlay bug. Ask the game for the string and take the part before its {1_Cost} slot. */
let costPrefix;

function costPrefixFor() {
    if (costPrefix !== undefined) return costPrefix;
    costPrefix = null;
    try {
        const raw = Locale.compose('LOC_CARD_COST');
        if (raw && raw !== 'LOC_CARD_COST') {
            /* "Coût : {1_Cost}" -> "Coût". Trim the separator so a stray space or colon in the
               rendered DOM cannot cost us the match. */
            const head = String(raw).split('{')[0].replace(/[\s:：]+$/, '').trim();
            if (head) costPrefix = head.toUpperCase();
        }
    } catch (e) { /* unreadable - the length heuristic below still finds it */ }
    return costPrefix;
}

/* ⭐⭐ THE ANCHOR IS STRUCTURE, NOT WORDS (2026-09-06 round 2 - Spanish still broke after round 1).
   Round 1 localised the "Cost" match but left the BOX still depending on finding that element, so a
   single missed string kept killing the whole overlay. The base tooltip builds this row from a fixed
   template - `<div class="flex flex-row flex-wrap items-center justify-center mt-2">` holding the
   advisor pills and then the cost pill - so the row can be selected outright, in any language, with
   no string anywhere in the path. Same selector Leonardfactory's yield-preview mod uses on this
   tooltip, which is base-game structure both mods read independently, not coupling. */
function findPillRow(tooltip) {
    try { return tooltip.querySelector('[class*="flex-wrap"][class*="mt-2"]'); }
    catch (e) { return null; }
}

/* The cost pill itself, needed only for the percentage fill. Structural first: the base template
   appends the cost pill AFTER the advisor pills, so it is the row's last child. The localised text
   scan stays as a fallback for a future layout change, and is never load-bearing for the box. */
function findCostEl(tooltip) {
    try {
        const row = findPillRow(tooltip);
        if (row && row.lastElementChild) return row.lastElementChild;
        const pre = costPrefixFor();
        let best = null;
        for (const el of tooltip.querySelectorAll('*')) {
            const t = (el.textContent ?? '').trim();
            if (t.length > 24) continue;
            /* deepest match wins (document order descends) */
            if (pre) { if (t.toUpperCase().startsWith(pre)) best = el; }
            else if (/^Cost\b/.test(t)) best = el;
        }
        return best;
    } catch (e) { return null; }
}

/* One line, once per session, naming WHY nothing was drawn. Silence was the whole problem: this bug
   shipped, was reported as a mod conflict, and cost two diagnosis rounds because a failure looked
   identical to "this node has no deed". Self-limiting, so it can stay in a release build. */
let toldWhy = false;

function whyNothing(reason) {
    if (toldWhy) return;
    toldWhy = true;
    try { console.error('[eureka-inspiration] tooltip overlay drew nothing: ' + reason); } catch (e) { /* mute */ }
}

function patchTooltip(tooltip) {
    try {
        if (!tooltip || tooltip.dataset.eniDone) return;
        /* ⚠ MARK DONE ONLY ONCE WE HAVE ACTUALLY RESOLVED. Setting it up front meant a fire on a
           half-rendered tooltip permanently retired that element, and the observer's later, correct
           fires all returned at the guard above. */
        const nodeKey = nodeFromTooltip(tooltip);
        if (!nodeKey) { whyNothing('no node resolved (hover tracking and the header-text fallback both missed)'); return; }
        const d = ENI_DEEDS[nodeKey];
        if (!d) return;
        tooltip.dataset.eniDone = '1';
        let pct = cardPct[nodeKey];
        if (pct == null) { const st = eniNodeState(nodeKey); pct = st.pct; if (st.completed) pct = 100; }
        const completed = pct != null && pct >= 100;
        const costEl = findCostEl(tooltip);
        // Percentage fill on the cost element (0% included), never on the advisor row.
        if (costEl && pct != null && !completed && !costEl.querySelector('.eni-fill')) {
            costEl.classList.add('eni-pill');
            const fill = document.createElement('i');
            fill.className = 'eni-fill';
            fill.style.width = pct + '%';
            costEl.insertBefore(fill, costEl.firstChild);
            const pctEl = document.createElement('span');
            pctEl.className = 'eni-pct';
            pctEl.textContent = pct + '%';
            costEl.appendChild(pctEl);
        }
        // The deed box: inserted ABOVE the advisor/cost pill row, inside the frame's
        // content column (appending after the pill row dangles the box off the frame's
        // rounded bottom - the base frame is "flex-row flex-wrap justify-center mt-2").
        if (!completed && !tooltip.querySelector('.eni-box')) {
            const deedText = eniLoc(d.deed);
            if (deedText) {
                const earned = eniBoostEarned(nodeKey);
                const box = document.createElement('div');
                box.className = 'eni-box' + (d.tree === 'civic' ? ' eni-civ' : '') + (earned ? ' eni-earned' : '');
                const k = document.createElement('span');
                k.className = 'eni-k';
                k.textContent = earned ? (d.tree === 'tech' ? 'Eureka!' : 'Inspiration') : 'Boost';
                box.appendChild(k);
                box.appendChild(document.createTextNode(' ' + deedText));
                // Multi-part deeds carry a compact "3 / 5" so the tooltip alone tells the
                // player how far along they are; the dashboard shows which parts remain.
                const mp = ENI_MULTIPART[nodeKey];
                if (mp && !earned) {
                    const done = eniPartsDone(mp);
                    const c = document.createElement('span');
                    c.className = 'eni-k eni-n';
                    c.textContent = Math.min(done, mp.need) + ' / ' + mp.need + ' ' + (mp.unit || 'types');
                    box.appendChild(c);
                }
                // Skill law: anchor on the frame's real cost row; absent beats detached -
                /* ⛔ ANCHOR FROM STRUCTURE, NEVER VIA costEl (2026-09-06). Deriving the row from the
                   cost element made the box hostage to a string match, which is how one missed
                   translation removed the entire overlay in French and Spanish. findPillRow selects
                   the row directly; the costEl route survives only as its fallback. */
                const pillRow = findPillRow(tooltip)
                    ?? (costEl && typeof costEl.closest === 'function' ? costEl.closest('.flex-wrap') : null);
                if (pillRow && pillRow.parentElement) {
                    box.style.marginTop = '0.4444rem';
                    pillRow.parentElement.insertBefore(box, pillRow);
                } else {
                    /* Last resort: the frame itself. Round 1 refused to fall back here and that
                       refusal is what made the failure TOTAL rather than merely ugly. A box in a
                       slightly wrong place is a bug report; no box at all reads as "the mod is
                       broken", which is exactly what got reported twice. */
                    tooltip.appendChild(box);
                }
            }
        }
    } catch (e) { /* cosmetic */ }
}

function watchTooltips() {
    try {
        const root = document.getElementById('uinext-tooltips');
        if (!root) { setTimeout(watchTooltips, 2000); return; }
        const mo = new MutationObserver(() => {
            try {
                const tip = root.querySelector('.tech-civic-tooltip');
                if (tip) patchTooltip(tip);
            } catch (e) { /* skip */ }
        });
        mo.observe(root, { childList: true, subtree: true });
    } catch (e) { /* tooltip layer unavailable */ }
}

eniInjectStyle();
setInterval(refreshCards, 400);
watchTooltips();
watchHover();
console.error('[eureka-inspiration] tree overlays v6 active, mapped ' + Object.keys(HASH2TYPE).length
    + ' nodes (node id by hash, anchors by structure - language-independent)');
