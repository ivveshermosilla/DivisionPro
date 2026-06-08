var _initLang = new URLSearchParams(window.location.search).get('lang');
    if (_initLang === 'es' || _initLang === 'en') {
        appState.lang = _initLang;
        localStorage.setItem('ivves_preferred_lang', _initLang);
    } else {
        var _savedLang = localStorage.getItem('ivves_preferred_lang');
        if (_savedLang === 'es' || _savedLang === 'en') { appState.lang = _savedLang; _initLang = _savedLang; }
    }
    dpQuickGen();
    dpRenderHomeRanking();
    updateUITexts();
    if (_initLang) showScreen('screen-menu');
