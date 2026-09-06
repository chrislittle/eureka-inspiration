/**
 * Eureka & Inspiration — the dashboard + the dock button.
 * v2 fixes: crest header (the design's identity mark) · styled toggle instead of a native
 * checkbox (Coherent rendered <input> as a text box) · drawn close control · note line
 * removed · the dock button is now the LIVE tracker ring — its blue/purple arcs mirror the
 * base dock's own tech and culture ring meters.
 */
import { ENI_DEEDS, eniNodeLabel, ENI_MULTIPART, ENI_IDEOLOGIES, ENI_IDEOLOGY_NODES, eniChosenIdeology, eniPartDone, eniPartsDone, eniCurrentAge, eniBoostEarned, eniNodeState, eniLoc, eniInjectStyle, ENI_BULB_SVG, ENI_CREST_SVG } from 'fs://game/eureka-inspiration/ui/eni-core.js';

/* ⚠ NAMES COME FROM THE GAME, NOT FROM US (2026-09-06). The dashboard used to print the mod's own
   hardcoded ENGLISH table, so a French player read "Writing" where the game says "Écriture".
   eniNodeLabel composes the node's own LOC key and falls back to that table only if the game
   cannot answer. Same root cause as the missing tree overlay. */
let hideCompleted = false;

function cardHtml(nodeType, d) {
    const st = eniNodeState(nodeType);
    const earned = eniBoostEarned(nodeType);
    if (st.completed && hideCompleted) return '';
    const civ = d.tree === 'civic';
    const name = eniNodeLabel(nodeType);
    const deed = eniLoc(d.deed);
    const deedCls = earned ? (civ ? 'eni-dc' : 'eni-dt') : '';
    let prog;
    if (st.completed) prog = '<span class="eni-prog eni-full"><i></i><span>Researched</span></span>';
    else if (st.pct != null) prog = '<span class="eni-prog"><i style="width:' + st.pct + '%"></i><span>' + st.pct + '%</span></span>';
    else prog = '<span class="eni-prog"><span>0%</span></span>';
    let badge = '';
    if (!st.completed) {
        if (earned) badge = '<span class="eni-badge ' + (civ ? 'ec' : 'et') + '">' + (civ ? 'Inspiration' : 'Eureka!') + '</span>';
        else badge = '<span class="eni-badge ' + (civ ? 'bc' : 'bt') + '">Boost</span>';
    } else badge = '<span class="eni-badge eni-tick">' +
        '<svg viewBox="0 0 14 14" width="13" height="13"><path d="M2.5 7.6 L5.6 10.6 L11.5 3.8" fill="none" stroke="#9aa3ad" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</span>';
    // A multi-part deed ("5 of these 9") gets a chip per part - lit once that part is done, dim
    // while it is outstanding - so the player can see WHICH ones are still missing. Drops away
    // once the deed is earned, since there is nothing left to track.
    let parts = '';
    const mp = ENI_MULTIPART[nodeType];
    if (mp && !earned && !st.completed) {
        const done = eniPartsDone(mp);
        const chips = mp.parts.map((pt) =>
            '<span class="eni-part' + (eniPartDone(pt.key) ? ' on' : '') + '">' + pt.label + '</span>'
        ).join('');
        // `unit` names what is being counted (types / Celebrations / kills ...). Older entries
        // without one keep the original wording.
        // A SPLIT deed shows chips only. Its part count collides with a number in the deed's own
        // sentence - "0 / 2" next to "Meet 2 civilizations" reads as civilizations met rather than
        // steps done (Chris, from the card in play) - and the chips already name themselves.
        parts = (mp.split ? ''
                 : '<div class="eni-count">' + done + ' / ' + mp.need + ' ' + (mp.unit || 'types') + '</div>') +
                '<div class="eni-parts">' + chips + '</div>';
    }
    return '<div class="eni-card ' + (civ ? 'eni-c' : 'eni-t') + (st.completed ? ' eni-done' : '') + '">' +
        '<div class="eni-nm">' + name + '</div>' +
        '<div class="eni-dd ' + deedCls + '">' + deed + '</div>' +
        parts +
        '<div class="eni-ft">' + prog + badge + '</div></div>';
}

function render() {
    try {
        const el = document.getElementById('eni-dash');
        if (!el) return;
        const age = eniCurrentAge();
        const entries = Object.entries(ENI_DEEDS).filter(([, d]) => d.age === age);
        let earned = 0, open = 0, banked = 0;
        for (const [n] of entries) {
            const st = eniNodeState(n);
            if (eniBoostEarned(n)) { earned++; if (!st.completed) banked++; }
            else if (!st.completed) open++;
        }
        const tech = entries.filter(([, d]) => d.tree === 'tech');
        const civicAll = entries.filter(([, d]) => d.tree === 'civic');
        // Modern forks three ways and a player walks only ONE, so the ideology deeds are pulled
        // out of the main civic run and shown as their own groups. Before the fork all three read
        // normally; after it, the two not taken are muted rather than removed.
        const civic = civicAll.filter(([n]) => !ENI_IDEOLOGY_NODES.has(n));
        const chosen = age === 'MO' ? eniChosenIdeology() : null;
        const ideoHtml = age !== 'MO' ? '' : ENI_IDEOLOGIES.map((ideo) => {
            const cards = ideo.nodes
                .filter((n) => ENI_DEEDS[n])
                .map((n) => cardHtml(n, ENI_DEEDS[n])).join('');
            if (!cards) return '';
            const yours = chosen === ideo.key;
            const note = chosen === null
                ? '<span class="eni-note">one path only</span>'
                : (yours ? '<span class="eni-yours">your ideology</span>'
                         : '<span class="eni-note">not your ideology</span>');
            return '<div class="eni-sect eni-sub' + (chosen && !yours ? ' eni-dim' : '') + '">' +
                   ideo.label + note + '</div>' +
                   '<div class="eni-cards' + (chosen && !yours ? ' eni-dim' : '') + '">' + cards + '</div>';
        }).join('');
        el.innerHTML =
            '<div class="eni-head">' +
            // The INLINE CREST, not the rendered PNG (Chris, 2026-08-06). The PNG worked - an
            // <img src="fs://game/<mod-id>/..."> does render, given an ImportFiles row - but the
            // proven route is preferred where it does the job, and the emblem art carries a wide
            // glow margin baked into the image, so at any given box size the ring itself reads
            // SMALLER than the crest does. The crest scales to fill its box exactly.
            // Sized well up from the original 64x56: this is the panel's identity mark, and it was
            // being out-weighed by the title beside it.
            '<div style="width:5.7778rem;height:5.0556rem;flex-shrink:0;">' + ENI_CREST_SVG + '</div>' +
            '<div class="eni-title"><div class="eni-w1">Eureka &amp;</div>' +
            '<div class="eni-w2">Inspiration</div></div>' +
            '<span class="eni-age">' + ({ AQ: 'Antiquity', EX: 'Exploration', MO: 'Modern' }[age] || '') + '</span>' +
            '<span class="eni-toggle' + (hideCompleted ? ' eni-on' : '') + '" id="eni-hide"><i></i>Hide completed</span>' +
            '<span class="eni-close" id="eni-close">' +
            '<svg viewBox="0 0 12 12" width="12" height="12"><line x1="1" y1="1" x2="11" y2="11" stroke="#b3a686" stroke-width="2"/><line x1="11" y1="1" x2="1" y2="11" stroke="#b3a686" stroke-width="2"/></svg>' +
            '</span></div>' +
            '<div class="eni-stats">' +
            '<div><b>' + earned + ' / ' + entries.length + '</b><span>boosts earned</span></div>' +
            '<div><b>' + open + '</b><span>boosts unearned</span></div>' +
            '<div><b>' + banked + '</b><span>boosted, not yet researched</span></div></div>' +
            '<div class="eni-body">' +
            // No count here on purpose (Chris, 2026-08-06): the stats strip above already carries
            // the totals, and a raw per-section number answers nothing a player would act on.
            '<div class="eni-sect">Technologies</div>' +
            '<div class="eni-cards">' +
            tech.map(([n, d]) => cardHtml(n, d)).join('') + '</div>' +
            '<div class="eni-sect">Civics</div>' +
            '<div class="eni-cards">' +
            civic.map(([n, d]) => cardHtml(n, d)).join('') + '</div>' +
            ideoHtml +
            '</div>';
        el.querySelector('#eni-close')?.addEventListener('click', hide);
        el.querySelector('#eni-hide')?.addEventListener('click', () => { hideCompleted = !hideCompleted; render(); });
    } catch (e) { console.error('[eureka-inspiration] dashboard render: ' + e); }
}

function show() {
    try {
        eniInjectStyle();
        let el = document.getElementById('eni-dash');
        if (!el) {
            el = document.createElement('div');
            el.id = 'eni-dash';
            document.body.appendChild(el);
        }
        el.style.display = 'flex';
        render();
    } catch (e) { console.error('[eureka-inspiration] dashboard show: ' + e); }
}
function hide() {
    try { const el = document.getElementById('eni-dash'); if (el) el.style.display = 'none'; } catch (e) { /* gone */ }
}
/* Re-render on a Font Scale change. eniRestyle() (eni-core) re-injects the stylesheet, but
   this panel also writes inline style="..." attributes, and those are rebuilt only by a
   render. render() no-ops when the panel does not exist, so this is safe unconditionally. */
try {
    engine.on('UIFontScaleChanged', () => { try { render(); } catch (e) { /* cosmetic */ } });
} catch (e) { /* no engine in this context */ }

function toggle() {
    const el = document.getElementById('eni-dash');
    if (el && el.style.display !== 'none') hide(); else show();
}

/* ---- The Eureka/Inspiration popup (UI-side) --------------------------------------- */
/* The data layer writes a player property when a deed completes (litmus-proven direct
   modifiers - the narrative-story popup route never activated in-game). This watcher
   polls the markers: the first poll is a silent baseline (no popups on load/reload),
   every later 0-to-1 flip pops the card. */

let popupBaselined = false;
const popupSeen = new Set();
const popupQueue = [];
let popupShowing = false;

function showNextPopup() {
    try {
        if (popupShowing || popupQueue.length === 0) return;
        popupShowing = true;
        const { nodeType, d, spent } = popupQueue.shift();
        const civ = d.tree === 'civic';
        const name = eniNodeLabel(nodeType);
        const doneKey = d.deed.replace(/_DESC$/, '_DONE');
        let doneText = eniLoc(doneKey);
        if (!doneText) doneText = eniLoc(d.deed);
        const el = document.createElement('div');
        el.className = 'eni-pop' + (civ ? ' eni-pop-c' : '') + (spent ? '' : ' eni-pop-x');
        el.innerHTML =
            // Gold glass, not the raw silver: this is the moment of reward, and #f2d488 is the
            // dock ring's own BOTH-BOOSTED colour and the popup's node-name accent (Chris, 2026-08-02).
            // A boost that landed on an ALREADY-RESEARCHED node paid nothing, so it keeps the raw
            // silver bulb and says so - announcing research that never arrived is worse than saying
            // nothing (Chris, 2026-08-08).
            '<div class="eni-pop-glyph">' +
            (spent ? ENI_BULB_SVG.split('#ccd1d5').join('#f2d488') : ENI_BULB_SVG) + '</div>' +
            '<div class="eni-pop-body">' +
            '<div class="eni-pop-title">' +
            (spent ? (civ ? 'Inspiration' : 'Eureka!')
                   : (civ ? 'Already completed' : 'Already researched')) + '</div>' +
            '<div class="eni-pop-node">' + name + '</div>' +
            '<div class="eni-pop-deed">' +
            (spent ? (doneText || '') : 'No boost provided.') + '</div>' +
            '</div>';
        document.body.appendChild(el);
        const dismiss = () => {
            try { el.remove(); } catch (e) { /* gone */ }
            popupShowing = false;
            setTimeout(showNextPopup, 400);
        };
        el.addEventListener('click', dismiss);
        setTimeout(dismiss, 9000);
    } catch (e) { popupShowing = false; console.error('[eureka-inspiration] popup: ' + e); }
}

function watchMarkers() {
    try {
        // No baseline until player data is actually readable, else markers restored
        // from a save would pop as if freshly earned.
        const p = Players.get(GameContext.localPlayerID);
        if (!p || typeof p.getProperty !== 'function') return;
        for (const [nodeType, d] of Object.entries(ENI_DEEDS)) {
            if (popupSeen.has(nodeType)) continue;
            if (eniBoostEarned(nodeType)) {
                // ALWAYS record it, whichever card we show - an un-recorded node is re-evaluated
                // on every poll, which is harmless today only because the marker is permanent.
                popupSeen.add(nodeType);
                // Did the boost actually buy anything? A node already researched when its marker
                // fires pays NOTHING (the mod's own rule: a head start, not a refund), so the
                // reward card would promise research that never arrived.
                // ⚠ ONE AMBIGUITY, accepted: if the boost itself finishes the node, this poll sees
                // it complete and shows the muted card even though the player was paid. It needs
                // the node to sit within the boost percentage of done, and nothing readable here
                // distinguishes "was already complete" from "just completed BY this". The
                // dashboard's earned-vs-banked split at the top of this file has the same blind spot.
                let spent = true;
                try { spent = !eniNodeState(nodeType).completed; } catch (e) { /* assume it paid */ }
                if (popupBaselined) { popupQueue.push({ nodeType, d, spent }); showNextPopup(); }
            }
        }
        popupBaselined = true;
    } catch (e) { /* next poll */ }
}

/* ---- The live tracker ring (dock button icon) ------------------------------------- */
/* Arcs mirror the base dock's own tech/culture fxs-ring-meter values (base-game DOM,
   the one dependency any UI mod carries). Bulb center stays silver until the
   current-research node mapping lands (next iteration lights it by boost state). */

function ringMeterPct(selector) {
    try {
        const el = document.querySelector(selector);
        if (!el) return 0;
        for (const attr of ['value', 'percent', 'progress']) {
            const v = parseFloat(el.getAttribute(attr));
            if (!Number.isNaN(v)) return Math.max(0, Math.min(100, v));
        }
    } catch (e) { /* absent */ }
    return 0;
}

// Current-research node -> manifest key (getResearching().type is the numeric node hash;
// same API the base dock uses for its own ring costs).
const DOCK_HASH2TYPE = {};
try {
    for (const key of Object.keys(ENI_DEEDS)) {
        try { DOCK_HASH2TYPE[String(Database.makeHash(key))] = key; } catch (e) { /* skip one */ }
    }
} catch (e) { /* dormant */ }

function currentBoostState(isCulture) {
    // 'lit' = the node being researched has its deed done; 'dim' = deed open or no deed.
    try {
        const p = Players.get(GameContext.localPlayerID);
        const sys = isCulture ? p?.Culture : p?.Techs;
        const t = sys?.getResearching?.()?.type;
        if (t == null) return 'dim';
        const nodeKey = DOCK_HASH2TYPE[String(t)];
        if (!nodeKey) return 'dim';
        return eniBoostEarned(nodeKey) ? 'lit' : 'dim';
    } catch (e) { return 'dim'; }
}

function arcPath(pct, side) {
    // Ring r=32 centered (48,42); arcs start just off the top post and sweep toward the
    // bottom post. side: -1 = left (tech), +1 = right (civic).
    const start = 6 * Math.PI / 180;                       // 6 degrees off top
    const span = (168 * Math.PI / 180) * (pct / 100);      // up to 168 degrees per side
    const a0 = -Math.PI / 2 + side * start;
    const a1 = a0 + side * span;
    const x0 = 48 + 32 * Math.cos(a0), y0 = 42 + 32 * Math.sin(a0);
    const x1 = 48 + 32 * Math.cos(a1), y1 = 42 + 32 * Math.sin(a1);
    const sweep = side > 0 ? 1 : 0;
    return { d: 'M' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' A32 32 0 0 ' + sweep + ' ' + x1.toFixed(1) + ' ' + y1.toFixed(1), tipX: x1, tipY: y1 };
}

function dockRingSvg() {
    const t = ringMeterPct('fxs-ring-meter.ring-tech');
    const c = ringMeterPct('fxs-ring-meter.ring-culture');
    const at = arcPath(t, -1), ac = arcPath(c, 1);
    // The design's boost states: gems (and the bulb) stay DIM until the researched
    // node's deed is done, then light in the tree color.
    const techLit = currentBoostState(false) === 'lit';
    const cultLit = currentBoostState(true) === 'lit';
    const anyLit = techLit || cultLit;
    const gemT = techLit
        ? 'fill="#7ec0f2" stroke="#d3a233" stroke-width="1.5"'
        : 'fill="#2a2f36" stroke="#595e63" stroke-width="1.2" opacity=".75"';
    const gemC = cultLit
        ? 'fill="#cf9de8" stroke="#d3a233" stroke-width="1.5"'
        : 'fill="#2a2f36" stroke="#595e63" stroke-width="1.2" opacity=".75"';
    return '<svg viewBox="0 0 96 84" width="100%" height="100%">' +
        '<circle cx="48" cy="42" r="32" fill="none" stroke="#14181d" stroke-width="7"/>' +
        (t > 0 ? '<path d="' + at.d + '" stroke="#4fa3e3" stroke-width="5.2" fill="none"/>' : '') +
        (c > 0 ? '<path d="' + ac.d + '" stroke="#a86bc9" stroke-width="5.2" fill="none"/>' : '') +
        '<rect x="46.4" y="3.5" width="3.2" height="13.5" rx="1" fill="#d3a233" stroke="#7a5a14" stroke-width=".7"/>' +
        '<rect x="46.4" y="67" width="3.2" height="13.5" rx="1" fill="#d3a233" stroke="#7a5a14" stroke-width=".7"/>' +
        (t > 0 ? '<circle cx="' + at.tipX.toFixed(1) + '" cy="' + at.tipY.toFixed(1) + '" r="5.6" ' + gemT + '/>' : '') +
        (c > 0 ? '<circle cx="' + ac.tipX.toFixed(1) + '" cy="' + ac.tipY.toFixed(1) + '" r="5.6" ' + gemC + '/>' : '') +
        '<circle cx="48" cy="42" r="20" fill="#1d2023" stroke="#595e63" stroke-width="2"/>' +
        // The bulb itself lights in the boost color (design spec): blue = boosted tech,
        // purple = boosted civic, gold = both. Silver + dim when nothing boosted.
        (anyLit ? '<circle cx="48" cy="40" r="14" fill="' + (techLit && cultLit ? '#f2d488' : techLit ? '#7ec0f2' : '#cf9de8') + '" opacity=".28"/>' : '') +
        '<g transform="translate(28,22) scale(1.0)"' + (anyLit ? '' : ' opacity=".55"') + '>' +
        (anyLit
            ? ENI_BULB_SVG.split('#ccd1d5').join(techLit && cultLit ? '#f2d488' : techLit ? '#7ec0f2' : '#cf9de8')
            : ENI_BULB_SVG
        ).replace('viewBox="0 0 40 40" width="100%" height="100%"', 'viewBox="0 0 40 40" width="40" height="40"') + '</g>' +
        '</svg>';
}

let dockIconEl = null;
function refreshDockIcon() {
    try { if (dockIconEl) dockIconEl.innerHTML = dockRingSvg(); } catch (e) { /* cosmetic */ }
}

class EniDockDecorator {
    constructor(panel) { this._panel = panel; }
    beforeAttach() { /* nothing */ }
    afterAttach() {
        try {
            const c = this._panel;
            if (typeof c.addRingButton === 'function') {
                // addRingButton(data, index) inserts the ring wrapper INTO the dock row -
                // index 3 = right after the culture ring (order: age 0, tech 1, culture 2).
                // modifierClass 'civic' borrows the base big-ring artwork + sizing (CSS-only;
                // the panel drives its own rings via stored references, not class queries).
                // ⚠ THE EMPTY TURN-COUNTER PLAQUE UNDER THIS BUTTON IS LEFT ALONE ON PURPOSE.
                // addRingButton always builds one and we have nothing honest to put in it: every
                // other plaque in this row means TURNS UNTIL SOMETHING (tech and culture count down
                // to their research, the age ring to the age end), so any count of ours would read
                // as a countdown. Two removal attempts FAILED in-game on 2026-08-06 - a
                // querySelector for '.tut-eni-dash .ssb-button__turn-counter' (the plaque is a
                // SIBLING of the button, not a descendant, so the class never scopes to it) and
                // then addRingButton's own returned `turnCounter` handle, which also left it
                // on screen. Do not spend more time here; it is cosmetic and it is empty.
                c.addRingButton({ tooltip: 'Eureka & Inspiration', modifierClass: 'civic', ringClass: 'ssb__texture-ring', class: ['ring-eni', 'tut-eni-dash'], audio: 'none', callback: toggle }, 3);
                setTimeout(() => {
                    try {
                        const icon = document.querySelector('.tut-eni-dash .ssb__button-icon');
                        if (icon) {
                            dockIconEl = icon;
                            icon.classList.add('eni-dock-btn');
                            // Inline beats the component stylesheet (class-CSS ties lose):
                            // kill the borrowed civic book glyph, keep the circle backing.
                            icon.style.backgroundImage = 'none';
                            refreshDockIcon();
                        }
                    } catch (e) { /* icon cosmetic */ }
                }, 100);
                return;
            }
            const root = c.Root ?? null;
            if (root) {
                const b = document.createElement('div');
                b.className = 'eni-dock-btn';
                b.style.cssText = 'width:2.1111rem;height:2rem;display:inline-flex;align-items:center;justify-content:center;margin:0 0.2222rem;';
                b.addEventListener('click', toggle);
                root.appendChild(b);
                dockIconEl = b;
                refreshDockIcon();
            }
        } catch (e) { console.error('[eureka-inspiration] dock button: ' + e); }
    }
    beforeDetach() { /* nothing */ }
    afterDetach() { /* nothing */ }
}
try {
    Controls.decorate('panel-sub-system-dock', (panel) => new EniDockDecorator(panel));
} catch (e) { console.error('[eureka-inspiration] dock decorate: ' + e); }

eniInjectStyle();
setInterval(refreshDockIcon, 1500);
setInterval(watchMarkers, 1000);
watchMarkers();
console.error('[eureka-inspiration] dashboard + live dock ring + popup watcher active');
