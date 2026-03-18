// ==========================================
// 1. CONFIGURATION ET DONNÉES
// ==========================================
const pokedexGrid = document.getElementById('pokedex-grid');
const shinySection = document.getElementById('shiny-section');
const hofSection = document.getElementById('hof-section');

// Variable pour suivre la shasse en direct
let currentHuntId = null;

// Données des méthodes et taux (approximatifs)
const huntMethods = {
    'Hasard': { name: 'Hasard (Full Odds)', odds: { 8192: 8192, 4096: 4096 } },
    'Charme': { name: 'Avec Charme Chroma', odds: { 8192: 2731, 4096: 1365 } },
    'Masuda': { name: 'Masuda (Œufs)', odds: { 8192: 1365, 4096: 512 } },
    'MasudaCharme': { name: 'Masuda + Charme', odds: { 8192: 1024, 4096: 512 } },
    'Reset': { name: 'Resets (SR)', odds: { 8192: 8192, 4096: 4096 } },
    'Radar': { name: 'Poké Radar (Chaîne 40)', odds: { 8192: 200, 4096: 200 } },
    'Peche': { name: 'Pêche à la chaîne', odds: { 8192: 100, 4096: 100 } }, // Taux très variable
    'SOS': { name: 'Appel SOS (Chaîne 31+)', odds: { 8192: 315, 4096: 315 } },
    'Massive': { name: 'Apparition Massive (LPA/EV)', odds: { 8192: 158, 4096: 158 } },
    'MassiveCharme': { name: 'Massive + Charme + Sandwich', odds: { 4096: 512 } },
    'Dynamax': { name: 'Antre Dynamax (avec Charme)', odds: { 4096: 100 } }
};

// Listes des formes régionales et spéciales
const specialForms = {
    alola: ['rattata-alola', 'raticate-alola', 'raichu-alola', 'sandshrew-alola', 'sandslash-alola', 'vulpix-alola', 'ninetales-alola', 'diglett-alola', 'dugtrio-alola', 'meowth-alola', 'persian-alola', 'geodude-alola', 'graveler-alola', 'golem-alola', 'grimer-alola', 'muk-alola', 'exeggutor-alola', 'marowak-alola'],
    galar: ['meowth-galar', 'ponyta-galar', 'rapidash-galar', 'slowpoke-galar', 'slowbro-galar', 'farfetchd-galar', 'weezing-galar', 'mr-mime-galar', 'articuno-galar', 'zapdos-galar', 'moltres-galar', 'slowking-galar', 'corsola-galar', 'zigzagoon-galar', 'linoone-galar', 'darumaka-galar', 'darmanitan-galar-standard', 'yamask-galar', 'stunfisk-galar'],
    hisui: ['growlithe-hisui', 'arcanine-hisui', 'voltorb-hisui', 'electrode-hisui', 'typhlosion-hisui', 'qwilfish-hisui', 'sneasel-hisui', 'samurott-hisui', 'lilligant-hisui', 'basculin-white-striped', 'zorua-hisui', 'zoroark-hisui', 'braviary-hisui', 'sliggoo-hisui', 'goodra-hisui', 'avalugg-hisui', 'decidueye-hisui'],
    paldea: ['tauros-paldea-combat-breed', 'tauros-paldea-blaze-breed', 'tauros-paldea-aqua-breed', 'wooper-paldea'],
    speciales: ['lycanroc-dusk', 'zygarde-10', 'greninja-ash', 'ursaluna-bloodmoon', 'gimmighoul-roaming', 'palafin-hero']
};

// ==========================================
// 2. INITIALISATION ET NAVIGATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    showSection('shiny'); // Afficher le tracker par défaut
    loadTheme();         // Charger le mode sombre si activé
    updateDashboard();   // Calculer les stats globales
});

function showSection(sectionName) {
    if (sectionName === 'shiny') {
        shinySection.style.display = 'block';
        hofSection.style.display = 'none';
        setActiveButton('btn-shiny');
        if (pokedexGrid.innerHTML === '') loadGeneration(151, 0, 'Kanto', 1); // Charger Gen 1 si vide
    } else {
        shinySection.style.display = 'none';
        hofSection.style.display = 'block';
        setActiveButton('btn-hof');
        loadHallOfFame();
    }
}

function setActiveButton(activeId) {
    document.getElementById('btn-shiny').style.backgroundColor = '';
    document.getElementById('btn-hof').style.backgroundColor = '';
    document.getElementById(activeId).style.backgroundColor = 'rgba(255,255,255,0.4)';
}

// ==========================================
// 3. TABLEAU DE BORD (Statistiques)
// ==========================================
async function updateDashboard() {
    let totalShiny = 0;
    let totalEncounters = 0;
    let maxEncounters = 0;
    let hardestPokemonId = null;

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('shiny-') && localStorage.getItem(key) === 'true') totalShiny++;
        if (key.startsWith('encounters-')) {
            const count = parseInt(localStorage.getItem(key)) || 0;
            totalEncounters += count;
            if (count > maxEncounters) { maxEncounters = count; hardestPokemonId = key.split('-')[1]; }
        }
    }

    document.getElementById('stat-total-shiny').textContent = totalShiny;
    document.getElementById('stat-total-encounters').textContent = totalEncounters;

    const longestHuntElement = document.getElementById('stat-longest-hunt');
    if (hardestPokemonId && maxEncounters > 0) {
        longestHuntElement.textContent = `N°${hardestPokemonId} (${maxEncounters})`;
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${hardestPokemonId}`);
            if (response.ok) {
                const data = await response.json();
                const name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
                longestHuntElement.textContent = `${name} (${maxEncounters})`;
            }
        } catch (e) { console.error(e); }
    } else {
        longestHuntElement.textContent = "- (0)";
    }
}

// ==========================================
// 4. CHARGEMENT DU SHINY TRACKER
// ==========================================
async function loadGeneration(limit, offset, name, genNumber) {
    document.getElementById('gen-title').textContent = `Génération ${genNumber} (${name})`;
    pokedexGrid.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Chargement du Pokédex...</p>';
    currentHuntId = null; closeLiveHunt(); // Fermer la shasse en cours si on change de gen
    
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
        const data = await response.json();
        pokedexGrid.innerHTML = '';
        data.results.forEach(pokemon => {
            const id = pokemon.url.split('/')[6];
            createPokemonCard(id, pokemon.name);
        });
    } catch (error) { pokedexGrid.innerHTML = 'Erreur lors du chargement.'; }
}

async function loadCustomList(listName, pokemonNames) {
    document.getElementById('gen-title').textContent = listName;
    pokedexGrid.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Chargement...</p>';
    currentHuntId = null; closeLiveHunt();
    
    try {
        pokedexGrid.innerHTML = '';
        for (const name of pokemonNames) {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            if (response.ok) {
                const data = await response.json();
                createPokemonCard(data.id, data.name);
            }
        }
    } catch (error) { console.error(error); }
}

// ==========================================
// 5. CRÉATION DES CARTES POKÉMON (v3.0)
// ==========================================
function createPokemonCard(id, name) {
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    // Récupérer données sauvegardées
    const isShiny = localStorage.getItem(`shiny-${id}`) === 'true'; 
    const savedEncounters = localStorage.getItem(`encounters-${id}`) || '';
    const savedGame = localStorage.getItem(`game-${id}`) || '';
    const savedMethod = localStorage.getItem(`method-${id}`) || '';
    const savedNickname = localStorage.getItem(`nickname-${id}`) || '';

    // Définir image et style
    const imgClass = isShiny ? '' : 'not-caught';
    const imgSrc = isShiny 
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    const checkedAttr = isShiny ? 'checked' : ''; 

    card.innerHTML = `
        <img src="${imgSrc}" id="img-${id}" class="${imgClass}" alt="${capitalizedName}">
        <h3>#${id} ${capitalizedName}</h3>
        
        <input type="text" id="nickname-${id}" placeholder="Surnom..." value="${savedNickname}" oninput="saveNickname(${id})" class="hunt-select" style="margin-bottom: 10px; text-align: center; font-style: italic; background: rgba(0,0,0,0.02);">
        
        <label style="cursor: pointer; font-weight: 800; color: var(--accent-orange); display: block; margin-bottom: 15px;">
            <input type="checkbox" id="shiny-${id}" onchange="toggleShiny(${id})" ${checkedAttr}> ✨ Shiny obtenu
        </label>
        
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px; text-align: left; border-top: 1px solid #eee; padding-top: 15px;">
            <div>
                <label style="color: #666; font-weight: 600;">Rencontres :</label>
                <input type="number" id="encounters-${id}" value="${savedEncounters}" oninput="saveEncounters(${id})" min="0" placeholder="0" style="width: 100%; text-align: center; margin-top: 4px; box-sizing: border-box;">
            </div>
            
            <div>
                <label style="color: #666; font-weight: 600;">Jeu de capture :</label>
                <select id="game-${id}" onchange="saveSelectData(${id}, 'game')" class="hunt-select">
                    <option value="">-- Choisir --</option>
                    <option value="Old" ${savedGame === 'Old' ? 'selected' : ''}>Anciens jeux (8192)</option>
                    <option value="Modern" ${savedGame === 'Modern' ? 'selected' : ''}>Jeux Récents (4096)</option>
                    <option value="GO" ${savedGame === 'GO' ? 'selected' : ''}>Pokémon GO</option>
                </select>
            </div>

            <div>
                <label style="color: #666; font-weight: 600;">Méthode :</label>
                <select id="method-${id}" onchange="saveSelectData(${id}, 'method')" class="hunt-select">
                    <option value="">-- Choisir --</option>
                    <option value="Hasard" ${savedMethod === 'Hasard' ? 'selected' : ''}>Hasard Full Odds</option>
                    <option value="Charme" ${savedMethod === 'Charme' ? 'selected' : ''}>Avec Charme Chroma</option>
                    <option value="Masuda" ${savedMethod === 'Masuda' ? 'selected' : ''}>Méthode Masuda</option>
                    <option value="Massive" ${savedMethod === 'Massive' ? 'selected' : ''}>Apparition Massive</option>
                    <option value="Reset" ${savedMethod === 'Reset' ? 'selected' : ''}>Soft Resets</option>
                </select>
            </div>
        </div>
        
        <button onclick="setAsCurrentHunt(${id}, '${capitalizedName}')" style="margin-top: 15px; width: 100%; background-color: var(--accent-blue); color: white; border: none; padding: 10px; border-radius: 10px; cursor: pointer; font-weight: bold; font-family: 'Plus Jakarta Sans', sans-serif; transition: background 0.2s;">
            🎯 Shasser en direct
        </button>
    `;

    pokedexGrid.appendChild(card);
}

// ==========================================
// 6. INTERACTIONS ET SAUVEGARDE (v3.0)
// ==========================================
function toggleShiny(id) {
    const checkbox = document.getElementById(`shiny-${id}`);
    const img = document.getElementById(`img-${id}`);
    
    if (checkbox.checked) {
        img.classList.remove('not-caught');
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`;
        playCry(id); // Jouer le cri
    } else {
        img.classList.add('not-caught');
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    }
    localStorage.setItem(`shiny-${id}`, checkbox.checked);
    updateDashboard();
}

function saveEncounters(id) {
    const input = document.getElementById(`encounters-${id}`);
    if (input.value > 100000) input.value = 100000; // Limite raisonnable
    localStorage.setItem(`encounters-${id}`, input.value);
    
    // Synchro si c'est la shasse en cours
    if (currentHuntId === id) {
        document.getElementById('live-hunt-counter').textContent = input.value || 0;
    }
    updateDashboard();
}

function saveNickname(id) {
    const nick = document.getElementById(`nickname-${id}`).value;
    localStorage.setItem(`nickname-${id}`, nick);
}

function saveSelectData(id, type) {
    const val = document.getElementById(`${type}-${id}`).value;
    localStorage.setItem(`${type}-${id}`, val);
    
    // Synchro probabilités si shasse en cours
    if (currentHuntId === id) {
        const game = document.getElementById(`game-${id}`).value;
        const method = document.getElementById(`method-${id}`).value;
        document.getElementById('live-hunt-odds').textContent = `Probabilité : ${calculateOdds(game, method)}`;
    }
}

function playCry(id) {
    const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;
    const audio = new Audio(cryUrl);
    audio.volume = 0.3;
    audio.play().catch(e => console.log("Cri indisponible"));
}

// ==========================================
// 7. MODULE SHASSE EN DIRECT & CLICKER
// ==========================================
function calculateOdds(game, method) {
    if (!game || !method || game === 'GO' || !huntMethods[method]) return "1 / ??? (Remplissez)";
    const baseRate = (game === 'Old') ? 8192 : 4096;
    const finalOdds = huntMethods[method].odds[baseRate] || baseRate;
    return `1 / ${finalOdds}`;
}

function setAsCurrentHunt(id, name) {
    currentHuntId = id;
    const encounters = localStorage.getItem(`encounters-${id}`) || 0;
    const nickname = localStorage.getItem(`nickname-${id}`) || capitalized(name);
    const game = document.getElementById(`game-${id}`).value;
    const method = document.getElementById(`method-${id}`).value;
    
    document.getElementById('live-hunt-img').src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    document.getElementById('live-hunt-name').textContent = capitalized(name);
    document.getElementById('live-hunt-nickname').textContent = (nickname !== capitalized(name)) ? `"${nickname}"` : "";
    document.getElementById('live-hunt-counter').textContent = encounters;
    document.getElementById('live-hunt-odds').textContent = `Probabilité : ${calculateOdds(game, method)}`;
    
    document.getElementById('live-hunt-module').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function incrementLiveHunt() {
    if (!currentHuntId) return;
    let encounters = parseInt(localStorage.getItem(`encounters-${currentHuntId}`)) || 0;
    encounters++;
    localStorage.setItem(`encounters-${currentHuntId}`, encounters);
    
    document.getElementById('live-hunt-counter').textContent = encounters;
    const cardInput = document.getElementById(`encounters-${currentHuntId}`);
    if (cardInput) cardInput.value = encounters;
    updateDashboard();
}

function closeLiveHunt() {
    document.getElementById('live-hunt-module').style.display = 'none';
    currentHuntId = null;
}

// ==========================================
// 8. BARRE DE RECHERCHE
// ==========================================
async function searchShiny() {
    const query = document.getElementById('search-shiny-input').value.toLowerCase().trim();
    if (query === "") { resetSearch(); return; }
    pokedexGrid.innerHTML = 'Recherche...'; currentHuntId = null; closeLiveHunt();
    
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        document.getElementById('gen-title').textContent = `Résultat : ${capitalized(data.name)}`;
        pokedexGrid.innerHTML = '';
        createPokemonCard(data.id, data.name);
    } catch (e) { pokedexGrid.innerHTML = 'Pokémon introuvable (nom anglais ou ID).'; }
}

function resetSearch() {
    document.getElementById('search-shiny-input').value = '';
    loadGeneration(151, 0, 'Kanto', 1);
}

// ==========================================
// 9. GESTIONNAIRE DE SAUVEGARDE (.json)
// ==========================================
function exportData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
    }
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pokedex_data_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = event => {
            try {
                const data = JSON.parse(event.target.result);
                localStorage.clear();
                Object.keys(data).forEach(key => localStorage.setItem(key, data[key]));
                alert("Données chargées ! La page va s'actualiser.");
                location.reload();
            } catch (err) { alert("Fichier JSON invalide."); }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ==========================================
// 10. MODE SOMBRE (DARK MODE)
// ==========================================
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    updateThemeButton(isDark);
}

function loadTheme() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) document.body.classList.add('dark-mode');
    updateThemeButton(isDark);
}

function updateThemeButton(isDark) {
    const btn = document.getElementById('btn-theme');
    btn.textContent = isDark ? '☀️ Mode Clair' : '🌙 Mode Sombre';
    btn.style.backgroundColor = isDark ? '#f39c12' : '#2c3e50';
    btn.style.borderColor = isDark ? '#f39c12' : '#2c3e50';
}

// ==========================================
// 11. HALL OF FAME (Logique simplifiée)
// ==========================================
const gamesList = [
    { id: 'rbj', name: 'Rouge/Bleu/Jaune', region: 'Kanto' },
    { id: 'hgss', name: 'HeartGold/SoulSilver', region: 'Johto' },
    { id: 'oras', name: 'Rubis Oméga/Saphir Alpha', region: 'Hoenn' },
    { id: 'usul', name: 'Ultra-Soleil/Ultra-Lune', region: 'Alola' },
    { id: 'ev', name: 'Écarlate/Violet', region: 'Paldea' }
];

function loadHallOfFame() {
    const grid = document.getElementById('hof-grid');
    if (grid.innerHTML !== '') return; // Ne pas recharger si déjà fait
    
    gamesList.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
            <div class="game-title">${game.name} (${game.region})</div>
            <p style="font-size: 14px; color: #666; margin-top:-15px; margin-bottom:20px;">Entrez les IDs de vos Pokémon (ex: 6 pour Dracaufeu)</p>
            <div class="team-container">
                ${[1,2,3,4,5,6].map(num => `
                    <div class="team-member">
                        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" id="team-${game.id}-${num}-img">
                        <input type="number" id="team-${game.id}-${num}-id" placeholder="ID" oninput="updateHoFSprite('${game.id}', ${num})" style="width: 60px; text-align: center; display:block; margin: 5px auto 0 auto;">
                    </div>
                `).join('')}
            </div>
        `;
        grid.appendChild(card);
        // Charger les sprites sauvegardés
        for(let i=1; i<=6; i++) updateHoFSprite(game.id, i, true);
    });
}

function updateHoFSprite(gameId, memberNum, isInitialLoad = false) {
    const inputId = `team-${gameId}-${memberNum}-id`;
    const imgId = `team-${gameId}-${memberNum}-img`;
    const pokemonId = document.getElementById(inputId).value;
    const img = document.getElementById(imgId);

    if (isInitialLoad) {
        const savedId = localStorage.getItem(inputId);
        if (savedId) {
            document.getElementById(inputId).value = savedId;
            img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${savedId}.png`;
        }
        return;
    }

    if (pokemonId && pokemonId > 0 && pokemonId <= 1025) {
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
        localStorage.setItem(inputId, pokemonId);
    } else {
        img.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
        localStorage.removeItem(inputId);
    }
}

// Outil pratique
function capitalized(str) { return str.charAt(0).toUpperCase() + str.slice(1); }