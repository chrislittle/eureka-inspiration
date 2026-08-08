/**
 * Eureka & Inspiration — shared core: the deed manifest, state readers, and the stylesheet.
 * All colors literal (Coherent ignores var()). Everything try/catch'd — pure additive UI.
 */

// Wave-1 manifest: node -> { tree: 'tech'|'civic', deed loc tag }. Wave-2 nodes join as their
// stories are encoded. The deed text tags are the story Description tags (flavor + deed).
export const ENI_DEEDS = {
    NODE_TECH_AQ_WRITING:            { tree: 'tech', age: 'AQ',  deed: 'LOC_ENI_AQ_WRITING_DESC' },
    NODE_TECH_AQ_IRRIGATION:         { tree: 'tech', age: 'AQ',  deed: 'LOC_ENI_AQ_IRRIGATION_DESC' },
    NODE_TECH_AQ_MASONRY:            { tree: 'tech', age: 'AQ',  deed: 'LOC_ENI_AQ_MASONRY_DESC' },
    NODE_TECH_AQ_CURRENCY:           { tree: 'tech', age: 'AQ',  deed: 'LOC_ENI_AQ_CURRENCY_DESC' },
    NODE_TECH_AQ_BRONZE_WORKING:     { tree: 'tech', age: 'AQ',  deed: 'LOC_ENI_AQ_BRONZE_WORKING_DESC' },
    NODE_TECH_AQ_MILITARY_TRAINING:  { tree: 'tech', age: 'AQ',  deed: 'LOC_ENI_AQ_MILITARY_TRAINING_DESC' },
    NODE_TECH_AQ_IRON_WORKING:       { tree: 'tech', age: 'AQ',  deed: 'LOC_ENI_AQ_IRON_WORKING_DESC' },
    NODE_CIVIC_AQ_MAIN_PUBLIC_LIFE:  { tree: 'civic', age: 'AQ', deed: 'LOC_ENI_AQ_PUBLIC_LIFE_DESC' },
    NODE_CIVIC_AQ_MAIN_CODE_OF_LAWS: { tree: 'civic', age: 'AQ', deed: 'LOC_ENI_AQ_CODE_OF_LAWS_DESC' },
    NODE_CIVIC_AQ_MAIN_ENTERTAINMENT:{ tree: 'civic', age: 'AQ', deed: 'LOC_ENI_AQ_ENTERTAINMENT_DESC' },
    NODE_CIVIC_AQ_MAIN_CITIZENSHIP:  { tree: 'civic', age: 'AQ', deed: 'LOC_ENI_AQ_CITIZENSHIP_DESC' },
    NODE_CIVIC_AQ_MAIN_ORG_MILITARY: { tree: 'civic', age: 'AQ', deed: 'LOC_ENI_AQ_ORG_MILITARY_DESC' },
    NODE_CIVIC_AQ_MAIN_LITERACY:     { tree: 'civic', age: 'AQ', deed: 'LOC_ENI_AQ_LITERACY_DESC' },
    NODE_CIVIC_AQ_MAIN_SKILLED_TRADES:{ tree: 'civic', age: 'AQ', deed: 'LOC_ENI_AQ_SKILLED_TRADES_DESC' },
    NODE_CIVIC_AQ_MAIN_PHILOSOPHY:   { tree: 'civic', age: 'AQ', deed: 'LOC_ENI_AQ_PHILOSOPHY_DESC' },
    NODE_CIVIC_AQ_MAIN_COMMERCE:     { tree: 'civic', age: 'AQ', deed: 'LOC_ENI_AQ_COMMERCE_DESC' },
    NODE_TECH_AQ_WHEEL:              { tree: 'tech', age: 'AQ',  deed: 'LOC_ENI_AQ_WHEEL_DESC' },
    NODE_TECH_AQ_NAVIGATION:         { tree: 'tech', age: 'AQ',  deed: 'LOC_ENI_AQ_NAVIGATION_DESC' },
    NODE_TECH_AQ_ENGINEERING:        { tree: 'tech', age: 'AQ',  deed: 'LOC_ENI_AQ_ENGINEERING_DESC' },
    NODE_TECH_AQ_MATHEMATICS:        { tree: 'tech', age: 'AQ',  deed: 'LOC_ENI_AQ_MATHEMATICS_DESC' },
    NODE_CIVIC_AQ_MAIN_MYSTICISM:    { tree: 'civic', age: 'AQ', deed: 'LOC_ENI_AQ_MYSTICISM_DESC' },
    NODE_CIVIC_AQ_MAIN_DISCIPLINE:   { tree: 'civic', age: 'AQ', deed: 'LOC_ENI_AQ_DISCIPLINE_DESC' },
    NODE_CIVIC_AQ_MAIN_TACTICS:      { tree: 'civic', age: 'AQ', deed: 'LOC_ENI_AQ_TACTICS_DESC' },

    /* ---- Exploration (22 deeds) ---- */
    NODE_TECH_EX_FEUDALISM:            { tree: 'tech', age: 'EX', deed: 'LOC_ENI_EX_FEUDALISM_DESC' },
    NODE_TECH_EX_GUILDS:               { tree: 'tech', age: 'EX', deed: 'LOC_ENI_EX_GUILDS_DESC' },
    NODE_TECH_EX_CASTLES:              { tree: 'tech', age: 'EX', deed: 'LOC_ENI_EX_CASTLES_DESC' },
    NODE_TECH_EX_HERALDRY:             { tree: 'tech', age: 'EX', deed: 'LOC_ENI_EX_HERALDRY_DESC' },
    NODE_TECH_EX_EDUCATION:            { tree: 'tech', age: 'EX', deed: 'LOC_ENI_EX_EDUCATION_DESC' },
    NODE_TECH_EX_METALLURGY:           { tree: 'tech', age: 'EX', deed: 'LOC_ENI_EX_METALLURGY_DESC' },
    NODE_TECH_EX_SHIPBUILDING:         { tree: 'tech', age: 'EX', deed: 'LOC_ENI_EX_SHIPBUILDING_DESC' },
    NODE_TECH_EX_ARCHITECTURE:         { tree: 'tech', age: 'EX', deed: 'LOC_ENI_EX_ARCHITECTURE_DESC' },
    NODE_TECH_EX_METAL_CASTING:        { tree: 'tech', age: 'EX', deed: 'LOC_ENI_EX_METAL_CASTING_DESC' },
    NODE_TECH_EX_GUNPOWDER:            { tree: 'tech', age: 'EX', deed: 'LOC_ENI_EX_GUNPOWDER_DESC' },
    NODE_TECH_EX_URBAN_PLANNING:       { tree: 'tech', age: 'EX', deed: 'LOC_ENI_EX_URBAN_PLANNING_DESC' },
    NODE_CIVIC_EX_BRANCH_REFORMATION:  { tree: 'civic', age: 'EX', deed: 'LOC_ENI_EX_REFORMATION_DESC' },
    NODE_CIVIC_EX_MAIN_AUTHORITY:      { tree: 'civic', age: 'EX', deed: 'LOC_ENI_EX_AUTHORITY_DESC' },
    NODE_CIVIC_EX_MAIN_INSPIRATION:    { tree: 'civic', age: 'EX', deed: 'LOC_ENI_EX_INSPIRATION_DESC' },
    NODE_CIVIC_EX_MAIN_MERCANTILISM:   { tree: 'civic', age: 'EX', deed: 'LOC_ENI_EX_MERCANTILISM_DESC' },
    NODE_CIVIC_EX_MAIN_BUREAUCRACY:    { tree: 'civic', age: 'EX', deed: 'LOC_ENI_EX_BUREAUCRACY_DESC' },
    NODE_CIVIC_EX_MAIN_COLONIALISM:    { tree: 'civic', age: 'EX', deed: 'LOC_ENI_EX_COLONIALISM_DESC' },
    NODE_CIVIC_EX_MAIN_DIPLOMATIC_SERVICE: { tree: 'civic', age: 'EX', deed: 'LOC_ENI_EX_DIPLOMATIC_SERVICE_DESC' },
    NODE_CIVIC_EX_MAIN_SOCIETY:        { tree: 'civic', age: 'EX', deed: 'LOC_ENI_EX_SOCIETY_DESC' },
    NODE_CIVIC_EX_MAIN_IMPERIALISM:    { tree: 'civic', age: 'EX', deed: 'LOC_ENI_EX_IMPERIALISM_DESC' },
    NODE_CIVIC_EX_MAIN_SOCIAL_CLASS:   { tree: 'civic', age: 'EX', deed: 'LOC_ENI_EX_SOCIAL_CLASS_DESC' },
    NODE_CIVIC_EX_MAIN_SOVEREIGNTY:    { tree: 'civic', age: 'EX', deed: 'LOC_ENI_EX_SOVEREIGNTY_DESC' },

    /* ---- Modern (25 deeds: 13 techs, 6 main civics, 6 ideology branches) ----
       The three entry-tier techs and civics are unboosted by design, and the three ideology
       ROOTS (Democracy, Fascism, Communism) carry CanBoost="false" in the base data. */
    NODE_TECH_MO_ELECTRICITY:          { tree: 'tech', age: 'MO', deed: 'LOC_ENI_MO_ELECTRICITY_DESC' },
    NODE_TECH_MO_URBANIZATION:         { tree: 'tech', age: 'MO', deed: 'LOC_ENI_MO_URBANIZATION_DESC' },
    NODE_TECH_MO_COMBUSTION:           { tree: 'tech', age: 'MO', deed: 'LOC_ENI_MO_COMBUSTION_DESC' },
    NODE_TECH_MO_INDUSTRIALIZATION:    { tree: 'tech', age: 'MO', deed: 'LOC_ENI_MO_INDUSTRIALIZATION_DESC' },
    NODE_TECH_MO_RADIO:                { tree: 'tech', age: 'MO', deed: 'LOC_ENI_MO_RADIO_DESC' },
    NODE_TECH_MO_FLIGHT:               { tree: 'tech', age: 'MO', deed: 'LOC_ENI_MO_FLIGHT_DESC' },
    NODE_TECH_MO_MASS_PRODUCTION:      { tree: 'tech', age: 'MO', deed: 'LOC_ENI_MO_MASS_PRODUCTION_DESC' },
    NODE_TECH_MO_COMPUTATION:          { tree: 'tech', age: 'MO', deed: 'LOC_ENI_MO_COMPUTATION_DESC' },
    NODE_TECH_MO_MOBILIZATION:         { tree: 'tech', age: 'MO', deed: 'LOC_ENI_MO_MOBILIZATION_DESC' },
    NODE_TECH_MO_ARMOR:                { tree: 'tech', age: 'MO', deed: 'LOC_ENI_MO_ARMOR_DESC' },
    NODE_TECH_MO_AERODYNAMICS:         { tree: 'tech', age: 'MO', deed: 'LOC_ENI_MO_AERODYNAMICS_DESC' },
    NODE_TECH_MO_NUCLEAR_FISSION:      { tree: 'tech', age: 'MO', deed: 'LOC_ENI_MO_NUCLEAR_FISSION_DESC' },
    NODE_TECH_MO_ROCKETRY:             { tree: 'tech', age: 'MO', deed: 'LOC_ENI_MO_ROCKETRY_DESC' },
    NODE_CIVIC_MO_MAIN_POLITICAL_THEORY: { tree: 'civic', age: 'MO', deed: 'LOC_ENI_MO_POLITICAL_THEORY_DESC' },
    NODE_CIVIC_MO_MAIN_GLOBALISM:      { tree: 'civic', age: 'MO', deed: 'LOC_ENI_MO_GLOBALISM_DESC' },
    NODE_CIVIC_MO_MAIN_NATIONALISM:    { tree: 'civic', age: 'MO', deed: 'LOC_ENI_MO_NATIONALISM_DESC' },
    NODE_CIVIC_MO_MAIN_CAPITALISM:     { tree: 'civic', age: 'MO', deed: 'LOC_ENI_MO_CAPITALISM_DESC' },
    NODE_CIVIC_MO_MAIN_MILITARISM:     { tree: 'civic', age: 'MO', deed: 'LOC_ENI_MO_MILITARISM_DESC' },
    NODE_CIVIC_MO_MAIN_HEGEMONY:       { tree: 'civic', age: 'MO', deed: 'LOC_ENI_MO_HEGEMONY_DESC' },
    NODE_CIVIC_MO_BRANCH_LIBERALISM:   { tree: 'civic', age: 'MO', deed: 'LOC_ENI_MO_LIBERALISM_DESC' },
    NODE_CIVIC_MO_BRANCH_PROGRESSIVISM:{ tree: 'civic', age: 'MO', deed: 'LOC_ENI_MO_PROGRESSIVISM_DESC' },
    NODE_CIVIC_MO_BRANCH_RADICALISM:   { tree: 'civic', age: 'MO', deed: 'LOC_ENI_MO_RADICALISM_DESC' },
    NODE_CIVIC_MO_BRANCH_AUTHORITARIANISM: { tree: 'civic', age: 'MO', deed: 'LOC_ENI_MO_ABSOLUTISM_DESC' },
    NODE_CIVIC_MO_BRANCH_CENTRALISM:   { tree: 'civic', age: 'MO', deed: 'LOC_ENI_MO_CENTRALISM_DESC' },
    NODE_CIVIC_MO_BRANCH_SOCIALISM:    { tree: 'civic', age: 'MO', deed: 'LOC_ENI_MO_SOCIALISM_DESC' },
};

// Multi-part deeds: a node whose deed is "N of these M". Each part has its own marker
// property, so the UI can show which are done and which remain. Add future N-of-M deeds here
// and both the dashboard checklist and the tooltip counter pick them up automatically.
export const ENI_MULTIPART = {
    // ===== GENERATED by tools/gen-eni-step-trackers.py - do not hand-edit =====
    NODE_TECH_AQ_WRITING: {
        need: 2,
        unit: 'civilizations',
        parts: [
            { key: 'ENI_AQ_STEP_WRITING_1', at: 1, label: '1 met' },
            { key: 'ENI_BOOST_NODE_TECH_AQ_WRITING', at: 2, label: '2 met' },
        ],
    },
    NODE_TECH_AQ_BRONZE_WORKING: {
        need: 2,
        unit: 'Iron',
        parts: [
            { key: 'ENI_AQ_STEP_BRONZE_WORKING_1', at: 1, label: '1 Iron' },
            { key: 'ENI_BOOST_NODE_TECH_AQ_BRONZE_WORKING', at: 2, label: '2 Iron' },
        ],
    },
    NODE_CIVIC_AQ_MAIN_LITERACY: {
        need: 5,
        unit: 'Codices',
        parts: [
            { key: 'ENI_AQ_STEP_LITERACY_1', at: 1, label: '1 Codices' },
            { key: 'ENI_AQ_STEP_LITERACY_2', at: 2, label: '2 Codices' },
            { key: 'ENI_AQ_STEP_LITERACY_3', at: 3, label: '3 Codices' },
            { key: 'ENI_AQ_STEP_LITERACY_4', at: 4, label: '4 Codices' },
            { key: 'ENI_BOOST_NODE_CIVIC_AQ_MAIN_LITERACY', at: 5, label: '5 Codices' },
        ],
    },
    NODE_CIVIC_AQ_MAIN_COMMERCE: {
        need: 3,
        unit: 'civilizations',
        parts: [
            { key: 'ENI_AQ_STEP_COMMERCE_1', at: 1, label: '1 civilizations' },
            { key: 'ENI_AQ_STEP_COMMERCE_2', at: 2, label: '2 civilizations' },
            { key: 'ENI_BOOST_NODE_CIVIC_AQ_MAIN_COMMERCE', at: 3, label: '3 civilizations' },
        ],
    },
    NODE_TECH_AQ_MATHEMATICS: {
        need: 2,
        unit: 'settlements',
        parts: [
            { key: 'ENI_AQ_STEP_MATHEMATICS_1', at: 1, label: '1 settlements' },
            { key: 'ENI_BOOST_NODE_TECH_AQ_MATHEMATICS', at: 2, label: '2 settlements' },
        ],
    },
    NODE_TECH_EX_EDUCATION: {
        need: 3,
        unit: 'settlements',
        parts: [
            { key: 'ENI_EX_STEP_EDUCATION_1', at: 1, label: '1 settlements' },
            { key: 'ENI_EX_STEP_EDUCATION_2', at: 2, label: '2 settlements' },
            { key: 'ENI_BOOST_NODE_TECH_EX_EDUCATION', at: 3, label: '3 settlements' },
        ],
    },
    NODE_TECH_EX_ARCHITECTURE: {
        need: 3,
        unit: 'settlements',
        parts: [
            { key: 'ENI_EX_STEP_ARCHITECTURE_1', at: 1, label: '1 settlements' },
            { key: 'ENI_EX_STEP_ARCHITECTURE_2', at: 2, label: '2 settlements' },
            { key: 'ENI_BOOST_NODE_TECH_EX_ARCHITECTURE', at: 3, label: '3 settlements' },
        ],
    },
    NODE_TECH_EX_METAL_CASTING: {
        need: 2,
        unit: 'settlements',
        parts: [
            { key: 'ENI_EX_STEP_METAL_CASTING_1', at: 1, label: '1 settlements' },
            { key: 'ENI_BOOST_NODE_TECH_EX_METAL_CASTING', at: 2, label: '2 settlements' },
        ],
    },
    NODE_TECH_EX_URBAN_PLANNING: {
        need: 2,
        unit: 'Cities',
        parts: [
            { key: 'ENI_EX_STEP_URBAN_PLANNING_1', at: 1, label: '1 Cities' },
            { key: 'ENI_BOOST_NODE_TECH_EX_URBAN_PLANNING', at: 2, label: '2 Cities' },
        ],
    },
    NODE_CIVIC_EX_BRANCH_REFORMATION: {
        need: 3,
        unit: 'settlements',
        parts: [
            { key: 'ENI_EX_STEP_REFORMATION_1', at: 1, label: '1 settlements' },
            { key: 'ENI_EX_STEP_REFORMATION_2', at: 2, label: '2 settlements' },
            { key: 'ENI_BOOST_NODE_CIVIC_EX_BRANCH_REFORMATION', at: 3, label: '3 settlements' },
        ],
    },
    NODE_CIVIC_EX_MAIN_INSPIRATION: {
        need: 2,
        unit: 'Relics',
        parts: [
            { key: 'ENI_EX_STEP_INSPIRATION_1', at: 1, label: '1 Relics' },
            { key: 'ENI_BOOST_NODE_CIVIC_EX_MAIN_INSPIRATION', at: 2, label: '2 Relics' },
        ],
    },
    NODE_CIVIC_EX_MAIN_COLONIALISM: {
        need: 7,
        unit: 'Resources',
        parts: [
            { key: 'ENI_EX_STEP_COLONIALISM_1', at: 1, label: '1 Resources' },
            { key: 'ENI_EX_STEP_COLONIALISM_3', at: 3, label: '3 Resources' },
            { key: 'ENI_EX_STEP_COLONIALISM_4', at: 4, label: '4 Resources' },
            { key: 'ENI_EX_STEP_COLONIALISM_6', at: 6, label: '6 Resources' },
            { key: 'ENI_BOOST_NODE_CIVIC_EX_MAIN_COLONIALISM', at: 7, label: '7 Resources' },
        ],
    },
    NODE_CIVIC_EX_MAIN_SOCIAL_CLASS: {
        need: 4,
        unit: 'settlements',
        parts: [
            { key: 'ENI_EX_STEP_SOCIAL_CLASS_1', at: 1, label: '1 settlements' },
            { key: 'ENI_EX_STEP_SOCIAL_CLASS_2', at: 2, label: '2 settlements' },
            { key: 'ENI_EX_STEP_SOCIAL_CLASS_3', at: 3, label: '3 settlements' },
            { key: 'ENI_BOOST_NODE_CIVIC_EX_MAIN_SOCIAL_CLASS', at: 4, label: '4 settlements' },
        ],
    },
    NODE_CIVIC_EX_MAIN_SOVEREIGNTY: {
        need: 10,
        unit: 'settlements',
        parts: [
            { key: 'ENI_EX_STEP_SOVEREIGNTY_2', at: 2, label: '2 settlements' },
            { key: 'ENI_EX_STEP_SOVEREIGNTY_4', at: 4, label: '4 settlements' },
            { key: 'ENI_EX_STEP_SOVEREIGNTY_6', at: 6, label: '6 settlements' },
            { key: 'ENI_EX_STEP_SOVEREIGNTY_8', at: 8, label: '8 settlements' },
            { key: 'ENI_BOOST_NODE_CIVIC_EX_MAIN_SOVEREIGNTY', at: 10, label: '10 settlements' },
        ],
    },
    NODE_TECH_MO_ELECTRICITY: {
        need: 4,
        unit: 'Resources',
        parts: [
            { key: 'ENI_MO_STEP_ELECTRICITY_1', at: 1, label: '1 Resources' },
            { key: 'ENI_MO_STEP_ELECTRICITY_2', at: 2, label: '2 Resources' },
            { key: 'ENI_MO_STEP_ELECTRICITY_3', at: 3, label: '3 Resources' },
            { key: 'ENI_BOOST_NODE_TECH_MO_ELECTRICITY', at: 4, label: '4 Resources' },
        ],
    },
    NODE_TECH_MO_URBANIZATION: {
        need: 3,
        unit: 'settlements',
        parts: [
            { key: 'ENI_MO_STEP_URBANIZATION_1', at: 1, label: '1 settlements' },
            { key: 'ENI_MO_STEP_URBANIZATION_2', at: 2, label: '2 settlements' },
            { key: 'ENI_BOOST_NODE_TECH_MO_URBANIZATION', at: 3, label: '3 settlements' },
        ],
    },
    NODE_TECH_MO_MASS_PRODUCTION: {
        need: 2,
        unit: 'settlements',
        parts: [
            { key: 'ENI_MO_STEP_MASS_PRODUCTION_1', at: 1, label: '1 settlements' },
            { key: 'ENI_BOOST_NODE_TECH_MO_MASS_PRODUCTION', at: 2, label: '2 settlements' },
        ],
    },
    NODE_CIVIC_MO_MAIN_HEGEMONY: {
        need: 3,
        unit: 'Museums',
        parts: [
            { key: 'ENI_MO_STEP_HEGEMONY_1', at: 1, label: '1 Museums' },
            { key: 'ENI_MO_STEP_HEGEMONY_2', at: 2, label: '2 Museums' },
            { key: 'ENI_BOOST_NODE_CIVIC_MO_MAIN_HEGEMONY', at: 3, label: '3 Museums' },
        ],
    },
    // ===== END GENERATED =====
    NODE_TECH_AQ_IRRIGATION: {
        need: 6,
        unit: 'types',
        parts: [
            { key: 'ENI_AQ_RURAL_FARM', label: 'Farm' },
            { key: 'ENI_AQ_RURAL_PASTURE', label: 'Pasture' },
            { key: 'ENI_AQ_RURAL_CAMP', label: 'Camp' },
            { key: 'ENI_AQ_RURAL_PLANTATION', label: 'Plantation' },
            { key: 'ENI_AQ_RURAL_WOODCUTTER', label: 'Woodcutter' },
            { key: 'ENI_AQ_RURAL_MINE', label: 'Mine' },
            { key: 'ENI_AQ_RURAL_QUARRY', label: 'Quarry' },
            { key: 'ENI_AQ_RURAL_CLAY_PIT', label: 'Clay Pit' },
            { key: 'ENI_AQ_RURAL_FISHING_BOAT', label: 'Fishing Boat' },
        ],
    },
    // Counted deeds. The step keys come from the ENI_AQ_STEP_* trackers; the LAST part is the
    // deed's own marker property, which is what the completion writes — so a deed needs only
    // (need - 1) trackers. Added 2026-08-04 after The Wheel completed with no warning and
    // Tactics failed with no way to see how far it had got.
    NODE_TECH_AQ_WHEEL: {
        need: 3,
        unit: 'Celebrations',
        parts: [
            { key: 'ENI_AQ_STEP_WHEEL_1', label: '1st Celebration' },
            { key: 'ENI_AQ_STEP_WHEEL_2', label: '2nd Celebration' },
            { key: 'ENI_BOOST_NODE_TECH_AQ_WHEEL', label: '3rd Celebration' },
        ],
    },
    NODE_CIVIC_AQ_MAIN_ORG_MILITARY: {
        need: 4,
        unit: 'kills',
        parts: [
            { key: 'ENI_AQ_STEP_ORG_MILITARY_1', label: '1st kill' },
            { key: 'ENI_AQ_STEP_ORG_MILITARY_2', label: '2nd kill' },
            { key: 'ENI_AQ_STEP_ORG_MILITARY_3', label: '3rd kill' },
            { key: 'ENI_BOOST_NODE_CIVIC_AQ_MAIN_ORG_MILITARY', label: '4th kill' },
        ],
    },
    NODE_CIVIC_AQ_MAIN_TACTICS: {
        need: 2,
        unit: 'broken formations',
        parts: [
            { key: 'ENI_AQ_STEP_TACTICS_1', label: '1st kill' },
            { key: 'ENI_BOOST_NODE_CIVIC_AQ_MAIN_TACTICS', label: '2nd kill' },
        ],
    },
    NODE_TECH_AQ_CURRENCY: {
        need: 4,
        unit: 'Supports',
        parts: [
            { key: 'ENI_AQ_STEP_CURRENCY_1', label: '1st Support' },
            { key: 'ENI_AQ_STEP_CURRENCY_2', label: '2nd Support' },
            { key: 'ENI_AQ_STEP_CURRENCY_3', label: '3rd Support' },
            { key: 'ENI_BOOST_NODE_TECH_AQ_CURRENCY', label: '4th Support' },
        ],
    },

    // ---- EXPLORATION, added 2026-08-06. Same shape as Antiquity's: one tracker per step, the LAST
    // part being the deed's own marker property, so a deed needs only (need - 1) trackers.
    // Gunpowder and Society carry an `at` on each part because they step in BUCKETS of three - the
    // counter must read 6 / 12, not 2 / 12. Where `at` is absent the parts are 1:1 and the count is
    // simply how many have fired, which keeps every Antiquity entry above working unchanged.
    NODE_TECH_EX_GUNPOWDER: {
        need: 12,
        unit: 'kills in their land',
        parts: [
            { key: 'ENI_EX_STEP_GUNPOWDER_3', at: 3, label: '3 kills' },
            { key: 'ENI_EX_STEP_GUNPOWDER_6', at: 6, label: '6 kills' },
            { key: 'ENI_EX_STEP_GUNPOWDER_9', at: 9, label: '9 kills' },
            { key: 'ENI_BOOST_NODE_TECH_EX_GUNPOWDER', at: 12, label: '12 kills' },
        ],
    },
    NODE_CIVIC_EX_MAIN_SOCIETY: {
        need: 10,
        unit: 'Specialists',
        parts: [
            { key: 'ENI_EX_STEP_SOCIETY_3', at: 3, label: '3 placed' },
            { key: 'ENI_EX_STEP_SOCIETY_6', at: 6, label: '6 placed' },
            { key: 'ENI_EX_STEP_SOCIETY_9', at: 9, label: '9 placed' },
            { key: 'ENI_BOOST_NODE_CIVIC_EX_MAIN_SOCIETY', at: 10, label: '10 placed' },
        ],
    },
    NODE_TECH_EX_SHIPBUILDING: {
        need: 5,
        unit: 'kills at sea',
        parts: [
            { key: 'ENI_EX_STEP_SHIPBUILDING_1', label: '1st kill' },
            { key: 'ENI_EX_STEP_SHIPBUILDING_2', label: '2nd kill' },
            { key: 'ENI_EX_STEP_SHIPBUILDING_3', label: '3rd kill' },
            { key: 'ENI_EX_STEP_SHIPBUILDING_4', label: '4th kill' },
            { key: 'ENI_BOOST_NODE_TECH_EX_SHIPBUILDING', label: '5th kill' },
        ],
    },
    NODE_TECH_EX_HERALDRY: {
        need: 3,
        unit: 'Cavalry units',
        parts: [
            { key: 'ENI_EX_STEP_HERALDRY_1', label: '1st Cavalry unit' },
            { key: 'ENI_EX_STEP_HERALDRY_2', label: '2nd Cavalry unit' },
            { key: 'ENI_BOOST_NODE_TECH_EX_HERALDRY', label: '3rd Cavalry unit' },
        ],
    },
    NODE_TECH_EX_METALLURGY: {
        need: 3,
        unit: 'Crossbowmen',
        parts: [
            { key: 'ENI_EX_STEP_METALLURGY_1', label: '1st Crossbowman' },
            { key: 'ENI_EX_STEP_METALLURGY_2', label: '2nd Crossbowman' },
            { key: 'ENI_BOOST_NODE_TECH_EX_METALLURGY', label: '3rd Crossbowman' },
        ],
    },
    NODE_CIVIC_EX_MAIN_MERCANTILISM: {
        need: 2,
        unit: 'Endeavors',
        parts: [
            { key: 'ENI_EX_STEP_MERCANTILISM_1', label: '1st Endeavor' },
            { key: 'ENI_BOOST_NODE_CIVIC_EX_MAIN_MERCANTILISM', label: '2nd Endeavor' },
        ],
    },
    NODE_CIVIC_EX_MAIN_DIPLOMATIC_SERVICE: {
        need: 2,
        unit: 'Alliances',
        parts: [
            { key: 'ENI_EX_STEP_DIPLOMATIC_SERVICE_1', label: '1st Alliance' },
            { key: 'ENI_BOOST_NODE_CIVIC_EX_MAIN_DIPLOMATIC_SERVICE', label: '2nd Alliance' },
        ],
    },
    NODE_CIVIC_EX_MAIN_AUTHORITY: {
        need: 2,
        unit: 'levies',
        parts: [
            { key: 'ENI_EX_STEP_AUTHORITY_1', label: '1st levy' },
            { key: 'ENI_BOOST_NODE_CIVIC_EX_MAIN_AUTHORITY', label: '2nd levy' },
        ],
    },

    // ---- MODERN, added 2026-08-06 after tools/audit-eni-counters.py found 24 counted deeds with
    // no progress readout. These three were the ones a player genuinely cannot count another way:
    // Radio and Mobilization tally EVENTS the engine never surfaces, and Centralism's towns can
    // only be checked by touring the empire. The rest of the 24 are visible elsewhere in the UI.
    NODE_TECH_MO_RADIO: {
        need: 3,
        unit: 'Espionage actions',
        parts: [
            { key: 'ENI_MO_STEP_RADIO_1', label: '1st action' },
            { key: 'ENI_MO_STEP_RADIO_2', label: '2nd action' },
            { key: 'ENI_BOOST_NODE_TECH_MO_RADIO', label: '3rd action' },
        ],
    },
    NODE_TECH_MO_MOBILIZATION: {
        need: 3,
        unit: 'kills by Air units',
        parts: [
            { key: 'ENI_MO_STEP_MOBILIZATION_1', label: '1st kill' },
            { key: 'ENI_MO_STEP_MOBILIZATION_2', label: '2nd kill' },
            { key: 'ENI_BOOST_NODE_TECH_MO_MOBILIZATION', label: '3rd kill' },
        ],
    },
    // Each step key is written by BOTH the Farming and the Fishing marker, so the counter reads the
    // same whichever path the empire is on. Five of ONE kind - the deed cannot sum the two.
    NODE_CIVIC_MO_BRANCH_CENTRALISM: {
        need: 5,
        unit: 'Farming or Fishing Towns',
        parts: [
            { key: 'ENI_MO_STEP_CENTRALISM_1', label: '1st Town' },
            { key: 'ENI_MO_STEP_CENTRALISM_2', label: '2nd Town' },
            { key: 'ENI_MO_STEP_CENTRALISM_3', label: '3rd Town' },
            { key: 'ENI_MO_STEP_CENTRALISM_4', label: '4th Town' },
            { key: 'ENI_BOOST_NODE_CIVIC_MO_BRANCH_CENTRALISM', label: '5th Town' },
        ],
    },
};

// ---- Modern ideologies -------------------------------------------------------
// Modern's civic tree forks three ways and a player only ever walks ONE, so six of the twelve
// civic deeds are unreachable the moment the fork is taken. The dashboard groups them and mutes
// the paths not taken, rather than listing all twelve flat as if they were equally available.
// The three ROOTS carry CanBoost="false" in the base data and can never take a boost, which is
// why Democracy, Fascism and Communism have no deed of their own - only the two nodes behind each.
export const ENI_IDEOLOGIES = [
    { key: 'DEMOCRACY', label: 'Democracy', root: 'NODE_CIVIC_MO_BRANCH_DEMOCRACY',
      nodes: ['NODE_CIVIC_MO_BRANCH_LIBERALISM', 'NODE_CIVIC_MO_BRANCH_PROGRESSIVISM'] },
    { key: 'FASCISM', label: 'Fascism', root: 'NODE_CIVIC_MO_BRANCH_FASCISM',
      nodes: ['NODE_CIVIC_MO_BRANCH_RADICALISM', 'NODE_CIVIC_MO_BRANCH_AUTHORITARIANISM'] },
    { key: 'COMMUNISM', label: 'Communism', root: 'NODE_CIVIC_MO_BRANCH_COMMUNISM',
      nodes: ['NODE_CIVIC_MO_BRANCH_CENTRALISM', 'NODE_CIVIC_MO_BRANCH_SOCIALISM'] },
];

// Every node that belongs to SOME ideology branch - used to pull them out of the main civic list.
export const ENI_IDEOLOGY_NODES = new Set(ENI_IDEOLOGIES.flatMap((i) => i.nodes));

// Which fork has the player taken? Read straight off the root node's own state - no derived math,
// and it answers itself the moment the root is researched. Returns null before the choice is made.
export function eniChosenIdeology() {
    for (const ideo of ENI_IDEOLOGIES) {
        try { if (eniNodeState(ideo.root).completed) return ideo.key; } catch (e) { /* keep looking */ }
    }
    return null;
}

// How far along is a multi-part deed? With `at` on the parts (bucketed steps) the answer is the
// HIGHEST bucket reached, not the number of chips lit - three trackers on a 12-kill deed must read
// 9 / 12, never 3 / 12. Without `at` the parts are 1:1 and lit-chip count is the answer.
export function eniPartsDone(mp) {
    let n = 0;
    for (const pt of mp.parts) {
        if (!eniPartDone(pt.key)) continue;
        n = (pt.at != null) ? Math.max(n, pt.at) : n + 1;
    }
    return Math.min(n, mp.need);
}

// Has this part fired? Same player-property read as the boost markers.
export function eniPartDone(propKey) {
    try {
        const p = Players.get(GameContext.localPlayerID);
        return (p?.getProperty?.(Database.makeHash(propKey)) ?? 0) >= 1;
    } catch (e) { return false; }
}

// Which age is in play - the dashboard lists only that age's deeds.
export function eniCurrentAge() {
    try {
        if (Game.age === Database.makeHash('AGE_EXPLORATION')) return 'EX';
        if (Game.age === Database.makeHash('AGE_MODERN')) return 'MO';
    } catch (e) { /* fall through */ }
    return 'AQ';
}

// Boost earned? The story reward wrote the player property ENI_BOOST_<nodeType>=1.
// Research can never set this - it is the unambiguous earned flag (MA-proven approach).
export function eniBoostEarned(nodeType) {
    try {
        const pid = GameContext.localPlayerID;
        const p = Players.get(pid);
        return (p?.getProperty?.(Database.makeHash('ENI_BOOST_' + nodeType)) ?? 0) >= 1;
    } catch (e) { return false; }
}

// Node research state + progress. Returns { completed, pct } - pct is null when unreadable
// (the UI hides the percentage rather than showing a wrong number).
export function eniNodeState(nodeType) {
    const out = { completed: false, pct: null };
    try {
        const hash = Database.makeHash(nodeType);
        const pid = GameContext.localPlayerID;
        let p = null;
        try { p = Players.get(pid); } catch (e) { /* cost falls back to the base figure */ }
        let node = null;
        try { node = Game.ProgressionTrees?.getNode?.(pid, hash) ?? null; } catch (e) { /* fall through */ }
        if (!node) { try { node = Game.ProgressionTrees?.getNode?.(hash) ?? null; } catch (e) { /* absent */ } }
        if (node) {
            if ((node.depthUnlocked ?? 0) >= 1) out.completed = true;
            // The ACTUAL cost, not GameInfo's. ProgressionTreeNodes.Cost is the UNSCALED base;
            // real cost scales with game speed, while node.progress is in scaled units - so
            // dividing by the base overstates progress. Found in play 2026-08-06: Currency read
            // 56% on the dashboard (137 / 245 base) while the game showed 40% (137 / 343 actual).
            // player.Techs / player.Culture .getNodeCost() is what the base UI itself uses.
            let cost = 0;
            try {
                const d = ENI_DEEDS[nodeType];
                const comp = (d && d.tree === 'civic') ? p?.Culture : p?.Techs;
                cost = comp?.getNodeCost?.(hash) ?? 0;
            } catch (e) { /* fall through to the base figure */ }
            if (!cost) cost = GameInfo?.ProgressionTreeNodes?.lookup?.(hash)?.Cost ?? 0;
            const prog = node.progress ?? 0;
            if (!out.completed && cost > 0 && prog >= 0) out.pct = Math.min(100, Math.round(100 * prog / cost));
        }
    } catch (e) { /* leave defaults */ }
    return out;
}

// Display names (shared by dashboard + tooltip name-resolution).
export const ENI_NODE_LABELS = {
    NODE_TECH_AQ_WRITING: 'Writing', NODE_TECH_AQ_IRRIGATION: 'Irrigation', NODE_TECH_AQ_MASONRY: 'Masonry',
    NODE_TECH_AQ_CURRENCY: 'Currency', NODE_TECH_AQ_BRONZE_WORKING: 'Bronze Working',
    NODE_TECH_AQ_MILITARY_TRAINING: 'Military Training', NODE_TECH_AQ_IRON_WORKING: 'Iron Working',
    NODE_CIVIC_AQ_MAIN_PUBLIC_LIFE: 'Public Life', NODE_CIVIC_AQ_MAIN_CODE_OF_LAWS: 'Code of Laws',
    NODE_CIVIC_AQ_MAIN_ENTERTAINMENT: 'Entertainment', NODE_CIVIC_AQ_MAIN_CITIZENSHIP: 'Citizenship',
    NODE_CIVIC_AQ_MAIN_ORG_MILITARY: 'Organized Military', NODE_CIVIC_AQ_MAIN_LITERACY: 'Literacy',
    NODE_CIVIC_AQ_MAIN_SKILLED_TRADES: 'Skilled Trades', NODE_CIVIC_AQ_MAIN_PHILOSOPHY: 'Philosophy',
    NODE_CIVIC_AQ_MAIN_COMMERCE: 'Commerce',
    NODE_TECH_AQ_WHEEL: 'The Wheel', NODE_TECH_AQ_NAVIGATION: 'Navigation',
    NODE_TECH_AQ_ENGINEERING: 'Engineering', NODE_TECH_AQ_MATHEMATICS: 'Mathematics',
    NODE_CIVIC_AQ_MAIN_MYSTICISM: 'Mysticism', NODE_CIVIC_AQ_MAIN_DISCIPLINE: 'Discipline',
    NODE_CIVIC_AQ_MAIN_TACTICS: 'Tactics',
    NODE_TECH_EX_FEUDALISM: 'Feudalism',
    NODE_TECH_EX_GUILDS: 'Guilds',
    NODE_TECH_EX_CASTLES: 'Castles',
    NODE_TECH_EX_HERALDRY: 'Heraldry',
    NODE_TECH_EX_EDUCATION: 'Education',
    NODE_TECH_EX_METALLURGY: 'Metallurgy',
    NODE_TECH_EX_SHIPBUILDING: 'Shipbuilding',
    NODE_TECH_EX_ARCHITECTURE: 'Architecture',
    NODE_TECH_EX_METAL_CASTING: 'Metal Casting',
    NODE_TECH_EX_GUNPOWDER: 'Gunpowder',
    NODE_TECH_EX_URBAN_PLANNING: 'Urban Planning',
    NODE_CIVIC_EX_BRANCH_REFORMATION: 'Reformation',
    NODE_CIVIC_EX_MAIN_AUTHORITY: 'Authority',
    NODE_CIVIC_EX_MAIN_INSPIRATION: 'Inspiration',
    NODE_CIVIC_EX_MAIN_MERCANTILISM: 'Mercantilism',
    NODE_CIVIC_EX_MAIN_BUREAUCRACY: 'Bureaucracy',
    NODE_CIVIC_EX_MAIN_COLONIALISM: 'Colonialism',
    NODE_CIVIC_EX_MAIN_DIPLOMATIC_SERVICE: 'Diplomatic Service',
    NODE_CIVIC_EX_MAIN_SOCIETY: 'Society',
    NODE_CIVIC_EX_MAIN_IMPERIALISM: 'Imperialism',
    NODE_CIVIC_EX_MAIN_SOCIAL_CLASS: 'Social Class',
    NODE_CIVIC_EX_MAIN_SOVEREIGNTY: 'Sovereignty',
    NODE_TECH_MO_ELECTRICITY: 'Electricity',
    NODE_TECH_MO_URBANIZATION: 'Urbanization',
    NODE_TECH_MO_COMBUSTION: 'Combustion',
    NODE_TECH_MO_INDUSTRIALIZATION: 'Industrialization',
    NODE_TECH_MO_RADIO: 'Radio',
    NODE_TECH_MO_FLIGHT: 'Flight',
    NODE_TECH_MO_MASS_PRODUCTION: 'Mass Production',
    NODE_TECH_MO_COMPUTATION: 'Computation',
    NODE_TECH_MO_MOBILIZATION: 'Mobilization',
    NODE_TECH_MO_ARMOR: 'Armor',
    NODE_TECH_MO_AERODYNAMICS: 'Aerodynamics',
    NODE_TECH_MO_NUCLEAR_FISSION: 'Nuclear Fission',
    NODE_TECH_MO_ROCKETRY: 'Rocketry',
    NODE_CIVIC_MO_MAIN_POLITICAL_THEORY: 'Political Theory',
    NODE_CIVIC_MO_MAIN_GLOBALISM: 'Globalism',
    NODE_CIVIC_MO_MAIN_NATIONALISM: 'Nationalism',
    NODE_CIVIC_MO_MAIN_CAPITALISM: 'Capitalism',
    NODE_CIVIC_MO_MAIN_MILITARISM: 'Militarism',
    NODE_CIVIC_MO_MAIN_HEGEMONY: 'Hegemony',
    NODE_CIVIC_MO_BRANCH_LIBERALISM: 'Liberalism',
    NODE_CIVIC_MO_BRANCH_PROGRESSIVISM: 'Progressivism',
    NODE_CIVIC_MO_BRANCH_RADICALISM: 'Radicalism',
    NODE_CIVIC_MO_BRANCH_AUTHORITARIANISM: 'Absolutism',
    NODE_CIVIC_MO_BRANCH_CENTRALISM: 'Centralism',
    NODE_CIVIC_MO_BRANCH_SOCIALISM: 'Socialism',
};

// UPPERCASED display name -> node, for tooltip header resolution.
export const ENI_NAME2NODE = {};
try { for (const [k, v] of Object.entries(ENI_NODE_LABELS)) ENI_NAME2NODE[v.toUpperCase()] = k; } catch (e) { /* dormant */ }

export function eniLoc(tag) {
    try { const s = Locale.compose(tag); if (s && s !== tag) return s; } catch (e) { /* fall back */ }
    // Fallback: never show a raw LOC key (the MA options-screen lesson).
    return '';
}

// One stylesheet for every ENI surface. Literal colors only.
export function eniInjectStyle() {
    try {
        if (document.getElementById('eni-style')) return;
        const st = document.createElement('style');
        st.id = 'eni-style';
        st.textContent =
            /* card badges: CSS ::after so they survive UI reconciliation */
            '.eni-b{position:relative;}' +
            /* THE BULB (Chris's design, 2026-08-01): a small CSS-drawn lightbulb - glass
               circle + base drawn by an offset box-shadow puck - inset at the card's right,
               vertically centered (the MA-pill placement, the ONLY proven-aligning spot).
               Unlit silver = deed open; lit blue/purple + glow = earned (matches the dock
               bulb metaphor). Real images can't survive tree-card redraws; pseudo-elements
               with baked-in styles do. */
            /* The bulb rides the NAME element (Chris, 2026-08-01): left:100% of the name box
               = right after the text, since the name is flex-initial (content-width).
               truncate's overflow:hidden would clip it - overridden on decorated cards. */
            '.eni-b .tree-card-name{position:relative;overflow:visible;}' +
            /* Classic YELLOW bulb by default (reads as a lightbulb instantly - Chris);
               the blue/purple takeover is the earned signal. */
            '.eni-b .tree-card-name::after{content:"";position:absolute;left:100%;margin-left:9px;' +
            'top:45%;transform:translateY(-55%);width:12px;height:12px;border-radius:50%;pointer-events:none;' +
            'border:2px solid #8a6318;background:#f5d76e;box-shadow:0 8px 0 -4px #b9902c,0 0 6px rgba(242,212,136,.45);}' +
            '.eni-e-t .tree-card-name::after{border-color:#1b5e8c;background:#4fc3ff;box-shadow:0 8px 0 -4px #2f7fb8,0 0 10px #4fa3e3;}' +
            '.eni-e-c .tree-card-name::after{border-color:#6f4390;background:#cf9de8;box-shadow:0 8px 0 -4px #9a5cc4,0 0 10px #a86bc9;}' +
            '.eni-e-t .tree-card-name{color:#4fc3ff;}' +
            '.eni-e-c .tree-card-name{color:#dca9ff;}' +
            /* tooltip: percentage fill inside the cost pill */
            '.eni-pill{position:relative;overflow:hidden;}' +
            '.eni-fill{display:block;position:absolute;top:0;left:0;bottom:0;pointer-events:none;' +
            'background:linear-gradient(180deg,rgba(242,212,136,.30),rgba(211,162,51,.22));' +
            'border-right:1px solid rgba(242,212,136,.55);}' +
            '.eni-pct{position:relative;margin-left:6px;font-size:.85em;color:#e6d9b8;}' +
            /* tooltip: the deed box */
            '.eni-box{display:block;margin:8px 0 0;padding:8px 11px;border-radius:3px;' +
            'background:rgba(20,32,46,.25);border:1px solid #3f8fce;color:#c9dcec;font-size:13px;line-height:1.45;}' +
            '.eni-box.eni-civ{border-color:#8a4fb0;background:rgba(38,22,50,.25);color:#dccbea;}' +
            '.eni-box.eni-earned{border-color:#205f8c;}' +
            '.eni-k{display:inline-block;text-transform:uppercase;letter-spacing:.1em;font-weight:700;' +
            'font-size:10px;padding:1px 8px 2px;border-radius:3px;margin-right:8px;vertical-align:middle;' +
            /* solid in BOTH states (Chris 2026-08-01 - hollow retired with the bulb model):
               deep tone = deed open, bright gradient = earned */
            'background:#2f6da0;color:#eaf6ff;border:1px solid #4fa3e3;}' +
            '.eni-civ .eni-k{background:#6f4390;color:#f4eafc;border-color:#a86bc9;}' +
            '.eni-earned .eni-k{background:linear-gradient(180deg,#7ec0f2,#3f8fce);color:#062338;border:1px solid #205f8c;}' +
            '.eni-civ.eni-earned .eni-k{background:linear-gradient(180deg,#cf9de8,#9a5cc4);color:#2a0a3a;border:1px solid #6f4390;}' +
            /* the compact "3 / 5" a multi-part deed carries at the end of its tooltip line */
            '.eni-k.eni-n{margin-left:6px;margin-right:0;letter-spacing:.06em;}' +
            /* dashboard overlay - OPTION B "cool slate" (Chris-picked 2026-08-01): neutral
               slate housing, ALL color carried by the mod's established accents
               (#4fc3ff tech blue / #cf9de8 civic purple - same hexes as popups/caps). */
            '#eni-dash{position:absolute;top:8%;left:50%;transform:translateX(-50%);width:64%;max-width:900px;' +
            'height:80%;z-index:500;background:#242830;border:2px solid #4a515c;' +
            'border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,.45);color:#e8ebef;font-family:sans-serif;' +
            'display:flex;flex-direction:column;pointer-events:auto;}' +
            '#eni-dash .eni-head{display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid #3a4049;}' +
                        // The wordmark follows the Steam logo: two lines, uppercase, gold, EQUAL CAP HEIGHT -
            // "Eureka" is the tech half and "Inspiration" the civic half and neither is subordinate.
            // Line 1 is letterspaced far wider so the two lines read as equal-width blocks despite
            // the different letter counts; the ratios are the Steam art's own (20/84 and 3/84 em).
            // ⚠ Flat gold, not the art's gradient - Coherent has no shipped SVG/CSS gradient text.
            // ⚠ TitleFont is THE GAME'S OWN display face, declared in core/ui/themes/default/
            // global-scaling.js alongside BodyFont (each with -SC/-TC/-JP/-KR locale variants).
            // Do NOT name Georgia or any other system font first: Coherent ships only the faces in
            // core/fonts and a system stack silently falls back. Georgia trails it purely so
            // tools/preview-eni-header.py still renders a serif in Chrome.
            // ⚠ font-weight 700, never 600: intermediate weights render INVISIBLE here.
            '#eni-dash .eni-title{flex-grow:1;line-height:1.12;}' +
            '#eni-dash .eni-w1,#eni-dash .eni-w2{display:block;color:#f2d488;text-transform:uppercase;'
                + 'font-weight:700;font-family:TitleFont,Georgia,serif;}' +
            '#eni-dash .eni-w1{font-size:25px;letter-spacing:5.9px;}' +
            '#eni-dash .eni-w2{font-size:25px;letter-spacing:0.9px;}' +
            '#eni-dash .eni-close{margin-left:12px;cursor:pointer;padding:6px 10px;border:1px solid #4a515c;border-radius:4px;}' +
            '#eni-dash .eni-close:hover{border-color:#9aa3ad;}' +
            '#eni-dash .eni-age{font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#9aa3ad;border:1px solid #454c57;border-radius:4px;padding:2px 9px;margin-right:12px;}' +
            '#eni-dash .eni-toggle{cursor:pointer;font-size:12px;color:#b5bdc6;}' +
            '#eni-dash .eni-toggle i{display:inline-block;width:12px;height:12px;border:1px solid #6a7482;border-radius:3px;margin-right:6px;background:transparent;}' +
            '#eni-dash .eni-toggle.eni-on i{background:#4fc3ff;border-color:#3f8fce;}' +
            '#eni-dash .eni-toggle:hover{color:#f0f2f5;}' +
            '#eni-dash .eni-stats{display:flex;border-bottom:1px solid #3a4049;background:#20242b;}' +
            '#eni-dash .eni-stats > div{flex:1;padding:8px 18px;border-right:1px solid #3a4049;}' +
            '#eni-dash .eni-stats b{display:block;font-size:17px;color:#f0f2f5;}' +
            '#eni-dash .eni-stats span{font-size:10px;text-transform:uppercase;letter-spacing:.09em;color:#9aa3ad;}' +
            '#eni-dash .eni-body{flex:1;overflow-y:auto;padding:10px 16px;}' +
            // Section headers were too quiet to scan against the cards (Chris, 2026-08-06): brighter,
            // larger, and given a hairline rule so a section reads as a section rather than a caption.
            // ⛔ USE ONLY font-weight 400 OR 700 - NEVER AN INTERMEDIATE WEIGHT. font-weight:600 made
            // the header labels render INVISIBLE in-game (2026-08-06): the text was in the DOM and the
            // 400-weight count pill beside it drew normally, but the label itself showed nothing.
            // The font ships regular and bold only, and Coherent does NOT synthesise the weights in
            // between - it draws nothing. 700 and `bold` are already used elsewhere in this sheet and
            // render fine, so bold is safe; anything between 400 and 700 is not.
                        // ⚠ FLEX, not a plain block. In Coherent an inline <span> inside this header breaks to
            // its OWN LINE and stretches full width - the "your ideology" pill rendered as a gold
            // BAR across the panel, and the old count pills sat under their heading rather than
            // beside it. A flex row keeps the label and its badge on one line and sizes the badge
            // to its content. Chrome lays these out inline either way, so a desktop preview will
            // NOT reproduce the bug.
            '#eni-dash .eni-sect{display:flex;align-items:baseline;'
                + 'font-size:13px;text-transform:uppercase;letter-spacing:.13em;'
                + 'color:#e6dcc4;margin:16px 2px 8px;padding-bottom:5px;border-bottom:1px solid #3a4550;}' +
            // An ideology group reads as a SUB-heading of Civic, not a peer of it.
            '#eni-dash .eni-sect.eni-sub{font-size:12px;color:#cdbf9c;margin:14px 2px 8px 12px;'
                + 'border-left:3px solid #4a5563;padding-left:9px;border-bottom:1px solid #333d47;}' +
            '#eni-dash .eni-sect .eni-note{font-size:11px;font-weight:400;text-transform:none;letter-spacing:0;'
                + 'color:#7d8894;margin-left:9px;font-style:italic;}' +
            '#eni-dash .eni-sect .eni-yours{flex:0 0 auto;font-size:11px;text-transform:none;letter-spacing:0;'
                + 'color:#0f1319;background:#c8a24a;padding:2px 7px;border-radius:9px;margin-left:9px;}' +
            // Muted, NOT hidden: the fork is worth seeing even once it is behind you. Kept well
            // above unreadable so a player can still check what the other paths asked for.
            '#eni-dash .eni-dim{opacity:.42;}' +
            '#eni-dash .eni-cards{display:flex;flex-wrap:wrap;}' +
            '#eni-dash .eni-card{flex:0 0 31.5%;margin:0 1% 10px 0;background:#2c313a;border:1px solid #454c57;border-radius:6px;padding:9px 11px;font-size:13px;}' +
            '#eni-dash .eni-card.eni-t{border-top:3px solid #4fc3ff;}' +
            '#eni-dash .eni-card.eni-c{border-top:3px solid #cf9de8;}' +
            '#eni-dash .eni-card.eni-done{opacity:.55;border-top-color:#454c57;}' +
            '#eni-dash .eni-nm{font-weight:700;color:#f0f2f5;}' +
            '#eni-dash .eni-card.eni-t .eni-nm{color:#4fc3ff;}' +
            '#eni-dash .eni-card.eni-c .eni-nm{color:#cf9de8;}' +
            '#eni-dash .eni-card.eni-done .eni-nm{color:#c3cad2;}' +
            '#eni-dash .eni-nm small{font-weight:400;color:#9aa3ad;margin-left:6px;font-size:11px;}' +
            '#eni-dash .eni-dd{color:#c3cad2;margin:5px 0;min-height:34px;font-size:12px;line-height:1.4;}' +
            '#eni-dash .eni-dd.eni-dt{color:#bfe0fb;}' +
            '#eni-dash .eni-dd.eni-dc{color:#e6cdf8;}' +
            '#eni-dash .eni-parts{display:flex;flex-wrap:wrap;margin:2px 0 6px;}' +
            '#eni-dash .eni-part{font-size:10px;padding:1px 6px;border-radius:3px;margin:0 4px 4px 0;border:1px solid #454c57;color:#8a939d;}' +
            '#eni-dash .eni-part.on{border-color:#4fa3e3;background:#2f6da0;color:#eaf6ff;}' +
            '#eni-dash .eni-card.eni-c .eni-part.on{border-color:#a86bc9;background:#6f4390;color:#f4eafc;}' +
            '#eni-dash .eni-count{font-size:11px;color:#9aa3ad;margin:1px 0 3px;}' +
            '#eni-dash .eni-ft{display:flex;align-items:center;}' +
            '#eni-dash .eni-prog{flex:1;position:relative;overflow:hidden;border:1px solid #454c57;border-radius:99px;padding:1px 9px;font-size:11px;text-align:center;margin-right:8px;color:#f0f2f5;background:#1b1f26;}' +
            '#eni-dash .eni-prog i{display:block;position:absolute;top:0;left:0;bottom:0;background:#3f8fce;}' +
            /* completed: inset fill (left+right) - width:100% measures the PADDED box and
               stops short of the pill's ends */
            '#eni-dash .eni-prog.eni-full i{left:0;right:0;width:auto;}' +
            '#eni-dash .eni-badge.eni-tick{border:none;padding:2px 4px;display:flex;align-items:center;}' +
            '#eni-dash .eni-card.eni-c .eni-prog i{background:#9a5cc4;}' +
            '#eni-dash .eni-prog span{position:relative;}' +
            '#eni-dash .eni-badge{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:2px 8px;border-radius:4px;}' +
            '#eni-dash .eni-badge.bt{background:#2f6da0;color:#eaf6ff;border:1px solid #4fa3e3;}' +
            '#eni-dash .eni-badge.et{background:linear-gradient(180deg,#7ec0f2,#3f8fce);color:#062338;border:1px solid #205f8c;}' +
            '#eni-dash .eni-badge.bc{background:#6f4390;color:#f4eafc;border:1px solid #a86bc9;}' +
            '#eni-dash .eni-badge.ec{background:linear-gradient(180deg,#cf9de8,#9a5cc4);color:#2a0a3a;border:1px solid #6f4390;}' +
            /* dock button - BIG tier, sized like the tech/civic ring buttons */
            '.eni-dock-btn{cursor:pointer;}' +
            /* modifierClass "civic" is borrowed for sizing + the dark circle backing; the
               book glyph (blp:sub_civics) is blanked INLINE in eni-dashboard.js - class
               CSS loses the cascade tie against the component stylesheet. */
            '.ring-eni .ssb__button-icon{width:4.6rem;height:4.2rem;}' +
            '.eni-pop{position:fixed;top:120px;left:50%;margin-left:-190px;width:380px;z-index:120;' +
            'display:flex;align-items:center;gap:14px;padding:14px 18px;cursor:pointer;' +
            'background:linear-gradient(180deg,#101b26,#0b1218);border:2px solid #4fa3e3;border-radius:10px;' +
            'box-shadow:0 10px 34px rgba(0,0,0,.7);color:#e8dcbc;font-family:sans-serif;pointer-events:auto;}' +
            '.eni-pop.eni-pop-c{background:linear-gradient(180deg,#180f22,#100a17);border-color:#a86bc9;}' +
            '.eni-pop .eni-pop-glyph{width:44px;height:44px;flex-shrink:0;}' +
            /* explicit width = 380 - 2x18 padding - 44 glyph - 14 gap; Coherent flex
               children overflow the border without it (field-proven on this very card) */
            '.eni-pop .eni-pop-body{width:286px;}' +
            '.eni-pop .eni-pop-title{font-size:19px;letter-spacing:.06em;color:#7ec0f2;font-weight:bold;}' +
            '.eni-pop.eni-pop-c .eni-pop-title{color:#cf9de8;}' +
            '.eni-pop .eni-pop-node{font-size:14px;color:#f2d488;margin-top:2px;}' +
            '.eni-pop .eni-pop-deed{font-size:12px;color:#b3a686;margin-top:4px;}';
        (document.head || document.documentElement).appendChild(st);
    } catch (e) { /* cosmetic only */ }
}

// The bulb, flat silver, as inline SVG.
export const ENI_BULB_SVG =
    '<svg viewBox="0 0 40 40" width="100%" height="100%">' +
    '<circle cx="20" cy="15.5" r="8" fill="#ccd1d5"/>' +
    '<path d="M15.8 21.8 L24.2 21.8 L22.8 26.8 L17.2 26.8 Z" fill="#ccd1d5"/>' +
    '<line x1="16.4" y1="23.5" x2="23.6" y2="23.5" stroke="#1d2023" stroke-width="1"/>' +
    '<rect x="17.6" y="27.2" width="4.8" height="2" rx="1" fill="#ccd1d5"/>' +
    '</svg>';

// The ring crest: the tracker in its fully-earned state (dashboard header identity).
// The dashboard header mark. Composition follows the Steam preview's 'live' variant, which is
// the one Chris picked (2026-08-06): the ring reads as a METER, not a full crest.
//   - dark TRACK behind both arcs, so an unfilled arc is visibly unfilled
//   - arcs PARTIAL and at DIFFERENT amounts (tech 72%, civic 41%) - a full ring on a mark that
//     has completed nothing was the thing that looked wrong
//   - each gem rides the HEAD OF ITS OWN ARC rather than a fixed corner, so the two pips are never
//     in the same place and the asymmetry comes from the meter itself
// This is a STATIC identity mark - the percentages are fixed. The live meter is dockRingSvg().
// Flat literal colours only: the Steam art gets its depth from SVG gradients and filters, and the
// base game's UI uses NEITHER anywhere, so they cannot be relied on to render here.
export const ENI_CREST_SVG =
    '<svg viewBox="0 0 96 84" width="100%" height="100%">' +
    '<circle cx="48" cy="42" r="32" fill="none" stroke="#14181d" stroke-width="7"/>' +
    '<circle cx="48" cy="42" r="35.4" fill="none" stroke="#0a0d10" stroke-width=".9" opacity=".55"/>' +
    '<circle cx="48" cy="42" r="28.7" fill="none" stroke="#59646e" stroke-width=".7" opacity=".5"/>' +
    // unfilled track - the whole point of a meter
    '<path d="M46.3 10.05 A32 32 0 0 0 46.3 73.95" stroke="#232a31" stroke-width="5.4" fill="none" stroke-linecap="round"/>' +
    '<path d="M49.7 10.05 A32 32 0 0 1 49.7 73.95" stroke="#232a31" stroke-width="5.4" fill="none" stroke-linecap="round"/>' +
    // filled portion
    '<path d="M46.3 10.05 A32 32 0 0 0 22.87 61.82" stroke="#4fa3e3" stroke-width="5.4" fill="none" stroke-linecap="round"/>' +
    '<path d="M49.7 10.05 A32 32 0 0 1 78.81 33.37" stroke="#a86bc9" stroke-width="5.4" fill="none" stroke-linecap="round"/>' +
    // sheen along the top edge of each filled arc
    '<path d="M46.3 11.6 A30.4 30.4 0 0 0 24.3 59.6" stroke="#ffffff" stroke-width="1.05" fill="none" opacity=".3"/>' +
    '<path d="M49.7 11.6 A30.4 30.4 0 0 1 77.2 34.6" stroke="#ffffff" stroke-width="1.05" fill="none" opacity=".3"/>' +
    // gold posts, top and bottom
    '<rect x="46.2" y="3.3" width="3.6" height="13.9" rx="1.2" fill="#d3a233" stroke="#7a5a14" stroke-width=".6"/>' +
    '<rect x="46.2" y="66.8" width="3.6" height="13.9" rx="1.2" fill="#d3a233" stroke="#7a5a14" stroke-width=".6"/>' +
    // gems at the head of their own arc
    '<circle cx="22.87" cy="61.82" r="6.6" fill="#7ec0f2" stroke="#d3a233" stroke-width="1.9"/>' +
    '<circle cx="78.81" cy="33.37" r="6.6" fill="#cf9de8" stroke="#d3a233" stroke-width="1.9"/>' +
    '<ellipse cx="20.97" cy="59.62" rx="2.1" ry="1.35" fill="#ffffff" opacity=".6"/>' +
    '<ellipse cx="76.91" cy="31.17" rx="2.1" ry="1.35" fill="#ffffff" opacity=".6"/>' +
    // recessed inner disc + the bulb
    '<circle cx="48" cy="42" r="21" fill="#12161a" stroke="#5b646c" stroke-width="1.9"/>' +
    '<circle cx="48" cy="42" r="19.4" fill="none" stroke="#000000" stroke-width="1.4" opacity=".45"/>' +
    '<g stroke="#f2d488" stroke-linecap="round" opacity=".92">' +
    '<line x1="48" y1="21.4" x2="48" y2="26.2" stroke-width="2.1"/>' +
    '<line x1="36.6" y1="25.6" x2="39.9" y2="28.9" stroke-width="1.9"/>' +
    '<line x1="59.4" y1="25.6" x2="56.1" y2="28.9" stroke-width="1.9"/>' +
    '<line x1="31.4" y1="35.4" x2="35.6" y2="36.6" stroke-width="1.5" opacity=".7"/>' +
    '<line x1="64.6" y1="35.4" x2="60.4" y2="36.6" stroke-width="1.5" opacity=".7"/></g>' +
    '<circle cx="48" cy="37.5" r="13.5" fill="#f2d488" opacity=".18"/>' +
    '<circle cx="48" cy="37.5" r="9.2" fill="#f2d488" stroke="#7a5a14" stroke-width=".5"/>' +
    '<ellipse cx="44.6" cy="33.6" rx="3.1" ry="2.05" fill="#fffdf2" opacity=".7"/>' +
    '<path d="M45.9 39.4 l1.5 -3.4 l1.2 2.4 l1.2 -2.4 l1.5 3.4" fill="none" stroke="#fff3c9" stroke-width=".62" opacity=".8"/>' +
    '<path d="M43.2 44.6 L52.8 44.6 L51.2 50.4 L44.8 50.4 Z" fill="#ccd1d5" stroke="#4a5157" stroke-width=".35"/>' +
    '<line x1="44" y1="46.4" x2="52" y2="46.4" stroke="#1d2023" stroke-width="1.05" opacity=".8"/>' +
    '<line x1="44.35" y1="48.3" x2="51.65" y2="48.3" stroke="#1d2023" stroke-width=".8" opacity=".6"/>' +
    '<rect x="45.4" y="50.8" width="5.2" height="2.4" rx="1.1" fill="#ccd1d5" stroke="#4a5157" stroke-width=".3"/>' +
    '</svg>';
