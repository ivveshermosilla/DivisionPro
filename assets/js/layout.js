// --- SOPORTE TÁCTIL ---
    window.addEventListener('touchmove', function() {}, {passive: false});

    // --- ALINEACIÓN DE RESTOS POR COLUMNAS ---
    function getResidueStartColumn(alignIndex, cellCount) {
        return Math.max(0, alignIndex - cellCount + 1);
    }
    function prepareWorkGrid(workArea, columnCount) {
        workArea.style.setProperty('--division-cols', Math.max(1, columnCount));
    }
    function createResidueRow(columnCount) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'residue-row';
        rowDiv.style.setProperty('--division-cols', Math.max(1, columnCount));
        return rowDiv;
    }
    function placeResidueCell(cell, columnIndex) {
        cell.style.gridColumn = `${Math.max(0, columnIndex) + 1}`;
    }
    window.addEventListener('resize', () => {
        if (!document.getElementById('screen-game-learn').classList.contains('hidden')) renderLearnGame();
        if (!document.getElementById('screen-game-pro').classList.contains('hidden')) renderProGame();
    });
