// UI Manager Class
class UIManager {
    constructor() {
        this.initializeUI();
        this.setupEventListeners();
    }

    // Initialize UI elements
    initializeUI() {
        this.renderPlayerList();
        this.populateTeamDropdown();
        this.populateDataLists();
        this.setMode('player');
        this.showWelcomeScreen();
    }

    // Setup event listeners
    setupEventListeners() {
        // Handle Enter key for checking answers
        document.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                if (game.currentPlayer) {
                    game.checkAnswers();
                } else if (game.currentTeam) {
                    game.checkTeamAnswers();
                }
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            const menu = document.getElementById('nav-menu');
            const menuBtn = document.querySelector('.menu-btn');
            
            if (menu && menuBtn && !menu.contains(event.target) && !menuBtn.contains(event.target)) {
                this.closeMenu();
            }
        });

        // Prevent scrolling when menu is open
        document.addEventListener('touchmove', (event) => {
            const menu = document.getElementById('nav-menu');
            if (menu && menu.classList.contains('open') && !menu.contains(event.target)) {
                event.preventDefault();
            }
        }, { passive: false });
    }

    // Render player list in navigation
    renderPlayerList() {
        const playerList = document.getElementById('player-list');
        playerList.innerHTML = '';
        
        Object.keys(PLAYERS_DB).forEach(playerName => {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';
            
            playerItem.innerHTML = `
                <div class="player-name">${playerName}</div>
                <div class="player-actions">
                    <button class="action-btn test-btn" onclick="ui.selectPlayerAndClose('${playerName}')">Test</button>
                    <button class="action-btn profile-btn" onclick="ui.viewProfileAndClose('${playerName}')">Profile</button>
                </div>
            `;
            
            playerList.appendChild(playerItem);
        });
    }

    // Populate team dropdown
    populateTeamDropdown() {
        const teamSelect = document.getElementById('team-select');
        const teamCounts = game.getTeamCounts();
        
        // Clear existing options except the first one
        while (teamSelect.options.length > 1) {
            teamSelect.remove(1);
        }
        
        // Add team options
        for (const [teamCode, teamName] of Object.entries(TEAM_NAMES)) {
            const option = document.createElement('option');
            option.value = teamCode;
            option.textContent = `${teamName} (${teamCounts[teamCode] || 0})`;
            teamSelect.appendChild(option);
        }
    }

    // Populate datalists for autocomplete
    populateDataLists() {
        // Populate team codes datalist
        const teamCodesDatalist = document.getElementById('team-codes');
        teamCodesDatalist.innerHTML = '';
        
        for (const [teamCode, teamName] of Object.entries(TEAM_NAMES)) {
            const option = document.createElement('option');
            option.value = teamCode;
            option.textContent = teamName;
            teamCodesDatalist.appendChild(option);
        }
        
        // Populate player names datalist
        const playerNamesDatalist = document.getElementById('player-names');
        playerNamesDatalist.innerHTML = '';
        
        for (const playerName of Object.keys(PLAYERS_DB)) {
            const option = document.createElement('option');
            option.value = playerName;
            playerNamesDatalist.appendChild(option);
        }
    }

    // Toggle menu
    toggleMenu() {
        const menu = document.getElementById('nav-menu');
        const overlay = document.getElementById('overlay');
        
        menu.classList.toggle('open');
        overlay.classList.toggle('show');
    }

    // Close menu
    closeMenu() {
        const menu = document.getElementById('nav-menu');
        const overlay = document.getElementById('overlay');
        
        menu.classList.remove('open');
        overlay.classList.remove('show');
    }

    // Select player and close menu
    selectPlayerAndClose(playerName) {
        this.selectPlayer(playerName);
        this.closeMenu();
    }

    // View profile and close menu
    viewProfileAndClose(playerName) {
        this.viewProfile(playerName);
        this.closeMenu();
    }

    // Select random player
    selectRandomPlayer() {
        const playerNames = Object.keys(PLAYERS_DB);
        const randomPlayer = playerNames[Math.floor(Math.random() * playerNames.length)];
        this.selectPlayer(randomPlayer);
        this.closeMenu();
    }

    // Set game mode
    setMode(mode) {
        game.currentMode = mode;
        
        const playerBtn = document.getElementById('player-mode-btn');
        const teamBtn = document.getElementById('team-mode-btn');
        const playerWelcome = document.getElementById('player-mode-welcome');
        const teamWelcome = document.getElementById('team-mode-welcome');
        const lookupTitle = document.getElementById('team-lookup-title');
        
        if (mode === 'player') {
            playerBtn.className = 'mode-btn active';
            teamBtn.className = 'mode-btn inactive';
            playerWelcome.style.display = 'block';
            teamWelcome.style.display = 'none';
            lookupTitle.textContent = 'Team Lookup';
        } else {
            playerBtn.className = 'mode-btn inactive';
            teamBtn.className = 'mode-btn active';
            playerWelcome.style.display = 'none';
            teamWelcome.style.display = 'block';
            lookupTitle.textContent = 'Team Mode - Select Team to Test';
        }
        
        // Reset team selection
        document.getElementById('team-select').value = '';
        document.getElementById('team-results').innerHTML = '';
    }

    // Handle team selection
    handleTeamSelection() {
        if (game.currentMode === 'player') {
            this.lookupTeam();
        } else {
            this.startTeamTest();
        }
    }

    // Lookup team
    lookupTeam() {
        const selectedTeam = document.getElementById('team-select').value;
        const resultsDiv = document.getElementById('team-results');
        
        if (!selectedTeam) {
            resultsDiv.innerHTML = '';
            return;
        }
        
        const foundPlayers = game.lookupTeam(selectedTeam);
        
        if (foundPlayers.length === 0) {
            resultsDiv.innerHTML = '<p style="text-align: center; color: #666;">No players found for this team.</p>';
        } else {
            let html = `<h4 style="margin-top: 0; color: #2c3e50;">Players who played for ${selectedTeam}:</h4>`;
            
            foundPlayers.forEach(player => {
                html += `
                    <div class="team-result-item">
                        <div class="team-result-name">${player.name}</div>
                        <div class="team-result-theme">Theme: ${player.theme}</div>
                        <div class="team-result-position">Team ${player.position} of ${player.totalTeams}</div>
                        <div class="team-result-story">${player.storySegment}</div>
                    </div>
                `;
            });
            
            resultsDiv.innerHTML = html;
        }
    }

    // Start team test
    startTeamTest() {
        const selectedTeam = document.getElementById('team-select').value;
        
        if (!selectedTeam) {
            return;
        }
        
        game.currentTeam = selectedTeam;
        
        // Show team test content
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('team-test-content').style.display = 'block';
        
        this.setupTeamTest();
    }

    // Setup team test
    setupTeamTest() {
        const teamPlayers = game.getPlayersForTeam(game.currentTeam);
        
        document.getElementById('team-test-name').textContent = TEAM_NAMES[game.currentTeam];
        document.getElementById('team-player-count').textContent = teamPlayers.length;
        
        const playerInputsContainer = document.getElementById('player-inputs');
        playerInputsContainer.innerHTML = '';
        
        teamPlayers.forEach((_, i) => {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'player-input-group';
            
            inputGroup.innerHTML = `
                <label>Player ${i + 1}</label>
                <input type="text" class="player-input" id="player-${i}" 
                       placeholder="Enter player name..." list="player-names">
            `;
            
            playerInputsContainer.appendChild(inputGroup);
        });
        
        document.getElementById('team-test-results').textContent = '';
        document.getElementById('player-stories').innerHTML = '';
        
        // Focus first input
        setTimeout(() => {
            const firstInput = document.getElementById('player-0');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    // Show team answers
    showTeamAnswers() {
        const teamPlayers = game.getPlayersForTeam(game.currentTeam);
        
        teamPlayers.forEach((player, i) => {
            const input = document.getElementById(`player-${i}`);
            input.value = player;
            input.className = 'player-input correct';
        });
        
        const resultsDiv = document.getElementById('team-test-results');
        resultsDiv.textContent = `Answers revealed! ${teamPlayers.length}/${teamPlayers.length} (100%)`;
        resultsDiv.className = 'results success';
        
        this.showStorySegments(teamPlayers);
    }

    // Show story segments
    showStorySegments(playerNames) {
        const storiesContainer = document.getElementById('player-stories');
        storiesContainer.innerHTML = '';
        
        playerNames.forEach(playerName => {
            const player = PLAYERS_DB[playerName];
            const storySegment = game.extractStorySegment(player.story, game.currentTeam);
            
            const segmentDiv = document.createElement('div');
            segmentDiv.className = 'story-segment';
            
            segmentDiv.innerHTML = `
                <div class="player-name">${playerName} (${player.keyWord})</div>
                <div class="story-text">${storySegment}</div>
            `;
            
            storiesContainer.appendChild(segmentDiv);
        });
    }

    // Reset team test
    resetTeamTest() {
        const teamPlayers = game.getPlayersForTeam(game.currentTeam);
        
        teamPlayers.forEach((_, i) => {
            const input = document.getElementById(`player-${i}`);
            input.value = '';
            input.className = 'player-input';
        });
        
        document.getElementById('team-test-results').textContent = '';
        document.getElementById('player-stories').innerHTML = '';
        
        setTimeout(() => {
            const firstInput = document.getElementById('player-0');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    // Show welcome screen
    showWelcomeScreen() {
        document.getElementById('welcome-screen').style.display = 'block';
        document.getElementById('test-content').style.display = 'none';
        document.getElementById('profile-view').style.display = 'none';
        document.getElementById('team-test-content').style.display = 'none';
    }

    // View player profile
    viewProfile(playerName) {
        game.currentProfilePlayer = playerName;
        const player = PLAYERS_DB[playerName];
        
        document.getElementById('profile-player-name').textContent = playerName;
        document.getElementById('profile-key-word').textContent = `Key Memory Item: ${player.keyWord}`;
        
        // Create teams list
        const teamsList = document.getElementById('profile-teams-list');
        teamsList.innerHTML = '';
        
        player.teams.forEach((team, i) => {
            const teamItem = document.createElement('div');
            teamItem.className = 'team-item';
            teamItem.textContent = `${i + 1}. ${TEAM_NAMES[team]} (${team})`;
            teamsList.appendChild(teamItem);
        });
        
        // Set story content
        document.getElementById('profile-story-content').textContent = player.story;
        
        // Show profile view
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('test-content').style.display = 'none';
        document.getElementById('profile-view').style.display = 'block';
        document.getElementById('team-test-content').style.display = 'none';
    }

    // Select player for test
    selectPlayer(playerName) {
        game.currentPlayer = playerName;
        this.setupTest();
        
        // Show test content
        document.getElementById('welcome-screen').style.display = 'none';
        document.getElementById('profile-view').style.display = 'none';
        document.getElementById('test-content').style.display = 'block';
        document.getElementById('team-test-content').style.display = 'none';
    }

    // Setup player test
    setupTest() {
        const player = PLAYERS_DB[game.currentPlayer];
        
        document.getElementById('player-name').textContent = game.currentPlayer;
        document.getElementById('key-word').textContent = player.keyWord;
        document.getElementById('team-count').textContent = player.teams.length;
        
        const teamInputsContainer = document.getElementById('team-inputs');
        teamInputsContainer.innerHTML = '';
        
        player.teams.forEach((_, i) => {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'team-input-group';
            
            const label = document.createElement('label');
            label.textContent = (i + 1).toString();
            
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'team-input';
            input.id = `team-${i}`;
            input.maxLength = 3;
            input.setAttribute('list', 'team-codes');
            input.addEventListener('input', function() {
                this.value = this.value.toUpperCase();
            });
            
            inputGroup.appendChild(label);
            inputGroup.appendChild(input);
            teamInputsContainer.appendChild(inputGroup);
        });
        
        document.getElementById('story-hint').style.display = 'none';
        document.getElementById('results').textContent = '';
        
        // Focus first input
        setTimeout(() => {
            const firstInput = document.getElementById('team-0');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    // Show hint
    showHint() {
        const player = PLAYERS_DB[game.currentPlayer];
        document.getElementById('story-text').textContent = player.story;
        document.getElementById('story-hint').style.display = 'block';
    }

    // Reset test
    resetTest() {
        const player = PLAYERS_DB[game.currentPlayer];
        
        player.teams.forEach((_, i) => {
            const input = document.getElementById(`team-${i}`);
            input.value = '';
            input.className = 'team-input';
        });
        
        document.getElementById('results').textContent = '';
        document.getElementById('story-hint').style.display = 'none';
        
        setTimeout(() => {
            const firstInput = document.getElementById('team-0');
            if (firstInput) firstInput.focus();
        }, 100);
    }
}

// Create global UI instance when DOM is ready
let ui;

// Check if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        ui = new UIManager();
    });
} else {
    // DOM is already loaded
    ui = new UIManager();
}
        