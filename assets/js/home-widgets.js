// --- ACTIVE PRACTICE (QUICK DIVISION) ---
    var _dpQ = { dividend: 0, divisor: 0, quotient: 0 };
    function dpQuickGen() {
        var divisor = Math.floor(Math.random() * 9) + 1;
        var quotient = Math.floor(Math.random() * 12) + 1;
        _dpQ = { dividend: divisor * quotient, divisor: divisor, quotient: quotient };
        var el = document.getElementById('dp-quick-question');
        if (el) el.textContent = _dpQ.dividend + ' ÷ ' + _dpQ.divisor;
        var inp = document.getElementById('dp-quick-input');
        if (inp) { inp.value = ''; inp.focus(); }
        var fb = document.getElementById('dp-quick-feedback');
        if (fb) { fb.textContent = ''; fb.style.color = ''; }
    }
    function dpQuickCheck() {
        var val = parseInt(document.getElementById('dp-quick-input').value, 10);
        var fb = document.getElementById('dp-quick-feedback');
        if (!fb) return;
        if (isNaN(val)) { fb.textContent = ''; return; }
        if (val === _dpQ.quotient) {
            fb.textContent = t().quickCorrect;
            fb.style.color = 'var(--success)';
        } else {
            fb.textContent = t().quickWrong + ' ' + _dpQ.quotient;
            fb.style.color = 'var(--danger)';
        }
    }
    // --- HOME RANKING ---
    function dpRenderHomeRanking() {
        var learnH = JSON.parse(localStorage.getItem('divisiones_history_learn') || '[]');
        var proH = JSON.parse(localStorage.getItem('divisiones_history_pro') || '[]');
        var combined = learnH.map(function(g) { return Object.assign({}, g, { _mk: 'learn' }); })
            .concat(proH.map(function(g) { return Object.assign({}, g, { _mk: 'pro' }); }))
            .sort(function(a, b) { return (b.ts || 0) - (a.ts || 0); })
            .slice(0, 10);
        var body = document.getElementById('dp-ranking-body');
        var empty = document.getElementById('dp-ranking-empty');
        if (!body) return;
        if (combined.length === 0) {
            body.innerHTML = '';
            if (empty) empty.style.display = 'block';
            return;
        }
        if (empty) empty.style.display = 'none';
        body.innerHTML = combined.map(function(g) {
            var mins = Math.floor(g.time/60).toString().padStart(2,'0');
            var secs = (g.time%60).toString().padStart(2,'0');
            var modeClass = g._mk === 'pro' ? 'dp-rank-mode pro' : 'dp-rank-mode';
            var modeLabel = g._mk === 'learn' ? (t().statLearnValue||'Guiado') : (t().statProValue||'Reto');
            var err = g.errors > 0 ? '<span style="color:var(--danger);font-weight:bold;">' + g.errors + ' err</span>' : '<span style="color:var(--success);">0 err</span>';
            var safeG = JSON.stringify(g).replace(/&/g,'&amp;').replace(/"/g,'&quot;');
            return '<div class="dp-rank-item" onclick=\'showSessionDetails(' + safeG + ')\'>' +
                '<span class="' + modeClass + '">' + modeLabel + '</span>' +
                '<span style="font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + (g.name||'—') + '</span>' +
                err +
                '<span style="color:var(--muted);">' + mins + ':' + secs + '</span>' +
                '</div>';
        }).join('');
    }
