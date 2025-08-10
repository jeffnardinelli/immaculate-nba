// Game Logic Class
class BasketballMemoryGame {
    constructor() {
        this.currentPlayer = null;
        this.currentProfilePlayer = null;
        this.currentTeam = null;
        this.currentMode = 'player';
        this.totalTests = 0;
        this.correctTests = 0;
    }

    // Get players who played for a specific team
    getPlayersForTeam(teamCode) {
        const foundPlayers = [];
        
        for (const playerName in game.getPlayers()) {
            const player = game.getPlayers()[playerName];
            if (player.teams.includes(teamCode)) {
                foundPlayers.push(playerName);
            }
        }
        
        return foundPlayers.sort();
    }

    // Extract story segment for a specific team
    extractStorySegment(story, teamCode) {
        const sentences = story.split(/[.!?]+/);
        
        for (const sentence of sentences) {
            if (sentence.includes(`(${teamCode})`)) {
                return sentence.trim() + '.';
            }
        }
        
        return 'Story segment not found.';
    }

    // Check player test answers
    checkAnswers() {
        const player = game.getPlayers()[this.currentPlayer];
        let correctCount = 0;
        
        for (let i = 0; i < player.teams.length; i++) {
            const input = document.getElementById(`team-${i}`);
            const userAnswer = input.value.trim().toUpperCase();
            
            if (userAnswer === player.teams[i]) {
                input.className = 'team-input correct';
                correctCount++;
            } else {
                input.className = 'team-input incorrect';
            }
        }
        
        const resultsDiv = document.getElementById('results');
        const percentage = Math.round((correctCount / player.teams.length) * 100);
        
        this.totalTests++;
        if (correctCount === player.teams.length) {
            this.correctTests++;
            resultsDiv.textContent = `Perfect! ${correctCount}/${player.teams.length} (${percentage}%)`;
            resultsDiv.className = 'results success';
        } else if (correctCount > 0) {
            resultsDiv.textContent = `Good effort! ${correctCount}/${player.teams.length} (${percentage}%)`;
            resultsDiv.className = 'results partial';
        } else {
            resultsDiv.textContent = `Keep trying! ${correctCount}/${player.teams.length} (${percentage}%)`;
            resultsDiv.className = 'results failure';
        }
        
        this.updateScore();
    }

    // Check team test answers
    checkTeamAnswers() {
        const teamPlayers = this.getPlayersForTeam(this.currentTeam);
        let correctCount = 0;
        const correctAnswers = [];
        
        for (let i = 0; i < teamPlayers.length; i++) {
            const input = document.getElementById(`player-${i}`);
            const userAnswer = input.value.trim();
            
            // Check if this answer matches any correct player (case insensitive)
            let isCorrect = false;
            for (const correctPlayer of teamPlayers) {
                if (userAnswer.toLowerCase() === correctPlayer.toLowerCase()) {
                    input.className = 'player-input correct';
                    correctCount++;
                    correctAnswers.push(correctPlayer);
                    isCorrect = true;
                    break;
                }
            }
            
            if (!isCorrect) {
                input.className = 'player-input incorrect';
            }
        }
        
        const resultsDiv = document.getElementById('team-test-results');
        const percentage = Math.round((correctCount / teamPlayers.length) * 100);
        
        if (correctCount === teamPlayers.length) {
            resultsDiv.textContent = `Perfect! ${correctCount}/${teamPlayers.length} (${percentage}%)`;
            resultsDiv.className = 'results success';
        } else if (correctCount > 0) {
            resultsDiv.textContent = `Good effort! ${correctCount}/${teamPlayers.length} (${percentage}%)`;
            resultsDiv.className = 'results partial';
        } else {
            resultsDiv.textContent = `Keep trying! ${correctCount}/${teamPlayers.length} (${percentage}%)`;
            resultsDiv.className = 'results failure';
        }
        
        // Show story segments for correct answers
        ui.showStorySegments(correctAnswers);
    }

    // Update score display
    updateScore() {
        document.getElementById('score').textContent = `Score: ${this.correctTests}/${this.totalTests}`;
    }

    // Get team counts for dropdown
    getTeamCounts() {
        const teamCounts = {};
        
        // Initialize all teams with 0
        for (const teamCode in TEAM_NAMES) {
            teamCounts[teamCode] = 0;
        }
        
        // Count players per team
        for (const playerName in game.getPlayers()) {
            const player = game.getPlayers()[playerName];
            for (const team of player.teams) {
                if (teamCounts[team] !== undefined) {
                    teamCounts[team]++;
                }
            }
        }
        
        return teamCounts;
    }

    // Lookup players for a team
    lookupTeam(teamCode) {
        const foundPlayers = [];
        
        for (const playerName in game.getPlayers()) {
            const player = game.getPlayers()[playerName];
            const teamIndex = player.teams.indexOf(teamCode);
            
            if (teamIndex !== -1) {
                foundPlayers.push({
                    name: playerName,
                    theme: player.keyWord,
                    position: teamIndex + 1,
                    totalTeams: player.teams.length,
                    storySegment: this.extractStorySegment(player.story, teamCode)
                });
            }
        }
        
        return foundPlayers;
    }
}

// Create global game instance
const game = new BasketballMemoryGame();