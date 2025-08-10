// UI Manager Class
class UIManager {
    constructor() {
        this.initializeUI();
        this.setupEventListeners();
    }

    // Initialize UI elements
    initializeUI() {
        // Wait for players to load before rendering
        if (window.game && game.loadPlayers) {
            game.loadPlayers().then(() => {
                console.log('Players loaded, initializing UI...');
                this.renderPlayerList();
                this.populateTeamDropdown();
                this.populateDataLists();
                this.setMode('player');
                this.showWelcomeScreen();
            }).catch(error => {
                console.error('Failed to load players:', error);
                // Try to initialize anyway
                this.setMode('player');
                this.showWelcomeScreen();
            });
        } else {
            // Initialize without players if game not ready
            this.setMode('player');
            this.showWelcomeScreen();
        }
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
        if (!playerList) return;
        
        playerList.innerHTML = '';
        
        const players = game.getPlayers();
        console.log('Rendering players:', Object.keys(players).length);
        
        if (Object.keys(players).length === 0) {
            playerList.innerHTML = '<div class="player-item">Loading players...</div>';
            return;
        }
        
        Object.keys(players).forEach(playerName => {
            const playerItem = document.createElement('div');
            playerItem.className = 'player-item';
            
            playerItem.innerHTML = `
                <div class="player-name">${playerName}</div>
                <div class="player-actions">
                    <button class="action-btn test-btn" onclick="ui.selectPlayerAndClose('${playerName.replace(/'/g, "\\'")}')">Test</button>
                    <button class="action-btn profile-btn" onclick="ui.viewProfileAndClose('${playerName.replace(/'/g, "\\'")}')">Profile</button>
                </div>
            `;
            
            playerList.appendChild(playerItem);
        });
    }

    // Populate team dropdown
    populateTeamDropdown() {
        const teamSelect = document.getElementById('team-select');
        if (!teamSelect) return;
        
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
        if (teamCodesDatalist) {
            teamCodesDatalist.innerHTML = '';
            
            for (const [teamCode, teamName] of Object.entries(TEAM_NAMES)) {
                const option = document.createElement('option');
                option.value = teamCode;
                option.textContent = teamName;
                teamCodesDatalist.appendChild(option);
            }
        }
        
        // Populate player names datalist
        const playerNamesDatalist = document.getElementById('player-names');
        if (playerNamesDatalist) {
            playerNamesDatalist.innerHTML = '';
            
            const players = game.getPlayers();
            for (const playerName of Object.keys(players)) {
                const option = document.createElement('option');
                option.value = playerName;
                playerNamesDatalist.appendChild(option);
            }
        }
    }

    // Toggle menu
    toggleMenu() {
        const menu = document.getElementById('nav-menu');
        const overlay = document.getElementById('overlay');
        
        if (menu) menu.classList.toggle('open');
        if (overlay) overlay.classList.toggle('show');
    }

    // Close menu
    closeMenu() {
        const menu = document.getElementById('nav-menu');
        const overlay = document.getElementById('overlay');
        
        if (menu) menu.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
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
        const players = game.getPlayers();
        const playerNames = Object.keys(players);
        if (playerNames.length === 0) return;
        
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
            if (playerBtn) playerBtn.className = 'mode-btn active';
            if (teamBtn) teamBtn.className = 'mode-btn inactive';
            if (playerWelcome) playerWelcome.style.display = 'block';
            if (teamWelcome) teamWelcome.style.display = 'none';
            if (lookupTitle) lookupTitle.textContent = 'Team Lookup';
        } else {
            if (playerBtn) playerBtn.className = 'mode-btn inactive';
            if (teamBtn) teamBtn.className = 'mode-btn active';
            if (playerWelcome) playerWelcome.style.display = 'none';
            if (teamWelcome) teamWelcome.style.display = 'block';
            if (lookupTitle) lookupTitle.textContent = 'Team Mode - Select Team to Test';
        }
        
        // Reset team selection
        const teamSelect = document.getElementById('team-select');
        if (teamSelect) teamSelect.value = '';
        const teamResults = document.getElementById('team-results');
        if (teamResults) teamResults.innerHTML = '';
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
        
        if (!selectedTeam || !resultsDiv) {
            if (resultsDiv) resultsDiv.innerHTML = '';
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
        const welcomeScreen = document.getElementById('welcome-screen');
        const teamTestContent = document.getElementById('team-test-content');
        
        if (welcomeScreen) welcomeScreen.style.display = 'none';
        if (teamTestContent) teamTestContent.style.display = 'block';
        
        this.setupTeamTest();
    }

    // Setup team test
    setupTeamTest() {
        const teamPlayers = game.getPlayersForTeam(game.currentTeam);
        
        const teamNameEl = document.getElementById('team-test-name');
        if (teamNameEl) teamNameEl.textContent = TEAM_NAMES[game.currentTeam];
        
        const playerCountEl = document.getElementById('team-player-count');
        if (playerCountEl) playerCountEl.textContent = teamPlayers.length;
        
        const playerInputsContainer = document.getElementById('player-inputs');
        if (playerInputsContainer) {
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
        }
        
        const resultsEl = document.getElementById('team-test-results');
        if (resultsEl) resultsEl.textContent = '';
        
        const storiesEl = document.getElementById('player-stories');
        if (storiesEl) storiesEl.innerHTML = '';
        
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
            if (input) {
                input.value = player;
                input.className = 'player-input correct';
            }
        });
        
        const resultsDiv = document.getElementById('team-test-results');
        if (resultsDiv) {
            resultsDiv.textContent = `Answers revealed! ${teamPlayers.length}/${teamPlayers.length} (100%)`;
            resultsDiv.className = 'results success';
        }
        
        this.showStorySegments(teamPlayers);
    }

    // Show story segments
    showStorySegments(playerNames) {
        const storiesContainer = document.getElementById('player-stories');
        if (!storiesContainer) return;
        
        storiesContainer.innerHTML = '';
        
        const players = game.getPlayers();
        
        playerNames.forEach(playerName => {
            const player = players[playerName];
            if (!player) return;
            
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
            if (input) {
                input.value = '';
                input.className = 'player-input';
            }
        });
        
        const resultsEl = document.getElementById('team-test-results');
        if (resultsEl) resultsEl.textContent = '';
        
        const storiesEl = document.getElementById('player-stories');
        if (storiesEl) storiesEl.innerHTML = '';
        
        setTimeout(() => {
            const firstInput = document.getElementById('player-0');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    // Show welcome screen
    showWelcomeScreen() {
        const screens = ['welcome-screen', 'test-content', 'profile-view', 'team-test-content'];
        
        screens.forEach(screenId => {
            const element = document.getElementById(screenId);
            if (element) {
                element.style.display = screenId === 'welcome-screen' ? 'block' : 'none';
            }
        });
    }

    // View player profile
    viewProfile(playerName) {
        game.currentProfilePlayer = playerName;
        const players = game.getPlayers();
        const player = players[playerName];
        
        if (!player) {
            console.error('Player not found:', playerName);
            return;
        }
        
        const nameEl = document.getElementById('profile-player-name');
        if (nameEl) nameEl.textContent = playerName;
        
        const keyWordEl = document.getElementById('profile-key-word');
        if (keyWordEl) keyWordEl.textContent = `Key Memory Item: ${player.keyWord}`;
        
        // Create teams list
        const teamsList = document.getElementById('profile-teams-list');
        if (teamsList) {
            teamsList.innerHTML = '';
            
            player.teams.forEach((team, i) => {
                const teamItem = document.createElement('div');
                teamItem.className = 'team-item';
                teamItem.textContent = `${i + 1}. ${TEAM_NAMES[team]} (${team})`;
                teamsList.appendChild(teamItem);
            });
        }
        
        // Set story content
        const storyEl = document.getElementById('profile-story-content');
        if (storyEl) storyEl.textContent = player.story;
        
        // Show profile view
        const screens = ['welcome-screen', 'test-content', 'profile-view', 'team-test-content'];
        screens.forEach(screenId => {
            const element = document.getElementById(screenId);
            if (element) {
                element.style.display = screenId === 'profile-view' ? 'block' : 'none';
            }
        });
    }

    // Select player for test
    selectPlayer(playerName) {
        game.currentPlayer = playerName;
        this.setupTest();
        
        // Show test content
        const screens = ['welcome-screen', 'profile-view', 'test-content', 'team-test-content'];
        screens.forEach(screenId => {
            const element = document.getElementById(screenId);
            if (element) {
                element.style.display = screenId === 'test-content' ? 'block' : 'none';
            }
        });
    }

    // Setup player test
    setupTest() {
        const players = game.getPlayers();
        const player = players[game.currentPlayer];
        
        if (!player) {
            console.error('Player not found:', game.currentPlayer);
            return;
        }
        
        const nameEl = document.getElementById('player-name');
        if (nameEl) nameEl.textContent = game.currentPlayer;
        
        const keyWordEl = document.getElementById('key-word');
        if (keyWordEl) keyWordEl.textContent = player.keyWord;
        
        const teamCountEl = document.getElementById('team-count');
        if (teamCountEl) teamCountEl.textContent = player.teams.length;
        
        const teamInputsContainer = document.getElementById('team-inputs');
        if (teamInputsContainer) {
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
        }
        
        const storyHint = document.getElementById('story-hint');
        if (storyHint) storyHint.style.display = 'none';
        
        const results = document.getElementById('results');
        if (results) results.textContent = '';
        
        // Focus first input
        setTimeout(() => {
            const firstInput = document.getElementById('team-0');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    // Show hint
    showHint() {
        const players = game.getPlayers();
        const player = players[game.currentPlayer];
        
        if (!player) return;
        
        const storyText = document.getElementById('story-text');
        if (storyText) storyText.textContent = player.story;
        
        const storyHint = document.getElementById('story-hint');
        if (storyHint) storyHint.style.display = 'block';
    }

    // Reset test
    resetTest() {
        const players = game.getPlayers();
        const player = players[game.currentPlayer];
        
        if (!player) return;
        
        player.teams.forEach((_, i) => {
            const input = document.getElementById(`team-${i}`);
            if (input) {
                input.value = '';
                input.className = 'team-input';
            }
        });
        
        const results = document.getElementById('results');
        if (results) results.textContent = '';
        
        const storyHint = document.getElementById('story-hint');
        if (storyHint) storyHint.style.display = 'none';
        
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
        console.log('DOM loaded, creating UIManager...');
        ui = new UIManager();
    });
} else {
    // DOM is already loaded
    console.log('DOM already loaded, creating UIManager...');
    ui = new UIManager();
}