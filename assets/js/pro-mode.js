// --- PRO MODE ---
    function loadProQuestion(idx) {
        clearTouchDragArtifacts();
        appState.game.currentQ = idx;
        appState.proGame.selections = { div: [], res: [] }; 
        document.getElementById('q-progress-pro').innerText = `${idx + 1} / ${appState.config.qCount}`;
        
        const btnPrev = document.getElementById('btn-side-prev');
        const btnNext = document.getElementById('btn-side-next');
        
        btnPrev.disabled = (idx === 0);
        
        if(idx === appState.config.qCount - 1) {
            btnNext.innerText = "🏁"; 
            btnNext.classList.add('finish-btn');
            btnNext.onclick = finishProGame;
        } else {
            btnNext.innerText = "➡"; 
            btnNext.classList.remove('finish-btn');
            btnNext.onclick = () => proNav(1);
        }
        renderProGame();
    }

    function proNav(dir) { let n = appState.game.currentQ + dir; if(n >= 0 && n < appState.config.qCount) loadProQuestion(n); }

    function finishProGame() {
        appState.game.stats = []; let tErr = 0;
        let maxPoints = appState.config.qCount * 10;
        let earnedPoints = 0;

        appState.game.questions.forEach((q, i) => {
            let uStr = appState.proGame.answers[i].quotients.join(''); 
            let uNum = parseInt(uStr); if(isNaN(uNum)) uStr = "";
            let cQ = Math.floor(q.dividend / q.divisor); 
            let qHasError = uStr !== cQ.toString();

            let lastRowIdx = q.scaffolding.length - 1;
            let uRemStr = appState.proGame.answers[i].residues[lastRowIdx].join('');
            let uRemNum = parseInt(uRemStr); if(isNaN(uRemNum)) uRemStr = "";
            let cRem = q.dividend % q.divisor;
            let remHasError = uRemStr !== cRem.toString();

            let localLogs = [];
            let errCount = 0;

            if (qHasError) {
                errCount++;
                localLogs.push({ type: 'PRO_QUOTIENT', input: uStr, expected: cQ });
            }
            if (remHasError) {
                errCount++;
                localLogs.push({ type: 'PRO_RESIDUE', input: uRemStr, expected: cRem });
            }

            if (!qHasError) {
                earnedPoints += 7; 
                if (!remHasError) {
                    earnedPoints += 3; 
                }
            }

            tErr += errCount;
            appState.game.stats.push({ 
                qNum: i + 1, dividend: q.dividend, divisor: q.divisor, 
                correctQuotient: cQ, correctRemainder: cRem, 
                time: 0, errors: errCount, logs: localLogs 
            });
        });
        
        appState.game.currentErrors = tErr;

        let percent = (earnedPoints / maxPoints) * 100;
        
        let notaCL = 1.0;
        if (percent < 60) {
            notaCL = 3 * (percent / 60) + 1;
        } else {
            notaCL = 3 * ((percent - 60) / 40) + 4;
        }
        notaCL = Math.round(notaCL * 10) / 10; 

        let gradeUS = 'F';
        if (percent >= 90) gradeUS = 'A';
        else if (percent >= 80) gradeUS = 'B';
        else if (percent >= 70) gradeUS = 'C';
        else if (percent >= 60) gradeUS = 'D';

        appState.game.scoreData = { percent: percent, notaCL: notaCL.toFixed(1), gradeUS: gradeUS };

        showSessionSummary();
    }

    function renderProGame() {
        const idx = appState.game.currentQ, q = appState.game.questions[idx], ans = appState.proGame.answers[idx], divDisp = document.getElementById('dividend-display-pro'), quoDisp = document.getElementById('quotient-display-pro'), workArea = document.getElementById('work-area-pro'), msg = document.getElementById('message-box-pro');
        const columnCount = Math.max(1, q.dividend.toString().length);
        prepareWorkGrid(workArea, columnCount);
        const isQuotientFull = ans.quotients.indexOf(null) === -1;

        divDisp.innerHTML = '';
	        q.dividend.toString().split('').forEach((d, i) => {
	            const span = document.createElement('div'); span.className = 'digit'; span.style.cursor = 'grab'; span.draggable = true;
	            span.dataset.dragType = 'bringdown';
	            span.dataset.dragVal = d;
	            span.ondragstart = (e) => { e.dataTransfer.setData("type", "bringdown"); e.dataTransfer.setData("val", d); };
            span.onclick = () => {
                const sel = appState.proGame.selections.div;
                const iIdx = sel.indexOf(i);
                if(iIdx > -1) sel.splice(iIdx, 1); else sel.push(i);
                renderProGame();
            };
            if(appState.proGame.selections.div.includes(i)) span.classList.add('selected');
            span.innerText = d; divDisp.appendChild(span);
        });
        document.getElementById('divisor-display-pro').innerText = q.divisor;

        quoDisp.innerHTML = '';
        let actQIdx = ans.quotients.indexOf(null); if(actQIdx === -1) actQIdx = ans.quotients.length;
        for(let i=0; i < ans.quotients.length; i++) {
            const box = document.createElement('div'); box.className = 'drop-zone drop-zone-pro';
            if(ans.quotients[i] !== null) { box.innerText = ans.quotients[i]; box.classList.add('filled'); } 
            else if (i === actQIdx) { box.classList.add('active-target', 'blink-pro'); }
            if(i <= actQIdx) { 
                box.ondragover = e => e.preventDefault(); 
                box.ondragenter = e => e.preventDefault();
                box.ondrop = e => handleProDrop(e, 'Q', i); 
                box.onclick = () => { ans.quotients[i] = null; renderProGame(); }; 
            }
            quoDisp.appendChild(box);
        }

        workArea.innerHTML = '';
        q.scaffolding.forEach((row, rIdx) => {
            const rowDiv = createResidueRow(columnCount);
            const startColumn = getResidueStartColumn(row.alignIndex, row.numBoxes);
            
            let finalRemNeedsFill = (isQuotientFull && rIdx === q.scaffolding.length - 1 && ans.residues[rIdx].includes(null));

            for(let cIdx = 0; cIdx < row.numBoxes; cIdx++) {
                const rBox = document.createElement('div'); rBox.className = 'drop-zone drop-zone-pro';
                placeResidueCell(rBox, startColumn + cIdx);
                
                if(ans.residues[rIdx][cIdx] !== null) { rBox.innerText = ans.residues[rIdx][cIdx]; rBox.classList.add('filled'); }
                
                if (finalRemNeedsFill && ans.residues[rIdx][cIdx] === null) {
                    rBox.classList.add('blink-pro');
                }

                rBox.ondragover = e => e.preventDefault(); 
                rBox.ondragenter = e => e.preventDefault();
                rBox.ondrop = e => handleProDrop(e, 'R', rIdx, cIdx); 
                rBox.ondblclick = () => { ans.residues[rIdx][cIdx] = null; renderProGame(); };
                rBox.onclick = () => {
                    const sel = appState.proGame.selections.res;
                    const fIdx = sel.findIndex(s => s.r === rIdx && s.c === cIdx);
                    if(fIdx > -1) sel.splice(fIdx, 1); else sel.push({r: rIdx, c: cIdx});
                    renderProGame();
                };

                if(appState.proGame.selections.res.some(s => s.r === rIdx && s.c === cIdx)) {
                    rBox.classList.add('working-row');
                }

                rowDiv.appendChild(rBox);
            }
            
            if (finalRemNeedsFill) {
                const arrow = document.createElement('div');
                arrow.className = 'residue-arrow';
                arrow.innerHTML = '&#8592;';
                placeResidueCell(arrow, startColumn + row.numBoxes);
                rowDiv.appendChild(arrow);
            }

            workArea.appendChild(rowDiv);
        });

        msg.style.background = "var(--primary)"; msg.innerHTML = t().msgProFree;
    }

    function handleProDrop(e, type, rIdx, cIdx) {
        e.preventDefault();
        const dT = getDropValue(e, "type");
        let val;
        if(dT === "number" || dT === "bringdown") val = getDropInteger(e, "text", "val");
        else return;
        if (val === null) return;
        const ans = appState.proGame.answers[appState.game.currentQ];
        if(type === 'Q') {
            if (rIdx < 0 || rIdx >= ans.quotients.length) return;
            ans.quotients[rIdx] = val;
            appState.proGame.selections = { div: [], res: [] }; 
        }
        if(type === 'R') {
            if (!ans.residues[rIdx] || cIdx < 0 || cIdx >= ans.residues[rIdx].length) return;
            ans.residues[rIdx][cIdx] = val;
        }
        renderProGame();
    }
