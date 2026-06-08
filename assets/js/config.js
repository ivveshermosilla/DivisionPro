function syncInputs(source) {
	        const s = document.getElementById('q-slider'), i = document.getElementById('q-input');
	        if (source === 'slider') i.value = s.value;
	        const nextValue = Math.max(1, Math.min(50, parseInt(i.value, 10) || 1));
	        i.value = nextValue;
	        s.value = nextValue;
	        appState.config.qCount = nextValue;
	    }
    function setDifficulty(d) {
        appState.config.difficulty = d;
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
        document.getElementById('diff-' + d).classList.add('selected');
        updateDiffDesc();
    }
    function updateDiffDesc() {
        const d = appState.config.difficulty, p = document.getElementById('diff-desc');
        p.innerText = d === 'easy' ? t().diffDescEasy : d === 'normal' ? t().diffDescNormal : t().diffDescHard;
    }
