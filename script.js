// ==========================================
// 1. VARIABLES & BASE DE DONNÉES
// ==========================================
const pokedexGrid = document.getElementById('pokedex-grid');

const huntingTips = {
    1: [
        "🥇 Écarlate/Violet : Reproduction (Masuda) avec Charme Chroma - 1/512",
        "🥈 Let's Go Pikachu/Évoli : Combo Capture (31+) avec Charme - ~1/273",
        "🥉 Rouge Feu/Vert Feuille : Resets au Bourg Palette - 1/8192"
    ],
    6: [
        "🥇 Épée/Bouclier : Antre Dynamax - 1/100 (avec Charme)",
        "🥈 Let's Go : Spawn rare dans les airs (Combo 31+)"
    ],
    130: [
        "🥇 Or/Argent/Cristal (ou HGSS) : Le fameux Léviator Rouge du Lac Colère ! (100%)",
        "🥈 Écarlate/Violet : Apparitions massives dans l'eau"
    ],
    151: [
        "🥇 Émeraude (Japon) : Rencontres/Fuites (Vieille Carte Mer) - 1/8192",
        "🥈 Pokémon GO : Étude magistrale (100% mais très long)"
    ]
};

// ==========================================
// 2. SHINY TRACKER (Générations & Cartes)
// ==========================================
async function loadGeneration(limit, offset, regionName, genNumber) {
    try {
        document.getElementById('gen-title').textContent = `Génération ${genNumber} (${regionName})`;
        pokedexGrid.innerHTML = '';

        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
        const data = await response.json();
        const pokemonList = data.results;

        pokemonList.forEach((pokemon, index) => {
            const id = offset + index + 1;
            createPokemonCard(id, pokemon.name);
        });
    } catch (error) {
        console.error("Erreur lors du chargement des Pokémon :", error);
    }
}
// Fonction pour charger une liste spécifique de Pokémon (ex: Formes régionales)
async function loadCustomList(regionName, pokemonNames) {
    try {
        document.getElementById('gen-title').textContent = regionName;
        pokedexGrid.innerHTML = ''; // On vide la grille

        // On boucle sur chaque nom de la liste pour aller le chercher
        for (const name of pokemonNames) {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            if (response.ok) {
                const data = await response.json();
                // On utilise la même fonction pour créer la carte, avec l'ID spécial de l'API
                createPokemonCard(data.id, data.name);
            }
        }
    } catch (error) {
        console.error("Erreur lors du chargement de la liste spéciale :", error);
    }
}

function createPokemonCard(id, name) {
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

    const isShiny = localStorage.getItem(`shiny-${id}`) === 'true'; 
    const savedEncounters = localStorage.getItem(`encounters-${id}`) || '';

    const imgClass = isShiny ? '' : 'not-caught';
    const imgSrc = isShiny 
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    const checkedAttr = isShiny ? 'checked' : ''; 

    card.innerHTML = `
        <img src="${imgSrc}" id="img-${id}" class="${imgClass}" alt="${capitalizedName}">
        <h3>#${id} ${capitalizedName}</h3>
        
        <label style="cursor: pointer; font-weight: bold; color: #d4af37;">
            <input type="checkbox" id="shiny-${id}" onchange="toggleShiny(${id})" ${checkedAttr}> ✨ Shiny
        </label>
        <br>
        <div style="margin-top: 10px;">
            <label style="font-size: 12px; color: #666;">Rencontres :</label><br>
            <input type="number" id="encounters-${id}" value="${savedEncounters}" oninput="saveEncounters(${id})" min="0" placeholder="0" style="width: 60px; text-align: center; margin-top: 5px; border: 1px solid #ccc; border-radius: 4px;">
        </div>
        <button onclick="showTip(${id}, '${capitalizedName}')" style="margin-top: 10px; background-color: #4CAF50; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
            💡 Où shasser ?
        </button>
    `;

    pokedexGrid.appendChild(card);
}
// ==========================================
// 2.5 RECHERCHE D'UN POKÉMON SPÉCIFIQUE
// ==========================================
async function searchShiny() {
    const input = document.getElementById('search-shiny-input');
    const query = input.value.toLowerCase().trim();
    
    // Si la case est vide et qu'on lance la recherche, on réinitialise tout
    if (query === "") {
        resetSearch();
        return;
    }

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        if (!response.ok) throw new Error("Pokémon introuvable");
        
        const data = await response.json();
        const capitalizedName = data.name.charAt(0).toUpperCase() + data.name.slice(1);
        
        document.getElementById('gen-title').textContent = `Résultat de recherche : ${capitalizedName}`;
        pokedexGrid.innerHTML = '';
        createPokemonCard(data.id, data.name);
        
    } catch (error) {
        alert("Pokémon introuvable ! Vérifie l'orthographe (en anglais) ou tape directement son numéro (ID).");
    }
}

// NOUVELLE FONCTION POUR RÉINITIALISER
function resetSearch() {
    // 1. On vide le texte de la barre de recherche
    document.getElementById('search-shiny-input').value = '';
    
    // 2. On recharge la Génération 1 par défaut (comme quand on ouvre le site)
    loadGeneration(151, 0, 'Kanto', 1);
}
// ==========================================
// 10. LECTURE DU CRI DU POKÉMON
// ==========================================
function playCry(id) {
    // On va chercher le fichier audio officiel sur PokéAPI
    const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;
    const audio = new Audio(cryUrl);
    
    audio.volume = 0.3; // Volume à 30% pour ne pas te faire sursauter si tu as un casque !
    
    // On lance la lecture. Le "catch" permet d'éviter que le site plante si un cri 
    // manque dans la base de données (parfois le cas pour certaines formes régionales).
    audio.play().catch(error => console.log("Cri introuvable pour ce Pokémon."));
}
function toggleShiny(id) {
    const checkbox = document.getElementById(`shiny-${id}`);
    const img = document.getElementById(`img-${id}`);
    
    if (checkbox.checked) {
        // C'est coché : image Shiny + On joue le cri !
        img.classList.remove('not-caught');
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`;
        
        playCry(id); // 🎺 Appel de la nouvelle fonction audio
        
    } else {
        // C'est décoché : on remet normal
        img.classList.add('not-caught');
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    }
    
    localStorage.setItem(`shiny-${id}`, checkbox.checked);
    
    // Met à jour le tableau de bord si tu l'as ajouté juste avant
    if (typeof updateDashboard === "function") {
        updateDashboard();
    }
}

function saveEncounters(id) {
    const input = document.getElementById(`encounters-${id}`);
    localStorage.setItem(`encounters-${id}`, input.value);
    updateDashboard();
}

function showTip(id, name) {
    const tips = huntingTips[id];
    if (tips) {
        let message = `Top méthodes pour shasser ${name} :\n\n`;
        tips.forEach(tip => { message += `- ${tip}\n`; });
        alert(message);
    } else {
        alert(`Pas de conseil spécifique enregistré pour ${name}.\n\nMéthode générique recommandée :\n🥇 Écarlate/Violet : Apparitions Massives + Sandwich Aura Brillance (1/512)\n🥈 Méthode Masuda (Reproduction).`);
    }
}
// ==========================================
// 1.5 LISTES DES FORMES RÉGIONALES ET SPÉCIALES
// ==========================================
const specialForms = {
    alola: [
        'rattata-alola', 'raticate-alola', 'raichu-alola', 'sandshrew-alola', 'sandslash-alola', 
        'vulpix-alola', 'ninetales-alola', 'diglett-alola', 'dugtrio-alola', 'meowth-alola', 
        'persian-alola', 'geodude-alola', 'graveler-alola', 'golem-alola', 'grimer-alola', 
        'muk-alola', 'exeggutor-alola', 'marowak-alola'
    ],
    galar: [
        'meowth-galar', 'ponyta-galar', 'rapidash-galar', 'slowpoke-galar', 'slowbro-galar', 
        'farfetchd-galar', 'weezing-galar', 'mr-mime-galar', 'articuno-galar', 'zapdos-galar', 
        'moltres-galar', 'slowking-galar', 'corsola-galar', 'zigzagoon-galar', 'linoone-galar', 
        'darumaka-galar', 'darmanitan-galar-standard', 'yamask-galar', 'stunfisk-galar'
    ],
    hisui: [
        'growlithe-hisui', 'arcanine-hisui', 'voltorb-hisui', 'electrode-hisui', 'typhlosion-hisui', 
        'qwilfish-hisui', 'sneasel-hisui', 'samurott-hisui', 'lilligant-hisui', 'basculin-white-striped', 
        'zorua-hisui', 'zoroark-hisui', 'braviary-hisui', 'sliggoo-hisui', 'goodra-hisui', 
        'avalugg-hisui', 'decidueye-hisui'
    ],
    paldea: [
        'tauros-paldea-combat-breed', 'tauros-paldea-blaze-breed', 'tauros-paldea-aqua-breed', 'wooper-paldea'
    ],
    speciales: [
        'lycanroc-dusk', // Lougaroc Crépusculaire
        'zygarde-10', 'zygarde-complete', // Formes Zygarde
        'greninja-ash', // Sachanobi
        'ursaluna-bloodmoon', // Ursaking Lune Vermeille
        'gimmighoul-roaming', // Mordudor Forme Marche
        'palafin-hero' // Superdofin Forme Héroïque
    ]
};

// ==========================================
// 3. NAVIGATION (Onglets)
// ==========================================
const btnShiny = document.getElementById('btn-shiny');
const btnHof = document.getElementById('btn-hof');
const sectionShiny = document.getElementById('shiny-section');
const sectionHof = document.getElementById('hof-section');

btnShiny.addEventListener('click', () => {
    sectionShiny.style.display = 'block';
    sectionHof.style.display = 'none';
});

btnHof.addEventListener('click', () => {
    sectionShiny.style.display = 'none';
    sectionHof.style.display = 'block';
});

// ==========================================
// 4. HALL OF FAME (Succès & Équipe)
// ==========================================
function saveAchievement(gameId, type) {
    const checkbox = document.getElementById(`${type}-${gameId}`);
    localStorage.setItem(`${type}-${gameId}`, checkbox.checked);
}

async function updateTeamSprite(gameId, slot) {
    const input = document.getElementById(`team-${gameId}-${slot}`);
    const img = document.getElementById(`sprite-${gameId}-${slot}`);
    const query = input.value.toLowerCase().trim(); 

    localStorage.setItem(`team-${gameId}-${slot}`, query);

    if (query === "") {
        img.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
        return;
    }

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        if (!response.ok) throw new Error("Pokémon introuvable");
        const data = await response.json();
        img.src = data.sprites.front_default;
    } catch (error) {
        console.error(error);
        img.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
    }
}

// ==========================================
// 5. HALL OF FAME (PC & Cimetière)
// ==========================================
function getExtraPokemonList(gameId, category) {
    const data = localStorage.getItem(`${category}-${gameId}`);
    return data ? JSON.parse(data) : []; 
}

async function addExtraPokemon(gameId, category) {
    const input = document.getElementById(`input-${category}-${gameId}`);
    const query = input.value.toLowerCase().trim();
    if (!query) return;

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
        if (!response.ok) throw new Error("Introuvable");
        const data = await response.json();
        
        const list = getExtraPokemonList(gameId, category);
        list.push({ id: data.id, name: data.name });
        localStorage.setItem(`${category}-${gameId}`, JSON.stringify(list));
        
        input.value = '';
        renderExtraPokemon(gameId, category);
    } catch (error) {
        alert("Pokémon introuvable ! Vérifie l'orthographe (en anglais) ou l'ID.");
    }
}

function renderExtraPokemon(gameId, category) {
    const container = document.getElementById(`container-${category}-${gameId}`);
    if (!container) return;
    container.innerHTML = ''; 
    
    const list = getExtraPokemonList(gameId, category);

    list.forEach((poke, index) => {
        const img = document.createElement('img');
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png`;
        img.title = poke.name; 
        img.className = 'extra-sprite';
        
        img.onclick = () => {
            if (confirm(`Veux-tu retirer ${poke.name} de cette boîte ?`)) {
                list.splice(index, 1); 
                localStorage.setItem(`${category}-${gameId}`, JSON.stringify(list));
                renderExtraPokemon(gameId, category); 
            }
        };
        
        container.appendChild(img);
    });
}

// ==========================================
// 6. INITIALISATION DU SITE AU LANCEMENT
// ==========================================
function loadHallOfFame() {
    const games = ['frlg', 'lgpe', 'hgss', 'emerald', 'oras', 'platinum', 'bdsp', 'b2w2', 'xy', 'usum', 'swsh', 'pla', 'sv', 'plza'];
    
    games.forEach(gameId => {
        // 1. Succès
        const nuzlockeSaved = localStorage.getItem(`nuzlocke-${gameId}`) === 'true';
        const pokedexSaved = localStorage.getItem(`pokedex-${gameId}`) === 'true';
        
        if (document.getElementById(`nuzlocke-${gameId}`)) {
            document.getElementById(`nuzlocke-${gameId}`).checked = nuzlockeSaved;
        }
        if (document.getElementById(`pokedex-${gameId}`)) {
            document.getElementById(`pokedex-${gameId}`).checked = pokedexSaved;
        }

        // 2. Équipe de 6
        for (let i = 1; i <= 6; i++) {
            const savedPokemon = localStorage.getItem(`team-${gameId}-${i}`);
            if (savedPokemon) {
                const input = document.getElementById(`team-${gameId}-${i}`);
                if (input) {
                    input.value = savedPokemon;
                    updateTeamSprite(gameId, i); 
                }
            }
        }

        // 3. PC et Cimetière
        renderExtraPokemon(gameId, 'pc');
        renderExtraPokemon(gameId, 'grave');
    });
}

// On lance le chargement au démarrage
loadGeneration(151, 0, 'Kanto', 1);
loadHallOfFame();
updateDashboard();
// ==========================================
// 7. EXPORT ET IMPORT DES DONNÉES (SAUVEGARDE)
// ==========================================

// Fonction pour TÉLÉCHARGER les données
function exportData() {
    // On prend tout le localStorage et on le transforme en texte
    const data = JSON.stringify(localStorage);
    
    // On crée un faux fichier avec ce texte
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // On crée un lien invisible qu'on clique automatiquement pour lancer le téléchargement
    const a = document.createElement('a');
    a.href = url;
    
    // Le nom du fichier qui sera téléchargé
    const date = new Date().toISOString().split('T')[0]; // Donne la date du jour (ex: 2024-10-25)
    a.download = `pokemon_tracker_backup_${date}.json`;
    
    a.click();
    URL.revokeObjectURL(url);
}

// Fonction pour CHARGER les données
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            // On lit le contenu du fichier
            const data = JSON.parse(e.target.result);
            
            // Sécurité : on demande confirmation avant d'écraser les données actuelles
            if (confirm("Attention, cela va écraser tes données actuelles. Veux-tu continuer ?")) {
                
                // On vide le coffre-fort actuel
                localStorage.clear();
                
                // On remplit avec les données du fichier
                for (let key in data) {
                    localStorage.setItem(key, data[key]);
                }
                
                alert("Données chargées avec succès ! La page va s'actualiser.");
                location.reload(); // On rafraîchit la page pour afficher les nouvelles données
            }
        } catch (error) {
            alert("Erreur : le fichier sélectionné n'est pas une sauvegarde valide.");
        }
    };
    
    reader.readAsText(file);
}
// ==========================================
// 8. TABLEAU DE BORD (Statistiques)
// ==========================================
function updateDashboard() {
    let totalShiny = 0;
    let totalEncounters = 0;
    let maxEncounters = 0;
    let hardestPokemonId = null;

    // On parcourt tout le coffre-fort (localStorage)
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        // 1. Compter les Shinys
        if (key.startsWith('shiny-') && localStorage.getItem(key) === 'true') {
            totalShiny++;
        }
        
        // 2. Compter les Rencontres et trouver le max
        if (key.startsWith('encounters-')) {
            const count = parseInt(localStorage.getItem(key)) || 0;
            totalEncounters += count;
            
            if (count > maxEncounters) {
                maxEncounters = count;
                hardestPokemonId = key.split('-')[1]; // Récupère l'ID du Pokémon
            }
        }
    }

    // Mise à jour de l'affichage HTML
    document.getElementById('stat-total-shiny').textContent = totalShiny;
    document.getElementById('stat-total-encounters').textContent = totalEncounters;

    // Trouver le nom du Pokémon le plus dur à shasser (si on en a au moins 1)
    const longestHuntElement = document.getElementById('stat-longest-hunt');
    if (hardestPokemonId && maxEncounters > 0) {
        longestHuntElement.textContent = `ID #${hardestPokemonId} (${maxEncounters})`; // Affichage de secours rapide
        
        // On demande discrètement le vrai nom à l'API
        fetch(`https://pokeapi.co/api/v2/pokemon/${hardestPokemonId}`)
            .then(res => res.json())
            .then(data => {
                const name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
                longestHuntElement.textContent = `${name} (${maxEncounters})`;
            }).catch(e => console.error(e));
    } else {
        longestHuntElement.textContent = "- (0)";
    }
}
// ==========================================
// 9. GESTION DU MODE SOMBRE (DARK MODE)
// ==========================================
function toggleTheme() {
    const body = document.body;
    const btnTheme = document.getElementById('btn-theme');
    
    // On ajoute ou on enlève la classe "dark-mode" sur toute la page
    body.classList.toggle('dark-mode');
    
    // On vérifie si le mode sombre est activé ou non
    const isDark = body.classList.contains('dark-mode');
    
    // On sauvegarde ce choix dans le coffre-fort
    localStorage.setItem('darkMode', isDark);
    
    // On change le texte et l'icône du bouton
    if (isDark) {
        btnTheme.textContent = '☀️ Mode Clair';
        btnTheme.style.backgroundColor = '#f39c12';
        btnTheme.style.borderColor = '#f39c12';
    } else {
        btnTheme.textContent = '🌙 Mode Sombre';
        btnTheme.style.backgroundColor = '#2c3e50';
        btnTheme.style.borderColor = '#2c3e50';
    }
}

// Fonction pour recharger le thème quand on ouvre le site
function loadTheme() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        const btnTheme = document.getElementById('btn-theme');
        btnTheme.textContent = '☀️ Mode Clair';
        btnTheme.style.backgroundColor = '#f39c12';
        btnTheme.style.borderColor = '#f39c12';
    }
}

// ON LANCE LA VÉRIFICATION DU THÈME AU DÉMARRAGE
loadTheme();