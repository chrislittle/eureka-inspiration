/**
 * Eureka & Inspiration — tree overlays: card badges + tooltip percentage pill + deed box.
 * v4: the tooltip resolves its node from ITS OWN HEADER NAME (works on the full trees AND
 * both research choosers — no hover dependency), and the percentage anchors on the real
 * Cost element, never the advisor row.
 */
import { ENI_DEEDS, ENI_NAME2NODE, ENI_MULTIPART, eniPartDone, eniPartsDone, eniBoostEarned, eniNodeState, eniLoc, eniInjectStyle } from 'fs://game/eureka-inspiration/ui/eni-core.js';

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

// The tooltip names its node in its header - find the first short leaf text and map it.
function nodeFromTooltip(tooltip) {
    try {
        const els = tooltip.querySelectorAll('*');
        for (const el of els) {
            if (el.childElementCount) continue;
            const t = (el.textContent ?? '').trim();
            if (t.length >= 3 && t.length <= 26) {
                const hit = ENI_NAME2NODE[t.toUpperCase()];
                if (hit !== undefined || Object.keys(ENI_NAME2NODE).length === 0) return hit ?? null;
                return hit ?? null;
            }
        }
    } catch (e) { /* unresolved */ }
    return null;
}

// The real Cost element: the deepest leaf-ish element whose text starts with "Cost".
function findCostEl(tooltip) {
    try {
        let best = null;
        for (const el of tooltip.querySelectorAll('*')) {
            const t = (el.textContent ?? '').trim();
            if (/^Cost\b/.test(t) && t.length <= 24) best = el; // deepest match wins (document order descends)
        }
        return best;
    } catch (e) { return null; }
}

function patchTooltip(tooltip) {
    try {
        if (!tooltip || tooltip.dataset.eniDone) return;
        tooltip.dataset.eniDone = '1';
        const nodeKey = nodeFromTooltip(tooltip);
        if (!nodeKey) return;
        const d = ENI_DEEDS[nodeKey];
        if (!d) return;
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
                // if the anchor is missing, skip the insert (never fall back to the root).
                const pillRow = costEl && typeof costEl.closest === 'function' ? costEl.closest('.flex-wrap') : null;
                if (pillRow && pillRow.parentElement) {
                    box.style.marginTop = '0.4444rem';
                    pillRow.parentElement.insertBefore(box, pillRow);
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
console.error('[eureka-inspiration] tree overlays v5 active, mapped ' + Object.keys(HASH2TYPE).length + ' nodes');
