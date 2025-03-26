// Initialize games data
let games = [];

// Player names
const PLAYER_NAMES = ['Avtukhov', 'Lesha', 'Zheka'];

// GitHub API configuration
const GAMES_FILE_PATH = 'data/games.json';

// DOM Elements
const gameForm = document.getElementById('gameForm');
const playerScoresDiv = document.getElementById('playerScores');
const gameList = document.getElementById('gameList');
const emptyState = document.getElementById('emptyState');

// Load saved games from GitHub
async function loadGames() {
    try {
        const response = await fetch(`https://api.github.com/repos/${config.username}/${config.repository}/contents/${GAMES_FILE_PATH}`);
        if (response.ok) {
            const data = await response.json();
            const content = atob(data.content);
            games = JSON.parse(content);
            displayGames();
        }
    } catch (error) {
        console.log('No existing games found. Starting fresh.');
        displayGames();
    }
}

// Save games to GitHub
async function saveGames() {
    try {
        // First, get the current file to get its SHA
        const getResponse = await fetch(`https://api.github.com/repos/${config.username}/${config.repository}/contents/${GAMES_FILE_PATH}`);
        let sha;
        
        if (getResponse.ok) {
            const data = await getResponse.json();
            sha = data.sha;
        }

        // Prepare the content
        const content = JSON.stringify(games, null, 2);
        const encodedContent = btoa(content);

        // Create or update the file
        const response = await fetch(`https://api.github.com/repos/${config.username}/${config.repository}/contents/${GAMES_FILE_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${config.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: 'Update games data',
                content: encodedContent,
                sha: sha
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save games');
        }
    } catch (error) {
        console.error('Error saving games:', error);
        alert('Failed to save the game. Please try again later.');
    }
}

// Create player score inputs
function createPlayerInputs() {
    playerScoresDiv.innerHTML = '';
    PLAYER_NAMES.forEach((name, i) => {
        const div = document.createElement('div');
        div.className = 'form-group';
        div.innerHTML = `
            <label for="player${i + 1}">${name} Score</label>
            <input type="number" id="player${i + 1}" required min="0" placeholder="Enter victory points">
        `;
        playerScoresDiv.appendChild(div);
    });
}

// Format date to be more readable
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Display games in the history section
function displayGames() {
    gameList.innerHTML = '';
    emptyState.style.display = games.length ? 'none' : 'block';
    
    // Sort games by date, newest first
    const sortedGames = [...games].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    sortedGames.forEach((game) => {
        const gameEntry = document.createElement('div');
        gameEntry.className = 'game-entry';
        
        // Find the winner
        const maxScore = Math.max(...game.scores);
        const winnerIndex = game.scores.indexOf(maxScore);
        
        gameEntry.innerHTML = `
            <h3>${game.name}</h3>
            ${game.scores.map((score, i) => `
                <div class="player-score ${score === maxScore ? 'winner' : ''}">
                    <span>${PLAYER_NAMES[i]}</span>
                    <span>${score} points</span>
                </div>
            `).join('')}
            <small>Played on ${formatDate(game.date)}</small>
        `;
        
        gameList.appendChild(gameEntry);
    });
}

// Add export/import functionality
function exportGames() {
    const dataStr = JSON.stringify(games, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportLink = document.createElement('a');
    exportLink.setAttribute('href', dataUri);
    exportLink.setAttribute('download', 'board-games-stats.json');
    exportLink.click();
}

function importGames(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedGames = JSON.parse(e.target.result);
                games = importedGames;
                saveGames();
                displayGames();
                alert('Games imported successfully!');
            } catch (error) {
                alert('Error importing games. Please make sure the file is valid.');
            }
        };
        reader.readAsText(file);
    }
}

gameForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const gameName = document.getElementById('gameName').value;
    const scores = [];
    
    // Collect scores
    for (let i = 1; i <= PLAYER_NAMES.length; i++) {
        const score = parseInt(document.getElementById(`player${i}`).value);
        scores.push(score);
    }
    
    // Create new game entry
    const newGame = {
        name: gameName,
        playerCount: PLAYER_NAMES.length,
        scores: scores,
        date: new Date().toISOString()
    };
    
    // Add to games array and save
    games.push(newGame);
    await saveGames();
    
    // Reset form and update display
    gameForm.reset();
    createPlayerInputs();
    displayGames();
});

// Initialize the app
createPlayerInputs();
loadGames(); 