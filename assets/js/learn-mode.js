// --- LEARN MODE ---
    function loadLearnQuestion(idx) {
        if (idx >= appState.game.questions.length) { showSessionSummary(); return; }
        clearTouchDragArtifacts();
        appState.game.currentQ = idx; appState.game.questionStartTime = Date.now(); appState.game.currentErrors = 0; appState.game.currentLogs = []; 
        document.getElementById('q-progress-learn').innerText = `${idx + 1} / ${appState.config.qCount}`;
        const q = appState.game.questions[idx]; const g = learnLogic;
        g.dividend = q.dividend; g.divisor = q.divisor; g.divDigits = q.dividend.toString().split('').map(Number);
        g.quotientLength = Math.floor(q.dividend / q.divisor).toString().length;
        g.selectedIndices = []; g.usedIndices = []; g.quotientFound = []; g.rows = []; g.tempResidues = null; g.currentWorkingVal = 0; g.expectedRemainderString = ""; g.step = 'SELECT';
        renderLearnGame();
    }

    function renderLearnGame() {
        const divDisp = document.getElementById('dividend-display-learn'), quoDisp = document.getElementById('quotient-display-learn'), workArea = document.getElementById('work-area-learn'), msg = document.getElementById('message-box-learn'), g = learnLogic;
        const columnCount = Math.max(1, g.divDigits.length);
        prepareWorkGrid(workArea, columnCount);
        
        divDisp.innerHTML = '';
        const selectableIdx = getNextSelectableLearnIndex();
        g.divDigits.forEach((d, i) => {
            const span = document.createElement('div'); span.className = 'digit';
            if (g.usedIndices.includes(i)) span.classList.add('used'); else if (g.selectedIndices.includes(i)) span.classList.add('selected');
            if (g.step === 'SELECT' && !g.usedIndices.includes(i)) {
                if (i === selectableIdx) span.classList.add('blink-soft');
            }
            const nextIdx = Math.max(...(g.selectedIndices.length ? g.selectedIndices : [-1])) + 1;
	            if (g.step === 'BRINGDOWN' && i === nextIdx) {
	                span.classList.add('blink-soft'); span.style.cursor = 'grab'; span.draggable = true;
	                span.dataset.dragType = 'bringdown';
	                span.dataset.dragVal = d;
	                span.dataset.dragIdx = i;
	                span.ondragstart = (e) => { e.dataTransfer.setData("type", "bringdown"); e.dataTransfer.setData("val", d); e.dataTransfer.setData("idx", i); };
	            }
            span.innerText = d; span.onclick = () => { if(g.step === 'SELECT') handleLearnClick(i); };
            divDisp.appendChild(span);
        });
        document.getElementById('divisor-display-learn').innerText = g.divisor;

        quoDisp.innerHTML = '';
        for(let i=0; i < g.quotientLength; i++) {
            const box = document.createElement('div'); box.className = 'drop-zone'; const qObj = g.quotientFound[i];
            if(qObj) {
                box.innerText = qObj.val;
                if(qObj.status === 'correct') box.classList.add('correct');
                else {
                    box.classList.add('incorrect'); 
                    box.ondragover = e => e.preventDefault(); 
                    box.ondragenter = e => e.preventDefault();
                    box.ondrop = e => handleLearnDrop(e, 'QUOTIENT', i);
                    box.onclick = function() { g.quotientFound.splice(i, 1); renderLearnGame(); };
                }
            } else {
                const noErr = !g.quotientFound.some(q => q.status === 'incorrect') && !(g.tempResidues && g.tempResidues.some(r => r && r.status === 'incorrect'));
                if(g.step === 'QUOTIENT' && i === g.quotientFound.length && noErr) {
                    box.classList.add('blink-soft'); 
                    box.ondragover = e => e.preventDefault(); 
                    box.ondragenter = e => e.preventDefault();
                    box.ondrop = e => handleLearnDrop(e, 'QUOTIENT', i);
                }
            }
            quoDisp.appendChild(box);
        }

        workArea.innerHTML = '';
        g.rows.forEach((row, idx) => {
            const rowDiv = createResidueRow(columnCount);
            const rChars = row.residueStr.split('');
            const startColumn = getResidueStartColumn(row.alignIndex, rChars.length);
            const isW = (idx === g.rows.length - 1) && (g.step === 'QUOTIENT');
            rChars.forEach((char, cIdx) => { const rBox = document.createElement('div'); rBox.className = `drop-zone ${isW ? 'working-row' : 'history-row'}`; rBox.innerText = char; placeResidueCell(rBox, startColumn + cIdx); rowDiv.appendChild(rBox); });
            if(row.brought !== null && row.brought !== undefined) { const bBox = document.createElement('div'); bBox.className = `drop-zone ${isW ? 'working-row' : 'history-row'}`; bBox.innerText = row.brought; placeResidueCell(bBox, startColumn + rChars.length); rowDiv.appendChild(bBox); }
            workArea.appendChild(rowDiv);
        });

        if (g.step === 'RESIDUE' || g.step === 'BRINGDOWN' || g.step === 'FINISH') {
            const actRow = createResidueRow(columnCount);
            const align = g.selectedIndices.length > 0 ? g.selectedIndices[g.selectedIndices.length - 1] : 0;
            const resLen = g.tempResidues ? g.tempResidues.length : 1;
            const startColumn = getResidueStartColumn(align, resLen);

            if (g.tempResidues) {
                g.tempResidues.forEach((resItem, rIdx) => {
                    const rBox = document.createElement('div'); rBox.className = 'drop-zone';
                    placeResidueCell(rBox, startColumn + rIdx);
                    if (resItem) {
                        rBox.innerText = resItem.val;
                        if (resItem.status === 'correct') { rBox.classList.add(g.step === 'FINISH' ? 'active-residue-input' : 'working-row'); } 
                        else {
                            rBox.classList.add('incorrect'); 
                            rBox.ondragover = e => e.preventDefault(); 
                            rBox.ondragenter = e => e.preventDefault();
                            rBox.ondrop = e => handleLearnDrop(e, 'RESIDUE', rIdx);
                            rBox.onclick = function() { g.tempResidues[rIdx] = null; renderLearnGame(); };
                        }
                    } else if (g.step === 'RESIDUE') {
                        const noErr = !g.tempResidues.some(r => r && r.status === 'incorrect');
                        if(rIdx === g.tempResidues.indexOf(null) && noErr) { 
                            rBox.classList.add('active-residue-input', 'blink-soft'); 
                            rBox.ondragover = e => e.preventDefault(); 
                            rBox.ondragenter = e => e.preventDefault();
                            rBox.ondrop = e => handleLearnDrop(e, 'RESIDUE', rIdx); 
                        } 
                        else if (!noErr && resItem === null) { rBox.classList.add('active-residue-input'); }
                    }
                    actRow.appendChild(rBox);
                });
            }
            if (g.step === 'BRINGDOWN') {
                const bBox = document.createElement('div'); bBox.className = 'drop-zone working-row blink-soft'; bBox.style.border = '3px dashed #d35400';
                placeResidueCell(bBox, startColumn + resLen);
                bBox.ondragover = e => e.preventDefault(); 
                bBox.ondragenter = e => e.preventDefault();
                bBox.ondrop = e => handleLearnDrop(e, 'BRINGDOWN'); 
                actRow.appendChild(bBox);
            }
            workArea.appendChild(actRow);
        }

        const nextBtn = document.getElementById('btn-learn-next');
        const isLast = appState.game.currentQ === appState.config.qCount - 1;
        
        nextBtn.innerText = isLast ? t().finish : t().nextQ;

        if (g.step === 'FINISH') {
            msg.innerText = t().gameFinish(g.quotientFound.map(o => o.val).join(''), g.expectedRemainderString);
            
            nextBtn.disabled = false;
            
            if (isLast) {
                nextBtn.classList.add('finish-mode');
                nextBtn.onclick = () => { saveStatsLearn(); showSessionSummary(); };
            } else {
                nextBtn.classList.remove('finish-mode');
                nextBtn.onclick = saveLearnAndNext;
            }
        } else {
            nextBtn.disabled = true;
            nextBtn.onclick = null;
            if(isLast) nextBtn.classList.add('finish-mode'); else nextBtn.classList.remove('finish-mode');
            
            msg.style.background = "var(--primary)";
            if (g.quotientFound.some(q => q.status === 'incorrect') || (g.tempResidues && g.tempResidues.some(r => r && r.status === 'incorrect'))) {
                msg.innerText = t().errorCorrection; msg.style.background = "var(--error)";
            } else {
                if(g.step === 'SELECT') {
                    const currentVal = parseInt(g.selectedIndices.map(idx => g.divDigits[idx]).join(''));
                    if (g.selectedIndices.length > 0 && currentVal < g.divisor) {
                        msg.innerText = t().gameSelectMore(currentVal, g.divisor);
                    } else {
                        msg.innerText = t().gameSelect;
                    }
                }
                else if(g.step === 'QUOTIENT') msg.innerText = t().gameQuotient(g.divisor, g.currentWorkingVal);
                else if(g.step === 'RESIDUE') msg.innerText = t().gameResidue(g.currentWorkingVal, g.quotientFound[g.quotientFound.length-1].val, g.divisor);
                else if(g.step === 'BRINGDOWN') msg.innerText = t().gameBringdown;
            }
        }
    }

    function getNextSelectableLearnIndex() {
        const g = learnLogic;
        if (g.step !== 'SELECT') return -1;
        if (g.selectedIndices.length > 0) {
            const nextIdx = g.selectedIndices[g.selectedIndices.length - 1] + 1;
            return nextIdx < g.divDigits.length && !g.usedIndices.includes(nextIdx) ? nextIdx : -1;
        }
        return g.divDigits.findIndex((_, i) => !g.usedIndices.includes(i));
    }

    function handleLearnClick(idx) {
        const g = learnLogic;
        if (g.step !== 'SELECT') return;
        if (g.selectedIndices.includes(idx)) {
            if (idx === g.selectedIndices[g.selectedIndices.length - 1]) g.selectedIndices.pop();
            else return;
        } else {
            const nextIdx = getNextSelectableLearnIndex();
            if (idx !== nextIdx) return;
            g.selectedIndices.push(idx);
        }
        const val = parseInt(g.selectedIndices.map(i => g.divDigits[i]).join('') || 0);
        if (g.selectedIndices.length > 0 && val >= g.divisor) { g.currentWorkingVal = val; g.step = 'QUOTIENT'; }
        renderLearnGame();
    }

    function getDropValue(e, key) {
        if (!e.dataTransfer || typeof e.dataTransfer.getData !== 'function') return "";
        const value = e.dataTransfer.getData(key);
        return value === null || value === undefined ? "" : String(value);
    }

    function getDropInteger(e, ...keys) {
        for (const key of keys) {
            const raw = getDropValue(e, key).trim();
            if (raw === "") continue;
            const parsed = Number.parseInt(raw, 10);
            if (Number.isFinite(parsed)) return parsed;
        }
        return null;
    }

    function handleLearnDrop(e, actionType, boxIdx) {
        e.preventDefault();
        const type = getDropValue(e, "type");
        const g = learnLogic;
        if (actionType === 'QUOTIENT') {
            if (g.step !== 'QUOTIENT' || type !== 'number') return;
            const val = getDropInteger(e, "text", "val");
            if (val === null || boxIdx < 0 || boxIdx >= g.quotientLength) return;
            const corr = Math.floor(g.currentWorkingVal / g.divisor), isC = (val === corr);
            if(!isC) { 
                const isDup = appState.game.currentLogs.some(l => l.type === 'QUOTIENT' && l.workingVal === g.currentWorkingVal && l.input === val);
                if(!isDup) {
                    appState.game.currentErrors++; 
                    appState.game.currentLogs.push({ type: 'QUOTIENT', input: val, expected: corr, workingVal: g.currentWorkingVal, div: g.divisor }); 
                }
            }
            if (g.quotientFound[boxIdx]) g.quotientFound[boxIdx] = { val: val, status: isC ? 'correct' : 'incorrect' }; else g.quotientFound.push({ val: val, status: isC ? 'correct' : 'incorrect' });
            if (isC) { g.step = 'RESIDUE'; g.expectedRemainderString = (g.currentWorkingVal - (corr * g.divisor)).toString(); g.tempResidues = new Array(g.expectedRemainderString.length).fill(null); }
        }
        else if (actionType === 'RESIDUE') {
            if (g.step !== 'RESIDUE' || type !== 'number' || !Array.isArray(g.tempResidues)) return;
            const val = getDropInteger(e, "text", "val");
            if (val === null || boxIdx < 0 || boxIdx >= g.tempResidues.length) return;
            const exp = parseInt(g.expectedRemainderString[boxIdx]), isC = (val === exp);
            if (!Number.isFinite(exp)) return;
            if(!isC) { 
                const sub = g.quotientFound[g.quotientFound.length-1].val * g.divisor; 
                const isDup = appState.game.currentLogs.some(l => l.type === 'RESIDUE' && l.workingVal === g.currentWorkingVal && l.input === val && l.boxIdx === boxIdx);
                if(!isDup) {
                    appState.game.currentErrors++; 
                    appState.game.currentLogs.push({ type: 'RESIDUE', input: val, expected: exp, workingVal: g.currentWorkingVal, div: g.divisor, sub: sub, fullRem: g.currentWorkingVal - sub, boxIdx: boxIdx }); 
                }
            }
            g.tempResidues[boxIdx] = { val: val, status: isC ? 'correct' : 'incorrect' };
            if (g.tempResidues.every(r => r && r.status === 'correct')) {
                if (g.rows.length === 0) g.selectedIndices.forEach(i => { if(!g.usedIndices.includes(i)) g.usedIndices.push(i); });
                g.step = (g.usedIndices.length < g.divDigits.length) ? 'BRINGDOWN' : 'FINISH';
            }
        }
        else if (actionType === 'BRINGDOWN') {
            if (g.step !== 'BRINGDOWN' || type !== 'bringdown') return;
            const oIdx = getDropInteger(e, "idx"), oVal = getDropInteger(e, "val", "text");
            const expectedIdx = Math.max(...(g.selectedIndices.length ? g.selectedIndices : [-1])) + 1;
            if (oIdx === null || oVal === null || oIdx !== expectedIdx) return;
            g.rows.push({ residueStr: g.expectedRemainderString, brought: oVal, alignIndex: g.selectedIndices[g.selectedIndices.length - 1] });
            g.usedIndices.push(oIdx); g.currentWorkingVal = parseInt(g.expectedRemainderString + oVal.toString()); g.selectedIndices.push(oIdx); g.tempResidues = null; g.step = 'QUOTIENT';
        }
        renderLearnGame();
    }

    function saveStatsLearn() {
        const q = appState.game.questions[appState.game.currentQ];
        appState.game.stats.push({ qNum: appState.game.currentQ + 1, dividend: q.dividend, divisor: q.divisor, correctQuotient: Math.floor(q.dividend / q.divisor), correctRemainder: q.dividend % q.divisor, time: Math.floor((Date.now() - appState.game.questionStartTime) / 1000), errors: appState.game.currentErrors, logs: [...appState.game.currentLogs] });
    }

    function saveLearnAndNext() {
        saveStatsLearn();
        loadLearnQuestion(appState.game.currentQ + 1);
    }
