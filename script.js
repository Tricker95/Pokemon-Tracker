// ==========================================
// 1. CONFIGURATION GLOBALE & DICTIONNAIRE FR
// ==========================================
const pokedexGrid = document.getElementById('pokedex-grid');
const shinySection = document.getElementById('shiny-section');
const hofSection = document.getElementById('hof-section');
const statsSection = document.getElementById('stats-section');
const badgesSection = document.getElementById('badges-section');
// --- DICTIONNAIRES DES TYPES ---
const typeTranslations = { 'normal': 'Normal', 'fighting': 'Combat', 'flying': 'Vol', 'poison': 'Poison', 'ground': 'Sol', 'rock': 'Roche', 'bug': 'Insecte', 'ghost': 'Spectre', 'steel': 'Acier', 'fire': 'Feu', 'water': 'Eau', 'grass': 'Plante', 'electric': 'Électrik', 'psychic': 'Psy', 'ice': 'Glace', 'dragon': 'Dragon', 'dark': 'Ténèbres', 'fairy': 'Fée' };
const typeColors = { 'normal': '#A8A77A', 'fighting': '#C22E28', 'flying': '#A98FF3', 'poison': '#A33EA1', 'ground': '#E2BF65', 'rock': '#B6A136', 'bug': '#A6B91A', 'ghost': '#735797', 'steel': '#B7B7CE', 'fire': '#EE8130', 'water': '#6390F0', 'grass': '#7AC74C', 'electric': '#F7D02C', 'psychic': '#F95587', 'ice': '#96D9D6', 'dragon': '#6F35FC', 'dark': '#705746', 'fairy': '#D685AD' };

// Matrice des affinités (Défenseur: { Attaquant: Multiplicateur })
const typeMatrix = {
    normal: { fighting: 2, ghost: 0 },
    fire: { fire: 0.5, water: 2, grass: 0.5, ice: 0.5, ground: 2, bug: 0.5, rock: 2, steel: 0.5, fairy: 0.5 },
    water: { fire: 0.5, water: 0.5, electric: 2, grass: 2, ice: 0.5, steel: 0.5 },
    electric: { electric: 0.5, ground: 2, flying: 0.5, steel: 0.5 },
    grass: { fire: 2, water: 0.5, grass: 0.5, electric: 0.5, ice: 2, poison: 2, ground: 0.5, flying: 2, bug: 2 },
    ice: { fire: 2, ice: 0.5, fighting: 2, rock: 2, steel: 2 },
    fighting: { flying: 2, psychic: 2, bug: 0.5, rock: 0.5, dark: 0.5, fairy: 2 },
    poison: { grass: 0.5, fighting: 0.5, poison: 0.5, ground: 2, psychic: 2, bug: 0.5, fairy: 0.5 },
    ground: { water: 2, grass: 2, ice: 2, poison: 0.5, rock: 0.5, electric: 0 },
    flying: { electric: 2, grass: 0.5, ice: 2, fighting: 0.5, ground: 0, bug: 0.5, rock: 2 },
    psychic: { fighting: 0.5, psychic: 0.5, bug: 2, ghost: 2, dark: 2 },
    bug: { fire: 2, grass: 0.5, fighting: 0.5, ground: 0.5, flying: 2, rock: 2 },
    rock: { normal: 0.5, fire: 0.5, water: 2, grass: 2, fighting: 2, poison: 0.5, ground: 2, flying: 0.5, steel: 2 },
    ghost: { normal: 0, fighting: 0, poison: 0.5, bug: 0.5, ghost: 2, dark: 2 },
    dragon: { fire: 0.5, water: 0.5, electric: 0.5, grass: 0.5, ice: 2, dragon: 2, fairy: 2 },
    dark: { fighting: 2, psychic: 0, bug: 2, ghost: 0.5, dark: 0.5, fairy: 2 },
    steel: { normal: 0.5, fire: 2, grass: 0.5, ice: 0.5, fighting: 2, poison: 0, ground: 2, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 0.5, dragon: 0.5, steel: 0.5, fairy: 0.5 },
    fairy: { fighting: 0.5, poison: 2, bug: 0.5, dragon: 0, dark: 0.5, steel: 2 }
};

let currentHuntId = null; let currentChainLength = 0;
let timerInterval; let timerSeconds = 0; let isTimerRunning = false;
let methodChart, longestChart, gameChart, timelineChart, typeRadarChart, durationChart;
let currentListIds = [];
const pokedexSection = document.getElementById('pokedex-section');
let currentDexId = 1; // ID du Pokémon affiché dans la fiche détaillée

const chainMethods = ['Radar', 'Peche', 'SOS', 'LG_Combo', 'LG_Combo_Charme', 'LG_Combo_Parfum', 'LG_Combo_All'];
// ==========================================
// DATA : FORMES MÉGA CUSTOM (LÉGENDES Z-A)
// (À remplacer par l'API quand dispo)
// ==========================================
// ==========================================
// DATA : FORMES MÉGA CUSTOM (LÉGENDES Z-A COMPLET)
// 45 Nouvelles Méga-Évolutions
// ==========================================
const CUSTOM_MEGA_DATA = {
    20001: { name_fr: "Méga-Mélodelfe", types: ['fairy'], sprite: 'assets/sprites/mega/melodelfe-za.png', cry: 'assets/cries/mega/melodelfe-za.ogg' },
    20002: { name_fr: "Méga-Empiflor", types: ['grass', 'poison'], sprite: 'assets/sprites/mega/empiflor-za.png', cry: 'assets/cries/mega/empiflor-za.ogg' },
    20003: { name_fr: "Méga-Staross", types: ['water', 'psychic'], sprite: 'assets/sprites/mega/staross-za.png', cry: 'assets/cries/mega/staross-za.ogg' },
    20004: { name_fr: "Méga-Dracolosse", types: ['dragon', 'flying'], sprite: 'assets/sprites/mega/dracolosse-za.png', cry: 'assets/cries/mega/dracolosse-za.ogg' },
    20005: { name_fr: "Méga-Méganium", types: ['grass'], sprite: 'assets/sprites/mega/meganium-za.png', cry: 'assets/cries/mega/meganium-za.ogg' },
    20006: { name_fr: "Méga-Aligatueur", types: ['water'], sprite: 'assets/sprites/mega/aligatueur-za.png', cry: 'assets/cries/mega/aligatueur-za.ogg' },
    20007: { name_fr: "Méga-Airmure", types: ['steel', 'flying'], sprite: 'assets/sprites/mega/airmure-za.png', cry: 'assets/cries/mega/airmure-za.ogg' },
    20008: { name_fr: "Méga-Momartik", types: ['ice', 'ghost'], sprite: 'assets/sprites/mega/momartik-za.png', cry: 'assets/cries/mega/momartik-za.ogg' },
    20009: { name_fr: "Méga-Roitiflam", types: ['fire', 'fighting'], sprite: 'assets/sprites/mega/roitiflam-za.png', cry: 'assets/cries/mega/roitiflam-za.ogg' },
    20010: { name_fr: "Méga-Minotaupe", types: ['ground', 'steel'], sprite: 'assets/sprites/mega/minotaupe-za.png', cry: 'assets/cries/mega/minotaupe-za.ogg' },
    20011: { name_fr: "Méga-Brutapode", types: ['bug', 'poison'], sprite: 'assets/sprites/mega/brutapode-za.png', cry: 'assets/cries/mega/brutapode-za.ogg' },
    20012: { name_fr: "Méga-Baggaïd", types: ['dark', 'fighting'], sprite: 'assets/sprites/mega/baggaid-za.png', cry: 'assets/cries/mega/baggaid-za.ogg' },
    20013: { name_fr: "Méga-Ohmassacre", types: ['electric'], sprite: 'assets/sprites/mega/ohmassacre-za.png', cry: 'assets/cries/mega/ohmassacre-za.ogg' },
    20014: { name_fr: "Méga-Lugulabre", types: ['ghost', 'fire'], sprite: 'assets/sprites/mega/lugulabre-za.png', cry: 'assets/cries/mega/lugulabre-za.ogg' },
    20015: { name_fr: "Méga-Blindépique", types: ['grass', 'fighting'], sprite: 'assets/sprites/mega/blindepique-za.png', cry: 'assets/cries/mega/blindepique-za.ogg' },
    20016: { name_fr: "Méga-Goupelin", types: ['fire', 'psychic'], sprite: 'assets/sprites/mega/goupelin-za.png', cry: 'assets/cries/mega/goupelin-za.ogg' },
    20017: { name_fr: "Méga-Amphinobi", types: ['water', 'dark'], sprite: 'assets/sprites/mega/amphinobi-za.png', cry: 'assets/cries/mega/amphinobi-za.ogg' },
    20018: { name_fr: "Méga-Némélios", types: ['fire', 'normal'], sprite: 'assets/sprites/mega/nemelios-za.png', cry: 'assets/cries/mega/nemelios-za.ogg' },
    20019: { name_fr: "Méga-Floette", types: ['fairy'], sprite: 'assets/sprites/mega/floette-za.png', cry: 'assets/cries/mega/floette-za.ogg' },
    20020: { name_fr: "Méga-Sépiatroce", types: ['dark', 'psychic'], sprite: 'assets/sprites/mega/sepiatroce-za.png', cry: 'assets/cries/mega/sepiatroce-za.ogg' },
    20021: { name_fr: "Méga-Golgopathe", types: ['rock', 'water'], sprite: 'assets/sprites/mega/golgopathe-za.png', cry: 'assets/cries/mega/golgopathe-za.ogg' },
    20022: { name_fr: "Méga-Kravarech", types: ['poison', 'dragon'], sprite: 'assets/sprites/mega/kravarech-za.png', cry: 'assets/cries/mega/kravarech-za.ogg' },
    20023: { name_fr: "Méga-Brutalibré", types: ['fighting', 'flying'], sprite: 'assets/sprites/mega/brutalibre-za.png', cry: 'assets/cries/mega/brutalibre-za.ogg' },
    20024: { name_fr: "Méga-Zygarde", types: ['dragon', 'ground'], sprite: 'assets/sprites/mega/zygarde-za.png', cry: 'assets/cries/mega/zygarde-za.ogg' },
    20025: { name_fr: "Méga-Draïeul", types: ['normal', 'dragon'], sprite: 'assets/sprites/mega/draieul-za.png', cry: 'assets/cries/mega/draieul-za.ogg' },
    20026: { name_fr: "Méga-Hexadron", types: ['fighting'], sprite: 'assets/sprites/mega/hexadron-za.png', cry: 'assets/cries/mega/hexadron-za.ogg' },
    20027: { name_fr: "Méga-Raichu X", types: ['electric'], sprite: 'assets/sprites/mega/raichu-x-za.png', cry: 'assets/cries/mega/raichu-x-za.ogg' },
    20028: { name_fr: "Méga-Raichu Y", types: ['electric'], sprite: 'assets/sprites/mega/raichu-y-za.png', cry: 'assets/cries/mega/raichu-y-za.ogg' },
    20029: { name_fr: "Méga-Éoko", types: ['psychic'], sprite: 'assets/sprites/mega/eoko-za.png', cry: 'assets/cries/mega/eoko-za.ogg' },
    20030: { name_fr: "Méga-Absol (Z-A)", types: ['dark'], sprite: 'assets/sprites/mega/absol-za.png', cry: 'assets/cries/mega/absol-za.ogg' },
    20031: { name_fr: "Méga-Étouraptor", types: ['normal', 'flying'], sprite: 'assets/sprites/mega/etouraptor-za.png', cry: 'assets/cries/mega/etouraptor-za.ogg' },
    20032: { name_fr: "Méga-Carchacrok (Z-A)", types: ['dragon', 'ground'], sprite: 'assets/sprites/mega/carchacrok-za.png', cry: 'assets/cries/mega/carchacrok-za.ogg' },
    20033: { name_fr: "Méga-Lucario (Z-A)", types: ['fighting', 'steel'], sprite: 'assets/sprites/mega/lucario-za.png', cry: 'assets/cries/mega/lucario-za.ogg' },
    20034: { name_fr: "Méga-Heatran", types: ['fire', 'steel'], sprite: 'assets/sprites/mega/heatran-za.png', cry: 'assets/cries/mega/heatran-za.ogg' },
    20035: { name_fr: "Méga-Darkrai", types: ['dark'], sprite: 'assets/sprites/mega/darkrai-za.png', cry: 'assets/cries/mega/darkrai-za.ogg' },
    20036: { name_fr: "Méga-Golemastoc", types: ['ground', 'ghost'], sprite: 'assets/sprites/mega/golemastoc-za.png', cry: 'assets/cries/mega/golemastoc-za.ogg' },
    20037: { name_fr: "Méga-Mistigrix", types: ['psychic'], sprite: 'assets/sprites/mega/mistigrix-za.png', cry: 'assets/cries/mega/mistigrix-za.ogg' },
    20038: { name_fr: "Méga-Crabominable", types: ['fighting', 'ice'], sprite: 'assets/sprites/mega/crabominable-za.png', cry: 'assets/cries/mega/crabominable-za.ogg' },
    20039: { name_fr: "Méga-Sarmuraï", types: ['bug', 'water'], sprite: 'assets/sprites/mega/sarmurai-za.png', cry: 'assets/cries/mega/sarmurai-za.ogg' },
    20040: { name_fr: "Méga-Magearna", types: ['steel', 'fairy'], sprite: 'assets/sprites/mega/magearna-za.png', cry: 'assets/cries/mega/magearna-za.ogg' },
    20041: { name_fr: "Méga-Zeraora", types: ['electric'], sprite: 'assets/sprites/mega/zeraora-za.png', cry: 'assets/cries/mega/zeraora-za.ogg' },
    20042: { name_fr: "Méga-Scovilain", types: ['grass', 'fire'], sprite: 'assets/sprites/mega/scovilain-za.png', cry: 'assets/cries/mega/scovilain-za.ogg' },
    20043: { name_fr: "Méga-Floréclat", types: ['rock', 'poison'], sprite: 'assets/sprites/mega/floreclat-za.png', cry: 'assets/cries/mega/floreclat-za.ogg' },
    20044: { name_fr: "Méga-Nigirigon", types: ['dragon', 'water'], sprite: 'assets/sprites/mega/nigirigon-za.png', cry: 'assets/cries/mega/nigirigon-za.ogg' },
    20045: { name_fr: "Méga-Glaivodo", types: ['dragon', 'ice'], sprite: 'assets/sprites/mega/glaivodo-za.png', cry: 'assets/cries/mega/glaivodo-za.ogg' }
};
const specialForms = {
    alola: ['rattata-alola', 'raticate-alola', 'raichu-alola', 'sandshrew-alola', 'sandslash-alola', 'vulpix-alola', 'ninetales-alola', 'diglett-alola', 'dugtrio-alola', 'meowth-alola', 'persian-alola', 'geodude-alola', 'graveler-alola', 'golem-alola', 'grimer-alola', 'muk-alola', 'exeggutor-alola', 'marowak-alola'],
    galar: ['meowth-galar', 'ponyta-galar', 'rapidash-galar', 'slowpoke-galar', 'slowbro-galar', 'farfetchd-galar', 'weezing-galar', 'mr-mime-galar', 'articuno-galar', 'zapdos-galar', 'moltres-galar', 'slowking-galar', 'corsola-galar', 'zigzagoon-galar', 'linoone-galar', 'darumaka-galar', 'darmanitan-galar-standard', 'yamask-galar', 'stunfisk-galar'],
    hisui: ['growlithe-hisui', 'arcanine-hisui', 'voltorb-hisui', 'electrode-hisui', 'typhlosion-hisui', 'qwilfish-hisui', 'sneasel-hisui', 'samurott-hisui', 'lilligant-hisui', 'basculin-white-striped', 'zorua-hisui', 'zoroark-hisui', 'braviary-hisui', 'sliggoo-hisui', 'goodra-hisui', 'avalugg-hisui', 'decidueye-hisui'],
    paldea: ['tauros-paldea-combat-breed', 'tauros-paldea-blaze-breed', 'tauros-paldea-aqua-breed', 'wooper-paldea'],
    speciales: ['lycanroc-dusk', 'zygarde-10', 'greninja-ash', 'ursaluna-bloodmoon', 'gimmighoul-roaming', 'palafin-hero'],
mega: [
        // ... tes anciens numéros 10033 à 10090 restent ici ...
        10033, 10034, 10035, 10036, 10037, 10038, 10039, 10040, 10041, 10042, 
        10043, 10044, 10045, 10046, 10047, 10048, 10049, 10050, 10051, 10052, 
        10053, 10054, 10055, 10056, 10057, 10058, 10059, 10060, 10062, 10063, 
        10064, 10065, 10066, 10067, 10068, 10069, 10070, 10071, 10072, 10073, 
        10074, 10075, 10076, 10077, 10078, 10086, 10087, 10088, 10089, 10090,
        
        // --- NOUVEAUTÉS LÉGENDES Z-A (45 Pokémon) ---
        20001, 20002, 20003, 20004, 20005, 20006, 20007, 20008, 20009, 20010, 
        20011, 20012, 20013, 20014, 20015, 20016, 20017, 20018, 20019, 20020,
        20021, 20022, 20023, 20024, 20025, 20026, 20027, 20028, 20029, 20030,
        20031, 20032, 20033, 20034, 20035, 20036, 20037, 20038, 20039, 20040,
        20041, 20042, 20043, 20044, 20045
    ],
    
    gigamax: [
        10195, 10196, 10197, 10198, 10199, 10200, 10201, 10202, 10203, 10204, 
        10205, 10206, 10207, 10208, 10210, 10211, 10212, 10213, 10214, 10215, 
        10216, 10217, 10218, 10219, 10220, 10221, 10222, 10223, 10224, 10225, 
        10226, 10227, 10228
    ],
};

// --- LES DICTIONNAIRES FRANÇAIS INSTANTANÉS ---
let pokemonFrDict = JSON.parse(localStorage.getItem('fr-dict')) || {};
let moveFrDict = JSON.parse(localStorage.getItem('fr-moves-dict')) || {};
let versionFrDict = JSON.parse(localStorage.getItem('fr-versions-dict')) || {};

async function loadFrenchDictionary() {
    // Si on a déjà les attaques en mémoire, on ne retélécharge rien !
    if (Object.keys(pokemonFrDict).length > 0 && Object.keys(moveFrDict).length > 0) return; 
    
    try {
        // La Super-Requête GraphQL (Pokémon + Attaques + Versions en 1 seule fois)
        const query = `query {
          species: pokemon_v2_pokemonspecies { id names: pokemon_v2_pokemonspeciesnames(where: {pokemon_v2_language: {name: {_eq: "fr"}}}) { name } }
          moves: pokemon_v2_move { name names: pokemon_v2_movenames(where: {pokemon_v2_language: {name: {_eq: "fr"}}}) { name } }
          versions: pokemon_v2_version { name names: pokemon_v2_versionnames(where: {pokemon_v2_language: {name: {_eq: "fr"}}}) { name } }
        }`;
        
        const res = await fetch('https://beta.pokeapi.co/graphql/v1beta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
        const json = await res.json();
        
        // Remplissage des 3 dictionnaires
        json.data.species.forEach(s => { if (s.names.length > 0) pokemonFrDict[s.id] = s.names[0].name; });
        json.data.moves.forEach(m => { if (m.names.length > 0) moveFrDict[m.name] = m.names[0].name; });
        json.data.versions.forEach(v => { if (v.names.length > 0) versionFrDict[v.name] = v.names[0].name; });
        
        // Sauvegarde dans la mémoire du navigateur
        localStorage.setItem('fr-dict', JSON.stringify(pokemonFrDict));
        localStorage.setItem('fr-moves-dict', JSON.stringify(moveFrDict));
        localStorage.setItem('fr-versions-dict', JSON.stringify(versionFrDict));
    } catch (e) { console.error("Erreur de téléchargement des dictionnaires", e); }
}

function getPokemonName(id, englishName) {
    return pokemonFrDict[id] || (englishName ? englishName.charAt(0).toUpperCase() + englishName.slice(1) : 'Inconnu');
}

function capitalized(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }

document.addEventListener('DOMContentLoaded', async () => { 
    // 1. Chargement du dictionnaire (Base de données)
    if (typeof moveFrDict !== 'undefined' && Object.keys(moveFrDict).length === 0) {
        document.body.insertAdjacentHTML('afterbegin', '<div id="loading-dict" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);color:var(--accent-orange);display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:9999;font-size:24px;font-weight:bold;font-family:\'Plus Jakarta Sans\', sans-serif;"><div>Mise à jour de la base de données... 🌍</div><div style="font-size:14px;color:#888;margin-top:10px;">Traduction des attaques et versions en cours...</div></div>');
        if (typeof loadFrenchDictionary === 'function') await loadFrenchDictionary();
        const loader = document.getElementById('loading-dict'); if (loader) loader.remove();
    }
    
    // 2. RESTAURATION DE LA DERNIÈRE PAGE (Le correctif est ici ! 🧠)
    const lastSection = localStorage.getItem('last_visited_section') || 'shiny';
    showSection(lastSection); 
    
    // 3. Initialisation globale de l'application
    if (typeof loadTheme === 'function') loadTheme(); 
    if (typeof checkRetroactiveAchievements === 'function') checkRetroactiveAchievements(); 
    if (typeof updateDashboard === 'function') updateDashboard(); 
    if (typeof renderWantedList === 'function') renderWantedList(); 
    
    // 4. RESTAURATION AUTOMATIQUE DE LA SHASSE EN DIRECT
    const activeHuntId = localStorage.getItem('active-hunt-id');
    const activeHuntName = localStorage.getItem('active-hunt-name');
    if (activeHuntId && activeHuntName && typeof setAsCurrentHunt === 'function') {
        setAsCurrentHunt(activeHuntId, activeHuntName);
    }
});
function showSection(sectionName) {
    // --- NOUVEAU : On sauvegarde la section courante dans la mémoire du navigateur ---
    localStorage.setItem('last_visited_section', sectionName);
    // ---------------------------------------------------------------------------------

    shinySection.style.display = 'none'; hofSection.style.display = 'none'; statsSection.style.display = 'none'; badgesSection.style.display = 'none'; pokedexSection.style.display = 'none';
    
    // --- C'EST ICI QU'ON A CORRIGÉ LE CODE ---
    ['btn-shiny', 'btn-hof', 'btn-stats', 'btn-badges', 'btn-pokedex'].forEach(id => { 
        const btn = document.getElementById(id); 
        if (btn) {
            btn.style.backgroundColor = ''; // On purge l'ancienne couleur grise bloquée
            if (id === `btn-${sectionName}`) {
                btn.classList.add('active'); // On active notre beau CSS
            } else {
                btn.classList.remove('active');
            }
        }
    });
    // -----------------------------------------
    
    if (sectionName === 'shiny') { shinySection.style.display = 'block'; if (pokedexGrid.children.length === 0) loadTrueLivingDex(); } 
    else if (sectionName === 'pokedex') { 
        pokedexSection.style.display = 'block'; 
        // Si la fiche est cachée (première ouverture), on charge un Pokémon au hasard !
        if (document.getElementById('dex-card-container').style.display === 'none') {
            const randomId = Math.floor(Math.random() * 1025) + 1;
            loadDexPokemon(randomId);
        }
    }
    else if (sectionName === 'hof') { hofSection.style.display = 'block'; loadHallOfFame(); } 
    else if (sectionName === 'stats') { statsSection.style.display = 'block'; renderCharts(); }
    else if (sectionName === 'badges') { badgesSection.style.display = 'block'; renderBadges(); }
}
function capitalized(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }

// ==========================================
// 2. SHINY TRACKER & WANTED LIST
// ==========================================
function togglePin(id, name) {
    if (localStorage.getItem(`pinned-${id}`)) { localStorage.removeItem(`pinned-${id}`); } 
    else {
        let count = 0; for(let i=0; i<localStorage.length; i++) if(localStorage.key(i).startsWith('pinned-')) count++;
        if (count >= 6) { alert("Max 6 cibles !"); return; }
        localStorage.setItem(`pinned-${id}`, name);
    }
    renderWantedList();
    const btn = document.getElementById(`pin-btn-${id}`);
    if(btn) { const isP = localStorage.getItem(`pinned-${id}`); btn.className = isP ? 'btn-pin active' : 'btn-pin'; btn.textContent = isP ? '📌' : '📍'; }
}

function renderWantedList() {
    const container = document.getElementById('wanted-list-container');
    if (!container) return; container.innerHTML = ''; let hasPinned = false;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('pinned-')) {
            hasPinned = true; const id = key.split('-')[1]; const name = localStorage.getItem(key);
            const cap = getPokemonName(id, name); // TRADUCTION ICI
            const encounters = localStorage.getItem(`encounters-${id}`) || 0;
            const isShiny = localStorage.getItem(`shiny-${id}`) === 'true';
            const imgSrc = isShiny ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png` : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
            container.innerHTML += `<div class="wanted-card"><button class="btn-unpin" onclick="togglePin(${id}, '${name}')">❌</button><img src="${imgSrc}" class="${isShiny?'':'not-caught'}"><h4>${cap}</h4><div class="encounters" id="wanted-encounters-${id}">${encounters} vues</div><button onclick="setAsCurrentHunt(${id}, '${cap}')" style="background:var(--accent-blue);color:white;border:none;padding:8px;border-radius:50px;width:100%;cursor:pointer;font-weight:bold;">🎯 Shasser</button></div>`;
        }
    }
    if (!hasPinned) container.innerHTML = `<p style="color:#888;font-style:italic;width:100%;text-align:center;">Aucune cible épinglée.</p>`;
}

async function updateDashboard() {
    let totalS=0, totalE=0, maxE=0, hardId=null, localS=0;
    
    for (let i=0; i<localStorage.length; i++) {
        const k=localStorage.key(i);
        // Sécurité : On exclut les shinys du HoF
        if(k.startsWith('shiny-') && !k.startsWith('shiny-team-') && localStorage.getItem(k)==='true') { 
            totalS++; 
            const pId=k.split('-')[1]; 
            if(currentListIds.includes(pId) || currentListIds.includes(parseInt(pId))) localS++; 
        }
        if(k.startsWith('encounters-')) { 
            const c=parseInt(localStorage.getItem(k))||0; 
            totalE+=c; 
            if(c>maxE) { maxE=c; hardId=k.split('-')[1]; } 
        }
    }
    
    document.getElementById('stat-total-shiny').textContent = totalS; 
    document.getElementById('stat-total-encounters').textContent = totalE;
    
    // --- MODIFICATION ICI : On passe à 1153 pour le True Living Dex ! ---
    const gp = Math.round((totalS/1153)*100);
    const gpt = document.getElementById('global-progress-text'); 
    if(gpt) gpt.textContent = `${totalS} / 1153 (${gp}%)`;
    // -------------------------------------------------------------------
    
    const gpb = document.getElementById('global-progress-bar'); 
    if(gpb) gpb.style.width = `${gp}%`;
    
    if(currentListIds.length>0) {
        const lp = Math.round((localS/currentListIds.length)*100);
        const lpt = document.getElementById('gen-progress-text'); 
        if(lpt) lpt.textContent = `${localS} / ${currentListIds.length} (${lp}%)`;
        const lpb = document.getElementById('gen-progress-bar'); 
        if(lpb) lpb.style.width = `${lp}%`;
    }
    
    if(hardId && maxE>0) { 
        document.getElementById('stat-longest-hunt').textContent=`${getPokemonName(hardId)} (${maxE})`; 
    } else {
        document.getElementById('stat-longest-hunt').textContent="- (0)";
    }
}

async function loadGeneration(limit, offset, name, genNumber) {
    document.getElementById('gen-title').textContent = `Génération ${genNumber} (${name})`;
    pokedexGrid.innerHTML = '<p style="text-align:center;grid-column:1/-1;">Chargement...</p>';
    currentHuntId = null; closeLiveHunt(); currentListIds = [];
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
        const data = await res.json(); pokedexGrid.innerHTML = '';
        data.results.forEach(p => { const id = p.url.split('/')[6]; currentListIds.push(id); createPokemonCard(id, p.name); });
        updateDashboard();
    } catch(e) {}
}

// Le cadenas de sécurité anti-mélange
let currentRenderId = 0;

async function loadCustomList(name, names) {
    document.getElementById('gen-title').textContent = name;
    pokedexGrid.innerHTML = '<p style="text-align:center;grid-column:1/-1;">Chargement en cours, veuillez patienter... 🔄</p>';
    currentHuntId = null; 
    closeLiveHunt(); 
    
    // On met à jour la barre à 1153 direct !
    currentListIds = [...names]; 
    updateDashboard(); 

    // On active le cadenas pour ce clic précis
    currentRenderId++; 
    const renderId = currentRenderId; 

    pokedexGrid.innerHTML = '';

    for(let n of names) { 
        // Si on a cliqué sur un autre bouton entre temps, on COUPE ce chargement !
        if (renderId !== currentRenderId) return; 

        try { 
            // Intercepteur Custom Z-A
            if (n >= 20000 && typeof CUSTOM_MEGA_DATA !== 'undefined' && CUSTOM_MEGA_DATA[n]) {
                createPokemonCard(n, CUSTOM_MEGA_DATA[n].name_fr);
                continue; 
            }

            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${n}`); 
            if (!res.ok) throw new Error("Non trouvé"); 
            const data = await res.json(); 
            
            // On vérifie le cadenas une dernière fois avant d'afficher
            if (renderId === currentRenderId) {
                createPokemonCard(data.id, data.name); 
            }
            
        } catch(e) {
            console.error(`Erreur de chargement pour l'ID ${n}`);
        } 
    }
}

// Fonction dédiée au True Living Dex (1153 Pokémon)
// Fonction dédiée au True Living Dex (1153 Pokémon)
function loadTrueLivingDex() {
    // 1. Les 1025 de base
    let baseDex = Array.from({length: 1025}, (_, i) => i + 1);
    
    // 2. Les 95 Mégas (Classiques + Z-A)
    let megaIDs = [
        10033, 10034, 10035, 10036, 10037, 10038, 10039, 10040, 10041, 10042, 
        10043, 10044, 10045, 10046, 10047, 10048, 10049, 10050, 10051, 10052, 
        10053, 10054, 10055, 10056, 10057, 10058, 10059, 10060, 10062, 10063, 
        10064, 10065, 10066, 10067, 10068, 10069, 10070, 10071, 10072, 10073, 
        10074, 10075, 10076, 10077, 10078, 10086, 10087, 10088, 10089, 10090,
        20001, 20002, 20003, 20004, 20005, 20006, 20007, 20008, 20009, 20010, 
        20011, 20012, 20013, 20014, 20015, 20016, 20017, 20018, 20019, 20020, 
        20021, 20022, 20023, 20024, 20025, 20026, 20027, 20028, 20029, 20030, 
        20031, 20032, 20033, 20034, 20035, 20036, 20037, 20038, 20039, 20040, 
        20041, 20042, 20043, 20044, 20045
    ];

    // 3. Les 33 Gigamax
    let gmaxIDs = [
        10195, 10196, 10197, 10198, 10199, 10200, 10201, 10202, 10203, 10204, 
        10205, 10206, 10207, 10208, 10210, 10211, 10212, 10213, 10214, 10215, 
        10216, 10217, 10218, 10219, 10220, 10221, 10222, 10223, 10224, 10225, 
        10226, 10227, 10228
    ];
    
    // 4. Fusion totale 
    let trueLivingDex = [...baseDex, ...megaIDs, ...gmaxIDs];
    
    // 5. On lance le chargement !
    loadCustomList('Pokédex Complet', trueLivingDex);
}

// RESTAURATION PARFAITE DES CARTES (Vues/Phases comme les autres inputs, Liste complète des jeux)
// RESTAURATION PARFAITE DES CARTES (Vues/Phases comme les autres inputs, Liste complète des jeux)
function createPokemonCard(id, name) {
    const card = document.createElement('div'); card.className = 'pokemon-card'; 
    const cap = getPokemonName(id, name); // TRADUCTION ICI
    const isS = localStorage.getItem(`shiny-${id}`) === 'true'; const sE = localStorage.getItem(`encounters-${id}`) || ''; const sP = localStorage.getItem(`phases-${id}`) || '1';
    const sG = localStorage.getItem(`game-${id}`) || ''; const sM = localStorage.getItem(`method-${id}`) || ''; const sN = localStorage.getItem(`nickname-${id}`) || ''; const sD = localStorage.getItem(`date-${id}`) || '';
    const isP = localStorage.getItem(`pinned-${id}`) !== null; const pinC = isP ? 'btn-pin active' : 'btn-pin'; const pinI = isP ? '📌' : '📍';
    
    // --- GESTION DES IMAGES CUSTOM ET FALLBACK ---
    let imgSrc = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${isS?'shiny/':''}${id}.png`;
    
    // Si c'est une forme de Z-A (ID >= 20000)
    if (id >= 20000 && typeof CUSTOM_MEGA_DATA !== 'undefined' && CUSTOM_MEGA_DATA[id]) {
        if (isS) {
            imgSrc = CUSTOM_MEGA_DATA[id].sprite.replace('mega/', 'mega/shiny/');
        } else {
            imgSrc = CUSTOM_MEGA_DATA[id].sprite; 
        }
    }
    
    const fallbackImg = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/201-question.png';
    // ---------------------------------------------

    card.innerHTML = `
        <img src="${imgSrc}" id="img-${id}" class="${isS?'':'not-caught'}" onerror="this.onerror=null; this.src='${fallbackImg}';">
        
        <h3 style="display:flex;justify-content:center;align-items:center;gap:8px;">
            #${id} ${cap}
            <button onclick="jumpToDex('${id}')" style="background:transparent; border:none; cursor:pointer; font-size:18px; padding:0; transition:0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'" title="Voir la Fiche Pokédex">📚</button>
            <button onclick="togglePin(${id}, '${name}')" class="${pinC}" id="pin-btn-${id}">${pinI}</button>
        </h3>
        
        <input type="text" id="nickname-${id}" placeholder="Surnom..." value="${sN}" oninput="saveNickname(${id})" class="hunt-select" style="text-align:center;font-style:italic;">
        <label style="cursor:pointer;font-weight:800;color:var(--accent-orange);display:block;margin:15px 0;"><input type="checkbox" id="shiny-${id}" onchange="toggleShiny(${id})" ${isS?'checked':''}> ✨ Obtenu</label>
        
        <div style="display:flex;flex-direction:column;gap:5px;font-size:13px;text-align:left;border-top:1px solid #eee;padding-top:15px;">
            <div style="display: flex; gap: 5px;">
                <div style="flex: 1;"><label>Vues:</label><input type="number" id="encounters-${id}" value="${sE}" oninput="saveEncounters(${id})" class="hunt-select"></div>
                <div style="flex: 1;"><label>Phases:</label><input type="number" id="phases-${id}" value="${sP}" oninput="savePhases(${id})" class="hunt-select"></div>
            </div>
            <div><label>Date:</label><input type="date" id="date-${id}" value="${sD}" onchange="saveSelect(${id},'date')" class="hunt-select"></div>
            <div><label>Jeu:</label><select id="game-${id}" onchange="saveSelect(${id},'game')" class="hunt-select">
                <option value="">--</option>
                <optgroup label="Kanto"><option value="Rouge" ${sG==='Rouge'?'selected':''}>Rouge</option><option value="Bleu" ${sG==='Bleu'?'selected':''}>Bleu</option><option value="Jaune" ${sG==='Jaune'?'selected':''}>Jaune</option><option value="Rouge Feu" ${sG==='Rouge Feu'?'selected':''}>Rouge Feu</option><option value="Vert Feuille" ${sG==='Vert Feuille'?'selected':''}>Vert Feuille</option><option value="Let's Go Pikachu" ${sG==="Let's Go Pikachu"?'selected':''}>Let's Go Pikachu</option><option value="Let's Go Évoli" ${sG==="Let's Go Évoli"?'selected':''}>Let's Go Évoli</option></optgroup>
                <optgroup label="Johto"><option value="Or" ${sG==='Or'?'selected':''}>Or</option><option value="Argent" ${sG==='Argent'?'selected':''}>Argent</option><option value="Cristal" ${sG==='Cristal'?'selected':''}>Cristal</option><option value="HeartGold" ${sG==='HeartGold'?'selected':''}>HeartGold</option><option value="SoulSilver" ${sG==='SoulSilver'?'selected':''}>SoulSilver</option></optgroup>
                <optgroup label="Hoenn"><option value="Rubis" ${sG==='Rubis'?'selected':''}>Rubis</option><option value="Saphir" ${sG==='Saphir'?'selected':''}>Saphir</option><option value="Émeraude" ${sG==='Émeraude'?'selected':''}>Émeraude</option><option value="Rubis Oméga" ${sG==='Rubis Oméga'?'selected':''}>Rubis Oméga</option><option value="Saphir Alpha" ${sG==='Saphir Alpha'?'selected':''}>Saphir Alpha</option></optgroup>
                <optgroup label="Sinnoh"><option value="Diamant" ${sG==='Diamant'?'selected':''}>Diamant</option><option value="Perle" ${sG==='Perle'?'selected':''}>Perle</option><option value="Platine" ${sG==='Platine'?'selected':''}>Platine</option><option value="Diamant Étincelant" ${sG==='Diamant Étincelant'?'selected':''}>Diamant Étincelant</option><option value="Perle Scintillante" ${sG==='Perle Scintillante'?'selected':''}>Perle Scintillante</option></optgroup>
                <optgroup label="Unys"><option value="Noir" ${sG==='Noir'?'selected':''}>Noir</option><option value="Blanc" ${sG==='Blanc'?'selected':''}>Blanc</option><option value="Noir 2" ${sG==='Noir 2'?'selected':''}>Noir 2</option><option value="Blanc 2" ${sG==='Blanc 2'?'selected':''}>Blanc 2</option></optgroup>
                <optgroup label="Kalos"><option value="X" ${sG==='X'?'selected':''}>X</option><option value="Y" ${sG==='Y'?'selected':''}>Y</option></optgroup>
                <optgroup label="Alola"><option value="Soleil" ${sG==='Soleil'?'selected':''}>Soleil</option><option value="Lune" ${sG==='Lune'?'selected':''}>Lune</option><option value="Ultra-Soleil" ${sG==='Ultra-Soleil'?'selected':''}>Ultra-Soleil</option><option value="Ultra-Lune" ${sG==='Ultra-Lune'?'selected':''}>Ultra-Lune</option></optgroup>
                <optgroup label="Galar"><option value="Épée" ${sG==='Épée'?'selected':''}>Épée</option><option value="Bouclier" ${sG==='Bouclier'?'selected':''}>Bouclier</option></optgroup>
                <optgroup label="Hisui"><option value="Légendes Arceus" ${sG==='Légendes Arceus'?'selected':''}>Légendes Arceus</option></optgroup>
                <optgroup label="Paldea"><option value="Écarlate" ${sG==='Écarlate'?'selected':''}>Écarlate</option><option value="Violet" ${sG==='Violet'?'selected':''}>Violet</option></optgroup>
                <optgroup label="Illumis"><option value="Légendes Z-A" ${sG==='Légendes Z-A'?'selected':''}>Légendes Z-A</option></optgroup>
                <optgroup label="Autres"><option value="Pokémon GO" ${sG==='Pokémon GO'?'selected':''}>Pokémon GO</option></optgroup>
            </select></div>
            <div><label>Méthode:</label><select id="method-${id}" onchange="saveSelect(${id},'method')" class="hunt-select">
                <option value="">--</option>
                <optgroup label="Classique"><option value="Hasard" ${sM==='Hasard'?'selected':''}>Hasard / Resets</option><option value="Charme" ${sM==='Charme'?'selected':''}>Avec Charme</option></optgroup>
                <optgroup label="Reproduction"><option value="Masuda" ${sM==='Masuda'?'selected':''}>Masuda</option><option value="MasudaCharme" ${sM==='MasudaCharme'?'selected':''}>Masuda + Charme</option></optgroup>
                <optgroup label="Let's Go"><option value="LG_Combo" ${sM==='LG_Combo'?'selected':''}>Combo Capture</option><option value="LG_Combo_Charme" ${sM==='LG_Combo_Charme'?'selected':''}>Combo + Charme</option><option value="LG_Combo_Parfum" ${sM==='LG_Combo_Parfum'?'selected':''}>Combo + Parfum</option><option value="LG_Combo_All" ${sM==='LG_Combo_All'?'selected':''}>Combo+Charme+Parfum</option></optgroup>
                <optgroup label="Méthodes à Chaîne"><option value="SOS" ${sM==='SOS'?'selected':''}>Appel SOS</option><option value="Radar" ${sM==='Radar'?'selected':''}>Poké Radar</option><option value="Peche" ${sM==='Peche'?'selected':''}>Pêche à la chaîne</option></optgroup>
                <optgroup label="Écarlate/Violet & LPA"><option value="Massive" ${sM==='Massive'?'selected':''}>App. Massive (60+)</option><option value="MassiveCharme" ${sM==='MassiveCharme'?'selected':''}>Massive (60+) + Charme</option><option value="SandwichMax" ${sM==='SandwichMax'?'selected':''}>Massive+Charme+Aura 3</option></optgroup>
                <optgroup label="Spécial"><option value="Dynamax" ${sM==='Dynamax'?'selected':''}>Antre Dynamax (Charme)</option></optgroup>
                <optgroup label="Obtention"><option value="Évolution" ${sM==='Évolution'?'selected':''}>Évolution (Non shassé)</option></optgroup>
            </select></div>
        </div>
        <div id="action-btns-${id}" style="display:flex;gap:5px;margin-top:15px;">
            <button onclick="setAsCurrentHunt(${id}, '${cap.replace(/'/g, "\\'")}')" style="flex:1;background:var(--accent-blue);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;padding:10px;">🎯 Shasser</button>
            <button onclick="openJournal(${id}, '${cap.replace(/'/g, "\\'")}')" style="background:#f39c12;color:white;border:none;border-radius:8px;padding:10px 15px;cursor:pointer;">📖</button>
            ${localStorage.getItem(`journal-link-${id}`) ? `<a href="${localStorage.getItem(`journal-link-${id}`)}" target="_blank" style="background:#e74c3c;color:white;text-decoration:none;padding:10px 15px;border-radius:8px;display:flex;align-items:center;">▶️</a>` : ''}
        </div>
    `;
    pokedexGrid.appendChild(card);
}
function toggleHoFShiny(g, i) {
    let k = `shiny-team-${g}-${i}`;
    let isCurrentlyShiny = localStorage.getItem(k) === 'true';
    
    // On inverse le statut
    localStorage.setItem(k, !isCurrentlyShiny);
    
    // Met à jour le sprite du Pokémon
    updateHoFSprite(g, i, true);
    
    // Met à jour visuellement l'étoile instantanément et de façon robuste
    let btn = document.getElementById(`shiny-btn-${g}-${i}`);
    if(btn) {
        if (!isCurrentlyShiny) {
            // Passe en mode Shiny
            btn.style.filter = 'grayscale(0) drop-shadow(0 0 5px rgba(241,196,15,0.8))';
            btn.style.opacity = '1';
        } else {
            // Passe en mode Normal
            btn.style.filter = 'grayscale(100%)';
            btn.style.opacity = '0.7';
        }
    }
}

function saveEncounters(id) { const v = document.getElementById(`encounters-${id}`).value; localStorage.setItem(`encounters-${id}`, v); if(currentHuntId === id) document.getElementById('live-hunt-counter').textContent = v || 0; const wc = document.getElementById(`wanted-encounters-${id}`); if(wc) wc.textContent = `${v||0} vues`; updateDashboard(); checkAchievements(); }
function savePhases(id) { const v = document.getElementById(`phases-${id}`).value; localStorage.setItem(`phases-${id}`, v); if(currentHuntId === id) document.getElementById('live-hunt-phases').textContent = v || 1; checkAchievements(); }
function saveNickname(id) { localStorage.setItem(`nickname-${id}`, document.getElementById(`nickname-${id}`).value); }
function saveSelect(id, type) { localStorage.setItem(`${type}-${id}`, document.getElementById(`${type}-${id}`).value); if(currentHuntId === id) updateLiveOdds(); checkAchievements(); }

// ==========================================
// 3. SHASSE EN DIRECT ET JOURNAL
// ==========================================
function calculateOdds(g, m, c = 0) {
    if(!g || !m) return "1 / ???"; let b = 4096;
    if(['Rouge/Bleu/Jaune', 'Or/Argent/Cristal', 'Rubis/Saphir/Émeraude', 'Rouge Feu/Vert Feuille', 'Diamant/Perle/Platine', 'HG/SS', 'Noir/Blanc (1 & 2)'].includes(g)) b = 8192;
    let r = 0; if(m === 'Charme') r += 2; if(m === 'Masuda') r += 5; if(m === 'MasudaCharme') r += 7;
    if(m.startsWith('LG_Combo')) { b = 4096; if(m.includes('Charme')) r += 2; if(m.includes('Parfum') || m === 'LG_Combo_All') r += 1; if(c >= 11 && c <= 20) r += 3; else if(c >= 21 && c <= 30) r += 7; else if(c >= 31) r += 11; }
    if(m === 'SOS') { b = 4096; if(c >= 11 && c <= 20) r += 4; else if(c >= 21 && c <= 30) r += 8; else if(c >= 31) r += 12; }
    if(m === 'Massive') { if(b === 4096) r += 2; } if(m === 'MassiveCharme') { if(b === 4096) r += 4; } if(m === 'SandwichMax') { if(b === 4096) r += 7; }
    if(m === 'Radar') { if(c >= 40) return b === 4096 ? "1 / 99" : "1 / 200"; if(c >= 30) return "1 / 256"; if(c >= 20) return "1 / 1024"; }
    if(m === 'Peche') { if(c >= 20) return "1 / 100"; if(c > 0) return `1 / ${Math.round(b / (1 + c * 2))}`; }
    if(m === 'Dynamax') return "1 / 100";
    return `1 / ${Math.round(b / (1 + r))}`;
}

function updateLiveOdds() { 
    if(!currentHuntId) return; 
    // Lecture directe dans le localStorage pour supporter le rafraichissement de page
    const gameValue = localStorage.getItem(`game-${currentHuntId}`) || '';
    const methodValue = localStorage.getItem(`method-${currentHuntId}`) || '';
    document.getElementById('live-hunt-odds').textContent = `Probabilité : ${calculateOdds(gameValue, methodValue, currentChainLength)}`; 
}

function toggleTimer() { if(!currentHuntId) return; const btn = document.getElementById('btn-timer-toggle'); if(isTimerRunning) { clearInterval(timerInterval); isTimerRunning = false; btn.textContent = "▶️"; } else { isTimerRunning = true; btn.textContent = "⏸️"; timerInterval = setInterval(() => { timerSeconds++; document.getElementById('live-hunt-timer').textContent = new Date(timerSeconds * 1000).toISOString().substr(11, 8); localStorage.setItem(`timer-${currentHuntId}`, timerSeconds); }, 1000); } }
function resetTimer() { if(!currentHuntId) return; timerSeconds = 0; document.getElementById('live-hunt-timer').textContent = "00:00:00"; localStorage.setItem(`timer-${currentHuntId}`, 0); }

function setAsCurrentHunt(id, name) {
    // Enregistrement de la session active
    localStorage.setItem('active-hunt-id', id);
    localStorage.setItem('active-hunt-name', name);
    currentHuntId = id; 
    
    clearInterval(timerInterval); isTimerRunning = false;
    document.getElementById('btn-timer-toggle').textContent = "▶️";
    
    timerSeconds = parseInt(localStorage.getItem(`timer-${id}`)) || 0;
    document.getElementById('live-hunt-timer').textContent = new Date(timerSeconds * 1000).toISOString().substr(11, 8);
    document.getElementById('live-hunt-img').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    document.getElementById('live-hunt-name').textContent = name;
    
    document.getElementById('live-hunt-counter').textContent = localStorage.getItem(`encounters-${id}`) || 0;
    document.getElementById('live-hunt-phases').textContent = localStorage.getItem(`phases-${id}`) || 1;
    
    // Restauration de la chaîne
    currentChainLength = parseInt(localStorage.getItem(`chain-${id}`)) || 0;
    document.getElementById('live-hunt-chain').textContent = currentChainLength;
    
    const methodValue = localStorage.getItem(`method-${id}`) || '';
    document.getElementById('live-hunt-chain-container').style.display = chainMethods.includes(methodValue) ? 'flex' : 'none';
    
    document.getElementById('live-hunt-module').style.display = 'block'; 
    updateLiveOdds(); 
    
    // Scrolle seulement si ce n'est pas un rechargement automatique
    if (event && event.type !== 'DOMContentLoaded') window.scrollTo({top: 0, behavior: 'smooth'});
}

function incrementLiveHunt() { if(!currentHuntId) return; let e = (parseInt(localStorage.getItem(`encounters-${currentHuntId}`)) || 0) + 1; localStorage.setItem(`encounters-${currentHuntId}`, e); document.getElementById('live-hunt-counter').textContent = e; if(document.getElementById(`encounters-${currentHuntId}`)) document.getElementById(`encounters-${currentHuntId}`).value = e; const wc = document.getElementById(`wanted-encounters-${currentHuntId}`); if(wc) wc.textContent = `${e} vues`; updateDashboard(); checkAchievements(); }
function incrementPhase() { if(!currentHuntId) return; let p = (parseInt(localStorage.getItem(`phases-${currentHuntId}`)) || 1) + 1; localStorage.setItem(`phases-${currentHuntId}`, p); document.getElementById('live-hunt-phases').textContent = p; if(document.getElementById(`phases-${currentHuntId}`)) document.getElementById(`phases-${currentHuntId}`).value = p; checkAchievements(); }

function incrementChain() { 
    if(!currentHuntId) return; 
    currentChainLength++; 
    localStorage.setItem(`chain-${currentHuntId}`, currentChainLength); // Sauvegarde la chaîne
    document.getElementById('live-hunt-chain').textContent = currentChainLength; 
    incrementLiveHunt(); 
    updateLiveOdds(); 
    checkAchievements(); 
}

function breakChain() { 
    if(!currentHuntId) return;
    currentChainLength = 0; 
    localStorage.setItem(`chain-${currentHuntId}`, 0); // Sauvegarde la brisure
    document.getElementById('live-hunt-chain').textContent = 0; 
    updateLiveOdds(); 
}

function closeLiveHunt() { 
    clearInterval(timerInterval); 
    isTimerRunning = false; 
    document.getElementById('live-hunt-module').style.display = 'none'; 
    localStorage.removeItem('active-hunt-id'); // Supprime la session active
    localStorage.removeItem('active-hunt-name');
    currentHuntId = null; 
}

function markLiveHuntAsShiny() { 
    if(!currentHuntId) return; 
    
    // --- 1. LA FÊTE (Garantie à 100% à chaque capture) ---
    if (typeof confetti === 'function') {
        confetti({particleCount: 150, spread: 80, origin: {y: 0.6}});
    }
    
    // --- 2. LE CRI DU POKÉMON ---
    // On utilise currentHuntId qui contient l'ID du Pokémon en cours
    let audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${currentHuntId}.ogg`);
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Le navigateur a bloqué l'audio automatique.", e));

    // --- 3. TA LOGIQUE EXACTE CONSERVÉE ---
    const cb = document.getElementById(`shiny-${currentHuntId}`); 
    if(cb && !cb.checked) { 
        cb.checked = true; 
        toggleShiny(currentHuntId); 
    } 
    else if(!cb) { 
        localStorage.setItem(`shiny-${currentHuntId}`, 'true'); 
        // Le vieux confetti caché ici a été retiré puisqu'il est géré au début !
    } 
    
    closeLiveHunt(); 
    updateDashboard(); 
    renderWantedList(); 
    checkAchievements(); // Les succès sont bien appelés ici, c'est parfait !
}
function toggleShiny(id) {
    const cb = document.getElementById(`shiny-${id}`);
    if (!cb) return;

    if (cb.checked) {
        // --- 1. LA FÊTE (Confettis) ---
        if (typeof confetti === 'function') {
            confetti({particleCount: 150, spread: 80, origin: {y: 0.6}});
        }
        
        // --- 2. LE CRI DU POKÉMON (Aiguillage Z-A vs Classique) ---
        let audioSource = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`; // Source par défaut
        
        // Si c'est un nouveau Méga, on remplace la source par ton fichier local
        if (id >= 20000 && typeof CUSTOM_MEGA_DATA !== 'undefined' && CUSTOM_MEGA_DATA[id] && CUSTOM_MEGA_DATA[id].cry) {
            audioSource = CUSTOM_MEGA_DATA[id].cry;
        }
        
        let audio = new Audio(audioSource);
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio bloqué", e));
        // ---------------------------------------------------------

        // Sauvegarde dans le navigateur
        localStorage.setItem(`shiny-${id}`, 'true');
    } else {
        // Si on décoche la case
        localStorage.removeItem(`shiny-${id}`);
    }

    // Mises à jour de l'interface et des succès
    if (typeof updateDashboard === 'function') updateDashboard();
    if (typeof checkAchievements === 'function') checkAchievements();
}
function openJournal(id, name) {
    document.getElementById('journal-poke-id').value = id; document.getElementById('journal-poke-name').textContent = `#${id} ${name}`;
    document.getElementById('journal-text').value = localStorage.getItem(`journal-note-${id}`) || ''; document.getElementById('journal-link').value = localStorage.getItem(`journal-link-${id}`) || '';
    document.getElementById('journal-modal').style.display = 'flex';
}
function closeJournal() { document.getElementById('journal-modal').style.display = 'none'; }
function saveJournal() {
    const id = document.getElementById('journal-poke-id').value; const t = document.getElementById('journal-text').value.trim(); const l = document.getElementById('journal-link').value.trim(); const n = document.getElementById('journal-poke-name').textContent.split(' ').slice(1).join(' ');
    if(t) localStorage.setItem(`journal-note-${id}`, t); else localStorage.removeItem(`journal-note-${id}`);
    if(l) localStorage.setItem(`journal-link-${id}`, l); else localStorage.removeItem(`journal-link-${id}`);
    closeJournal();
    const d = document.getElementById(`action-btns-${id}`);
    if(d) { d.innerHTML = `<button onclick="setAsCurrentHunt(${id}, '${n}')" style="flex:1;background:var(--accent-blue);color:white;border:none;border-radius:8px;font-weight:bold;padding:10px;">🎯 Shasser</button><button onclick="openJournal(${id}, '${n}')" style="background:#f39c12;color:white;border:none;border-radius:8px;padding:10px 15px;">📖</button>${l ? `<a href="${l}" target="_blank" style="background:#e74c3c;color:white;text-decoration:none;padding:10px 15px;border-radius:8px;display:flex;align-items:center;">▶️</a>` : ''}`; }
}

// ==========================================
// 4. HALL OF FAME & CIMETIÈRE (Liste originale)
// ==========================================
const nuzlockeGames = [
    { id: 'gen1', name: 'Kanto (RBJ/RFVF)' },
    { id: 'gen2', name: 'Johto (OAC/HGSS)' },
    { id: 'gen3', name: 'Hoenn (RSE/ROSA)' },
    { id: 'gen4', name: 'Sinnoh (DPP/DEPS)' },
    { id: 'gen5', name: 'Unys (NB1&2)' },
    { id: 'gen6', name: 'Kalos (X/Y)' },
    { id: 'gen7', name: 'Alola (USUL)' },
    { id: 'lgpe', name: "Kanto (Let's Go)" },
    { id: 'gen8', name: 'Galar (EB)' },
    { id: 'plza', name: 'Illumis (Z-A)' },
    { id: 'gen9', name: 'Paldea (EV)' }
];
const ribbonTypes = ['none', 'mvp', 'slayer', 'survivor', 'hero']; const ribbonIcons = { 'none': '🎖️', 'mvp': '👑', 'slayer': '⚔️', 'survivor': '🛡️', 'hero': '🌟' }; const ribbonTitles = { 'none': 'Attribuer', 'mvp': 'MVP', 'slayer': 'Tueur de Champion', 'survivor': 'Survivant à 1 PV', 'hero': 'Héros' };

function showHofTab(tab) {
    // --- NOUVEAU : On mémorise le clic pour le rafraîchissement ---
    localStorage.setItem('last_hof_tab', tab);

    // 1. On cache toutes les sections (avec vérification de sécurité)
    ['hof-official-content', 'hof-hackrom-content', 'hof-super-content', 'hof-graveyard-content'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // 2. On désactive tous les boutons proprement
    ['tab-official', 'tab-hackrom', 'tab-super', 'tab-graveyard'].forEach(id => {
        const b = document.getElementById(id);
        if (b) {
            b.classList.remove('active');
            b.style.background = ''; // Purge des vieux styles en dur
            b.style.color = '';
            b.style.boxShadow = '';
        }
    });

    // 3. On affiche la section demandée (sécurisé)
    const contentToDisplay = document.getElementById(`hof-${tab}-content`);
    if (contentToDisplay) {
        contentToDisplay.style.display = 'block';
    } else {
        console.error(`Oups ! La section hof-${tab}-content est introuvable dans le HTML.`);
    }

    // 4. On active le bouton cliqué (sécurisé)
    const btnToActivate = document.getElementById(`tab-${tab}`);
    if (btnToActivate) {
        btnToActivate.classList.add('active');
        
        // Exceptions de couleur pour Super et Graveyard (si géré en dur)
        if (tab === 'super') {
            btnToActivate.style.background = 'linear-gradient(135deg, #f1c40f, #f39c12)';
            btnToActivate.style.color = 'white';
        } else if (tab === 'graveyard') {
            btnToActivate.style.background = '#2c3e50';
            btnToActivate.style.color = 'white';
        }
    }

    // 5. Exécution des fonctions spécifiques (avec try/catch pour ne pas bloquer les clics)
    try {
        if (tab === 'super' && typeof renderSuperHoF === 'function') renderSuperHoF();
        if (tab === 'graveyard' && typeof renderGlobalGraveyard === 'function') renderGlobalGraveyard();
    } catch (erreur) {
        console.error("Erreur lors du rendu de la section :", erreur);
    }
}

function loadHallOfFame() { 
    const g = document.getElementById('hof-official-grid'); 
    
    // 1. On lit la mémoire du navigateur (si rien n'est mémorisé, on met 'official')
    const lastHofTab = localStorage.getItem('last_hof_tab') || 'official';

    // 2. Si le contenu est DÉJÀ chargé, on affiche juste le bon onglet et on s'arrête
    if(g && g.children.length > 0) {
        showHofTab(lastHofTab);
        return; 
    }
    
    // 3. Sinon, on génère tout le contenu du Hall of Fame
    renderHallOfFame(); 
    
    // 4. Et on affiche l'onglet mémorisé !
    showHofTab(lastHofTab);
}
function renderHallOfFame() {
    const og = document.getElementById('hof-official-grid'); const hg = document.getElementById('hof-hackrom-grid');
    if(og) og.innerHTML = ''; if(hg) hg.innerHTML = '';
    
    let co = JSON.parse(localStorage.getItem('custom-official-runs')) || []; 
    let ch = JSON.parse(localStorage.getItem('custom-hackroms')) || []; 

    // Fonction de rendu avec Tri "En cours" vs "Terminées"
    const renderSorted = (runs, grid, isOC) => {
        let prog = [], comp = [];
        runs.forEach(r => localStorage.getItem(`status-${r.id}`) === 'completed' ? comp.push(r) : prog.push(r));
        
        if(prog.length > 0) {
            grid.innerHTML += `<div style="width: 100%; display: flex; align-items: center; gap: 15px; margin: 20px 0;"><h3 style="margin:0; color:var(--accent-orange); font-size: 24px;">⏳ Parties en cours</h3><div style="flex:1; height:2px; background:var(--accent-orange); opacity:0.3;"></div></div>`;
            prog.forEach(r => createGameCard(r, grid, true, isOC));
        }
        if(comp.length > 0) {
            grid.innerHTML += `<div style="width: 100%; display: flex; align-items: center; gap: 15px; margin: 40px 0 20px 0;"><h3 style="margin:0; color:#2ecc71; font-size: 24px;">🏆 Panthéon (Terminées)</h3><div style="flex:1; height:2px; background:#2ecc71; opacity:0.3;"></div></div>`;
            comp.forEach(r => createGameCard(r, grid, true, isOC));
        }
    };

    if(og) renderSorted(co, og, true);
    if(hg) renderSorted(ch, hg, false);
}

function toggleRunStatus(id) {
    let s = localStorage.getItem(`status-${id}`) === 'completed' ? 'progress' : 'completed';
    localStorage.setItem(`status-${id}`, s);
    renderHallOfFame(); 
    checkAchievements();
}

function toggleHoFShiny(g, i) {
    let k = `shiny-team-${g}-${i}`;
    localStorage.setItem(k, localStorage.getItem(k) === 'true' ? 'false' : 'true');
    updateHoFSprite(g, i, true);
}

function createGameCard(g, grid, isC = false, isOC = false) {
    const card = document.createElement('div'); card.className = 'game-card'; let html = '';
    const status = localStorage.getItem(`status-${g.id}`) || 'progress';
    
    for(let i = 1; i <= 6; i++) {
        const n = localStorage.getItem(`team-${g.id}-${i}-nick`) || '';
        let r = localStorage.getItem(`ribbon-${g.id}-${i}`) || 'none';
        let isShiny = localStorage.getItem(`shiny-team-${g.id}-${i}`) === 'true';
        if(r === 'none' && localStorage.getItem(`team-${g.id}-${i}-mvp`) === 'true') { r = 'mvp'; localStorage.setItem(`ribbon-${g.id}-${i}`, 'mvp'); }
        
        let shinyFilter = isShiny ? 'grayscale(0) drop-shadow(0 0 5px rgba(241,196,15,0.8))' : 'grayscale(100%)';
        let shinyOpacity = isShiny ? '1' : '0.7';
        
        html += `
        <div class="team-member" style="position: relative;">
            <button id="shiny-btn-${g.id}-${i}" onclick="toggleHoFShiny('${g.id}', ${i})" style="position:absolute; top:8px; left:8px; background:transparent; border:none; font-size:16px; cursor:pointer; z-index:5; filter: ${shinyFilter}; opacity: ${shinyOpacity}; transition: 0.2s;" title="Marquer comme Shiny">✨</button>
            
            <button onclick="jumpToDex(localStorage.getItem('team-${g.id}-${i}-id'))" style="position:absolute; top:8px; right:8px; background:transparent; border:none; font-size:16px; cursor:pointer; z-index:5; opacity:0.6; transition: 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'" title="Voir la fiche Pokédex">📖</button>
            
            <div class="ribbon-icon ${r !== 'none' ? `ribbon-${r}` : ''}" id="ribbon-${g.id}-${i}" onclick="toggleRibbon('${g.id}',${i})" title="${ribbonTitles[r]}">${ribbonIcons[r]}</div>
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" id="team-${g.id}-${i}-img">
            <input type="text" id="team-${g.id}-${i}-nick" value="${n}" oninput="saveHoFNick('${g.id}',${i})" class="hunt-select" style="text-align:center; font-size:12px; padding:6px; margin-bottom:6px;" placeholder="Surnom">
            <input type="text" id="team-${g.id}-${i}-id" onchange="updateHoFSprite('${g.id}',${i})" class="hunt-select" style="text-align:center; font-size:12px; padding:6px;" placeholder="ID/Nom">
        </div>`;
    }
    
    let del = isC ? `<button onclick="${isOC ? 'deleteOfficialRun' : 'deleteHackrom'}('${g.id}')" class="btn-action chain-break" style="float:right; margin:0;">✖ Supprimer</button>` : '';
    let statusBtn = `<button onclick="toggleRunStatus('${g.id}')" class="btn-action ${status === 'completed' ? 'timer-btn' : 'timer-reset'}" style="float:right; margin-right:10px;">${status === 'completed' ? '🏆 Terminée' : '⏳ En cours'}</button>`;
    
    card.innerHTML = `
        <div style="margin-bottom: 25px; border-bottom: 2px dashed #eee; padding-bottom: 15px;">
            ${del}
            ${statusBtn}
            <div class="game-title" style="margin: 0; border: none; padding: 0;">${g.name}</div>
        </div>
        <h4 style="color: var(--accent-blue); text-transform: uppercase; letter-spacing: 1px; font-size: 14px; text-align: center;">🛡️ L'Équipe</h4>
        <div class="team-container">${html}</div>
        <div style="display: flex; gap: 30px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 250px;">
                <h4 style="color: #34495e; text-transform: uppercase; letter-spacing: 1px; font-size: 14px;">💻 PC (En vie)</h4>
                <div style="display:flex; gap:10px; margin-bottom:15px;">
                    <input type="text" id="pc-${g.id}-input" class="hunt-select" style="margin:0;" placeholder="Nom ou ID...">
                    <button onclick="addExtra('${g.id}','pc')" class="btn-action timer-btn" style="min-width: 80px;">Ajouter</button>
                    <button onclick="clearExtra('${g.id}','pc')" class="btn-action timer-reset" style="min-width: 80px;">Vider</button>
                </div>
                <div id="pc-container-${g.id}" class="extra-container"></div>
            </div>
            <div style="flex: 1; min-width: 250px;">
                <h4 style="color: #e74c3c; text-transform: uppercase; letter-spacing: 1px; font-size: 14px;">🪦 Cimetière</h4>
                <div style="display:flex; gap:10px; margin-bottom:15px;">
                    <input type="text" id="grave-${g.id}-input" class="hunt-select" style="margin:0;" placeholder="Nom ou ID...">
                    <button onclick="addExtra('${g.id}','grave')" class="btn-action chain-break" style="background:#e74c3c; color:white; min-width: 80px; margin:0;">Ajouter</button>
                    <button onclick="clearExtra('${g.id}','grave')" class="btn-action timer-reset" style="min-width: 80px;">Vider</button>
                </div>
                <div id="grave-container-${g.id}" class="extra-container graveyard"></div>
            </div>
        </div>`;
    grid.appendChild(card);
    for(let i = 1; i <= 6; i++) updateHoFSprite(g.id, i, true);
    loadExtra(g.id, 'pc'); loadExtra(g.id, 'grave');
}
function addOfficialRun() { 
    const select = document.getElementById('new-official-game');
    const game = select.value; 
    if(!game) return; // Empêche l'ajout si rien n'est sélectionné
    
    const region = select.options[select.selectedIndex].parentNode.label; // Récupère "Johto", "Kanto", etc.
    const rule = document.getElementById('new-official-rule').value.trim(); 
    
    let c = JSON.parse(localStorage.getItem('custom-official-runs')) || []; 
    // Format de sauvegarde : "Région - Jeu - Règles"
    c.push({id: 'offrun-' + Date.now(), name: `${region} - ${game}${rule ? ' - ' + rule : ''}`}); 
    localStorage.setItem('custom-official-runs', JSON.stringify(c)); 
    
    select.value = ''; document.getElementById('new-official-rule').value = '';
    renderHallOfFame(); checkAchievements(); 
}function deleteOfficialRun(id) { let c = JSON.parse(localStorage.getItem('custom-official-runs')) || []; c = c.filter(r => r.id !== id); localStorage.setItem('custom-official-runs', JSON.stringify(c)); renderHallOfFame(); checkAchievements(); }
function addHackrom() { const n = document.getElementById('new-hackrom-name').value.trim(); if(!n) return; let c = JSON.parse(localStorage.getItem('custom-hackroms')) || []; c.push({id: 'hackrom-' + Date.now(), name: n}); localStorage.setItem('custom-hackroms', JSON.stringify(c)); renderHallOfFame(); checkAchievements(); }
function deleteHackrom(id) { let c = JSON.parse(localStorage.getItem('custom-hackroms')) || []; c = c.filter(h => h.id !== id); localStorage.setItem('custom-hackroms', JSON.stringify(c)); renderHallOfFame(); checkAchievements(); }

async function updateHoFSprite(g, i, load = false) {
    const idInput = document.getElementById(`team-${g}-${i}-id`); const img = document.getElementById(`team-${g}-${i}-img`);
    const isShiny = localStorage.getItem(`shiny-team-${g}-${i}`) === 'true';
    const shinyPath = isShiny ? 'shiny/' : '';
    
    if(load) { 
        const s = localStorage.getItem(idInput.id); 
        if(s) { idInput.value = s; img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shinyPath}${s}.png`; } 
        return; 
    }
    
    let q = idInput.value.toLowerCase().trim();
    if(!q) { img.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"; localStorage.removeItem(idInput.id); checkAchievements(); return; }
    
    // Traduction FR inversée
    for (let [id, nameFr] of Object.entries(pokemonFrDict)) { if (nameFr.toLowerCase() === q) { q = id; break; } }
    
    let pid = q; 
    if(isNaN(q)) { try { const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${q}`); const d = await res.json(); pid = d.id; idInput.value = pid; } catch(e) { idInput.value = ""; return; } }
    
    img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shinyPath}${pid}.png`; 
    localStorage.setItem(idInput.id, pid); 
    checkAchievements();
}

function saveHoFNick(g, i) { localStorage.setItem(`team-${g}-${i}-nick`, document.getElementById(`team-${g}-${i}-nick`).value); }
function toggleRibbon(g, i) { let c = localStorage.getItem(`ribbon-${g}-${i}`) || 'none'; let n = ribbonTypes[(ribbonTypes.indexOf(c) + 1) % ribbonTypes.length]; localStorage.setItem(`ribbon-${g}-${i}`, n); const e = document.getElementById(`ribbon-${g}-${i}`); e.className = n === 'none' ? 'ribbon-icon' : `ribbon-icon ribbon-${n}`; e.textContent = ribbonIcons[n]; e.title = ribbonTitles[n]; checkAchievements(); if(document.getElementById('hof-super-content').style.display === 'block') renderSuperHoF(); }

async function addExtra(g, t) { const i = document.getElementById(`${t}-${g}-input`); const q = i.value.toLowerCase().trim(); if(!q) return; let pid = q; if(isNaN(q)) { try { const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${q}`); const d = await res.json(); pid = d.id; } catch(e) { return; } } let l = JSON.parse(localStorage.getItem(`${t}-list-${g}`)) || []; l.push(pid); localStorage.setItem(`${t}-list-${g}`, JSON.stringify(l)); i.value = ''; loadExtra(g, t); checkAchievements(); }
function loadExtra(g, t) { const c = document.getElementById(`${t}-container-${g}`); c.innerHTML = ''; let l = JSON.parse(localStorage.getItem(`${t}-list-${g}`)) || []; l.forEach((p, i) => { const w = document.createElement('div'); w.style.cssText = 'position:relative;display:inline-block;'; const img = document.createElement('img'); img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p}.png`; img.className = 'extra-sprite'; if(t === 'grave') { img.title = localStorage.getItem(`grave-note-${g}-${i}`) || "Sans cause"; img.oncontextmenu = (e) => { e.preventDefault(); const n = prompt("Note:", img.title); if(n !== null) { localStorage.setItem(`grave-note-${g}-${i}`, n); loadExtra(g, t); } }; } const b = document.createElement('button'); b.innerHTML = '✖'; b.style.cssText = 'position:absolute;top:-5px;right:-5px;background:#e74c3c;color:white;border:none;border-radius:50%;width:18px;height:18px;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;'; b.onclick = () => { l.splice(i, 1); localStorage.setItem(`${t}-list-${g}`, JSON.stringify(l)); if(t === 'grave') { for(let j = i; j < l.length; j++) { let nn = localStorage.getItem(`grave-note-${g}-${j + 1}`); if(nn) localStorage.setItem(`grave-note-${g}-${j}`, nn); else localStorage.removeItem(`grave-note-${g}-${j}`); } localStorage.removeItem(`grave-note-${g}-${l.length}`); } loadExtra(g, t); checkAchievements(); }; w.appendChild(img); w.appendChild(b); c.appendChild(w); }); }
function clearExtra(g, t) { localStorage.removeItem(`${t}-list-${g}`); loadExtra(g, t); checkAchievements(); }

function electSupreme(g, i, r) { localStorage.setItem(`supreme-${r}`, `${g}-${i}`); renderSuperHoF(); }
function removeSupreme(r) { localStorage.removeItem(`supreme-${r}`); renderSuperHoF(); }

async function renderSuperHoF() {
    const gc = document.getElementById('hof-super-grid'); const sc = document.getElementById('hof-supremes-grid'); if(!gc || !sc) return;
    gc.innerHTML = ''; sc.innerHTML = '';
    let a = nuzlockeGames.concat(JSON.parse(localStorage.getItem('custom-official-runs')) || []).concat(JSON.parse(localStorage.getItem('custom-hackroms')) || []);
    let l = [];
    for(let r of a) {
        // Magie du Tag : On récupère "Région - Jeu" pour le badge
        let parts = r.name.split(' - ');
        let displayName = parts.length > 1 ? `${parts[0]} - ${parts[1]}` : r.name.split(' (')[0];
        
        for(let i = 1; i <= 6; i++) { 
            const p = localStorage.getItem(`team-${r.id}-${i}-id`); const b = localStorage.getItem(`ribbon-${r.id}-${i}`) || 'none'; 
            if(p && b !== 'none') l.push({ rId: r.id, rN: displayName, s: i, p, b, n: localStorage.getItem(`team-${r.id}-${i}-nick`) || 'Sans nom' }); 
        }
    }
    
    if(l.length === 0) { gc.innerHTML = '<p style="width:100%;text-align:center;color:#888;">Aucun nominé.</p>'; sc.innerHTML = '<p style="width:100%;text-align:center;color:#888;">Podium vide.</p>'; return; }
    const cats = ['mvp', 'slayer', 'survivor', 'hero']; const cols = { 'mvp': '#f1c40f', 'slayer': '#e74c3c', 'survivor': '#2ecc71', 'hero': '#3498db' };
    
    for(let c of cats) {
        const sk = localStorage.getItem(`supreme-${c}`); const e = l.find(x => `${x.rId}-${x.s}` === sk && x.b === c);
        if(e) { 
            let sn = getPokemonName(e.p, "Inconnu");
            sc.innerHTML += `<div class="super-hof-card border-${c}" style="transform:scale(1.15);margin:10px;box-shadow:0 10px 25px ${cols[c]}40;"><div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:white;padding:4px 12px;border-radius:50px;border:2px solid ${cols[c]};font-size:10px;font-weight:900;color:${cols[c]};">L'ULTIME</div><button onclick="removeSupreme('${c}')" style="position:absolute;top:8px;right:8px;background:rgba(231,76,60,0.1);color:#e74c3c;border:none;border-radius:50%;cursor:pointer;">❌</button><div style="font-size:35px;margin-bottom:5px;">${ribbonIcons[c]}</div><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${e.p}.png"><div class="game-tag">${e.rN}</div><h4>"${e.n}"</h4><div class="species">${sn}</div></div>`; 
        } else { 
            sc.innerHTML += `<div style="width:160px;padding:20px;border-radius:15px;border:2px dashed ${cols[c]};display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0.5;margin:10px;"><div style="font-size:40px;filter:grayscale(100%);">${ribbonIcons[c]}</div><div style="font-size:12px;font-weight:bold;text-align:center;margin-top:10px;">Aucun<br>${ribbonTitles[c]}</div></div>`; 
        }
    }
    for(let e of l) {
        const sk = localStorage.getItem(`supreme-${e.b}`); if(sk === `${e.rId}-${e.s}`) continue;
        let sn = getPokemonName(e.p, "Inconnu");
        gc.innerHTML += `<div class="super-hof-card border-${e.b}"><div style="font-size:24px;margin-bottom:5px;">${ribbonIcons[e.b]}</div><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${e.p}.png"><div class="game-tag">${e.rN}</div><h4>"${e.n}"</h4><div class="species">${sn}</div><button onclick="electSupreme('${e.rId}',${e.s},'${e.b}')" style="background:var(--bg-color);color:var(--text-color);border:2px solid #eee;border-radius:50px;padding:6px;width:100%;margin-top:10px;cursor:pointer;font-weight:bold;font-size:10px;">Élire l'Ultime 🏆</button></div>`;
    }
}

async function renderGlobalGraveyard() {
    const c = document.getElementById('hof-graveyard-grid'); if(!c) return;
    c.innerHTML = '<p style="width:100%;text-align:center;">Réveil des âmes...</p>';
    let a = nuzlockeGames.concat(JSON.parse(localStorage.getItem('custom-official-runs')) || []).concat(JSON.parse(localStorage.getItem('custom-hackroms')) || []);
    let dl = [];
    for(let r of a) { 
        let parts = r.name.split(' - ');
        let displayName = parts.length > 1 ? `${parts[0]} - ${parts[1]}` : r.name.split(' (')[0];
        let gl = JSON.parse(localStorage.getItem(`grave-list-${r.id}`)) || []; 
        for(let i = 0; i < gl.length; i++) { dl.push({ rn: displayName, p: gl[i], n: localStorage.getItem(`grave-note-${r.id}-${i}`) || "Sans cause" }); } 
    }
    if(dl.length === 0) { c.innerHTML = '<p style="width:100%;text-align:center;color:#888;">Aucun mort.</p>'; return; }
    c.innerHTML = '';
    for(let d of dl) { 
        let sn = getPokemonName(d.p, "Inconnu");
        c.innerHTML += `<div class="grave-card"><div style="position:absolute;top:-12px;left:-10px;font-size:26px;">🪦</div><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${d.p}.png"><h4>${sn}</h4><div class="game-tag">${d.rn}</div><div class="death-note">"${d.n}"</div></div>`; 
    }
}

// ==========================================
// 5. STATISTIQUES (CHART.JS)
// ==========================================
async function renderCharts() {
    let methodCounts = {}; let gameCounts = {}; let encountersList = []; let datesMap = {}; let typeCounts = {};
    let durationCounts = { "✨ Miracle (<50)": 0, "🐇 Rapide (50-512)": 0, "🚶 Classique (512-4k)": 0, "🐢 Longue (4k-8k)": 0, "💀 Douleur (>8k)": 0 };

    let missingIds = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Sécurité HoF
        if (key.startsWith('shiny-') && !key.startsWith('shiny-team-') && localStorage.getItem(key) === 'true') {
            const id = key.split('-')[1];
            if (!localStorage.getItem(`types-${id}`)) missingIds.push(id);
        }
    }

    if (missingIds.length > 0) {
        await Promise.all(missingIds.map(async (id) => {
            try {
                const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
                const data = await res.json();
                const types = data.types.map(t => typeTranslations[t.type.name] || capitalized(t.type.name));
                localStorage.setItem(`types-${id}`, JSON.stringify(types));
            } catch(e) {}
        }));
    }

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Sécurité HoF
        if (key.startsWith('shiny-') && !key.startsWith('shiny-team-') && localStorage.getItem(key) === 'true') {
            const id = key.split('-')[1];
            const method = localStorage.getItem(`method-${id}`) || 'Inconnue';
            const game = localStorage.getItem(`game-${id}`) || 'Inconnu';
            const encounters = parseInt(localStorage.getItem(`encounters-${id}`)) || 0;
            const nickname = localStorage.getItem(`nickname-${id}`);
            const date = localStorage.getItem(`date-${id}`);

            methodCounts[method] = (methodCounts[method] || 0) + 1;
            gameCounts[game] = (gameCounts[game] || 0) + 1;
            encountersList.push({ id: id, nickname: nickname, count: encounters });
            
            if (date) { const monthYear = date.substring(0, 7); datesMap[monthYear] = (datesMap[monthYear] || 0) + 1; }
            
            const types = JSON.parse(localStorage.getItem(`types-${id}`)) || [];
            types.forEach(t => { 
                const frType = typeTranslations[t.toLowerCase()] || t;
                typeCounts[frType] = (typeCounts[frType] || 0) + 1; 
            });
            
            if (encounters > 0) {
                if (encounters < 50) durationCounts["✨ Miracle (<50)"]++;
                else if (encounters <= 512) durationCounts["🐇 Rapide (50-512)"]++;
                else if (encounters <= 4096) durationCounts["🚶 Classique (512-4k)"]++;
                else if (encounters <= 8192) durationCounts["🐢 Longue (4k-8k)"]++;
                else durationCounts["💀 Douleur (>8k)"]++;
            }
        }
    }

    encountersList.sort((a, b) => b.count - a.count); const top5 = encountersList.slice(0, 5);
    for (let item of top5) { await new Promise((resolve) => { const img = new Image(); img.onload = () => { item.imgObj = img; resolve(); }; img.onerror = () => { item.imgObj = null; resolve(); }; img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${item.id}.png`; }); }
    
    const textColor = document.body.classList.contains('dark-mode') ? '#e0e0e0' : '#2c3e50';
    Chart.defaults.color = textColor;

    // --- GRAPHIQUE 1 : TIMELINE ---
    const sortedDates = Object.keys(datesMap).sort();
    
    // NOUVEAU : Transformation des dates "YYYY-MM" en "Mois Année" français
    const frenchDateLabels = sortedDates.map(dateStr => {
        // Ajout d'un jour arbitraire (-01) pour que Javascript puisse lire la date correctement
        const dateObj = new Date(dateStr + '-01');
        return dateObj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    });

    const timelineCtx = document.getElementById('timelineChart').getContext('2d');
    if (timelineChart) timelineChart.destroy();
    timelineChart = new Chart(timelineCtx, { 
        type: 'line', 
        data: { 
            labels: frenchDateLabels, // Utilisation des labels français ici
            datasets: [{ 
                label: 'Shinys obtenus', 
                data: sortedDates.map(date => datesMap[date]), 
                borderColor: '#9b59b6', 
                backgroundColor: 'rgba(155, 89, 182, 0.2)', 
                borderWidth: 3, 
                tension: 0.3, 
                fill: true 
            }] 
        }, 
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } 
        } 
    });

    // --- GRAPHIQUE 2 : TYPES RADAR (TEXTE EN FRANÇAIS UNIQUEMENT) ---
    const typeLabels = Object.keys(typeCounts).sort();
    const typeData = typeLabels.map(label => typeCounts[label]);
    const radarCtx = document.getElementById('typeRadarChart').getContext('2d');
    if (typeRadarChart) typeRadarChart.destroy();

    typeRadarChart = new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: typeLabels.length > 0 ? typeLabels : ['Aucun type'],
            datasets: [{
                label: 'Quantité',
                data: typeData.length > 0 ? typeData : [0],
                backgroundColor: 'rgba(231, 76, 60, 0.2)',
                borderColor: '#e74c3c',
                pointBackgroundColor: '#e74c3c',
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: document.body.classList.contains('dark-mode') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                    grid: { color: document.body.classList.contains('dark-mode') ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                    pointLabels: {
                        color: textColor,
                        font: { size: 12, weight: 'bold' }
                    },
                    ticks: { display: false, stepSize: 1 },
                    suggestedMin: 0
                }
            },
            plugins: { legend: { display: false } }
        }
    });

    // --- GRAPHIQUE 3 : LONGEST (TOP 5) ---
    const longestCtx = document.getElementById('longestChart').getContext('2d');
    if (longestChart) longestChart.destroy();
    longestChart = new Chart(longestCtx, { type: 'bar', data: { labels: top5.map((item, idx) => ' '.repeat(idx + 1)), datasets: [{ label: 'Rencontres / Resets', data: top5.map(item => item.count), backgroundColor: '#e74c3c', borderRadius: 5 }] }, options: { responsive: true, maintainAspectRatio: false, layout: { padding: { bottom: 65 } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } }, plugins: { tooltip: { callbacks: { title: function(context) { const item = top5[context[0].dataIndex]; return item.nickname ? `"${item.nickname}"` : `Pokémon #${item.id}`; } } } } }, plugins: [{ id: 'customSprites', afterDraw: (chart) => { const ctx = chart.ctx; const xAxis = chart.scales.x; const meta = chart.getDatasetMeta(0); if (!meta || !meta.data) return; meta.data.forEach((datapoint, index) => { const img = top5[index]?.imgObj; if (img) { const size = 60; ctx.drawImage(img, datapoint.x - (size / 2), xAxis.bottom + 5, size, size); } }); } }] });

    // --- GRAPHIQUE 4 : METHODES ---
    const methodCtx = document.getElementById('methodChart').getContext('2d'); 
    if (methodChart) methodChart.destroy(); 
    methodChart = new Chart(methodCtx, { type: 'doughnut', data: { labels: Object.keys(methodCounts).map(m => m === '' ? 'Hasard' : m), datasets: [{ data: Object.values(methodCounts), backgroundColor: ['#3498db', '#9b59b6', '#f1c40f', '#e74c3c', '#2ecc71', '#e67e22', '#34495e'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } } });
    
    // --- GRAPHIQUE 5 : JEUX ---
    const gameCtx = document.getElementById('gameChart').getContext('2d'); 
    if (gameChart) gameChart.destroy(); 
    gameChart = new Chart(gameCtx, { type: 'pie', data: { labels: Object.keys(gameCounts).map(g => g === '' ? 'Inconnu' : g), datasets: [{ data: Object.values(gameCounts), backgroundColor: ['#2ecc71', '#1abc9c', '#f39c12', '#34495e', '#d35400', '#9b59b6', '#e74c3c'], borderWidth: 0 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } } });

    // --- GRAPHIQUE 6 : DUREES ---
    const activeDurations = Object.keys(durationCounts).filter(k => durationCounts[k] > 0); 
    const activeDurationData = activeDurations.map(k => durationCounts[k]); 
    const durationCtx = document.getElementById('durationChart').getContext('2d'); 
    if (durationChart) durationChart.destroy();
    durationChart = new Chart(durationCtx, { type: 'polarArea', data: { labels: activeDurations.length > 0 ? activeDurations : ['Aucune donnée'], datasets: [{ data: activeDurationData.length > 0 ? activeDurationData : [1], backgroundColor: ['rgba(46, 204, 113, 0.6)', 'rgba(52, 152, 219, 0.6)', 'rgba(241, 196, 15, 0.6)', 'rgba(230, 126, 34, 0.6)', 'rgba(231, 76, 60, 0.6)'], borderWidth: 2, borderColor: document.body.classList.contains('dark-mode') ? '#1a1a30' : '#ffffff' }] }, options: { responsive: true, maintainAspectRatio: false, scales: { r: { ticks: { display: false }, grid: { color: 'rgba(0,0,0,0.1)' } } }, plugins: { legend: { position: 'bottom' } } } });
// --- APPEL DE LA NOUVELLE FONCTION POUR LES GRAPHES HALL OF FAME ---
    computeAndRenderHofCharts();
}
// --- FONCTION PRINCIPALE POUR LES STATS DU HALL OF FAME ---
async function computeAndRenderHofCharts() {
    
    // 1. Initialisation des données HoF
    let h = { t:0, hk:0, mvp:0, td:0, completed:0, survivors:0 };
    let runTypeCounts = { 'Officielles': 0, 'Hackroms': 0 };
    let regionCounts = {};
    let graveyardCategories = { "💀 No Hit Run (0)": 0, "🚶 Survivant (1-5)": 0, "🐢 Long Deuil (6-10)": 0, "💀 Hécatombe (>10)": 0 };
    let mvpLeaderCounts = {};

    // 2. On récupère les parties
    let officialRuns = JSON.parse(localStorage.getItem('custom-official-runs')) || [];
    let hackromRuns = JSON.parse(localStorage.getItem('hackrom-runs')) || [];
    let allSavedRuns = [...officialRuns, ...hackromRuns];

    // 3. Analyse de toutes les parties
    allSavedRuns.forEach(run => {
        h.t++; // Compteur total
        
        // --- 3a. Type de Partie & Complétion ---
        if(hackromRuns.find(x => x.id === run.id)) {
            runTypeCounts['Hackroms']++;
        } else {
            runTypeCounts['Officielles']++;
        }
        
        let isCompleted = localStorage.getItem(`status-${run.id}`) === 'completed';
        if (isCompleted) h.completed++;
        
        // --- 3b. Champions & MVPs & Morts ---
        let tc = 0; // Champions dans l'équipe
        for(let i=1;i<=6;i++) { 
            let pokeId = localStorage.getItem(`team-${run.id}-${i}-id`);
            let pokeName = localStorage.getItem(`team-${run.id}-${i}-nickname`) || localStorage.getItem(`team-${run.id}-${i}-name`);
            
            if(pokeId) {
                tc++; h.survivors++; // Champions
                if(localStorage.getItem(`ribbon-${run.id}-${i}`)==='mvp') {
                    h.mvp++; // MVP distinctions
                    // MVP Leaders : On utilise le pseudonyme ou le nom du pokémon
                    mvpLeaderCounts[pokeName] = (mvpLeaderCounts[pokeName] || 0) + 1;
                }
            }
        }
        
        let gl=JSON.parse(localStorage.getItem(`grave-list-${run.id}`))||[];
        let d=gl.length; // Nombre de morts
        h.td+=d; // Total deaths cumulative
        
        // --- 3c. Régions Conquises (Uniquement terminées) ---
        if(tc>0 && isCompleted) {
            let parts = run.name.split(' - ');
            let region = parts.length > 1 ? parts[0] : run.name.split(' (')[0];
            regionCounts[region] = (regionCounts[region] || 0) + 1;
        }

        // --- 3d. Graveyard Breakdown (Nuzlocke) ---
        if(d === 0) graveyardCategories["💀 No Hit Run (0)"]++;
        else if(d <= 5) graveyardCategories["🚶 Survivant (1-5)"]++;
        else if(d <= 10) graveyardCategories["🐢 Long Deuil (6-10)"]++;
        else graveyardCategories["💀 Hécatombe (>10)"]++;
    });

    // 4. Validation finale des Stat Cards (HTML)
    document.getElementById('hof-stat-total-runs').textContent = h.t;
    let completionPercent = h.t > 0 ? Math.round((h.completed / h.t) * 100) : 0;
    document.getElementById('hof-stat-completion-rate').textContent = completionPercent + '%';
    document.getElementById('hof-stat-total-champions').textContent = h.survivors;
    document.getElementById('hof-stat-total-mvps').textContent = h.mvp;

    // 5. Rendu des graphiques HoF
    renderHofRunTypeChart(runTypeCounts);
    renderHofRegionChart(regionCounts);
    renderHofGraveyardChart(graveyardCategories);
    renderHofMvpChart(mvpLeaderCounts);
}

// =========================================
// FONCTIONS DE RENDU CHART.JS SPÉCIFIQUES HoF
// =========================================

// --- Graph 1: Répartition Officiels/Hackroms (Donut) ---
function renderHofRunTypeChart(dataCounts) {
    const ctx = document.getElementById('hofRunTypeChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(dataCounts),
            datasets: [{
                data: Object.values(dataCounts),
                backgroundColor: ['#3498db', '#9b59b6'], // Bleu et Violet
                borderWidth: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

// --- Graph 2: Régions Conquises (Bar) ---
function renderHofRegionChart(dataCounts) {
    const ctx = document.getElementById('hofRegionChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(dataCounts).sort(), // Régions par ordre alphabétique
            datasets: [{
                label: 'Régions terminées',
                data: Object.keys(dataCounts).sort().map(k => dataCounts[k]),
                backgroundColor: '#2ecc71', // Vert émeraude NovaDex
                borderRadius: 5
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            },
            plugins: { legend: { display: false } }
        }
    });
}

// --- Graph 3: Graveyard Breakdown (Pie Chart) ---
function renderHofGraveyardChart(graveyardCats) {
    const ctx = document.getElementById('hofGraveyardChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(graveyardCats),
            datasets: [{
                data: Object.values(graveyardCats),
                backgroundColor: ['rgba(46, 204, 113, 0.6)', 'rgba(241, 196, 15, 0.6)', 'rgba(230, 126, 34, 0.6)', 'rgba(231, 76, 60, 0.6)'],
                borderWidth: 2, borderColor: document.body.classList.contains('dark-mode') ? '#1a1a30' : '#ffffff'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

// --- Graph 4: MVP Leaders (Top 5 Bar) ---
function renderHofMvpChart(mvpLeaders) {
    const sortedLeaders = Object.keys(mvpLeaders).sort((a, b) => mvpLeaders[b] - mvpLeaders[a]);
    const top5Leaders = sortedLeaders.slice(0, 5);
    const top5Values = top5Leaders.map(k => mvpLeaders[k]);

    const ctx = document.getElementById('hofMvpChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: top5Leaders,
            datasets: [{
                label: 'Nombre de MVP distinctions',
                data: top5Values,
                backgroundColor: '#f1c40f', // Doré "Shiny"
                borderRadius: 5
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            },
            plugins: { legend: { display: false } }
        }
    });
}
// ==========================================
// 6. SUCCÈS (BADGES)
// ==========================================
const achievementsList = {
    // 1. Paliers Shinys
    first_shiny: { title: "Première Étincelle", desc: "1 Shiny.", icon: "✨" }, 
    shiny_10: { title: "Régulier", desc: "10 Shinys.", icon: "🥉" }, 
    shiny_50: { title: "Pro", desc: "50 Shinys.", icon: "🥈" }, 
    shiny_100: { title: "Maître", desc: "100 Shinys.", icon: "🥇" }, 
    shiny_250: { title: "Grand Maître", desc: "250 Shinys.", icon: "💎" }, 
    shiny_500: { title: "Légende", desc: "500 Shinys.", icon: "👑" }, 
    shiny_all: { title: "Dieu Pokémon", desc: "True Living Dex (1153).", icon: "🌌" },
    
    // 2. Légendaires (NOUVEAU)
    leg_1: { title: "Chasseur de Mythes", desc: "1 Légendaire Shiny.", icon: "☄️" },
    leg_5: { title: "Demi-Dieu", desc: "5 Légendaires Shinys.", icon: "🌩️" },
    leg_10: { title: "Panthéon", desc: "10 Légendaires Shinys.", icon: "🏛️" },

    // 3. Maîtres Régionaux
    master_kanto: { title: "Maître Kanto", desc: "151 Shinys.", icon: "🧬" }, 
    master_johto: { title: "Maître Johto", desc: "100 Shinys.", icon: "🍂" }, 
    master_hoenn: { title: "Maître Hoenn", desc: "135 Shinys.", icon: "🎺" }, 
    master_sinnoh: { title: "Maître Sinnoh", desc: "107 Shinys.", icon: "❄️" }, 
    master_unys: { title: "Maître Unys", desc: "156 Shinys.", icon: "⚡" }, 
    master_kalos: { title: "Maître Kalos", desc: "72 Shinys.", icon: "🗼" }, 
    master_alola: { title: "Maître Alola", desc: "88 Shinys.", icon: "🌴" }, 
    master_galar: { title: "Maître Galar", desc: "89 Shinys.", icon: "🚂" }, 
    master_hisui: { title: "Maître Hisui", desc: "24 Shinys.", icon: "🪵" }, 
    master_paldea: { title: "Maître Paldea", desc: "120 Shinys.", icon: "🍇" },

    // 4. Chance & Douleur
    beni: { title: "Béni", desc: "< 5 rencontres.", icon: "👼" }, 
    lucky: { title: "Insolent", desc: "< 50 rencontres.", icon: "🍀" }, 
    pain: { title: "Patience", desc: "> 10 000 rencontres.", icon: "🗿" }, 
    abyss: { title: "Abysses", desc: "> 20 000 rencontres.", icon: "🕳️" }, 
    curse: { title: "Malédiction", desc: "Phase 5.", icon: "⛈️" }, 
    stubborn: { title: "Acharné", desc: "Phase 10.", icon: "🤬" },

    // 5. Méthodes
    purist: { title: "Puriste", desc: "1 Shiny Hasard (Rétro).", icon: "👴" }, 
    god_of_odds: { title: "Dieu du Hasard", desc: "5 Shinys Hasard.", icon: "🎲" }, 
    masuda_master: { title: "Éleveur", desc: "5 Shinys Masuda.", icon: "🥚" }, 
    masuda_god: { title: "Dieu Pension", desc: "20 Shinys Masuda.", icon: "🐣" }, 
    combo_master: { title: "Combo Master", desc: "5 Shinys Let's Go.", icon: "🔗" }, 
    massive_master: { title: "Nettoyeur", desc: "5 Apparitions Massives.", icon: "🧹" }, 
    chain_master: { title: "Maître Radar", desc: "Chaîne de 40.", icon: "📡" },

    // 6. Hall of Fame
    hof_first: { title: "Survivant", desc: "1 Jeu Terminé.", icon: "🎖️" }, 
    hof_nohit: { title: "No Hit Run", desc: "Jeu Terminé (0 mort).", icon: "🛡️" }, 
    hof_miracle: { title: "Miraculé", desc: "Jeu Terminé (1 survivant).", icon: "🩸" }, 
    hof_mvp: { title: "Faiseur Rois", desc: "1 MVP.", icon: "👑" }, 
    hof_emperor: { title: "Empereur", desc: "10 MVP.", icon: "💺" }, 
    hof_death: { title: "Deuil", desc: "1 épitaphe.", icon: "🪦" }, 
    hof_hecatombe: { title: "Hécatombe", desc: "10 morts 1 partie.", icon: "💀" }, 
    hof_gravedigger: { title: "Fossoyeur", desc: "50 morts total.", icon: "⛏️" }, 
    hof_globe: { title: "Globe-Trotter", desc: "5 régions terminées.", icon: "✈️" }, 
    hof_multiverse: { title: "Multivers", desc: "9 régions terminées.", icon: "🌍" }, 
    hof_hackrom: { title: "Hackrom", desc: "1 Fan Game terminé.", icon: "👾" },

    // 7. Formes Spéciales (Méga & Gigamax)
    mega_1: { title: "Gemme Sésame", desc: "1 Méga Shiny.", icon: "🔮" },
    mega_10: { title: "Maître Méga", desc: "10 Mégas Shinys.", icon: "🌀" },
    gmax_1: { title: "Étoile Rouge", desc: "1 Gigamax Shiny.", icon: "☁️" },
    gmax_10: { title: "Colosse", desc: "10 Gigamax Shinys.", icon: "🌋" }
};

function computeAllBadges() {
    // 1. Initialisation des compteurs (ajout de mega et gmax)
    let s = {
        ts:0, maxP:1, maxC:parseInt(localStorage.getItem('max_chain'))||0, h:0, b:false, l:false, p:false, ab:false, 
        mas:0, com:0, msv:0, g1:0, g2:0, g3:0, g4:0, g5:0, g6:0, g7:0, g8:0, hi:0, g9:0, leg:0, mega:0, gmax:0
    };
    const og = ['Rouge', 'Bleu', 'Jaune', 'Or', 'Argent', 'Cristal', 'Rubis', 'Saphir', 'Émeraude', 'Rouge Feu', 'Vert Feuille', 'Diamant', 'Perle', 'Platine', 'HeartGold', 'SoulSilver', 'Noir', 'Blanc', 'Noir 2', 'Blanc 2'];
    
    // Listes de référence (Légendaires, Mégas, Gigamax)
    const legendaries = [144,145,146,150,151,243,244,245,249,250,251,377,378,379,380,381,382,383,384,385,386,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,638,639,640,641,642,643,644,645,646,647,648,649,716,717,718,719,720,721,785,786,787,788,789,790,791,792,800,801,802,807,888,889,890,891,892,894,895,896,897,898,905,1001,1002,1003,1004,1007,1008,1014,1015,1016,1017,1024,1025];
    const megaIDs = [
        10033, 10034, 10035, 10036, 10037, 10038, 10039, 10040, 10041, 10042, 
        10043, 10044, 10045, 10046, 10047, 10048, 10049, 10050, 10051, 10052, 
        10053, 10054, 10055, 10056, 10057, 10058, 10059, 10060, 10062, 10063, 
        10064, 10065, 10066, 10067, 10068, 10069, 10070, 10071, 10072, 10073, 
        10074, 10075, 10076, 10077, 10078, 10086, 10087, 10088, 10089, 10090,
        // --- NOUVELLES MÉGAS LÉGENDES Z-A ---
        20001, 20002, 20003, 20004, 20005, 20006, 20007, 20008, 20009, 20010, 
        20011, 20012, 20013, 20014, 20015, 20016, 20017, 20018, 20019, 20020, 
        20021, 20022, 20023, 20024, 20025, 20026, 20027, 20028, 20029, 20030, 
        20031, 20032, 20033, 20034, 20035, 20036, 20037, 20038, 20039, 20040, 
        20041, 20042, 20043, 20044, 20045
    ];
    const gmaxIDs = [10195, 10196, 10197, 10198, 10199, 10200, 10201, 10202, 10203, 10204, 10205, 10206, 10207, 10208, 10210, 10211, 10212, 10213, 10214, 10215, 10216, 10217, 10218, 10219, 10220, 10221, 10222, 10223, 10224, 10225, 10226, 10227, 10228];

    // 2. Analyse du LocalStorage (Les Shinys)
    for(let i=0; i<localStorage.length; i++){
        const k = localStorage.key(i);
        if(k.startsWith('shiny-') && !k.startsWith('shiny-team-') && localStorage.getItem(k)==='true'){
            s.ts++;
            const id = parseInt(k.split('-')[1]);
            const e = parseInt(localStorage.getItem(`encounters-${id}`))||0;
            const p = parseInt(localStorage.getItem(`phases-${id}`))||1;
            const g = localStorage.getItem(`game-${id}`);
            const m = localStorage.getItem(`method-${id}`);
            
            // On compte les Légendaires et les Formes Spéciales
            if(legendaries.includes(id)) s.leg++; 
            if(megaIDs.includes(id)) s.mega++;
            if(gmaxIDs.includes(id)) s.gmax++;

            // Calculs habituels...
            if(e>0){if(e<5)s.b=true;if(e<50)s.l=true;if(e>=10000)s.p=true;if(e>=20000)s.ab=true;}
            if(p>s.maxP)s.maxP=p;if(m==='Masuda'||m==='MasudaCharme')s.mas++;if(og.includes(g)&&m==='Hasard')s.h++;
            if(m&&m.startsWith('LG_Combo'))s.com++;if(m&&m.startsWith('Massive'))s.msv++;
            
            // Classification par Génération
            if(id<=151)s.g1++;else if(id<=251)s.g2++;else if(id<=386)s.g3++;else if(id<=493)s.g4++;else if(id<=649)s.g5++;else if(id<=721)s.g6++;else if(id<=809)s.g7++;else if(id<=898)s.g8++;else if(id<=905)s.hi++;else if(id<=1025)s.g9++;
        }
    }
    
    // 3. Analyse du Hall of Fame
    let h = {t:false,d:false,hc:false,nh:false,mi:false,hk:false,or:0,mvp:0,td:0};
    let rs = new Set();
    
    let officialRuns = JSON.parse(localStorage.getItem('custom-official-runs')) || [];
    let hackromRuns = JSON.parse(localStorage.getItem('hackrom-runs')) || [];
    let allSavedRuns = [...officialRuns, ...hackromRuns];

    allSavedRuns.forEach(run => {
        let tc=0;
        for(let i=1;i<=6;i++) { 
            if(localStorage.getItem(`team-${run.id}-${i}-id`)) tc++;
            if(localStorage.getItem(`ribbon-${run.id}-${i}`)==='mvp') h.mvp++;
        }
        
        let gl=JSON.parse(localStorage.getItem(`grave-list-${run.id}`))||[];
        let d=gl.length;
        h.td+=d;
        if(d>0) h.d=true;
        if(d>=10) h.hc=true;
        
        let isCompleted = localStorage.getItem(`status-${run.id}`) === 'completed';

        if(isCompleted) {
            h.t = true; // Survivant (1 jeu terminé)
            if(d === 0) h.nh = true; // No Hit Run (Terminé avec 0 mort)
            if(tc === 1) h.mi = true; // Miraculé (Terminé avec 1 seul Pokémon)
            
            if(hackromRuns.find(x => x.id === run.id)) {
                h.hk=true; 
            } else {
                let parts = run.name.split(' - ');
                let region = parts.length > 1 ? parts[0] : run.name.split(' (')[0];
                rs.add(region);
            }
        }
    });
    
    h.or = rs.size;

    // 4. RETOUR DES RÉSULTATS (Validation des succès)
    return {
        // Paliers & Légendaires
        'first_shiny': s.ts >= 1, 'shiny_10': s.ts >= 10, 'shiny_50': s.ts >= 50, 'shiny_100': s.ts >= 100, 'shiny_250': s.ts >= 250, 'shiny_500': s.ts >= 500, 'shiny_all': s.ts >= 1153,
        'leg_1': s.leg >= 1, 'leg_5': s.leg >= 5, 'leg_10': s.leg >= 10,
        
        // Régions
        'master_kanto': s.g1 >= 151, 'master_johto': s.g2 >= 100, 'master_hoenn': s.g3 >= 135, 'master_sinnoh': s.g4 >= 107, 'master_unys': s.g5 >= 156, 'master_kalos': s.g6 >= 72, 'master_alola': s.g7 >= 88, 'master_galar': s.g8 >= 89, 'master_hisui': s.hi >= 24, 'master_paldea': s.g9 >= 120,
        
        // Méthodes & Douleur
        'beni': s.b, 'lucky': s.l, 'pain': s.p, 'abyss': s.ab, 'curse': s.maxP >= 5, 'stubborn': s.maxP >= 10,
        'purist': s.h >= 1, 'god_of_odds': s.h >= 5, 'masuda_master': s.mas >= 5, 'masuda_god': s.mas >= 20, 'combo_master': s.com >= 5, 'massive_master': s.msv >= 5, 'chain_master': s.maxC >= 40,
        
        // Hall of Fame
        'hof_first': h.t, 'hof_nohit': h.nh, 'hof_miracle': h.mi, 'hof_mvp': h.mvp >= 1, 'hof_emperor': h.mvp >= 10, 'hof_death': h.d, 'hof_hecatombe': h.hc, 'hof_gravedigger': h.td >= 50, 'hof_globe': h.or >= 5, 'hof_multiverse': h.or >= 9, 'hof_hackrom': h.hk,
        
        // --- NOUVEAUX : Formes Spéciales ---
        'mega_1': s.mega >= 1, 'mega_10': s.mega >= 10,
        'gmax_1': s.gmax >= 1, 'gmax_10': s.gmax >= 10
    };
}

function checkAchievements() { let n=[]; const s=computeAllBadges(); Object.keys(achievementsList).forEach(c=>{const w=localStorage.getItem(`badge_state_${c}`)==='true';const is=s[c]||false;if(!w&&is){n.push(c);localStorage.setItem(`badge_state_${c}`,'true');}else if(w&&!is)localStorage.setItem(`badge_state_${c}`,'false');}); if(n.length>0)n.forEach(c=>showBadgeToast(c)); const b=document.getElementById('badges-section'); if(b&&b.style.display==='block')renderBadges(); }
function renderBadges() { const g=document.getElementById('badges-grid'); if(!g)return; g.innerHTML=''; Object.keys(achievementsList).forEach(c=>{const b=achievementsList[c];const u=localStorage.getItem(`badge_state_${c}`)==='true';g.innerHTML+=`<div class="badge-card ${u?'badge-unlocked':'badge-locked'}"><div class="badge-icon">${b.icon}</div><div class="badge-info"><h4>${b.title}</h4><p>${u?b.desc:'🔒 Verrouillé'}</p></div></div>`;}); }
function showBadgeToast(badgeId) {
    // 1. On récupère les infos du succès
    const badge = achievementsList[badgeId];
    if (!badge) return;

    // 2. On cible le conteneur (qui est bien dans ton HTML)
    const container = document.getElementById('toast-container');
    if (!container) return;

    // 3. On crée la notification
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div class="toast-icon">${badge.icon}</div>
        <div class="toast-content">
            <h4>Succès Déverrouillé !</h4>
            <p>${badge.title}</p>
        </div>
    `;

    // 4. On l'ajoute à la page
    container.appendChild(toast);

    // 5. On déclenche l'animation d'apparition
    // (Le très léger délai permet au navigateur de comprendre qu'il doit animer)
    setTimeout(() => {
        toast.classList.add('show');
    }, 50);

    // 6. On la supprime après 4 secondes
    setTimeout(() => {
        toast.classList.remove('show');
        // On attend la fin de l'animation de sortie (400ms) avant de supprimer le HTML
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, 4000);
}
function checkRetroactiveAchievements() { const s=computeAllBadges(); Object.keys(achievementsList).forEach(c=>{localStorage.setItem(`badge_state_${c}`,s[c]?'true':'false');}); }

// ==========================================
// 7. PROFIL DRESSEUR & TRAINER CARD (VIP DESIGN)
// ==========================================
const trainerAvatars = ['red', 'leaf', 'ethan', 'lyra', 'brendan', 'may', 'lucas', 'dawn', 'hilbert', 'hilda', 'nate', 'rosa', 'calem', 'serena', 'sun', 'moon', 'victor', 'gloria', 'cynthia', 'steven', 'leon'];

function openProfileModal() {
    const grid = document.getElementById('avatar-grid');
    grid.innerHTML = '';
    const savedAvatar = localStorage.getItem('profile-avatar') || 'red';
    
    document.getElementById('profile-name-input').value = localStorage.getItem('profile-name') || '';
    document.getElementById('profile-avatar-input').value = savedAvatar;

    trainerAvatars.forEach(avatar => {
        const div = document.createElement('div');
        div.className = `avatar-option ${savedAvatar === avatar ? 'selected' : ''}`;
        div.onclick = () => selectAvatar(avatar, div);
        div.innerHTML = `<img src="https://play.pokemonshowdown.com/sprites/trainers/${avatar}.png" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'">`;
        grid.appendChild(div);
    });

    document.getElementById('profile-modal').style.display = 'flex';
}

function selectAvatar(avatar, element) {
    document.getElementById('profile-avatar-input').value = avatar;
    document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
}

function saveProfile() {
    const name = document.getElementById('profile-name-input').value.trim();
    const avatar = document.getElementById('profile-avatar-input').value;
    localStorage.setItem('profile-name', name || 'Dresseur');
    localStorage.setItem('profile-avatar', avatar);
    document.getElementById('profile-modal').style.display = 'none';
}

function openTrainerCard() {
    let totalShiny = 0; let totalEncounters = 0; let shinyList = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Sécurité HoF
        if (key.startsWith('shiny-') && !key.startsWith('shiny-team-') && localStorage.getItem(key) === 'true') {
            totalShiny++; 
            const id = key.split('-')[1];
            const encounters = parseInt(localStorage.getItem(`encounters-${id}`)) || 0;
            totalEncounters += encounters; 
            shinyList.push({ id: id, encounters: encounters });
        }
    }

    let unlockedBadges = 0;
    Object.keys(achievementsList).forEach(code => { if (localStorage.getItem(`badge_state_${code}`) === 'true') unlockedBadges++; });

    shinyList.sort((a, b) => b.encounters - a.encounters);
    const top6 = shinyList.slice(0, 6);

    const tName = localStorage.getItem('profile-name') || 'Dresseur';
    const tAvatar = localStorage.getItem('profile-avatar') || 'red';
    document.getElementById('tc-trainer-name').textContent = tName;
    document.getElementById('tc-trainer-sprite').src = `https://play.pokemonshowdown.com/sprites/trainers/${tAvatar}.png`;

    document.getElementById('tc-total-shiny').textContent = totalShiny;
    document.getElementById('tc-total-encounters').textContent = totalEncounters.toLocaleString('fr-FR');
    document.getElementById('tc-total-badges').textContent = `${unlockedBadges} / 41`;

    const teamGrid = document.getElementById('tc-team-grid');
    teamGrid.innerHTML = '';
    
    top6.forEach(poke => {
        teamGrid.innerHTML += `
            <div style="background: rgba(255,255,255,0.03); border-radius: 12px; padding: 10px; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid rgba(255,255,255,0.05); height: 100%; box-sizing: border-box;">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${poke.id}.png" style="height: 65px; filter: drop-shadow(0 5px 10px rgba(0,0,0,0.8)); margin-bottom: 5px;">
                <div style="font-size: 12px; font-weight: bold; color: #d4af37; letter-spacing: 0.5px;">
                    ${poke.encounters.toLocaleString('fr-FR')} <span style="font-size: 9px; color: #888; font-weight: normal; text-transform: lowercase;">vues</span>
                </div>
            </div>
        `;
    });
    
    for(let i = top6.length; i < 6; i++) {
        teamGrid.innerHTML += `
            <div style="background: rgba(0,0,0,0.2); border: 1px dashed rgba(255,255,255,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; height: 100%; box-sizing: border-box;">
                <div style="width: 20px; height: 20px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.05);"></div>
            </div>
        `;
    }

    document.getElementById('trainer-card-modal').style.display = 'flex';
}

function downloadTrainerCard() {
    const cardElement = document.getElementById('trainer-card-capture');
    if(!cardElement) return;

    html2canvas(cardElement, {
        backgroundColor: null,
        scale: 2, 
        useCORS: true 
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Ma_Licence_Shiny_${new Date().toISOString().slice(0,10)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

// ==========================================
// 8. OUTILS ET RECHERCHE
// ==========================================
async function searchShiny() { 
    let q = document.getElementById('search-shiny-input').value.toLowerCase().trim(); 
    if(q === "") { resetSearch(); return; } 
    pokedexGrid.innerHTML = 'Recherche...'; currentHuntId = null; closeLiveHunt(); 
    
    // MAGIE : Recherche inversée (Français -> ID)
    for (let [id, nameFr] of Object.entries(pokemonFrDict)) {
        if (nameFr.toLowerCase() === q) { q = id; break; }
    }

    try{
        const res=await fetch(`https://pokeapi.co/api/v2/pokemon/${q}`);
        if(!res.ok)throw new Error();
        const d=await res.json();
        const frName = getPokemonName(d.id, d.name);
        document.getElementById('gen-title').textContent=`Résultat : ${frName}`;
        pokedexGrid.innerHTML=''; currentListIds=[d.id];
        createPokemonCard(d.id, d.name); updateDashboard();
    }catch(e){pokedexGrid.innerHTML='Pokémon introuvable.';} 
}
function resetSearch() { 
    document.getElementById('search-shiny-input').value=''; 
    loadTrueLivingDex(); 
}
function exportData() { const d={}; for(let i=0;i<localStorage.length;i++)d[localStorage.key(i)]=localStorage.getItem(localStorage.key(i)); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify(d)],{type:'application/json'})); a.download=`pokedex_data_${new Date().toISOString().slice(0,10)}.json`; a.click(); }
function importData() { const i=document.createElement('input'); i.type='file'; i.accept='.json'; i.onchange=e=>{const r=new FileReader(); r.onload=ev=>{try{const d=JSON.parse(ev.target.result);localStorage.clear();Object.keys(d).forEach(k=>localStorage.setItem(k,d[k]));alert("Données chargées !");location.reload();}catch(err){alert("JSON invalide.");}}; r.readAsText(e.target.files[0]);}; i.click(); }
function toggleTheme() {
    const body = document.body;
    const themeBtn = document.getElementById('theme-toggle');
    
    // Bascule la classe 'dark-mode'
    body.classList.toggle('dark-mode');
    
    // Si on est en dark mode, on affiche le soleil pour revenir au jour
    if (body.classList.contains('dark-mode')) {
        themeBtn.textContent = '☀️'; 
    } else {
        themeBtn.textContent = '🌙'; // Par défaut (Light), on affiche la lune
    }
}
function loadTheme() { if(localStorage.getItem('darkMode')==='true')document.body.classList.add('dark-mode'); document.getElementById('btn-theme').textContent=document.body.classList.contains('dark-mode')?'☀️':'🌙'; }

function openRandomHuntModal() { 
    document.getElementById('random-hunt-modal').style.display='flex'; document.getElementById('random-hunt-content').style.display='none'; document.getElementById('random-hunt-loading').style.display='block'; let u=[]; for(let i=1;i<=1025;i++)if(localStorage.getItem(`shiny-${i}`)!=='true')u.push(i); if(u.length===0){document.getElementById('random-hunt-loading').style.display='none';document.getElementById('random-hunt-content').style.display='block';document.getElementById('random-hunt-error').textContent="Tu as tous les Shinys !";document.getElementById('random-hunt-error').style.display='block';return;} const r=u[Math.floor(Math.random()*u.length)]; 
    fetch(`https://pokeapi.co/api/v2/pokemon/${r}`).then(res=>res.json()).then(d=>{
        const frName = getPokemonName(d.id, d.name); // TRADUCTION ICI
        document.getElementById('random-hunt-img').src=`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${d.id}.png`;
        document.getElementById('random-hunt-name').textContent=`#${d.id} ${frName}`;
        document.getElementById('btn-accept-random').onclick=()=>{
            closeRandomModal();
            document.getElementById('gen-title').textContent="🎯 Défi Aléatoire !";
            pokedexGrid.innerHTML='';
            currentListIds=[d.id];
            createPokemonCard(d.id, d.name);
            updateDashboard();
            setTimeout(()=>setAsCurrentHunt(d.id, frName),100);
        };
        document.getElementById('random-hunt-loading').style.display='none';
        document.getElementById('random-hunt-content').style.display='block';
    }); 
}
// --- L'AIGUILLEUR CONTEXTUEL DU BOUTON DÉ ---
function triggerSmartRandom() {
    // Si on est sur l'onglet Hall of Fame -> Défi Nuzlocke
    if (document.getElementById('hof-section').style.display === 'block') {
        openRandomChallengeModal();
    } 
    // Sinon (Tracking Shiny, Pokédex, etc.) -> Shasse Aléatoire
    else {
        openRandomHuntModal();
    }
}

// --- GÉNÉRATEUR DE DÉFIS NUZLOCKE ---
const nuzlockeRules = ["Hardcore Nuzlocke", "Monotype (Eau)", "Monotype (Feu)", "Monotype (Plante)", "Wedlocke", "Shinylocke", "Trashlocke", "Soul Link", "Nuzlocke Classique", "Généralocke (Étape 1)", "Little Cup (Pas d'évolution)"];
const hackromList = ["Radical Red", "Renegade Platinum", "Emerald Kaizo", "Unbound", "Sacred Gold", "Storm Silver", "Inclement Emerald", "Polished Crystal"];
const officialGamesList = ["Rouge/Bleu", "Jaune", "Or/Argent", "Cristal", "Rubis/Saphir", "Émeraude", "Rouge Feu/Vert Feuille", "Diamant/Perle", "Platine", "HeartGold/SoulSilver", "Noir/Blanc", "Noir 2/Blanc 2", "X/Y", "Rubis Oméga/Saphir Alpha", "Soleil/Lune", "Ultra-Soleil/Ultra-Lune", "Épée/Bouclier", "Écarlate/Violet"];

function openRandomChallengeModal() { 
    document.getElementById('random-challenge-modal').style.display = 'flex'; 
    document.getElementById('random-challenge-content').style.display = 'none'; 
    document.getElementById('random-challenge-loading').style.display = 'block'; 
    
    setTimeout(() => {
        // 70% de chance Jeu Officiel, 30% Hackrom
        const isHackrom = Math.random() > 0.7; 
        const gameName = isHackrom ? hackromList[Math.floor(Math.random() * hackromList.length)] : officialGamesList[Math.floor(Math.random() * officialGamesList.length)];
        const rule = nuzlockeRules[Math.floor(Math.random() * nuzlockeRules.length)];
        
        document.getElementById('random-game-icon').textContent = isHackrom ? '👾' : '🎮';
        document.getElementById('random-game-name').textContent = gameName;
        document.getElementById('random-game-rule').textContent = rule;
        
        document.getElementById('btn-accept-challenge').onclick = () => {
            document.getElementById('random-challenge-modal').style.display = 'none';
            const runId = (isHackrom ? 'hackrom-' : 'offrun-') + Date.now();
            let c = JSON.parse(localStorage.getItem(isHackrom ? 'custom-hackroms' : 'custom-official-runs')) || []; 
            c.push({id: runId, name: `${gameName} - ${rule}`}); 
            localStorage.setItem(isHackrom ? 'custom-hackroms' : 'custom-official-runs', JSON.stringify(c)); 
            localStorage.setItem(`status-${runId}`, 'progress'); // Démarre en statut "En cours"
            
            showSection('hof'); 
            showHofTab(isHackrom ? 'hackrom' : 'official');
            renderHallOfFame(); 
        };
        
        document.getElementById('random-challenge-loading').style.display = 'none';
        document.getElementById('random-challenge-content').style.display = 'block';
    }, 600);
}
function closeRandomModal() { document.getElementById('random-hunt-modal').style.display='none'; }
// ==========================================
// 9. POKÉDEX NATIONAL COMPLET (FICHE)
// ==========================================

// Gestion des sous-onglets
function showDexTab(tabName) {
    // Cache tous les contenus
    ['infos', 'moves', 'locations', 'hunting'].forEach(t => {
        document.getElementById(`dex-tab-${t}`).style.display = 'none';
    });
    // Retire la classe 'active' de tous les boutons
    document.querySelectorAll('.dex-tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Affiche le bon contenu et active le bouton
    document.getElementById(`dex-tab-${tabName}`).style.display = 'block';
    event.currentTarget.classList.add('active');
}

// Fonction de recherche (Barre interne)
async function searchDex() {
    let q = document.getElementById('dex-search-input').value.toLowerCase().trim();
    if (!q) return;
    
    // MAGIE : Recherche inversée (Français -> ID)
    for (let [id, nameFr] of Object.entries(pokemonFrDict)) {
        if (nameFr.toLowerCase() === q) { q = id; break; }
    }
    
    document.getElementById('dex-empty-state').style.display = 'none';
    document.getElementById('dex-card-container').style.display = 'none';
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${q}`);
        if(!res.ok) throw new Error();
        const data = await res.json();
        loadDexPokemon(data.id);
    } catch(e) { alert("Pokémon introuvable dans le Pokédex."); }
}
function jumpToDex(id) {
    if (!id) return;
    
    // MAGIE : On force la conversion du texte en vrai nombre entier !
    const numericId = parseInt(id, 10); 
    
    showSection('pokedex');
    loadDexPokemon(numericId);
}

// Chargement basique de la fiche (Sera complété à l'étape 2)
async function loadDexPokemon(id) {
    // --- INTERCEPTEUR POUR FORMES CUSTOM Z-A ---
    // Si l'ID est >= 20000 et qu'on l'a dans notre base custom
    if (id >= 20000 && typeof CUSTOM_MEGA_DATA !== 'undefined' && CUSTOM_MEGA_DATA[id]) {
        const customData = CUSTOM_MEGA_DATA[id];
        // On effectue le rendu de la carte en local, sans appeler l'API !
        if (typeof renderCustomCardLocal === "function") {
            renderCustomCardLocal(id, customData);
        } else {
            console.error("La fonction renderCustomCardLocal n'existe pas !");
        }
        return; // On arrête là la fonction, mission accomplie !
    }
    // -----------------------------------------------------

    if (id < 1 || id > 1025) {
        // Permettre le chargement des autres formes PokeAPI (Mégas Gen 6, Gigamax)
        if (!(id >= 10000 && id < 20000)) return; 
    }
    
    currentDexId = id;
    
    document.getElementById('dex-empty-state').style.display = 'none';
    document.getElementById('dex-card-container').style.display = 'block';
    
    // On vide l'onglet info pour afficher un chargement propre
    document.getElementById('dex-tab-infos').innerHTML = '<div style="text-align:center; padding: 40px; color: #888;">Analyse des données en cours... 🔄</div>';
    
    try {
        // 1. Récupération des données basiques
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!res.ok) throw new Error("Pokémon introuvable sur PokeAPI");
        const data = await res.json();
        
        // 2. Mise à jour du Header
        document.getElementById('dex-id').textContent = `#${String(id).padStart(4, '0')}`;
        document.getElementById('dex-name-fr').textContent = getPokemonName(id, data.name);
        document.getElementById('dex-name-en').textContent = capitalized(data.name);
        document.getElementById('dex-sprite').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
        
        // Affichage des Types
        const typesDiv = document.getElementById('dex-types');
        typesDiv.innerHTML = data.types.map(t => {
            const typeColor = (typeof typeColors !== 'undefined' && typeColors[t.type.name]) ? typeColors[t.type.name] : '#777';
            const typeTrans = (typeof typeTranslations !== 'undefined' && typeTranslations[t.type.name]) ? typeTranslations[t.type.name] : capitalized(t.type.name);
            return `<span class="type-badge" style="background-color: ${typeColor}">${typeTrans}</span>`;
        }).join('');
        
        // 3. Mise à jour des boutons Suivant/Précédent (Adapté pour ne pas planter sur les formes spéciales)
        const prevBtn = document.getElementById('dex-btn-prev'); const nextBtn = document.getElementById('dex-btn-next');
        if(id > 1 && id <= 1025) { 
            prevBtn.style.visibility = 'visible'; 
            document.getElementById('dex-prev-img').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id - 1}.png`; 
            document.getElementById('dex-prev-name').textContent = `#${String(id - 1).padStart(4, '0')} ${getPokemonName(id - 1)}`; 
        } else { prevBtn.style.visibility = 'hidden'; }
        
        if(id < 1025) { 
            nextBtn.style.visibility = 'visible'; 
            document.getElementById('dex-next-img').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id + 1}.png`; 
            document.getElementById('dex-next-name').textContent = `#${String(id + 1).padStart(4, '0')} ${getPokemonName(id + 1)}`; 
        } else { nextBtn.style.visibility = 'hidden'; }
        
        // Force l'affichage du premier onglet
        const firstTabBtn = document.querySelector('.dex-tab-btn');
        if(firstTabBtn) firstTabBtn.click();

        // 4. RÉCUPÉRATION DES DONNÉES AVANCÉES (Espèce + Évolution)
        try {
            // Pour les formes alternatives (Mégas 10000+), on cherche l'espèce de base
            let speciesId = id;
            if (id > 10000) {
                const speciesUrlParts = data.species.url.split('/');
                speciesId = speciesUrlParts[speciesUrlParts.length - 2];
            }

            const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${speciesId}`);
            if (!speciesRes.ok) throw new Error("Espèce introuvable");
            const speciesData = await speciesRes.json();
            
            // Description FR
            const frEntry = speciesData.flavor_text_entries.find(e => e.language.name === 'fr');
            let flavorText = frEntry ? frEntry.flavor_text.replace(/[\n\f]/g, ' ') : "Description non disponible en français.";

            // Calcul Mathématique des Faiblesses
            let multipliers = {};
            if (typeof typeColors !== 'undefined') {
                Object.keys(typeColors).forEach(t => multipliers[t] = 1);
            }
            
            if (typeof typeMatrix !== 'undefined') {
                data.types.forEach(t => {
                    const defType = t.type.name; const matrix = typeMatrix[defType];
                    if (matrix) Object.keys(matrix).forEach(atk => { multipliers[atk] *= matrix[atk]; });
                });
            }
            
            let weak = [], resist = [], immun = [];
            Object.keys(multipliers).forEach(t => {
                if (multipliers[t] >= 2) weak.push({type: t, mult: multipliers[t]});
                else if (multipliers[t] === 0) immun.push({type: t, mult: 0});
                else if (multipliers[t] < 1) resist.push({type: t, mult: multipliers[t]});
            });

            const renderTags = (arr) => arr.map(t => {
                const bgCol = typeColors ? typeColors[t.type] : '#777';
                const trans = typeTranslations ? typeTranslations[t.type] : capitalized(t.type);
                return `<span class="type-badge" style="background-color: ${bgCol}; display:inline-block; margin:3px; font-size:10px;">${trans} (x${t.mult})</span>`;
            }).join('');
            
            let weakHtml = `
                <h4 style="margin-top:35px; text-align:center; color: var(--text-color);">📊 Affinités de Types</h4>
                <div class="weakness-grid">
                    <div class="weakness-col"><div style="font-weight:900; color:#e74c3c; margin-bottom:10px; text-transform:uppercase; font-size:12px;">Faiblesses</div>${weak.length > 0 ? renderTags(weak) : '<span style="color:#888;font-size:12px;">Aucune</span>'}</div>
                    <div class="weakness-col"><div style="font-weight:900; color:#2ecc71; margin-bottom:10px; text-transform:uppercase; font-size:12px;">Résistances</div>${resist.length > 0 ? renderTags(resist) : '<span style="color:#888;font-size:12px;">Aucune</span>'}</div>
                    <div class="weakness-col"><div style="font-weight:900; color:#95a5a6; margin-bottom:10px; text-transform:uppercase; font-size:12px;">Immunités</div>${immun.length > 0 ? renderTags(immun) : '<span style="color:#888;font-size:12px;">Aucune</span>'}</div>
                </div>`;

            // --- Arbre d'évolution ---
            let evoHtml = `<h4 style="margin-top:35px; text-align:center; color: var(--text-color);">🧬 Famille d'Évolution</h4><div class="evo-chain" style="display:flex; flex-wrap:wrap; justify-content:center; gap:15px; border:none; padding:0; background:transparent;">`;
            
            try {
                if (speciesData.evolution_chain && speciesData.evolution_chain.url) {
                    const evoRes = await fetch(speciesData.evolution_chain.url);
                    const evoData = await evoRes.json();
                    
                    // Fonction magique de base pour éviter de polluer avec tout le dico si besoin
                    const getEvoMethod = (details) => {
                        if (!details || details.length === 0) return '?';
                        return 'Évolution'; // Version simplifiée pour la sécurité, tu pourras remettre ton dico complet si ça marche
                    };

                    let edges = [];
                    const extractEdges = (node) => {
                        const fromId = node.species.url.split('/')[6];
                        node.evolves_to.forEach(next => {
                            const toId = next.species.url.split('/')[6];
                            edges.push({ from: fromId, to: toId, method: getEvoMethod(next.evolution_details) });
                            extractEdges(next);
                        });
                    };
                    extractEdges(evoData.chain);
                    
                    if (edges.length === 0) {
                        const singleId = evoData.chain.species.url.split('/')[6];
                        evoHtml += `
                            <div class="evo-item" onclick="loadDexPokemon(${singleId})" style="background:var(--card-bg); padding:15px; border-radius:15px; box-shadow:var(--shadow); border:1px solid rgba(128,128,128,0.2);">
                                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${singleId}.png" style="width:80px; height:80px;">
                                <div style="font-size:14px; font-weight:900; margin-top:8px; color: var(--text-color);">${getPokemonName(singleId)}</div>
                                <div style="font-size:11px; color:#888; margin-top:5px; font-style:italic;">N'évolue pas</div>
                            </div>`;
                    } else {
                        edges.forEach(edge => {
                            evoHtml += `
                            <div style="display:flex; align-items:center; gap:10px; background:var(--card-bg); padding:10px 15px; border-radius:15px; box-shadow:var(--shadow); border:1px solid rgba(128,128,128,0.2);">
                                <div class="evo-item" onclick="loadDexPokemon(${edge.from})" style="margin:0;">
                                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${edge.from}.png" style="width:60px; height:60px; padding:2px;">
                                    <div style="font-size:12px; font-weight:900; margin-top:5px; color: var(--text-color);">${getPokemonName(edge.from)}</div>
                                </div>
                                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-width:90px; padding: 0 10px;">
                                    <span style="font-size:10px; background:var(--accent-blue); color:white; padding:4px 8px; border-radius:10px; font-weight:bold; text-align:center; white-space:nowrap; margin-bottom:5px;">${edge.method}</span>
                                    <span style="color:#ccc; font-size:16px;">➡️</span>
                                </div>
                                <div class="evo-item" onclick="loadDexPokemon(${edge.to})" style="margin:0;">
                                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${edge.to}.png" style="width:60px; height:60px; padding:2px;">
                                    <div style="font-size:12px; font-weight:900; margin-top:5px; color: var(--text-color);">${getPokemonName(edge.to)}</div>
                                </div>
                            </div>`;
                        });
                    }
                    evoHtml += `</div>`;
                } else {
                    evoHtml += `<div style="text-align:center; color:#888; font-style:italic;">Données d'évolution indisponibles.</div></div>`;
                }
            } catch(e) { 
                evoHtml += `<div style="text-align:center; color:#888; font-style:italic;">Erreur de chargement des évolutions.</div></div>`; 
            }

            document.getElementById('dex-tab-infos').innerHTML = `
                <div style="background: rgba(0,0,0,0.03); padding: 20px; border-radius: 12px; border-left: 4px solid var(--accent-blue);">
                    <p style="margin:0; text-align: justify; font-style: italic; color: #555; font-size: 15px; line-height: 1.6;">"${flavorText}"</p>
                </div>
                ${weakHtml}
                ${evoHtml}
            `;
            
        } catch (error) {
            console.error(error);
            document.getElementById('dex-tab-infos').innerHTML = '<div style="text-align:center; color:#e74c3c;">Erreur lors du chargement des données d\'espèce.</div>';
        }

        // --- 5. ATTAQUES ---
        try {
            let levelMoves = []; let tmMoves = []; let eggMoves = [];
            data.moves.forEach(m => {
                const latestDetails = m.version_group_details[m.version_group_details.length - 1];
                if(!latestDetails) return;
                
                const moveNameRaw = m.move.name;
                const moveNameFr = (typeof moveFrDict !== 'undefined' && moveFrDict[moveNameRaw]) ? moveFrDict[moveNameRaw] : moveNameRaw.split('-').map(capitalized).join(' ');
                const method = latestDetails.move_learn_method.name;
                const level = latestDetails.level_learned_at;

                if (method === 'level-up') levelMoves.push({ name: moveNameFr, level: level });
                else if (method === 'machine') tmMoves.push(moveNameFr);
                else if (method === 'egg') eggMoves.push(moveNameFr);
            });

            levelMoves.sort((a, b) => a.level - b.level);
            levelMoves = levelMoves.filter((v,i,a) => a.findIndex(t => (t.name === v.name && t.level === v.level)) === i);
            tmMoves.sort(); eggMoves.sort(); 

            const renderMoveBadge = (name, type) => {
                const color = type === 'ct' ? 'rgba(52, 152, 219, 0.1)' : 'rgba(46, 204, 113, 0.1)';
                const textColor = type === 'ct' ? 'var(--accent-blue)' : '#27ae60';
                const borderColor = type === 'ct' ? 'rgba(52, 152, 219, 0.3)' : 'rgba(46, 204, 113, 0.3)';
                return `<span style="background:${color}; color:${textColor}; padding: 8px 15px; border-radius: 50px; font-size: 13px; font-weight: bold; border: 1px solid ${borderColor}; display: inline-block; box-shadow: 0 2px 5px rgba(0,0,0,0.03);">${name}</span>`;
            };

            let movesHtml = `<div style="display:flex; flex-direction:column; gap:30px; width:100%;">`;
            movesHtml += `<div><h4 style="color:var(--accent-blue); margin-top:0; margin-bottom:15px; font-size:18px;">📈 Apprises par Niveau</h4>
            <div style="border-radius: 8px; border: 1px solid #eee; background: var(--card-bg); overflow: hidden;"><table class="moves-table"><tr><th style="width:50px;">Niv.</th><th>Attaque</th></tr>`;
            levelMoves.forEach(m => { movesHtml += `<tr><td style="color:#888; font-weight:900;">${m.level === 0 ? 'Évo' : m.level}</td><td style="color:var(--text-color);">${m.name}</td></tr>`; });
            movesHtml += `</table></div></div>`;
            movesHtml += `<div><h4 style="color:#e74c3c; margin-top:0; margin-bottom:15px; font-size:18px;">💿 Capsules Techniques (CT)</h4><div style="display: flex; flex-wrap: wrap; gap: 8px;">${tmMoves.length > 0 ? tmMoves.map(m => renderMoveBadge(m, 'ct')).join('') : '<div style="color:#888;font-style:italic;">Aucune</div>'}</div></div>`;
            movesHtml += `<div><h4 style="color:#2ecc71; margin-top:0; margin-bottom:15px; font-size:18px;">🥚 Reproduction (Egg Moves)</h4><div style="display: flex; flex-wrap: wrap; gap: 8px;">${eggMoves.length > 0 ? eggMoves.map(m => renderMoveBadge(m, 'egg')).join('') : '<div style="color:#888;font-style:italic;">Aucune</div>'}</div></div></div>`;
            
            document.getElementById('dex-tab-moves').innerHTML = movesHtml;
        } catch(e) {
            document.getElementById('dex-tab-moves').innerHTML = '<div style="text-align:center; color:#e74c3c; padding: 20px;">Erreur de chargement des attaques.</div>';
        }

        // --- 6. LOCALISATIONS ---
        try {
            document.getElementById('dex-tab-locations').innerHTML = '<div style="text-align:center; padding: 40px; color: #888;">Recherche spatio-temporelle de l\'habitat... 🌍</div>';
            const encRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/encounters`);
            const encData = await encRes.json();
            
            if (encData.length === 0) {
                document.getElementById('dex-tab-locations').innerHTML = `<div style="text-align:center; padding: 40px; color: #888; font-style:italic; background:rgba(0,0,0,0.02); border-radius:12px;">Introuvable à l'état sauvage de façon classique.<br><span style="font-size:12px;">(Évolution, Événement, Œuf ou Fossile uniquement).</span></div>`;
            } else {
                let gamesMap = {};
                encData.forEach(enc => {
                    let words = enc.location_area.name.replace(/-/g, ' ').replace('area', '').trim().split(' ');
                    let cleanArea = words.map(capitalized).join(' ');
                    
                    enc.version_details.forEach(vd => {
                        const gNameRaw = vd.version.name;
                        const gNameFr = (typeof versionFrDict !== 'undefined' && versionFrDict[gNameRaw]) ? versionFrDict[gNameRaw] : gNameRaw.split('-').map(capitalized).join(' ');
                        
                        if(!gamesMap[gNameFr]) gamesMap[gNameFr] = new Set();
                        gamesMap[gNameFr].add(cleanArea);
                    });
                });
                
                let locHtml = `<div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:15px;">`;
                Object.keys(gamesMap).forEach(g => {
                    locHtml += `<div class="location-card"><div class="location-game">🎮 Version ${g}</div><div class="location-area" style="font-weight:bold;">${Array.from(gamesMap[g]).join('<br>📍 ')}</div></div>`;
                });
                locHtml += `</div>`;
                document.getElementById('dex-tab-locations').innerHTML = locHtml;
            }
        } catch(e) {
            document.getElementById('dex-tab-locations').innerHTML = `<div style="text-align:center; color:#e74c3c; padding: 20px;">Le Pokédex n'a pas pu charger les localisations.</div>`;
        }

        // --- 7. SHASSE ---
        try {
            document.getElementById('dex-tab-hunting').innerHTML = '<div style="text-align:center; padding: 40px; color: #888;">Calcul de l\'algorithme en cours... 🔄</div>';
            
            // On cherche l'espèce de base si c'est une forme alternative
            let speciesId = id;
            if (id > 10000) {
                const speciesUrlParts = data.species.url.split('/');
                speciesId = speciesUrlParts[speciesUrlParts.length - 2];
            }
            
            const specRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${speciesId}`);
            const specData = await specRes.json();
            
            let huntTitle = "Méthode Classique"; let huntGame = "Jeu le plus récent"; let huntMethod = "Œufs (Méthode Masuda)"; let huntOdds = "1/512 (Avec Charme)"; let huntColor = "var(--accent-orange)";
            const isLegendary = specData.is_legendary || specData.is_mythical;

            if (isLegendary) {
                huntTitle = "Traque Légendaire"; huntMethod = "Expéditions Dynamax / Soft Reset"; huntOdds = "1/100 (Dynamax) ou 1/1365"; huntGame = "Épée & Bouclier (DLC) / Ultra-Soleil & Lune"; huntColor = "#9b59b6"; 
            } else if (id <= 151) { 
                huntTitle = "Shasse Ultra-Rapide"; huntMethod = "Combo Capture (31+) + Charme + Parfum"; huntOdds = "1/273"; huntGame = "Let's Go Pikachu / Évoli"; huntColor = "#f1c40f"; 
            } else if (id <= 493 || id === 722 || id === 723 || id === 724) { 
                huntTitle = "Exploration de Hisui"; huntMethod = "Apparitions Massives (Niv. Dex 10 + Charme)"; huntOdds = "1/137"; huntGame = "Légendes Pokémon : Arceus"; huntColor = "#27ae60"; 
            } else {
                huntTitle = "Shasse Moderne"; huntMethod = "Apparition Massive + Sandwich Brillance Nv. 3"; huntOdds = "1/512"; huntGame = "Écarlate / Violet"; huntColor = "#e74c3c"; 
            }

            const huntHtml = `
                <div style="background: var(--card-bg); border: 3px solid ${huntColor}; border-radius: 15px; padding: 30px; text-align: center; box-shadow: 0 10px 20px rgba(0,0,0,0.05); position: relative; overflow: hidden; max-width: 800px; margin: 0 auto;">
                    <div style="position: absolute; top: -30px; right: -20px; font-size: 150px; opacity: 0.05;">✨</div>
                    <h3 style="color: ${huntColor}; margin-top: 0; font-size: 26px; text-transform: uppercase; letter-spacing: 2px; display:flex; justify-content:center; align-items:center; gap:10px;">
                        <span style="font-size:30px;">🎯</span> ${huntTitle}
                    </h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; margin-top: 30px; position:relative; z-index:2;">
                        <div style="flex: 1; min-width: 200px; background: rgba(0,0,0,0.02); padding: 20px; border-radius: 12px; border: 1px dashed #ccc;"><div style="font-size: 12px; color: #888; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">🎮 Jeu recommandé</div><div style="font-size: 18px; font-weight: 900; color: var(--text-color);">${huntGame}</div></div>
                        <div style="flex: 1; min-width: 200px; background: rgba(0,0,0,0.02); padding: 20px; border-radius: 12px; border: 1px dashed #ccc;"><div style="font-size: 12px; color: #888; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">⚔️ Méthode</div><div style="font-size: 18px; font-weight: 900; color: var(--text-color);">${huntMethod}</div></div>
                        <div style="flex: 1; min-width: 200px; background: rgba(0,0,0,0.02); padding: 20px; border-radius: 12px; border: 1px dashed #ccc; border-bottom: 4px solid ${huntColor};"><div style="font-size: 12px; color: #888; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">🎲 Taux d'apparition</div><div style="font-size: 22px; font-weight: 900; color: ${huntColor};">${huntOdds}</div></div>
                    </div>
                    <div style="margin-top: 25px; font-size: 12px; color: #888; font-style: italic; background: rgba(0,0,0,0.03); padding: 10px; border-radius: 8px;">
                        * L'algorithme se base sur les taux officiels maximaux. Si le Pokémon n'est pas codé dans le jeu recommandé (ex: non transférable), la <strong>Méthode Masuda (1/512 avec Charme Chroma)</strong> ou le <strong>Poké Radar (1/99 avec chaîne de 40)</strong> restent les meilleures alternatives.
                    </div>
                </div>`;
            document.getElementById('dex-tab-hunting').innerHTML = huntHtml;
        } catch (e) {
            document.getElementById('dex-tab-hunting').innerHTML = '<div style="text-align:center; color:#e74c3c; padding: 20px;">Impossible de charger les données de shasse.</div>';
        }

    } catch (err) {
        console.error("Erreur Globale Pokédex:", err);
        document.getElementById('dex-tab-infos').innerHTML = `<div style="text-align:center; padding: 40px; color: #e74c3c;">Erreur : Impossible de charger ce Pokémon. Vérifiez votre connexion.</div>`;
    }
}

function playDexCry() {
    console.log("--- TEST AUDIO ---");
    console.log("1. ID Courant :", currentDexId);
    
    if(!currentDexId) return;
    
    const btn = document.getElementById('dex-cry-btn');
    console.log("2. Lien caché dans le bouton :", btn.dataset.customCry);
    
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => btn.style.transform = 'scale(1)', 150);
    
    // --- GESTION CRIS CUSTOM Z-A ---
    if (currentDexId >= 20000 && btn.dataset.customCry && btn.dataset.customCry !== "undefined") {
        console.log("3. Fichier audio ciblé :", btn.dataset.customCry);
        
        const audio = new Audio(btn.dataset.customCry);
        audio.volume = 0.5;
        
        // On écoute exactement ce que répond le navigateur
        audio.play()
            .then(() => console.log("4. SUCCÈS ! Le son est joué."))
            .catch(e => console.error("4. ERREUR AUDIO :", e.message));
            
        return; 
    }
    // -------------------------------------

    console.log("3. Lancement du cri PokeAPI classique...");
    const audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${currentDexId}.ogg`);
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Cri non disponible sur PokeAPI"));
}
// Fonction pour simuler le rendu PokeAPI pour les formes custom
// Fonction pour simuler le rendu PokeAPI pour les formes custom Z-A
function renderCustomCardLocal(id, data) {
    console.log(`Rendu local Custom pour ${data.name_fr}`);
    
    // Vital : on sauvegarde l'ID courant pour le bouton des cris !
    currentDexId = id; 
    
    // 1. On affiche le Pokédex (comme pour un Pokémon normal)
    const emptyState = document.getElementById('dex-empty-state');
    if (emptyState) emptyState.style.display = 'none';
    
    const cardContainer = document.getElementById('dex-card-container');
    if (cardContainer) cardContainer.style.display = 'block';

    // 2. Mise à jour du Header (Noms et ID) - SÉCURISÉ
    const idElement = document.getElementById('dex-id');
    if (idElement) idElement.textContent = `#${id}`;
    
    const nameFrElement = document.getElementById('dex-name-fr'); 
    if (nameFrElement) nameFrElement.textContent = data.name_fr;
    
    const nameEnElement = document.getElementById('dex-name-en');
    if (nameEnElement) nameEnElement.textContent = data.name_en || data.name_fr; 

    // 3. Gestion de l'image principale avec IMAGE DE SECOURS (Zarbi "?")
    const imgElement = document.getElementById('dex-sprite'); 
    if (imgElement) {
        imgElement.onerror = null; 
        imgElement.src = data.sprite;
        imgElement.onerror = function() {
            this.onerror = null; // Empêche une boucle infinie
            this.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/201-question.png'; 
        };
    }
    
    // 4. Gestion des types
    const typesElement = document.getElementById('dex-types');
    if (typesElement) {
        typesElement.innerHTML = data.types.map(t => {
            const typeColor = (typeof typeColors !== 'undefined' && typeColors[t]) ? typeColors[t] : '#777';
            const typeTrans = (typeof typeTranslations !== 'undefined' && typeTranslations[t]) ? typeTranslations[t] : t.charAt(0).toUpperCase() + t.slice(1);
            return `<span class="type-badge" style="background-color: ${typeColor}">${typeTrans}</span>`;
        }).join('');
    }

    // 5. LA MAGIE AUDIO : On donne le lien du cri au bouton !
    const cryBtn = document.getElementById('dex-cry-btn');
    if (cryBtn) {
        cryBtn.dataset.customCry = data.cry; 
    }

    // 6. Nettoyage des onglets du bas
    const tabsToEmpty = ['dex-tab-infos', 'dex-tab-moves', 'dex-tab-locations', 'dex-tab-hunting'];
    tabsToEmpty.forEach(tab => {
        const el = document.getElementById(tab);
        if (el) {
            el.innerHTML = `<div style="text-align:center; padding: 40px; color: #888; background: rgba(0,0,0,0.02); border-radius: 12px;">
                <span style="font-size: 24px;">🔬</span><br><br>
                <strong>Données en cours de recherche par le Professeur Platane...</strong><br>
                <span style="font-size:12px; font-style: italic;">(Forme Z-A non documentée)</span>
            </div>`;
        }
    });

    // 7. On cache les boutons Suivant/Précédent - SÉCURISÉ
    const btnPrev = document.getElementById('dex-btn-prev');
    if (btnPrev) btnPrev.style.visibility = 'hidden';
    
    const btnNext = document.getElementById('dex-btn-next');
    if (btnNext) btnNext.style.visibility = 'hidden';

    // 8. Force l'affichage du premier onglet proprement
    const firstTabBtn = document.querySelector('.dex-tab-btn');
    if (firstTabBtn) firstTabBtn.click();
}