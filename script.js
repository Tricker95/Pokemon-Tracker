const pokedexGrid = document.getElementById('pokedex-grid');
const shinySection = document.getElementById('shiny-section');
const hofSection = document.getElementById('hof-section');

let currentHuntId = null;
let currentChainLength = 0;

// VARIABLES CHRONOMÈTRE
let timerInterval;
let timerSeconds = 0;
let isTimerRunning = false;

const chainMethods = ['Radar', 'Peche', 'SOS', 'LG_Combo', 'LG_Combo_Charme', 'LG_Combo_Parfum', 'LG_Combo_All'];

const specialForms = {
    alola: ['rattata-alola', 'raticate-alola', 'raichu-alola', 'sandshrew-alola', 'sandslash-alola', 'vulpix-alola', 'ninetales-alola', 'diglett-alola', 'dugtrio-alola', 'meowth-alola', 'persian-alola', 'geodude-alola', 'graveler-alola', 'golem-alola', 'grimer-alola', 'muk-alola', 'exeggutor-alola', 'marowak-alola'],
    galar: ['meowth-galar', 'ponyta-galar', 'rapidash-galar', 'slowpoke-galar', 'slowbro-galar', 'farfetchd-galar', 'weezing-galar', 'mr-mime-galar', 'articuno-galar', 'zapdos-galar', 'moltres-galar', 'slowking-galar', 'corsola-galar', 'zigzagoon-galar', 'linoone-galar', 'darumaka-galar', 'darmanitan-galar-standard', 'yamask-galar', 'stunfisk-galar'],
    hisui: ['growlithe-hisui', 'arcanine-hisui', 'voltorb-hisui', 'electrode-hisui', 'typhlosion-hisui', 'qwilfish-hisui', 'sneasel-hisui', 'samurott-hisui', 'lilligant-hisui', 'basculin-white-striped', 'zorua-hisui', 'zoroark-hisui', 'braviary-hisui', 'sliggoo-hisui', 'goodra-hisui', 'avalugg-hisui', 'decidueye-hisui'],
    paldea: ['tauros-paldea-combat-breed', 'tauros-paldea-blaze-breed', 'tauros-paldea-aqua-breed', 'wooper-paldea'],
    speciales: ['lycanroc-dusk', 'zygarde-10', 'greninja-ash', 'ursaluna-bloodmoon', 'gimmighoul-roaming', 'palafin-hero']
};

document.addEventListener('DOMContentLoaded', () => { showSection('shiny'); loadTheme(); updateDashboard(); });

function showSection(sectionName) {
    if (sectionName === 'shiny') {
        shinySection.style.display = 'block'; hofSection.style.display = 'none'; setActiveButton('btn-shiny');
        if (pokedexGrid.children.length === 0) loadGeneration(151, 0, 'Kanto', 1); 
    } else {
        shinySection.style.display = 'none'; hofSection.style.display = 'block'; setActiveButton('btn-hof'); loadHallOfFame();
    }
}

function setActiveButton(activeId) {
    document.getElementById('btn-shiny').style.backgroundColor = ''; document.getElementById('btn-hof').style.backgroundColor = '';
    document.getElementById(activeId).style.backgroundColor = 'rgba(255,255,255,0.4)';
}

function capitalized(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }

async function updateDashboard() {
    let totalShiny = 0, totalEncounters = 0, maxEncounters = 0, hardestPokemonId = null;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('shiny-') && localStorage.getItem(key) === 'true') totalShiny++;
        if (key.startsWith('encounters-')) {
            const count = parseInt(localStorage.getItem(key)) || 0; totalEncounters += count;
            if (count > maxEncounters) { maxEncounters = count; hardestPokemonId = key.split('-')[1]; }
        }
    }
    document.getElementById('stat-total-shiny').textContent = totalShiny;
    document.getElementById('stat-total-encounters').textContent = totalEncounters;
    const longestHuntElement = document.getElementById('stat-longest-hunt');
    if (hardestPokemonId && maxEncounters > 0) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${hardestPokemonId}`);
            if (response.ok) { const data = await response.json(); longestHuntElement.textContent = `${capitalized(data.name)} (${maxEncounters})`; }
        } catch (e) { longestHuntElement.textContent = `N°${hardestPokemonId} (${maxEncounters})`; }
    } else { longestHuntElement.textContent = "- (0)"; }
}

async function loadGeneration(limit, offset, name, genNumber) {
    document.getElementById('gen-title').textContent = `Génération ${genNumber} (${name})`;
    pokedexGrid.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Chargement...</p>';
    currentHuntId = null; closeLiveHunt(); 
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
        const data = await response.json(); pokedexGrid.innerHTML = '';
        data.results.forEach(pokemon => createPokemonCard(pokemon.url.split('/')[6], pokemon.name));
    } catch (error) { pokedexGrid.innerHTML = 'Erreur.'; }
}

async function loadCustomList(listName, pokemonNames) {
    document.getElementById('gen-title').textContent = listName;
    pokedexGrid.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Chargement...</p>';
    currentHuntId = null; closeLiveHunt();
    try {
        pokedexGrid.innerHTML = '';
        for (const name of pokemonNames) {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            if (response.ok) { const data = await response.json(); createPokemonCard(data.id, data.name); }
        }
    } catch (error) { console.error(error); }
}

function createPokemonCard(id, name) {
    const card = document.createElement('div'); card.className = 'pokemon-card'; const capName = capitalized(name);
    const isShiny = localStorage.getItem(`shiny-${id}`) === 'true'; 
    const savedEncounters = localStorage.getItem(`encounters-${id}`) || '';
    const savedGame = localStorage.getItem(`game-${id}`) || '';
    const savedMethod = localStorage.getItem(`method-${id}`) || '';
    const savedNickname = localStorage.getItem(`nickname-${id}`) || '';
    const imgClass = isShiny ? '' : 'not-caught';
    const imgSrc = isShiny ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png` : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    const checkedAttr = isShiny ? 'checked' : ''; 

    card.innerHTML = `
        <img src="${imgSrc}" id="img-${id}" class="${imgClass}" alt="${capName}">
        <h3>#${id} ${capName}</h3>
        <input type="text" id="nickname-${id}" placeholder="Surnom..." value="${savedNickname}" oninput="saveNickname(${id})" class="hunt-select" style="margin-bottom: 10px; text-align: center; font-style: italic; background: rgba(0,0,0,0.02);">
        <label style="cursor: pointer; font-weight: 800; color: var(--accent-orange); display: block; margin-bottom: 15px;">
            <input type="checkbox" id="shiny-${id}" onchange="toggleShiny(${id})" ${checkedAttr}> ✨ Shiny obtenu
        </label>
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px; text-align: left; border-top: 1px solid #eee; padding-top: 15px;">
            <div><label style="color: #666; font-weight: 600;">Rencontres :</label><input type="number" id="encounters-${id}" value="${savedEncounters}" oninput="saveEncounters(${id})" min="0" placeholder="0" style="width: 100%; text-align: center; margin-top: 4px; box-sizing: border-box;"></div>
            <div><label style="color: #666; font-weight: 600;">Jeu :</label><select id="game-${id}" onchange="saveSelectData(${id}, 'game')" class="hunt-select">
                <option value="">-- Choisir --</option><option value="Old" ${savedGame === 'Old' ? 'selected' : ''}>Anciens jeux (8192)</option><option value="Modern" ${savedGame === 'Modern' ? 'selected' : ''}>Jeux Récents (4096)</option><option value="GO" ${savedGame === 'GO' ? 'selected' : ''}>Pokémon GO</option></select></div>
            <div><label style="color: #666; font-weight: 600;">Méthode :</label><select id="method-${id}" onchange="saveSelectData(${id}, 'method')" class="hunt-select">
                <option value="">-- Choisir --</option>
                <optgroup label="Classique"><option value="Hasard" ${savedMethod === 'Hasard' ? 'selected' : ''}>Hasard / Resets</option><option value="Charme" ${savedMethod === 'Charme' ? 'selected' : ''}>Avec Charme</option></optgroup>
                <optgroup label="Reproduction"><option value="Masuda" ${savedMethod === 'Masuda' ? 'selected' : ''}>Masuda</option><option value="MasudaCharme" ${savedMethod === 'MasudaCharme' ? 'selected' : ''}>Masuda + Charme</option></optgroup>
                <optgroup label="Let's Go"><option value="LG_Combo" ${savedMethod === 'LG_Combo' ? 'selected' : ''}>Combo Capture</option><option value="LG_Combo_Charme" ${savedMethod === 'LG_Combo_Charme' ? 'selected' : ''}>Combo + Charme</option><option value="LG_Combo_Parfum" ${savedMethod === 'LG_Combo_Parfum' ? 'selected' : ''}>Combo + Parfum</option><option value="LG_Combo_All" ${savedMethod === 'LG_Combo_All' ? 'selected' : ''}>Combo+Charme+Parfum</option></optgroup>
                <optgroup label="Méthodes à Chaîne"><option value="SOS" ${savedMethod === 'SOS' ? 'selected' : ''}>Appel SOS</option><option value="Radar" ${savedMethod === 'Radar' ? 'selected' : ''}>Poké Radar</option><option value="Peche" ${savedMethod === 'Peche' ? 'selected' : ''}>Pêche à la chaîne</option></optgroup>
                <optgroup label="Écarlate/Violet & LPA"><option value="Massive" ${savedMethod === 'Massive' ? 'selected' : ''}>App. Massive (60+)</option><option value="MassiveCharme" ${savedMethod === 'MassiveCharme' ? 'selected' : ''}>Massive (60+) + Charme</option><option value="SandwichMax" ${savedMethod === 'SandwichMax' ? 'selected' : ''}>Massive+Charme+Aura 3</option></optgroup>
                <optgroup label="Spécial"><option value="Dynamax" ${savedMethod === 'Dynamax' ? 'selected' : ''}>Antre Dynamax (Charme)</option></optgroup></select></div>
        </div>
        <button onclick="setAsCurrentHunt(${id}, '${capName}')" style="margin-top: 15px; width: 100%; background-color: var(--accent-blue); color: white; border: none; padding: 10px; border-radius: 10px; cursor: pointer; font-weight: bold; font-family: 'Plus Jakarta Sans', sans-serif;">🎯 Shasser en direct</button>
    `;
    pokedexGrid.appendChild(card);
}

// INTERACTIONS ET CONFETTIS ✨
function toggleShiny(id) {
    const checkbox = document.getElementById(`shiny-${id}`);
    const img = document.getElementById(`img-${id}`);
    if (checkbox.checked) {
        img.classList.remove('not-caught');
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`;
        playCry(id); 
        // EXPLOSION DE CONFETTIS !
        if (typeof confetti === "function") {
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#f1c40f', '#f39c12', '#e74c3c', '#3498db', '#2ecc71'] });
        }
    } else {
        img.classList.add('not-caught');
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    }
    localStorage.setItem(`shiny-${id}`, checkbox.checked);
    updateDashboard();
}

function saveEncounters(id) {
    const input = document.getElementById(`encounters-${id}`);
    if (input.value > 100000) input.value = 100000; 
    localStorage.setItem(`encounters-${id}`, input.value);
    if (currentHuntId === id) document.getElementById('live-hunt-counter').textContent = input.value || 0;
    updateDashboard();
}

function saveNickname(id) { localStorage.setItem(`nickname-${id}`, document.getElementById(`nickname-${id}`).value); }

function saveSelectData(id, type) {
    localStorage.setItem(`${type}-${id}`, document.getElementById(`${type}-${id}`).value);
    if (currentHuntId === id) updateLiveOdds();
}

function playCry(id) {
    const audio = new Audio(`https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`);
    audio.volume = 0.3; audio.play().catch(e => console.log("Cri indisponible"));
}

function calculateOdds(game, method, chain = 0) {
    if (!game || !method || game === 'GO') return "1 / ???";
    let baseOdds = (game === 'Old') ? 8192 : 4096; let extraRolls = 0;
    if (method === 'Charme') extraRolls += 2;
    if (method === 'Masuda') extraRolls += 5;
    if (method === 'MasudaCharme') extraRolls += 7;
    if (method.startsWith('LG_Combo')) {
        baseOdds = 4096; if (method.includes('Charme')) extraRolls += 2; if (method.includes('Parfum') || method === 'LG_Combo_All') extraRolls += 1;
        if (chain >= 11 && chain <= 20) extraRolls += 3; else if (chain >= 21 && chain <= 30) extraRolls += 7; else if (chain >= 31) extraRolls += 11;
    }
    if (method === 'SOS') {
        baseOdds = 4096; if (chain >= 11 && chain <= 20) extraRolls += 4; else if (chain >= 21 && chain <= 30) extraRolls += 8; else if (chain >= 31) extraRolls += 12;
    }
    if (method === 'Massive') { if (baseOdds === 4096) extraRolls += 2; }
    if (method === 'MassiveCharme') { if (baseOdds === 4096) extraRolls += 4; }
    if (method === 'SandwichMax') { if (baseOdds === 4096) extraRolls += 7; }
    if (method === 'Radar') { if (chain >= 40) return baseOdds === 4096 ? "1 / 99 (Max)" : "1 / 200 (Max)"; if (chain >= 30) return "1 / 256"; if (chain >= 20) return "1 / 1024"; }
    if (method === 'Peche') { if (chain >= 20) return "1 / 100 (Max)"; if (chain > 0) return `1 / ${Math.round(baseOdds / (1 + chain * 2))}`; }
    if (method === 'Dynamax') return "1 / 100 (Fixe)";
    return `1 / ${Math.round(baseOdds / (1 + extraRolls))}`;
}

function updateLiveOdds() {
    if (!currentHuntId) return;
    const oddsEl = document.getElementById('live-hunt-odds');
    oddsEl.textContent = `Probabilité : ${calculateOdds(document.getElementById(`game-${currentHuntId}`).value, document.getElementById(`method-${currentHuntId}`).value, currentChainLength)}`;
    oddsEl.style.transform = 'scale(1.1)'; setTimeout(() => oddsEl.style.transform = 'scale(1)', 200);
}

// LOGIQUE CHRONOMÈTRE ⏱️
function formatTime(totalSeconds) {
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(totalSeconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

function toggleTimer() {
    if(!currentHuntId) return;
    const btn = document.getElementById('btn-timer-toggle');
    if(isTimerRunning) {
        clearInterval(timerInterval); isTimerRunning = false;
        btn.textContent = "▶️ Reprendre"; btn.style.backgroundColor = "var(--accent-blue)";
    } else {
        isTimerRunning = true;
        btn.textContent = "⏸️ Pause"; btn.style.backgroundColor = "var(--accent-orange)";
        timerInterval = setInterval(() => {
            timerSeconds++;
            document.getElementById('live-hunt-timer').textContent = formatTime(timerSeconds);
            localStorage.setItem(`timer-${currentHuntId}`, timerSeconds);
        }, 1000);
    }
}

function resetTimer() {
    if(!currentHuntId) return;
    if(confirm("Remettre le chrono à zéro pour ce Pokémon ?")) {
        timerSeconds = 0; document.getElementById('live-hunt-timer').textContent = formatTime(0);
        localStorage.setItem(`timer-${currentHuntId}`, 0);
    }
}

function setAsCurrentHunt(id, name) {
    currentHuntId = id; currentChainLength = 0;
    
    // Reset et chargement du Timer
    clearInterval(timerInterval); isTimerRunning = false;
    document.getElementById('btn-timer-toggle').textContent = "▶️ Démarrer";
    document.getElementById('btn-timer-toggle').style.backgroundColor = "var(--accent-blue)";
    timerSeconds = parseInt(localStorage.getItem(`timer-${id}`)) || 0;
    document.getElementById('live-hunt-timer').textContent = formatTime(timerSeconds);

    const encounters = localStorage.getItem(`encounters-${id}`) || 0;
    const nickname = localStorage.getItem(`nickname-${id}`) || capitalized(name);
    const method = document.getElementById(`method-${id}`).value;
    
    document.getElementById('live-hunt-img').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    document.getElementById('live-hunt-name').textContent = capitalized(name);
    document.getElementById('live-hunt-nickname').textContent = (nickname !== capitalized(name)) ? `"${nickname}"` : "";
    document.getElementById('live-hunt-counter').textContent = encounters;
    document.getElementById('live-hunt-chain').textContent = 0;
    
    document.getElementById('live-hunt-chain-container').style.display = chainMethods.includes(method) ? 'flex' : 'none';
    document.getElementById('live-hunt-module').style.display = 'block';
    updateLiveOdds(); window.scrollTo({ top: 0, behavior: 'smooth' });
}

function incrementLiveHunt() {
    if (!currentHuntId) return;
    let encounters = parseInt(localStorage.getItem(`encounters-${currentHuntId}`)) || 0; encounters++;
    localStorage.setItem(`encounters-${currentHuntId}`, encounters);
    document.getElementById('live-hunt-counter').textContent = encounters;
    if (document.getElementById(`encounters-${currentHuntId}`)) document.getElementById(`encounters-${currentHuntId}`).value = encounters;
    updateDashboard();
}

function incrementChain() { if (!currentHuntId) return; currentChainLength++; document.getElementById('live-hunt-chain').textContent = currentChainLength; incrementLiveHunt(); updateLiveOdds(); }
function breakChain() { currentChainLength = 0; document.getElementById('live-hunt-chain').textContent = 0; updateLiveOdds(); }
function closeLiveHunt() { clearInterval(timerInterval); isTimerRunning = false; document.getElementById('live-hunt-module').style.display = 'none'; currentHuntId = null; }

async function searchShiny() {
    const query = document.getElementById('search-shiny-input').value.toLowerCase().trim();
    if (query === "") { resetSearch(); return; }
    pokedexGrid.innerHTML = 'Recherche...'; currentHuntId = null; closeLiveHunt();
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`); if (!response.ok) throw new Error();
        const data = await response.json(); document.getElementById('gen-title').textContent = `Résultat : ${capitalized(data.name)}`;
        pokedexGrid.innerHTML = ''; createPokemonCard(data.id, data.name);
    } catch (e) { pokedexGrid.innerHTML = 'Pokémon introuvable.'; }
}
function resetSearch() { document.getElementById('search-shiny-input').value = ''; loadGeneration(151, 0, 'Kanto', 1); }

function exportData() {
    const data = {}; for (let i = 0; i < localStorage.length; i++) data[localStorage.key(i)] = localStorage.getItem(localStorage.key(i));
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }));
    a.download = `pokedex_data_${new Date().toISOString().slice(0,10)}.json`; a.click();
}

function importData() {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
    input.onchange = e => {
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const data = JSON.parse(ev.target.result); localStorage.clear(); Object.keys(data).forEach(key => localStorage.setItem(key, data[key]));
                alert("Données chargées !"); location.reload();
            } catch (err) { alert("Fichier JSON invalide."); }
        }; reader.readAsText(e.target.files[0]);
    }; input.click();
}

function toggleTheme() { document.body.classList.toggle('dark-mode'); const isDark = document.body.classList.contains('dark-mode'); localStorage.setItem('darkMode', isDark); updateThemeButton(isDark); }
function loadTheme() { const isDark = localStorage.getItem('darkMode') === 'true'; if (isDark) document.body.classList.add('dark-mode'); updateThemeButton(isDark); }
function updateThemeButton(isDark) { const btn = document.getElementById('btn-theme'); btn.textContent = isDark ? '☀️' : '🌙'; btn.style.backgroundColor = isDark ? '#f39c12' : '#2c3e50'; btn.style.borderColor = isDark ? '#f39c12' : '#2c3e50'; }

// ==========================================
// 11. HALL OF FAME V5 (Surnoms, MVP, Épitaphes & RECHERCHE PAR NOM)
// ==========================================
const nuzlockeGames = [
    { id: 'gen1', name: 'Kanto (Rouge/Bleu/Jaune/RFVF)' }, { id: 'gen2', name: 'Johto (Or/Argent/Cristal/HGSS)' },
    { id: 'gen3', name: 'Hoenn (Rubis/Saphir/Émeraude/ROSA)' }, { id: 'gen4', name: 'Sinnoh (Diamant/Perle/Platine/DEPS)' },
    { id: 'gen5', name: 'Unys (Noir/Blanc 1 & 2)' }, { id: 'gen6', name: 'Kalos (X/Y)' },
    { id: 'gen7', name: 'Alola (Soleil/Lune/USUL)' }, { id: 'gen8', name: 'Galar (Épée/Bouclier)' },
    { id: 'gen9', name: 'Paldea (Écarlate/Violet)' }
];

function loadHallOfFame() {
    const grid = document.getElementById('hof-grid');
    if (grid.children.length > 0) return; 
    
    nuzlockeGames.forEach(game => {
        const card = document.createElement('div'); card.className = 'game-card';
        
        let teamHTML = '';
        for(let num=1; num<=6; num++) {
            const savedNick = localStorage.getItem(`team-${game.id}-${num}-nick`) || '';
            const isMVP = localStorage.getItem(`team-${game.id}-${num}-mvp`) === 'true';
            const crownClass = isMVP ? 'mvp-crown active' : 'mvp-crown';
            
            teamHTML += `
                <div class="team-member">
                    <div class="${crownClass}" id="crown-${game.id}-${num}" onclick="toggleMVP('${game.id}', ${num})" title="Élire MVP de la partie">👑</div>
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" id="team-${game.id}-${num}-img">
                    <input type="text" id="team-${game.id}-${num}-nick" placeholder="Surnom" value="${savedNick}" oninput="saveHoFNickname('${game.id}', ${num})" style="width: 85px; text-align: center; margin: 8px 0 4px 0; font-size: 11px; font-style: italic; border-radius: 6px; padding: 4px; box-sizing: border-box;">
                    <input type="text" id="team-${game.id}-${num}-id" placeholder="Nom ou ID" onchange="updateHoFSprite('${game.id}', ${num})" style="width: 85px; text-align: center; border-radius: 6px; padding: 4px; font-size: 11px; box-sizing: border-box;">
                </div>
            `;
        }

        card.innerHTML = `
            <div class="game-title">${game.name}</div>
            <h4 style="margin-bottom: 15px;">🏆 Mon Équipe Finale</h4>
            <div class="team-container" style="display: flex; gap: 15px; flex-wrap: wrap; justify-content: flex-start;">${teamHTML}</div>
            
            <h4 style="margin-top: 30px; margin-bottom: 5px; color: var(--accent-blue);">💻 Boîte PC (Réserve)</h4>
            <div style="display: flex; gap: 10px; margin-bottom: 10px;"><input type="text" id="pc-${game.id}-input" placeholder="Nom ou ID..." style="width: 150px; text-align: center; border-radius: 8px;"><button onclick="addExtraPokemon('${game.id}', 'pc')" style="background-color: var(--accent-blue); color: white; border: none; padding: 5px 15px; border-radius: 8px; cursor: pointer; font-weight: bold;">Ajouter</button><button onclick="clearExtra('${game.id}', 'pc')" style="background-color: #95a5a6; color: white; border: none; padding: 5px 15px; border-radius: 8px; cursor: pointer;">Vider</button></div>
            <div id="pc-container-${game.id}" class="extra-container"></div>
            
            <h4 style="margin-top: 25px; margin-bottom: 5px; color: #e74c3c;">🪦 Cimetière (Clic droit = Épitaphe)</h4>
            <div style="display: flex; gap: 10px; margin-bottom: 10px;"><input type="text" id="grave-${game.id}-input" placeholder="Nom ou ID..." style="width: 150px; text-align: center; border-radius: 8px;"><button onclick="addExtraPokemon('${game.id}', 'grave')" style="background-color: #e74c3c; color: white; border: none; padding: 5px 15px; border-radius: 8px; cursor: pointer; font-weight: bold;">Ajouter</button><button onclick="clearExtra('${game.id}', 'grave')" style="background-color: #333; color: white; border: none; padding: 5px 15px; border-radius: 8px; cursor: pointer;">Vider</button></div>
            <div id="grave-container-${game.id}" class="extra-container graveyard"></div>
        `;
        grid.appendChild(card);
        for(let i=1; i<=6; i++) updateHoFSprite(game.id, i, true);
        loadExtraPokemon(game.id, 'pc'); loadExtraPokemon(game.id, 'grave');
    });
}

// NOUVEAU : Fonction asynchrone pour gérer la recherche par nom
async function updateHoFSprite(gameId, memberNum, isInitialLoad = false) {
    const inputId = `team-${gameId}-${memberNum}-id`; 
    const imgId = `team-${gameId}-${memberNum}-img`;
    const input = document.getElementById(inputId); 
    const img = document.getElementById(imgId);
    
    if (isInitialLoad) { 
        const savedId = localStorage.getItem(inputId); 
        if (savedId) { input.value = savedId; img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${savedId}.png`; } 
        return; 
    }
    
    const query = input.value.toLowerCase().trim();
    if (!query) {
        img.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
        localStorage.removeItem(inputId);
        return;
    }

    let pokemonId = query;
    // Si c'est du texte (pas un nombre), on interroge l'API
    if (isNaN(query)) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
            if (response.ok) {
                const data = await response.json();
                pokemonId = data.id;
                input.value = pokemonId; // On remplace le nom par l'ID officiel pour plus de clarté
            } else {
                alert("❌ Pokémon introuvable ! Vérifie l'orthographe (en anglais).");
                input.value = "";
                return;
            }
        } catch (e) { return; }
    }

    if (pokemonId && pokemonId > 0 && pokemonId <= 1025) { 
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`; 
        localStorage.setItem(inputId, pokemonId); 
    } else { 
        img.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"; 
        localStorage.removeItem(inputId); 
    }
}

function saveHoFNickname(gameId, memberNum) { localStorage.setItem(`team-${gameId}-${memberNum}-nick`, document.getElementById(`team-${gameId}-${memberNum}-nick`).value); }

function toggleMVP(gameId, num) {
    const crown = document.getElementById(`crown-${gameId}-${num}`);
    if (crown.classList.contains('active')) {
        crown.classList.remove('active'); localStorage.setItem(`team-${gameId}-${num}-mvp`, 'false');
    } else {
        for(let i=1; i<=6; i++) { document.getElementById(`crown-${gameId}-${i}`).classList.remove('active'); localStorage.setItem(`team-${gameId}-${i}-mvp`, 'false'); }
        crown.classList.add('active'); localStorage.setItem(`team-${gameId}-${num}-mvp`, 'true');
    }
}

// NOUVEAU : Asynchrone pour le PC et le Cimetière
async function addExtraPokemon(gameId, type) {
    const input = document.getElementById(`${type}-${gameId}-input`); 
    const query = input.value.toLowerCase().trim();
    if (!query) return;

    let pokemonId = query;
    if (isNaN(query)) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
            if (response.ok) {
                const data = await response.json();
                pokemonId = data.id;
            } else {
                alert("❌ Pokémon introuvable ! Vérifie l'orthographe (en anglais).");
                return;
            }
        } catch (e) { return; }
    }

    if (!pokemonId || pokemonId <= 0 || pokemonId > 1025) return;
    
    let list = JSON.parse(localStorage.getItem(`${type}-list-${gameId}`)) || []; 
    list.push(pokemonId);
    localStorage.setItem(`${type}-list-${gameId}`, JSON.stringify(list)); 
    input.value = ''; 
    loadExtraPokemon(gameId, type);
}

function loadExtraPokemon(gameId, type) {
    const container = document.getElementById(`${type}-container-${gameId}`); container.innerHTML = '';
    let list = JSON.parse(localStorage.getItem(`${type}-list-${gameId}`)) || [];
    list.forEach((pokeId, index) => {
        const img = document.createElement('img'); img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokeId}.png`; img.className = 'extra-sprite';
        if (type === 'grave') {
            const deathNote = localStorage.getItem(`grave-note-${gameId}-${index}`) || "Cause inconnue. Clic Droit pour ajouter une note.";
            img.title = `${deathNote} (Double-clic pour supprimer)`;
            img.oncontextmenu = (e) => { e.preventDefault(); addDeathNote(gameId, index); }; 
        } else {
            img.title = "Double-cliquez pour supprimer";
        }
        img.ondblclick = () => removeExtraPokemon(gameId, type, index); container.appendChild(img);
    });
}

function addDeathNote(gameId, index) {
    const currentNote = localStorage.getItem(`grave-note-${gameId}-${index}`) || "";
    const newNote = prompt("✍️ Racontez la cause du décès de ce Pokémon :", currentNote);
    if (newNote !== null) { localStorage.setItem(`grave-note-${gameId}-${index}`, newNote); loadExtraPokemon(gameId, 'grave'); }
}

function removeExtraPokemon(gameId, type, index) {
    let list = JSON.parse(localStorage.getItem(`${type}-list-${gameId}`)) || []; list.splice(index, 1);
    localStorage.setItem(`${type}-list-${gameId}`, JSON.stringify(list));
    if(type === 'grave') {
        for(let i = index; i < list.length; i++) {
            let nextNote = localStorage.getItem(`grave-note-${gameId}-${i+1}`);
            if (nextNote) localStorage.setItem(`grave-note-${gameId}-${i}`, nextNote); else localStorage.removeItem(`grave-note-${gameId}-${i}`);
        }
        localStorage.removeItem(`grave-note-${gameId}-${list.length}`);
    }
    loadExtraPokemon(gameId, type);
}

function clearExtra(gameId, type) { if(confirm("Es-tu sûr de vouloir vider cette boîte ?")) { localStorage.removeItem(`${type}-list-${gameId}`); loadExtraPokemon(gameId, type); } }

// ==========================================
// 12. ROULETTE DE SHASSE ALÉATOIRE (CIBLES INÉDITES)
// ==========================================

function openRandomHuntModal() {
    document.getElementById('random-hunt-modal').style.display = 'flex';
    generateRandomHunt();
}

function closeRandomModal() {
    document.getElementById('random-hunt-modal').style.display = 'none';
}

async function generateRandomHunt() {
    const content = document.getElementById('random-hunt-content');
    const loading = document.getElementById('random-hunt-loading');
    const errorMsg = document.getElementById('random-hunt-error');
    const btnAccept = document.getElementById('btn-accept-random');
    
    // Animation de chargement
    content.style.display = 'none';
    loading.style.display = 'block';
    errorMsg.style.display = 'none';
    btnAccept.style.display = 'block';
    
    // 1. On scanne le Pokédex pour trouver ceux NON capturés
    let uncaughtIds = [];
    for (let i = 1; i <= 1025; i++) {
        if (localStorage.getItem(`shiny-${i}`) !== 'true') {
            uncaughtIds.push(i);
        }
    }
    
    // Sécurité : Si tu as absolument TOUT attrapé (Le rêve !)
    if (uncaughtIds.length === 0) {
        loading.style.display = 'none';
        content.style.display = 'block';
        document.getElementById('random-hunt-img').src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
        document.getElementById('random-hunt-name').textContent = "Incroyable !";
        errorMsg.textContent = "Tu as déjà obtenu tous les Shinys du Pokédex !";
        errorMsg.style.display = 'block';
        btnAccept.style.display = 'none';
        return;
    }

    // 2. Tirage au sort intelligent parmi les ID restants
    const randomIndex = Math.floor(Math.random() * uncaughtIds.length);
    const randomId = uncaughtIds[randomIndex];
    
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        
        // 3. Affichage du Pokémon tiré au sort (directement en Shiny pour hyper !)
        document.getElementById('random-hunt-img').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${data.id}.png`;
        document.getElementById('random-hunt-name').textContent = `#${data.id} ${capitalized(data.name)}`;
        
        // 4. Action si le joueur accepte le défi
        btnAccept.onclick = () => {
            closeRandomModal();
            // On nettoie la grille et on affiche uniquement le Pokémon tiré au sort
            document.getElementById('gen-title').textContent = "🎯 Défi Aléatoire Accepté !";
            pokedexGrid.innerHTML = '';
            createPokemonCard(data.id, data.name);
            
            // On lance automatiquement le module de Shasse en Direct !
            setTimeout(() => {
                setAsCurrentHunt(data.id, data.name);
            }, 100);
        };
        
        // Fin du chargement
        loading.style.display = 'none';
        content.style.display = 'block';
        
        // Petit cri du Pokémon pour l'immersion (optionnel)
        playCry(data.id);
        
    } catch (error) {
        loading.textContent = 'Erreur réseau...';
        setTimeout(generateRandomHunt, 1000); // Réessaie si le fetch bugge
    }
}