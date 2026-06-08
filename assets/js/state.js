// --- ESTADO GLOBAL ---
    let appState = {
        lang: 'es', currentMode: 'learn', config: { difficulty: 'easy', qCount: 10 },
        game: { 
            currentQ: 0, questions: [], stats: [], timerFn: null, 
            secondsElapsed: 0, currentErrors: 0, currentLogs: [], 
            lastName: "", currentlyViewingHistory: null, isPaused: false,
            scoreData: null 
        },
        proGame: { answers: [], selections: { div: [], res: [] } }
    };
