// ==========================================
// 1. CONFIGURATION GLOBALE & DICTIONNAIRE FR
// ==========================================
const pokedexGrid = document.getElementById('pokedex-grid');
const shinySection = document.getElementById('shiny-section');
const hofSection = document.getElementById('hof-section');
const statsSection = document.getElementById('stats-section');
const badgesSection = document.getElementById('badges-section');

let currentHuntId = null; let currentChainLength = 0;
let timerInterval; let timerSeconds = 0; let isTimerRunning = false;
let methodChart, longestChart, gameChart, timelineChart, typeRadarChart, durationChart;
let currentListIds = [];

const chainMethods = ['Radar', 'Peche', 'SOS', 'LG_Combo', 'LG_Combo_Charme', 'LG_Combo_Parfum', 'LG_Combo_All'];
const specialForms = {
    alola: ['rattata-alola', 'raticate-alola', 'raichu-alola', 'sandshrew-alola', 'sandslash-alola', 'vulpix-alola', 'ninetales-alola', 'diglett-alola', 'dugtrio-alola', 'meowth-alola', 'persian-alola', 'geodude-alola', 'graveler-alola', 'golem-alola', 'grimer-alola', 'muk-alola', 'exeggutor-alola', 'marowak-alola'],
    galar: ['meowth-galar', 'ponyta-galar', 'rapidash-galar', 'slowpoke-galar', 'slowbro-galar', 'farfetchd-galar', 'weezing-galar', 'mr-mime-galar', 'articuno-galar', 'zapdos-galar', 'moltres-galar', 'slowking-galar', 'corsola-galar', 'zigzagoon-galar', 'linoone-galar', 'darumaka-galar', 'darmanitan-galar-standard', 'yamask-galar', 'stunfisk-galar'],
    hisui: ['growlithe-hisui', 'arcanine-hisui', 'voltorb-hisui', 'electrode-hisui', 'typhlosion-hisui', 'qwilfish-hisui', 'sneasel-hisui', 'samurott-hisui', 'lilligant-hisui', 'basculin-white-striped', 'zorua-hisui', 'zoroark-hisui', 'braviary-hisui', 'sliggoo-hisui', 'goodra-hisui', 'avalugg-hisui', 'decidueye-hisui'],
    paldea: ['tauros-paldea-combat-breed', 'tauros-paldea-blaze-breed', 'tauros-paldea-aqua-breed', 'wooper-paldea'],
    speciales: ['lycanroc-dusk', 'zygarde-10', 'greninja-ash', 'ursaluna-bloodmoon', 'gimmighoul-roaming', 'palafin-hero']
};

// --- LE DICTIONNAIRE FRANÇAIS INSTANTANÉ ---
let pokemonFrDict = JSON.parse(localStorage.getItem('fr-dict')) || {};

async function loadFrenchDictionary() {
    if (Object.keys(pokemonFrDict).length > 0) return; // Déjà chargé !
    try {
        const query = `query { pokemon_v2_pokemonspecies { id pokemon_v2_pokemonspeciesnames(where: {pokemon_v2_language: {name: {_eq: "fr"}}}) { name } } }`;
        const res = await fetch('https://beta.pokeapi.co/graphql/v1beta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
        const json = await res.json();
        json.data.pokemon_v2_pokemonspecies.forEach(s => {
            if (s.pokemon_v2_pokemonspeciesnames.length > 0) pokemonFrDict[s.id] = s.pokemon_v2_pokemonspeciesnames[0].name;
        });
        localStorage.setItem('fr-dict', JSON.stringify(pokemonFrDict));
    } catch (e) { console.error("Erreur de téléchargement du dictionnaire", e); }
}

function getPokemonName(id, englishName) {
    // Retourne le nom FR s'il existe, sinon capitalise le nom anglais en secours
    return pokemonFrDict[id] || (englishName ? englishName.charAt(0).toUpperCase() + englishName.slice(1) : 'Inconnu');
}

function capitalized(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }

document.addEventListener('DOMContentLoaded', async () => { 
    // Écran de chargement ultra-pro pour le dictionnaire (ne s'affiche que la 1ère fois)
    if (Object.keys(pokemonFrDict).length === 0) {
        document.body.insertAdjacentHTML('afterbegin', '<div id="loading-dict" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);color:var(--accent-orange);display:flex;flex-direction:column;justify-content:center;align-items:center;z-index:9999;font-size:24px;font-weight:bold;font-family:\'Plus Jakarta Sans\', sans-serif;"><div>Téléchargement du Pokédex Français... 🌍</div><div style="font-size:14px;color:#888;margin-top:10px;">Une seule fois, promis !</div></div>');
        await loadFrenchDictionary();
        const loader = document.getElementById('loading-dict'); if (loader) loader.remove();
    }
    
    showSection('shiny'); 
    loadTheme(); 
    checkRetroactiveAchievements(); 
    updateDashboard(); 
    renderWantedList(); 
    
    // RESTAURATION AUTOMATIQUE DE LA SHASSE EN DIRECT
    const activeHuntId = localStorage.getItem('active-hunt-id');
    const activeHuntName = localStorage.getItem('active-hunt-name');
    if (activeHuntId && activeHuntName) {
        setAsCurrentHunt(activeHuntId, activeHuntName);
    }
});

document.addEventListener('DOMContentLoaded', () => { 
    showSection('shiny'); 
    loadTheme(); 
    checkRetroactiveAchievements(); 
    updateDashboard(); 
    renderWantedList(); 
    
    // RESTAURATION AUTOMATIQUE DE LA SHASSE EN DIRECT
    const activeHuntId = localStorage.getItem('active-hunt-id');
    const activeHuntName = localStorage.getItem('active-hunt-name');
    if (activeHuntId && activeHuntName) {
        setAsCurrentHunt(activeHuntId, activeHuntName);
    }
});

function showSection(sectionName) {
    shinySection.style.display = 'none'; hofSection.style.display = 'none'; statsSection.style.display = 'none'; badgesSection.style.display = 'none';
    ['btn-shiny', 'btn-hof', 'btn-stats', 'btn-badges'].forEach(id => { 
        const btn = document.getElementById(id); 
        if (btn) btn.style.backgroundColor = (id === `btn-${sectionName}`) ? 'rgba(255,255,255,0.4)' : ''; 
    });
    if (sectionName === 'shiny') { 
        shinySection.style.display = 'block'; 
        if (pokedexGrid.children.length === 0) loadGeneration(1025, 0, 'Complet', 'Toutes'); 
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
        if(k.startsWith('shiny-') && localStorage.getItem(k)==='true') { totalS++; const pId=k.split('-')[1]; if(currentListIds.includes(pId) || currentListIds.includes(parseInt(pId))) localS++; }
        if(k.startsWith('encounters-')) { const c=parseInt(localStorage.getItem(k))||0; totalE+=c; if(c>maxE) { maxE=c; hardId=k.split('-')[1]; } }
    }
    document.getElementById('stat-total-shiny').textContent = totalS; document.getElementById('stat-total-encounters').textContent = totalE;
    const gp = Math.round((totalS/1025)*100);
    const gpt = document.getElementById('global-progress-text'); if(gpt) gpt.textContent = `${totalS} / 1025 (${gp}%)`;
    const gpb = document.getElementById('global-progress-bar'); if(gpb) gpb.style.width = `${gp}%`;
    if(currentListIds.length>0) {
        const lp = Math.round((localS/currentListIds.length)*100);
        const lpt = document.getElementById('gen-progress-text'); if(lpt) lpt.textContent = `${localS} / ${currentListIds.length} (${lp}%)`;
        const lpb = document.getElementById('gen-progress-bar'); if(lpb) lpb.style.width = `${lp}%`;
    }
    // TRADUCTION ICI
    if(hardId && maxE>0) { document.getElementById('stat-longest-hunt').textContent=`${getPokemonName(hardId)} (${maxE})`; } else document.getElementById('stat-longest-hunt').textContent="- (0)";
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

async function loadCustomList(name, names) {
    document.getElementById('gen-title').textContent = name;
    pokedexGrid.innerHTML = '<p style="text-align:center;grid-column:1/-1;">Chargement...</p>';
    currentHuntId = null; closeLiveHunt(); currentListIds = []; pokedexGrid.innerHTML = '';
    for(let n of names) { try{ const res=await fetch(`https://pokeapi.co/api/v2/pokemon/${n}`); const data=await res.json(); currentListIds.push(data.id); createPokemonCard(data.id, data.name); }catch(e){} }
    updateDashboard();
}

// RESTAURATION PARFAITE DES CARTES (Vues/Phases comme les autres inputs, Liste complète des jeux)
function createPokemonCard(id, name) {
    const card = document.createElement('div'); card.className = 'pokemon-card'; 
    const cap = getPokemonName(id, name); // TRADUCTION ICI
    const isS = localStorage.getItem(`shiny-${id}`) === 'true'; const sE = localStorage.getItem(`encounters-${id}`) || ''; const sP = localStorage.getItem(`phases-${id}`) || '1';
    const sG = localStorage.getItem(`game-${id}`) || ''; const sM = localStorage.getItem(`method-${id}`) || ''; const sN = localStorage.getItem(`nickname-${id}`) || ''; const sD = localStorage.getItem(`date-${id}`) || '';
    const isP = localStorage.getItem(`pinned-${id}`) !== null; const pinC = isP ? 'btn-pin active' : 'btn-pin'; const pinI = isP ? '📌' : '📍';
    const imgSrc = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${isS?'shiny/':''}${id}.png`;
    
    card.innerHTML = `
        <img src="${imgSrc}" id="img-${id}" class="${isS?'':'not-caught'}">
        <h3 style="display:flex;justify-content:center;align-items:center;">#${id} ${cap}<button onclick="togglePin(${id}, '${name}')" class="${pinC}" id="pin-btn-${id}">${pinI}</button></h3>
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
                <optgroup label="Anciens (1/8192)">
                    <option value="Rouge/Bleu/Jaune" ${sG==='Rouge/Bleu/Jaune'?'selected':''}>Rouge/Bleu/Jaune</option>
                    <option value="Or/Argent/Cristal" ${sG==='Or/Argent/Cristal'?'selected':''}>Or/Argent/Cristal</option>
                    <option value="Rubis/Saphir/Émeraude" ${sG==='Rubis/Saphir/Émeraude'?'selected':''}>Rubis/Saphir/Émeraude</option>
                    <option value="Rouge Feu/Vert Feuille" ${sG==='Rouge Feu/Vert Feuille'?'selected':''}>Rouge Feu/Vert Feuille</option>
                    <option value="Diamant/Perle/Platine" ${sG==='Diamant/Perle/Platine'?'selected':''}>Diamant/Perle/Platine</option>
                    <option value="HG/SS" ${sG==='HG/SS'?'selected':''}>HeartGold/SoulSilver</option>
                    <option value="Noir/Blanc (1 & 2)" ${sG==='Noir/Blanc (1 & 2)'?'selected':''}>Noir/Blanc (1 & 2)</option>
                </optgroup>
                <optgroup label="Récents (1/4096)">
                    <option value="X/Y" ${sG==='X/Y'?'selected':''}>X/Y</option>
                    <option value="RO/SA" ${sG==='RO/SA'?'selected':''}>Rubis Oméga/Saphir Alpha</option>
                    <option value="Soleil/Lune/USUL" ${sG==='Soleil/Lune/USUL'?'selected':''}>Soleil/Lune/USUL</option>
                    <option value="Let's Go Pikachu/Évoli" ${sG==="Let's Go Pikachu/Évoli"?'selected':''}>Let's Go Pikachu/Évoli</option>
                    <option value="Épée/Bouclier" ${sG==='Épée/Bouclier'?'selected':''}>Épée/Bouclier</option>
                    <option value="DEPS" ${sG==='DEPS'?'selected':''}>Diamant É. / Perle S.</option>
                    <option value="Légendes Arceus" ${sG==='Légendes Arceus'?'selected':''}>Légendes Arceus</option>
                    <option value="Écarlate/Violet" ${sG==='Écarlate/Violet'?'selected':''}>Écarlate/Violet</option>
                    <option value="Légendes Z-A" ${sG==='Légendes Z-A'?'selected':''}>Légendes Z-A</option>
                </optgroup>
                <optgroup label="Autres"><option value="Pokémon GO" ${sG==='Pokémon GO'?'selected':''}>Pokémon GO</option></optgroup>
            </select></div>
            <div><label>Méthode:</label><select id="method-${id}" onchange="saveSelect(${id},'method')" class="hunt-select">
                <option value="">--</option>
                <optgroup label="Classique">
                    <option value="Hasard" ${sM==='Hasard'?'selected':''}>Hasard / Resets</option>
                    <option value="Charme" ${sM==='Charme'?'selected':''}>Avec Charme</option>
                </optgroup>
                <optgroup label="Reproduction">
                    <option value="Masuda" ${sM==='Masuda'?'selected':''}>Masuda</option>
                    <option value="MasudaCharme" ${sM==='MasudaCharme'?'selected':''}>Masuda + Charme</option>
                </optgroup>
                <optgroup label="Let's Go">
                    <option value="LG_Combo" ${sM==='LG_Combo'?'selected':''}>Combo Capture</option>
                    <option value="LG_Combo_Charme" ${sM==='LG_Combo_Charme'?'selected':''}>Combo + Charme</option>
                    <option value="LG_Combo_Parfum" ${sM==='LG_Combo_Parfum'?'selected':''}>Combo + Parfum</option>
                    <option value="LG_Combo_All" ${sM==='LG_Combo_All'?'selected':''}>Combo+Charme+Parfum</option>
                </optgroup>
                <optgroup label="Méthodes à Chaîne">
                    <option value="SOS" ${sM==='SOS'?'selected':''}>Appel SOS</option>
                    <option value="Radar" ${sM==='Radar'?'selected':''}>Poké Radar</option>
                    <option value="Peche" ${sM==='Peche'?'selected':''}>Pêche à la chaîne</option>
                </optgroup>
                <optgroup label="Écarlate/Violet & LPA">
                    <option value="Massive" ${sM==='Massive'?'selected':''}>App. Massive (60+)</option>
                    <option value="MassiveCharme" ${sM==='MassiveCharme'?'selected':''}>Massive (60+) + Charme</option>
                    <option value="SandwichMax" ${sM==='SandwichMax'?'selected':''}>Massive+Charme+Aura 3</option>
                </optgroup>
                <optgroup label="Spécial">
                    <option value="Dynamax" ${sM==='Dynamax'?'selected':''}>Antre Dynamax (Charme)</option>
                </optgroup>
                <optgroup label="Obtention">
                    <option value="Évolution" ${sM==='Évolution'?'selected':''}>Évolution (Non shassé)</option>
                </optgroup>
            </select></div>
        </div>
        <div id="action-btns-${id}" style="display:flex;gap:5px;margin-top:15px;">
            <button onclick="setAsCurrentHunt(${id}, '${cap}')" style="flex:1;background:var(--accent-blue);color:white;border:none;border-radius:8px;cursor:pointer;font-weight:bold;padding:10px;">🎯 Shasser</button>
            <button onclick="openJournal(${id}, '${cap}')" style="background:#f39c12;color:white;border:none;border-radius:8px;padding:10px 15px;cursor:pointer;">📖</button>
            ${localStorage.getItem(`journal-link-${id}`) ? `<a href="${localStorage.getItem(`journal-link-${id}`)}" target="_blank" style="background:#e74c3c;color:white;text-decoration:none;padding:10px 15px;border-radius:8px;display:flex;align-items:center;">▶️</a>` : ''}
        </div>
    `;
    pokedexGrid.appendChild(card);
}

function toggleShiny(id) {
    const cb = document.getElementById(`shiny-${id}`); const img = document.getElementById(`img-${id}`);
    if(cb.checked) {
        img.classList.remove('not-caught'); img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`;
        const audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`); audio.volume = 0.3; audio.play().catch(e=>{});
        const di = document.getElementById(`date-${id}`); if(di && !di.value) { const t = new Date().toISOString().split('T')[0]; di.value = t; localStorage.setItem(`date-${id}`, t); }
        if(typeof confetti === "function") confetti({particleCount: 150, spread: 80, origin: {y: 0.6}});
    } else {
        img.classList.add('not-caught'); img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    }
    localStorage.setItem(`shiny-${id}`, cb.checked); checkAchievements(); updateDashboard(); renderWantedList();
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
    const cb = document.getElementById(`shiny-${currentHuntId}`); 
    if(cb && !cb.checked) { cb.checked = true; toggleShiny(currentHuntId); } 
    else if(!cb) { localStorage.setItem(`shiny-${currentHuntId}`, 'true'); confetti({particleCount: 150, spread: 80, origin: {y: 0.6}}); } 
    closeLiveHunt(); 
    updateDashboard(); 
    renderWantedList(); 
    checkAchievements(); 
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
    ['hof-official-content', 'hof-hackrom-content', 'hof-super-content', 'hof-graveyard-content'].forEach(id => document.getElementById(id).style.display = 'none');
    ['tab-official', 'tab-hackrom', 'tab-super', 'tab-graveyard'].forEach(id => { const b = document.getElementById(id); b.style.background = 'rgba(0,0,0,0.1)'; b.style.color = 'var(--text-color)'; });
    if(tab === 'official') { document.getElementById('hof-official-content').style.display = 'block'; document.getElementById('tab-official').style.background = 'var(--accent-blue)'; document.getElementById('tab-official').style.color = 'white'; }
    else if(tab === 'hackrom') { document.getElementById('hof-hackrom-content').style.display = 'block'; document.getElementById('tab-hackrom').style.background = 'var(--accent-orange)'; document.getElementById('tab-hackrom').style.color = 'white'; }
    else if(tab === 'super') { document.getElementById('hof-super-content').style.display = 'block'; document.getElementById('tab-super').style.background = 'linear-gradient(135deg, #f1c40f, #f39c12)'; document.getElementById('tab-super').style.color = 'white'; renderSuperHoF(); }
    else if(tab === 'graveyard') { document.getElementById('hof-graveyard-content').style.display = 'block'; document.getElementById('tab-graveyard').style.background = '#2c3e50'; document.getElementById('tab-graveyard').style.color = 'white'; renderGlobalGraveyard(); }
}

function loadHallOfFame() { const g = document.getElementById('hof-official-grid'); if(g && g.children.length > 0) return; renderHallOfFame(); showHofTab('official'); }
function renderHallOfFame() {
    const og = document.getElementById('hof-official-grid'); const hg = document.getElementById('hof-hackrom-grid');
    if(og) og.innerHTML = ''; if(hg) hg.innerHTML = '';
    if(og) nuzlockeGames.forEach(g => createGameCard(g, og, false, false));
    let co = JSON.parse(localStorage.getItem('custom-official-runs')) || []; if(og) co.forEach(r => createGameCard(r, og, true, true));
    let ch = JSON.parse(localStorage.getItem('custom-hackroms')) || []; if(hg) ch.forEach(h => createGameCard(h, hg, true, false));
}

function createGameCard(g, grid, isC = false, isOC = false) {
    const card = document.createElement('div'); card.className = 'game-card'; let html = '';
    
    // Génération des 6 Pokémon de l'équipe
    for(let i = 1; i <= 6; i++) {
        const n = localStorage.getItem(`team-${g.id}-${i}-nick`) || '';
        let r = localStorage.getItem(`ribbon-${g.id}-${i}`) || 'none';
        if(r === 'none' && localStorage.getItem(`team-${g.id}-${i}-mvp`) === 'true') { r = 'mvp'; localStorage.setItem(`ribbon-${g.id}-${i}`, 'mvp'); }
        html += `
        <div class="team-member">
            <div class="ribbon-icon ${r !== 'none' ? `ribbon-${r}` : ''}" id="ribbon-${g.id}-${i}" onclick="toggleRibbon('${g.id}',${i})" title="${ribbonTitles[r]}">${ribbonIcons[r]}</div>
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" id="team-${g.id}-${i}-img">
            <input type="text" id="team-${g.id}-${i}-nick" value="${n}" oninput="saveHoFNick('${g.id}',${i})" class="hunt-select" style="text-align:center; font-size:12px; padding:6px; margin-bottom:6px;" placeholder="Surnom">
            <input type="text" id="team-${g.id}-${i}-id" onchange="updateHoFSprite('${g.id}',${i})" class="hunt-select" style="text-align:center; font-size:12px; padding:6px;" placeholder="ID/Nom">
        </div>`;
    }
    
    // Bouton de suppression de la partie
    let del = ''; 
    if(isC && !isOC) del = `<button onclick="deleteHackrom('${g.id}')" class="btn-action chain-break" style="float:right; margin:0;">✖ Supprimer</button>`; 
    else if(isOC) del = `<button onclick="deleteOfficialRun('${g.id}')" class="btn-action chain-break" style="float:right; margin:0;">✖ Supprimer</button>`;
    
    // Assemblage de la carte complète
    card.innerHTML = `
        ${del}
        <div class="game-title">${g.name}</div>
        <h4 style="color: var(--accent-blue); text-transform: uppercase; letter-spacing: 1px; font-size: 14px; text-align: center;">🏆 Équipe Finale</h4>
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

function addOfficialRun() { const s = document.getElementById('new-official-game').value; const r = document.getElementById('new-official-rule').value.trim(); if(!r) return; let c = JSON.parse(localStorage.getItem('custom-official-runs')) || []; c.push({id: 'offrun-' + Date.now(), name: `${s} - ${r}`}); localStorage.setItem('custom-official-runs', JSON.stringify(c)); renderHallOfFame(); checkAchievements(); }
function deleteOfficialRun(id) { let c = JSON.parse(localStorage.getItem('custom-official-runs')) || []; c = c.filter(r => r.id !== id); localStorage.setItem('custom-official-runs', JSON.stringify(c)); renderHallOfFame(); checkAchievements(); }
function addHackrom() { const n = document.getElementById('new-hackrom-name').value.trim(); if(!n) return; let c = JSON.parse(localStorage.getItem('custom-hackroms')) || []; c.push({id: 'hackrom-' + Date.now(), name: n}); localStorage.setItem('custom-hackroms', JSON.stringify(c)); renderHallOfFame(); checkAchievements(); }
function deleteHackrom(id) { let c = JSON.parse(localStorage.getItem('custom-hackroms')) || []; c = c.filter(h => h.id !== id); localStorage.setItem('custom-hackroms', JSON.stringify(c)); renderHallOfFame(); checkAchievements(); }

async function updateHoFSprite(g, i, load = false) {
    const idInput = document.getElementById(`team-${g}-${i}-id`); const img = document.getElementById(`team-${g}-${i}-img`);
    if(load) { const s = localStorage.getItem(idInput.id); if(s) { idInput.value = s; img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${s}.png`; } return; }
    const q = idInput.value.toLowerCase().trim();
    if(!q) { img.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"; localStorage.removeItem(idInput.id); checkAchievements(); return; }
    let pid = q; if(isNaN(q)) { try { const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${q}`); const d = await res.json(); pid = d.id; idInput.value = pid; } catch(e) { idInput.value = ""; return; } }
    img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pid}.png`; localStorage.setItem(idInput.id, pid); checkAchievements();
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
    for(let r of a) for(let i = 1; i <= 6; i++) { const p = localStorage.getItem(`team-${r.id}-${i}-id`); const b = localStorage.getItem(`ribbon-${r.id}-${i}`) || 'none'; if(p && b !== 'none') l.push({ rId: r.id, rN: r.name.split(' (')[0], s: i, p, b, n: localStorage.getItem(`team-${r.id}-${i}-nick`) || 'Sans nom' }); }
    if(l.length === 0) { gc.innerHTML = '<p style="width:100%;text-align:center;color:#888;">Aucun nominé.</p>'; sc.innerHTML = '<p style="width:100%;text-align:center;color:#888;">Podium vide.</p>'; return; }
    const cats = ['mvp', 'slayer', 'survivor', 'hero']; const cols = { 'mvp': '#f1c40f', 'slayer': '#e74c3c', 'survivor': '#2ecc71', 'hero': '#3498db' };
    for(let c of cats) {
        const sk = localStorage.getItem(`supreme-${c}`); const e = l.find(x => `${x.rId}-${x.s}` === sk && x.b === c);
        if(e) { 
            let sn = getPokemonName(e.p, "Inconnu"); // TRADUCTION INSTANTANÉE SANS API !
            sc.innerHTML += `<div class="super-hof-card border-${c}" style="transform:scale(1.15);margin:10px;box-shadow:0 10px 25px ${cols[c]}40;"><div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:white;padding:4px 12px;border-radius:50px;border:2px solid ${cols[c]};font-size:10px;font-weight:900;color:${cols[c]};">L'ULTIME</div><button onclick="removeSupreme('${c}')" style="position:absolute;top:8px;right:8px;background:rgba(231,76,60,0.1);color:#e74c3c;border:none;border-radius:50%;cursor:pointer;">❌</button><div style="font-size:35px;margin-bottom:5px;">${ribbonIcons[c]}</div><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${e.p}.png"><div class="game-tag">${e.rN}</div><h4>"${e.n}"</h4><div class="species">${sn}</div></div>`; 
        } else { 
            sc.innerHTML += `<div style="width:160px;padding:20px;border-radius:15px;border:2px dashed ${cols[c]};display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0.5;margin:10px;"><div style="font-size:40px;filter:grayscale(100%);">${ribbonIcons[c]}</div><div style="font-size:12px;font-weight:bold;text-align:center;margin-top:10px;">Aucun<br>${ribbonTitles[c]}</div></div>`; 
        }
    }
    for(let e of l) {
        const sk = localStorage.getItem(`supreme-${e.b}`); if(sk === `${e.rId}-${e.s}`) continue;
        let sn = getPokemonName(e.p, "Inconnu"); // TRADUCTION ICI
        gc.innerHTML += `<div class="super-hof-card border-${e.b}"><div style="font-size:24px;margin-bottom:5px;">${ribbonIcons[e.b]}</div><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${e.p}.png"><div class="game-tag">${e.rN}</div><h4>"${e.n}"</h4><div class="species">${sn}</div><button onclick="electSupreme('${e.rId}',${e.s},'${e.b}')" style="background:var(--bg-color);color:var(--text-color);border:2px solid #eee;border-radius:50px;padding:6px;width:100%;margin-top:10px;cursor:pointer;font-weight:bold;font-size:10px;">Élire l'Ultime 🏆</button></div>`;
    }
}

async function renderGlobalGraveyard() {
    const c = document.getElementById('hof-graveyard-grid'); if(!c) return;
    c.innerHTML = '<p style="width:100%;text-align:center;">Réveil des âmes...</p>';
    let a = nuzlockeGames.concat(JSON.parse(localStorage.getItem('custom-official-runs')) || []).concat(JSON.parse(localStorage.getItem('custom-hackroms')) || []);
    let dl = [];
    for(let r of a) { let gl = JSON.parse(localStorage.getItem(`grave-list-${r.id}`)) || []; for(let i = 0; i < gl.length; i++) { dl.push({ rn: r.name.split(' (')[0], p: gl[i], n: localStorage.getItem(`grave-note-${r.id}-${i}`) || "Sans cause" }); } }
    if(dl.length === 0) { c.innerHTML = '<p style="width:100%;text-align:center;color:#888;">Aucun mort.</p>'; return; }
    c.innerHTML = '';
    for(let d of dl) { 
        let sn = getPokemonName(d.p, "Inconnu"); // TRADUCTION ICI (Instantanée !)
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
        if (key.startsWith('shiny-') && localStorage.getItem(key) === 'true') {
            const id = key.split('-')[1];
            if (!localStorage.getItem(`types-${id}`)) missingIds.push(id);
        }
    }

    // Dictionnaire de traduction Anglais -> Français
    const typeTranslations = {
        'normal': 'Normal', 'fighting': 'Combat', 'flying': 'Vol', 'poison': 'Poison', 'ground': 'Sol',
        'rock': 'Roche', 'bug': 'Insecte', 'ghost': 'Spectre', 'steel': 'Acier', 'fire': 'Feu',
        'water': 'Eau', 'grass': 'Plante', 'electric': 'Électrik', 'psychic': 'Psy', 'ice': 'Glace',
        'dragon': 'Dragon', 'dark': 'Ténèbres', 'fairy': 'Fée'
    };

    // 1. Récupération et traduction des types manquants
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

    // 2. Traitement des données
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('shiny-') && localStorage.getItem(key) === 'true') {
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
            // Traduction de sécurité pour les anciennes données
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
    const timelineCtx = document.getElementById('timelineChart').getContext('2d');
    if (timelineChart) timelineChart.destroy();
    timelineChart = new Chart(timelineCtx, { type: 'line', data: { labels: sortedDates, datasets: [{ label: 'Shinys obtenus', data: sortedDates.map(date => datesMap[date]), borderColor: '#9b59b6', backgroundColor: 'rgba(155, 89, 182, 0.2)', borderWidth: 3, tension: 0.3, fill: true }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } } });

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
}

// ==========================================
// 6. SUCCÈS (BADGES)
// ==========================================
const achievementsList = {
    first_shiny: { title: "Premier Sang", desc: "1 Shiny.", icon: "🩸" }, shiny_10: { title: "Régulier", desc: "10 Shinys.", icon: "🥉" }, shiny_50: { title: "Pro", desc: "50 Shinys.", icon: "🥈" }, shiny_100: { title: "Maître", desc: "100 Shinys.", icon: "🥇" }, shiny_250: { title: "Grand Maître", desc: "250 Shinys.", icon: "💎" }, shiny_500: { title: "Légende", desc: "500 Shinys.", icon: "👑" }, shiny_all: { title: "Dieu Pokémon", desc: "Living Dex (1025).", icon: "🌌" },
    master_kanto: { title: "Maître Kanto", desc: "151 Shinys.", icon: "🧬" }, master_johto: { title: "Maître Johto", desc: "100 Shinys.", icon: "🍂" }, master_hoenn: { title: "Maître Hoenn", desc: "135 Shinys.", icon: "🎺" }, master_sinnoh: { title: "Maître Sinnoh", desc: "107 Shinys.", icon: "❄️" }, master_unys: { title: "Maître Unys", desc: "156 Shinys.", icon: "⚡" }, master_kalos: { title: "Maître Kalos", desc: "72 Shinys.", icon: "✨" }, master_alola: { title: "Maître Alola", desc: "88 Shinys.", icon: "🌴" }, master_galar: { title: "Maître Galar", desc: "89 Shinys.", icon: "🚂" }, master_hisui: { title: "Maître Hisui", desc: "7 Shinys.", icon: "🪵" }, master_paldea: { title: "Maître Paldea", desc: "120 Shinys.", icon: "🍇" },
    beni: { title: "Béni", desc: "< 5 rencontres.", icon: "👼" }, lucky: { title: "Insolent", desc: "< 50 rencontres.", icon: "🍀" }, pain: { title: "Patience", desc: "> 10 000 rencontres.", icon: "🗿" }, abyss: { title: "Abysses", desc: "> 20 000 rencontres.", icon: "🕳️" }, curse: { title: "Malédiction", desc: "Phase 5.", icon: "⛈️" }, stubborn: { title: "Acharné", desc: "Phase 10.", icon: "🤬" },
    purist: { title: "Puriste", desc: "1 Shiny Hasard (Rétro).", icon: "👴" }, archaeologist: { title: "Archéologue", desc: "5 Shinys Hasard.", icon: "🦖" }, masuda_master: { title: "Éleveur", desc: "5 Shinys Masuda.", icon: "🥚" }, masuda_god: { title: "Dieu Pension", desc: "20 Shinys Masuda.", icon: "🐣" }, combo_master: { title: "Combo Master", desc: "5 Shinys Let's Go.", icon: "🔗" }, massive_master: { title: "Nettoyeur", desc: "5 Apparitions Massives.", icon: "🧹" }, chain_master: { title: "Maître Radar", desc: "Chaîne de 40.", icon: "📡" },
    hof_first: { title: "Survivant", desc: "1 équipe HoF.", icon: "🎖️" }, hof_nohit: { title: "No Hit Run", desc: "Cimetière vide.", icon: "🛡️" }, hof_miracle: { title: "Miraculé", desc: "1 SEUL survivant.", icon: "🩸" }, hof_mvp: { title: "Faiseur Rois", desc: "1 MVP.", icon: "👑" }, hof_emperor: { title: "Empereur", desc: "10 MVP.", icon: "💺" }, hof_death: { title: "Deuil", desc: "1 épitaphe.", icon: "🪦" }, hof_hecatombe: { title: "Hécatombe", desc: "10 morts 1 partie.", icon: "💀" }, hof_gravedigger: { title: "Fossoyeur", desc: "30 morts total.", icon: "⛏️" }, hof_globe: { title: "Globe-Trotter", desc: "5 régions HoF.", icon: "✈️" }, hof_multiverse: { title: "Multivers", desc: "9 régions HoF.", icon: "🌍" }, hof_hackrom: { title: "Hackrom", desc: "1 Fan Game.", icon: "👾" }
};

function computeAllBadges() {
    let s = {ts:0,maxP:1,maxC:parseInt(localStorage.getItem('max_chain'))||0,h:0,b:false,l:false,p:false,ab:false,mas:0,com:0,msv:0,g1:0,g2:0,g3:0,g4:0,g5:0,g6:0,g7:0,g8:0,hi:0,g9:0};
    const og = ['Rouge/Bleu/Jaune','Or/Argent/Cristal','Rubis/Saphir/Émeraude','Rouge Feu/Vert Feuille','Diamant/Perle/Platine','HG/SS','Noir/Blanc (1 & 2)'];
    for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('shiny-')&&localStorage.getItem(k)==='true'){s.ts++;const id=parseInt(k.split('-')[1]);const e=parseInt(localStorage.getItem(`encounters-${id}`))||0;const p=parseInt(localStorage.getItem(`phases-${id}`))||1;const g=localStorage.getItem(`game-${id}`);const m=localStorage.getItem(`method-${id}`);if(e>0){if(e<5)s.b=true;if(e<50)s.l=true;if(e>=10000)s.p=true;if(e>=20000)s.ab=true;}if(p>s.maxP)s.maxP=p;if(m==='Masuda'||m==='MasudaCharme')s.mas++;if(og.includes(g)&&m==='Hasard')s.h++;if(m&&m.startsWith('LG_Combo'))s.com++;if(m&&m.startsWith('Massive'))s.msv++;if(id<=151)s.g1++;else if(id<=251)s.g2++;else if(id<=386)s.g3++;else if(id<=493)s.g4++;else if(id<=649)s.g5++;else if(id<=721)s.g6++;else if(id<=809)s.g7++;else if(id<=898)s.g8++;else if(id<=905)s.hi++;else if(id<=1025)s.g9++;}}
    let h = {t:false,d:false,td:0,mvp:0,hc:false,nh:false,mi:false,or:0,hk:false};
    let a = nuzlockeGames.map(x=>x.id).concat((JSON.parse(localStorage.getItem('custom-official-runs'))||[]).map(x=>x.id));
    let all = a.concat((JSON.parse(localStorage.getItem('custom-hackroms'))||[]).map(x=>x.id));
    let rs = new Set();
    all.forEach(g=>{let tc=0;for(let i=1;i<=6;i++){if(localStorage.getItem(`team-${g}-${i}-id`)){tc++;h.t=true;}if(localStorage.getItem(`ribbon-${g}-${i}`)==='mvp')h.mvp++;}let gl=JSON.parse(localStorage.getItem(`grave-list-${g}`))||[];let d=gl.length;h.td+=d;if(d>0)h.d=true;if(d>=10)h.hc=true;if(tc>0&&d===0)h.nh=true;if(tc===1)h.mi=true;if(tc>0){if(!a.includes(g))h.hk=true;else rs.add(g);}});
    h.or = rs.size; if(currentChainLength>s.maxC)localStorage.setItem('max_chain',currentChainLength);
    return {first_shiny:s.ts>=1,shiny_10:s.ts>=10,shiny_50:s.ts>=50,shiny_100:s.ts>=100,shiny_250:s.ts>=250,shiny_500:s.ts>=500,shiny_all:s.ts>=1025,master_kanto:s.g1===151,master_johto:s.g2===100,master_hoenn:s.g3===135,master_sinnoh:s.g4===107,master_unys:s.g5===156,master_kalos:s.g6===72,master_alola:s.g7===88,master_galar:s.g8===89,master_hisui:s.hi===7,master_paldea:s.g9===120,beni:s.b,lucky:s.l,pain:s.p,abyss:s.ab,curse:s.maxP>=5,stubborn:s.maxP>=10,purist:s.h>=1,archaeologist:s.h>=5,masuda_master:s.mas>=5,masuda_god:s.mas>=20,combo_master:s.com>=5,massive_master:s.msv>=5,chain_master:s.maxC>=40,hof_first:h.t,hof_nohit:h.nh,hof_miracle:h.mi,hof_mvp:h.mvp>=1,hof_emperor:h.mvp>=10,hof_death:h.d,hof_hecatombe:h.hc,hof_gravedigger:h.td>=30,hof_globe:h.or>=5,hof_multiverse:h.or>=9,hof_hackrom:h.hk};
}

function checkAchievements() { let n=[]; const s=computeAllBadges(); Object.keys(achievementsList).forEach(c=>{const w=localStorage.getItem(`badge_state_${c}`)==='true';const is=s[c]||false;if(!w&&is){n.push(c);localStorage.setItem(`badge_state_${c}`,'true');}else if(w&&!is)localStorage.setItem(`badge_state_${c}`,'false');}); if(n.length>0)n.forEach(c=>showBadgeToast(c)); const b=document.getElementById('badges-section'); if(b&&b.style.display==='block')renderBadges(); }
function renderBadges() { const g=document.getElementById('badges-grid'); if(!g)return; g.innerHTML=''; Object.keys(achievementsList).forEach(c=>{const b=achievementsList[c];const u=localStorage.getItem(`badge_state_${c}`)==='true';g.innerHTML+=`<div class="badge-card ${u?'badge-unlocked':'badge-locked'}"><div class="badge-icon">${b.icon}</div><div class="badge-info"><h4>${b.title}</h4><p>${u?b.desc:'🔒 Verrouillé'}</p></div></div>`;}); }
function showBadgeToast(c) { const b=achievementsList[c]; const t=document.createElement('div'); t.className='toast-notification'; t.innerHTML=`<div style="font-size:35px;margin-right:15px;background:rgba(0,0,0,0.2);border-radius:50%;width:50px;height:50px;display:flex;align-items:center;justify-content:center;">${b.icon}</div><div><h4 style="margin:0;color:#f1c40f;">Succès !</h4><p style="margin:3px 0 0 0;font-size:14px;font-weight:bold;">${b.title}</p></div>`; document.getElementById('toast-container').appendChild(t); setTimeout(()=>{t.style.opacity="0";setTimeout(()=>t.remove(),400);},4000); }
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
        if (key.startsWith('shiny-') && localStorage.getItem(key) === 'true') {
            totalShiny++; const id = key.split('-')[1];
            const encounters = parseInt(localStorage.getItem(`encounters-${id}`)) || 0;
            totalEncounters += encounters; shinyList.push({ id: id, encounters: encounters });
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
    const q=document.getElementById('search-shiny-input').value.toLowerCase().trim(); 
    if(q===""){resetSearch();return;} 
    pokedexGrid.innerHTML='Recherche...'; currentHuntId=null; closeLiveHunt(); 
    try{
        const res=await fetch(`https://pokeapi.co/api/v2/pokemon/${q}`);
        if(!res.ok)throw new Error();
        const d=await res.json();
        const frName = getPokemonName(d.id, d.name); // TRADUCTION ICI
        document.getElementById('gen-title').textContent=`Résultat : ${frName}`;
        pokedexGrid.innerHTML='';
        currentListIds=[d.id];
        createPokemonCard(d.id, d.name);
        updateDashboard();
    }catch(e){pokedexGrid.innerHTML='Pokémon introuvable.';} 
}
function resetSearch() { 
    document.getElementById('search-shiny-input').value=''; 
    loadGeneration(1025, 0, 'Complet', 'Toutes'); 
}
function exportData() { const d={}; for(let i=0;i<localStorage.length;i++)d[localStorage.key(i)]=localStorage.getItem(localStorage.key(i)); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify(d)],{type:'application/json'})); a.download=`pokedex_data_${new Date().toISOString().slice(0,10)}.json`; a.click(); }
function importData() { const i=document.createElement('input'); i.type='file'; i.accept='.json'; i.onchange=e=>{const r=new FileReader(); r.onload=ev=>{try{const d=JSON.parse(ev.target.result);localStorage.clear();Object.keys(d).forEach(k=>localStorage.setItem(k,d[k]));alert("Données chargées !");location.reload();}catch(err){alert("JSON invalide.");}}; r.readAsText(e.target.files[0]);}; i.click(); }
function toggleTheme() { document.body.classList.toggle('dark-mode'); const d=document.body.classList.contains('dark-mode'); localStorage.setItem('darkMode',d); document.getElementById('btn-theme').textContent=d?'☀️':'🌙'; }
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
function closeRandomModal() { document.getElementById('random-hunt-modal').style.display='none'; }