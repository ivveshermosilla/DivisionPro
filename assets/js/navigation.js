// --- NAVIGATION & REACTIVITY ---
    function showScreen(id) {
        clearTouchDragArtifacts();
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById(id).classList.remove('hidden');
        const topbar = document.getElementById('dp-topbar');
        if (topbar) topbar.classList.toggle('hidden', id !== 'screen-menu' && id !== 'screen-lang');
        if (id === 'screen-game-learn' || id === 'screen-game-pro') {
            window.dispatchEvent(new Event('resize'));
        }
    }

    function toggleInGameLang() {
        appState.lang = appState.lang === 'es' ? 'en' : 'es';
        localStorage.setItem('ivves_preferred_lang', appState.lang);
        updateUITexts();
        
        if (!document.getElementById('screen-game-learn').classList.contains('hidden')) renderLearnGame();
        if (!document.getElementById('screen-game-pro').classList.contains('hidden')) renderProGame();
        
        if (!document.getElementById('screen-score').classList.contains('hidden')) {
            renderDetailedLog(appState.game.stats, 'score-detailed-log', appState.currentMode);
            if (appState.game.lastName && document.getElementById('modal-name').classList.contains('hidden')) {
                document.getElementById('score-title').innerText = t().scoreTitle + " " + appState.game.lastName;
            }
        }
        if (!document.getElementById('screen-history').classList.contains('hidden')) showGlobalHistory();
        if (!document.getElementById('modal-details').classList.contains('hidden') && appState.game.currentlyViewingHistory) {
            showSessionDetails(appState.game.currentlyViewingHistory);
        }
    }

    function setLanguage(l) { appState.lang = l; localStorage.setItem('ivves_preferred_lang', l); updateUITexts(); showScreen('screen-menu'); }
    function goToMenu() { stopTimers(); showScreen('screen-menu'); }
    function goToConfig(mode) { appState.currentMode = mode; updateUITexts(); showScreen('screen-config'); }
    
    function closeModal(id) { 
        document.getElementById(id).classList.add('hidden'); 
        if (id === 'modal-details') appState.game.currentlyViewingHistory = null;
        if (id === 'modal-exit') appState.game.isPaused = false; 
    }
    
    function confirmExit() { 
        appState.game.isPaused = true; 
        document.getElementById('modal-exit').classList.remove('hidden'); 
    }
    function exitToMenu() { closeModal('modal-exit'); goToConfig(appState.currentMode); }

    function getStorageKey() { return 'divisiones_history_' + appState.currentMode; }

    function confirmResetHistory() {
        if(confirm(t().resetConfirm)) {
            localStorage.removeItem(getStorageKey());
            showGlobalHistory();
        }
    }

    function updateUITexts() {
        const txt = t();
        const m = appState.currentMode;
        
        const ids = {
	            'txt-nav-subtitle': txt.navSubtitle,
	            'txt-config-back': txt.configBack,
	            'txt-history-back': txt.historyBack,
	            'txt-lang-eyebrow': txt.langEyebrow,
	            'txt-lang-title': txt.langTitle,
	            'txt-lang-subtitle': txt.langSubtitle,
            'txt-lang-es': txt.langEs,
            'txt-lang-en': txt.langEn,
            'txt-home-eyebrow': txt.homeEyebrow,
            'txt-home-copy': txt.homeCopy,
            'txt-stat-learn-value': txt.statLearnValue,
            'txt-stat-learn-label': txt.statLearnLabel,
            'txt-stat-pro-value': txt.statProValue,
            'txt-stat-pro-label': txt.statProLabel,
            'txt-stat-mobile-value': txt.statMobileValue,
            'txt-stat-mobile-label': txt.statMobileLabel,
            'txt-method-title': txt.methodTitle,
            'txt-method-copy': txt.methodCopy,
            'txt-sequence-title': txt.sequenceTitle,
            'txt-sequence-1-title': txt.sequence1Title,
            'txt-sequence-1-copy': txt.sequence1Copy,
            'txt-sequence-2-title': txt.sequence2Title,
            'txt-sequence-2-copy': txt.sequence2Copy,
            'txt-sequence-3-title': txt.sequence3Title,
            'txt-sequence-3-copy': txt.sequence3Copy,
            'txt-home-history-title': txt.homeHistoryTitle,
	            'txt-home-history-copy': txt.homeHistoryCopy,
	            'txt-home-history-btn': txt.homeHistoryBtn,
	            'txt-mode-learn-cta': txt.modeLearnCta,
	            'txt-mode-pro-cta': txt.modeProCta,
	            'txt-config-copy': txt.configCopy,
	            'txt-config-pill': txt.configPill,
	            'btn-history-config-text': txt.historyBtn,
	            'txt-preview-label': txt.previewLabel,
	            'txt-preview-title': txt.previewTitle,
	            'txt-preview-subtitle': txt.previewSubtitle,
            'txt-game-learn-title': txt.gameLearnTitle,
            'txt-game-learn-copy': txt.gameLearnCopy,
	            'txt-game-pro-title': txt.gameProTitle,
	            'txt-game-pro-copy': txt.gameProCopy,
	            'txt-pro-scratch-label': txt.proScratchLabel,
	            'txt-score-copy': txt.scoreCopy,
	            'txt-score-history-btn': txt.scoreHistoryBtn,
            'menu-title-text': txt.menuTitle, 'btn-play': txt.playLearn, 'btn-play-pro': txt.playPro,
            'config-title': m === 'learn' ? txt.configLearn : txt.configPro, 
            'inst-title': txt.instTitle, 'inst-text': m === 'learn' ? txt.instLearn : txt.instPro,
            'btn-history-float-text': txt.historyBtn, 'lbl-difficulty': txt.diff, 'diff-easy': txt.easy,
            'diff-normal': txt.normal, 'diff-hard': txt.hard, 'lbl-qcount': txt.qCount,
            'btn-start': txt.start, 'btn-exit-learn': txt.exit, 'btn-exit-pro': txt.exit, 
            'modal-exit-title': txt.exitConfirm, 'modal-exit-text': txt.exitWarn, 
            'btn-confirm-exit': txt.yes, 'btn-cancel-exit': txt.cancel,
            'score-title': txt.scoreTitle, 'lbl-total-time': txt.time, 'lbl-total-errors': txt.errors,
            'btn-home-config': m === 'learn' ? txt.btnHomeConfigLearn : txt.btnHomeConfigPro,
            'btn-home-menu': txt.btnHomeMenu,
            'history-title': txt.historyTitle, 'th-h-date': txt.hDate,
            'th-h-name': txt.hName, 'th-h-mode': txt.hMode, 'th-h-time': txt.hTime, 'th-h-err': txt.hErr,
            'history-empty': txt.hEmpty, 'history-hint': txt.hHint, 'modal-name-title': txt.nameTitle,
            'btn-save-name': txt.save, 'btn-skip-name': txt.skip, 'lbl-details-title': txt.detailsTitle,
            'modal-details-title': txt.detailsTitle, 'btn-close-details': txt.close, 'btn-reset': txt.resetBtn,
            'lbl-nota-cl': txt.scoreNotaCL, 'lbl-grade-us': txt.scoreGradeUS, 'th-h-score': txt.hScore,
            'dp-txt-tutor-btn': txt.tutorBtn,
            'dp-txt-footer-github': txt.footerGithub, 'dp-txt-footer-matpro': txt.footerMatpro, 'dp-txt-footer-about': txt.footerAbout,
            'dp-txt-tutor-eyebrow': txt.tutorEyebrow, 'dp-txt-tutor-title': txt.tutorTitle, 'dp-txt-tutor-copy': txt.tutorCopy,
            'dp-txt-tutor-close': txt.tutorClose, 'dp-txt-tutor-modes-title': txt.tutorModesTitle,
            'dp-txt-tutor-mode1-title': txt.tutorMode1Title, 'dp-txt-tutor-mode1-copy': txt.tutorMode1Copy,
            'dp-txt-tutor-mode2-title': txt.tutorMode2Title, 'dp-txt-tutor-mode2-copy': txt.tutorMode2Copy,
            'dp-txt-tutor-steps-title': txt.tutorStepsTitle,
            'dp-txt-tutor-step1-title': txt.tutorStep1Title, 'dp-txt-tutor-step1-copy': txt.tutorStep1Copy,
            'dp-txt-tutor-step2-title': txt.tutorStep2Title, 'dp-txt-tutor-step2-copy': txt.tutorStep2Copy,
            'dp-txt-tutor-step3-title': txt.tutorStep3Title, 'dp-txt-tutor-step3-copy': txt.tutorStep3Copy,
            'dp-txt-about-eyebrow': txt.aboutEyebrow, 'dp-txt-about-title': txt.aboutTitle,
            'dp-txt-about-copy1': txt.aboutCopy1, 'dp-txt-about-copy2': txt.aboutCopy2,
            'dp-txt-about-dedication': txt.aboutDedication, 'dp-txt-about-close': txt.aboutClose,
            'dp-txt-quick-title': txt.quickTitle,
            'dp-txt-quick-subtitle': txt.quickSubtitle,
            'dp-txt-quick-chip': txt.quickChip,
            'dp-quick-label': txt.quickLabel,
            'dp-txt-quick-check': txt.quickCheck,
            'dp-txt-quick-next': txt.quickNext,
            'dp-txt-ranking-title': txt.rankingTitle,
            'dp-txt-ranking-hint': txt.rankingHint,
            'dp-txt-ranking-pill': txt.rankingPill,
            'dp-ranking-empty': txt.rankingEmpty
        };
        
        for (const [id, val] of Object.entries(ids)) {
            const el = document.getElementById(id);
            if(el) {
                if(id === 'inst-text' || id === 'txt-home-title') el.innerHTML = val;
                else if (id === 'score-title') {
                    el.innerText = (appState.game.lastName && document.getElementById('modal-name').classList.contains('hidden')) ? val + " " + appState.game.lastName : val;
                }
                else el.innerText = val;
            }
        }
        const _mpLink = document.getElementById('dp-txt-footer-matpro');
        if (_mpLink) _mpLink.href = 'https://ivveshermosilla.github.io/matpro-triple-method/?lang=' + appState.lang;
        
	        const card = document.getElementById('inst-card-container');
	        const startBtn = document.getElementById('btn-start-action');
	        const configScreen = document.getElementById('screen-config');
	        if(m === 'pro') {
	            card.classList.add('pro-card');
	            startBtn.classList.add('btn-pro');
	            startBtn.classList.add('pro');
	            startBtn.classList.remove('learn');
	            configScreen.classList.add('pro-accent');
	            startBtn.style.background = '';
	        } else {
	            card.classList.remove('pro-card');
	            startBtn.classList.remove('btn-pro');
	            startBtn.classList.remove('pro');
	            startBtn.classList.add('learn');
	            configScreen.classList.remove('pro-accent');
	            startBtn.style.background = '';
	        }

        document.getElementById('player-name-input').placeholder = txt.namePlaceholder;
        const homeTitle = document.getElementById('txt-home-title');
        if (homeTitle) homeTitle.innerHTML = txt.homeTitle;
        refreshLanguageToggle();
        updateDiffDesc();
        dpRenderHomeRanking();
    }
