// --- TIMERS & FINISH ---
    function startTimer() { 
        if(appState.game.timerFn) clearInterval(appState.game.timerFn);
        appState.game.secondsElapsed = 0;
        appState.game.timerFn = setInterval(() => {
            if(!appState.game.isPaused) {
                appState.game.secondsElapsed++;
                const mins = Math.floor(appState.game.secondsElapsed / 60).toString().padStart(2, '0');
                const secs = (appState.game.secondsElapsed % 60).toString().padStart(2, '0');
                
                const tLearn = document.getElementById('game-timer-learn');
                const tPro = document.getElementById('game-timer-pro');
                if(tLearn) tLearn.innerText = `${mins}:${secs}`;
                if(tPro) tPro.innerText = `${mins}:${secs}`;
            }
        }, 1000);
    }
    
    function stopTimers() { if(appState.game.timerFn) clearInterval(appState.game.timerFn); }

    function showSessionSummary() {
        stopTimers(); showScreen('screen-score');
        const dur = appState.game.secondsElapsed;
        const errs = appState.currentMode === 'learn' ? appState.game.stats.reduce((a, c) => a + c.errors, 0) : appState.game.currentErrors;
        
        const mins = Math.floor(dur / 60).toString().padStart(2, '0');
        const secs = (dur % 60).toString().padStart(2, '0');

        document.getElementById('score-title').innerText = t().scoreTitle;
        document.getElementById('score-total-time').innerText = `${mins}:${secs}`;
        document.getElementById('score-total-errors').innerText = errs;

        if(appState.currentMode === 'pro' && appState.game.scoreData) {
            document.querySelectorAll('.pro-score-card').forEach(el => el.classList.remove('hidden'));
            let sd = appState.game.scoreData;
            let nCL = document.getElementById('score-nota-cl');
            let gUS = document.getElementById('score-grade-us');
            nCL.innerText = sd.notaCL;
            gUS.innerText = sd.gradeUS;
            
            nCL.style.color = parseFloat(sd.notaCL) >= 4.0 ? 'var(--success)' : 'var(--error)';
            gUS.style.color = (sd.gradeUS === 'F' || sd.gradeUS === 'D') ? 'var(--error)' : 'var(--success)';
        } else {
            document.querySelectorAll('.pro-score-card').forEach(el => el.classList.add('hidden'));
        }

        renderDetailedLog(appState.game.stats, 'score-detailed-log', appState.currentMode);
        document.getElementById('player-name-input').value = appState.game.lastName || ""; 
        document.getElementById('modal-name').classList.remove('hidden');
    }

    function skipSaving() { closeModal('modal-name'); }
    function saveSessionWithName() { const name = document.getElementById('player-name-input').value || "Anon"; appState.game.lastName = name; closeModal('modal-name'); saveGlobalStats(name); document.getElementById('score-title').innerText = t().scoreTitle + " " + name; }

    function renderDetailedLog(statsArray, containerId, mode) {
        const c = document.getElementById(containerId); c.innerHTML = ""; let hasErr = false;
        statsArray.forEach(s => {
            if(s.errors === 0) return; hasErr = true;
            const div = document.createElement('div'); div.className = 'log-item';
            const h = document.createElement('div'); h.className = 'log-q';
            if(mode === 'learn') {
                h.innerText = t().logHeader(s.qNum, appState.config.qCount, s.dividend, s.divisor, s.correctQuotient, s.correctRemainder); div.appendChild(h);
                const eStr = document.createElement('div'); eStr.className = 'log-err-count'; eStr.innerText = t().logErrCount(s.errors); div.appendChild(eStr);
                const ul = document.createElement('ul'); ul.className = 'log-ul';
                if (s.logs) s.logs.forEach(e => { const li = document.createElement('li'); if(e.type === 'QUOTIENT') li.innerText = t().errQuotient(e.workingVal, e.div, e.input, e.expected); else if(e.type === 'RESIDUE') li.innerText = t().errResidue(e.workingVal, e.sub, e.fullRem, e.input, e.expected); ul.appendChild(li); }); div.appendChild(ul);
            } else {
                h.innerText = t().proLogHeader(s.qNum, appState.config.qCount, s.dividend, s.divisor, s.correctQuotient, s.correctRemainder); div.appendChild(h);
                const ul = document.createElement('ul'); ul.className = 'log-ul';
                if (s.logs && s.logs.length > 0) { 
                    s.logs.forEach(log => {
                        const li = document.createElement('li'); 
                        if (log.type === 'PRO_QUOTIENT') {
                            if (log.input === "") li.innerText = t().proErrOmitted(log.expected, s.correctRemainder);
                            else li.innerText = t().proErrQuotient(log.input, log.expected); 
                        } else if (log.type === 'PRO_RESIDUE') {
                            if (log.input === "") li.innerText = t().proErrRemOmitted(log.expected);
                            else li.innerText = t().proErrResidue(log.input, log.expected);
                        }
                        ul.appendChild(li);
                    });
                } 
                div.appendChild(ul);
            } c.appendChild(div);
        });
        if(!hasErr) c.innerHTML = `<div class="log-perfect">${t().logPerfectSession}</div>`;
    }

    function saveGlobalStats(name) {
        let history = JSON.parse(localStorage.getItem(getStorageKey()) || '[]');
        const totalDuration = appState.game.secondsElapsed;
        let totalErrors = appState.currentMode === 'learn' ? appState.game.stats.reduce((acc, curr) => acc + curr.errors, 0) : appState.game.currentErrors;
        const now = new Date(); const dateString = `${now.getDate()}/${now.getMonth()+1} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        let record = { date: dateString, ts: Date.now(), name: name, mode: appState.config.difficulty, time: totalDuration, errors: totalErrors, totalQs: appState.config.qCount, stats: appState.game.stats };
        if(appState.currentMode === 'pro' && appState.game.scoreData) {
            record.scoreData = appState.game.scoreData;
        }

        history.push(record);
        localStorage.setItem(getStorageKey(), JSON.stringify(history));
        dpRenderHomeRanking();
    }

    function showGlobalHistory() {
        showScreen('screen-history');
        const modeName = appState.currentMode === 'learn' ? t().configLearn : t().configPro;
        document.getElementById('history-title').innerText = `${t().historyTitle} · ${modeName}`;
        const history = JSON.parse(localStorage.getItem(getStorageKey()) || '[]');
        const tbody = document.getElementById('history-body'), emptyMsg = document.getElementById('history-empty');
        tbody.innerHTML = '';
        
        const scoreTh = document.getElementById('th-h-score');
        if(appState.currentMode === 'pro') scoreTh.style.display = 'table-cell';
        else scoreTh.style.display = 'none';

        if (history.length === 0) { emptyMsg.style.display = 'block'; } 
        else {
            emptyMsg.style.display = 'none';
            history.slice().reverse().forEach(game => {
                const tr = document.createElement('tr'); tr.onclick = () => showSessionDetails(game);
                const mins = Math.floor(game.time / 60).toString().padStart(2, '0'), secs = (game.time % 60).toString().padStart(2, '0');
                
                let rowHTML = `<td>${game.date}</td><td>${game.name || '-'}</td><td>${game.mode === 'easy' ? t().easy : game.mode === 'normal' ? t().normal : t().hard}</td><td>${mins}:${secs}</td><td style="${game.errors>0?'color:var(--error); font-weight:bold;':''}">${game.errors}</td>`;
                
                if(appState.currentMode === 'pro') {
                    let scoreHtml = '-';
                    if (game.scoreData) {
                        let clColor = parseFloat(game.scoreData.notaCL) >= 4.0 ? 'var(--success)' : 'var(--error)';
                        scoreHtml = `<span style="font-weight:bold; color:${clColor}">${game.scoreData.notaCL}</span> | ${game.scoreData.gradeUS}`;
                    }
                    rowHTML += `<td>${scoreHtml}</td>`;
                }
                
                tr.innerHTML = rowHTML;
                tbody.appendChild(tr);
            });
        }
    }

    function showSessionDetails(gameData) {
        appState.game.currentlyViewingHistory = gameData;
        if(!gameData.stats) { document.getElementById('modal-details-content').innerHTML = "<p style='padding:20px;text-align:center;'>Esta partida no contiene detalles guardados.</p>"; } 
        else { const oQCount = appState.config.qCount; if(gameData.totalQs) appState.config.qCount = gameData.totalQs; renderDetailedLog(gameData.stats, 'modal-details-content', gameData._mk || appState.currentMode); appState.config.qCount = oQCount; }
        document.getElementById('modal-details').classList.remove('hidden');
    }

    function handleGlobalBack() {
        const h = !document.getElementById('screen-history').classList.contains('hidden');
        const c = !document.getElementById('screen-config').classList.contains('hidden');
        if(h || c) goToMenu(); else showScreen('screen-lang');
    }
