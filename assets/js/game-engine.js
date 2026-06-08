// --- GAME ENGINE ---
    let learnLogic = { divDigits: [], step: 'SELECT', selectedIndices: [], usedIndices: [], rows: [], quotientFound: [], currentWorkingVal: 0, expectedRemainderString: "", tempResidues: null };

    function startGame() {
        appState.game.questions = []; appState.game.stats = []; appState.proGame.answers = []; appState.game.currentQ = 0; appState.game.lastName = ""; 
        appState.game.isPaused = false; appState.game.scoreData = null;
        
        for(let i=0; i<appState.config.qCount; i++) {
            let q = generateQuestionLogic();
            appState.game.questions.push(q);
            if(appState.currentMode === 'pro') {
                let qLen = Math.floor(q.dividend / q.divisor).toString().length;
                let scaff = calcProScaffolding(q.dividend, q.divisor);
                appState.proGame.answers.push({
                    quotients: new Array(qLen).fill(null),
                    residues: scaff.map(r => new Array(r.numBoxes).fill(null))
                });
                q.scaffolding = scaff;
            }
        }
        
        startTimer();
        generateNumpads();

        if(appState.currentMode === 'learn') {
            showScreen('screen-game-learn');
            loadLearnQuestion(0);
        } else {
            showScreen('screen-game-pro');
            loadProQuestion(0);
        }
    }

    function generateQuestionLogic() {
        const m = appState.config.difficulty; let div, divisor;
        if (m === 'easy') { divisor = Math.floor(Math.random() * 11) + 2; div = divisor * (Math.floor(Math.random() * 12) + 1); } 
        else if (m === 'normal') { div = Math.floor(Math.random() * 490) + 10; divisor = Math.floor(Math.random() * 11) + 2; } 
        else { div = Math.floor(Math.random() * 9900) + 100; divisor = Math.floor(Math.random() * 11) + 2; }
        if(div < divisor) div = divisor * Math.floor(Math.random()*5 + 1);
        return { dividend: div, divisor: divisor };
    }

    function calcProScaffolding(dividend, divisor) {
        let divStr = dividend.toString(), divLength = divStr.length, rows = [], currentVal = 0, started = false;
        for(let i=0; i<divLength; i++) {
            currentVal = currentVal * 10 + parseInt(divStr[i]);
            if(currentVal >= divisor || started) {
                started = true;
                let qDigit = Math.floor(currentVal / divisor);
                let sub = qDigit * divisor;
                let rem = currentVal - sub;
                let nextDigit = (i + 1 < divLength) ? divStr[i+1] : null;
                let numBoxes = rem.toString().length + (nextDigit !== null ? 1 : 0);
                rows.push({ remStr: rem.toString(), bringDown: nextDigit, alignIndex: i + (nextDigit !== null ? 1 : 0), numBoxes: numBoxes });
                currentVal = rem;
            }
        }
        return rows;
    }

	    function generateNumpads() {
	        ['numpad-learn', 'numpad-pro'].forEach(pId => {
	            const pad = document.getElementById(pId);
	            if(pad.innerHTML === '') {
	                [1,2,3,4,5,6,7,8,9,0].forEach(n => {
	                    const btn = document.createElement('div'); btn.className = 'num-key'; btn.innerText = n; btn.draggable = true;
	                    btn.dataset.dragType = 'number';
	                    btn.dataset.dragText = n;
	                    btn.dataset.dragVal = n;
	                    btn.ondragstart = (e) => { e.dataTransfer.setData("text", n); e.dataTransfer.setData("type", "number"); };
	                    pad.appendChild(btn);
	                });
	            }
	        });
	    }
