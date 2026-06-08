// --- TOUCH DRAG WITHOUT REPLACING THE DRAG MODEL ---
	    let touchDragState = null;
        const dragArtifactSelector = [
            '.drag-ghost',
            '.mobile-drag-image',
            '.dnd-poly-drag-image',
            '.dnd-poly-drag-image-snapback',
            '.dnd-poly-drag-operation-icon',
            '[class*="dnd-poly-drag-image"]',
            '[class*="dnd-poly-drag-operation"]'
        ].join(',');

        function clearTouchDragArtifacts() {
            const state = touchDragState;
            touchDragState = null;
            if (state && state.source) state.source.classList.remove('touch-dragging');
            document.querySelectorAll('.touch-dragging').forEach(el => el.classList.remove('touch-dragging'));
            document.querySelectorAll(dragArtifactSelector).forEach(el => el.remove());
            document.body.classList.remove('dnd-poly-dragging');
        }

	    function buildDropEvent(payload) {
	        return {
	            preventDefault() {},
	            dataTransfer: {
	                getData(key) {
	                    if (key === 'type') return payload.type || '';
	                    if (key === 'text') return payload.text || '';
	                    if (key === 'val') return payload.val || '';
	                    if (key === 'idx') return payload.idx || '';
	                    return '';
	                }
	            }
	        };
	    }

	    function getTouchPayload(source) {
	        const type = source.dataset.dragType;
	        if (!type) return null;
	        return {
	            type,
	            text: source.dataset.dragText || source.innerText || '',
	            val: source.dataset.dragVal || source.innerText || '',
	            idx: source.dataset.dragIdx || ''
	        };
	    }

	    function moveDragGhost(state, x, y) {
	        state.ghost.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
	    }

	    function activateTouchDrag(state, event) {
	        state.active = true;
	        state.source.classList.add('touch-dragging');
	        state.ghost = document.createElement('div');
	        state.ghost.className = 'drag-ghost';
	        state.ghost.textContent = state.payload.text || state.payload.val;
	        document.body.appendChild(state.ghost);
	        moveDragGhost(state, event.clientX, event.clientY);
	    }

	    function finishTouchDrag(event) {
	        const state = touchDragState;
	        if (!state) return;
	        touchDragState = null;

	        if (state.active) {
	            event.preventDefault();
	            const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.drop-zone, .drop-zone-pro');
	            if (target && typeof target.ondrop === 'function') {
	                target.ondrop(buildDropEvent(state.payload));
	            }
	        }

	        state.source.classList.remove('touch-dragging');
	        if (state.ghost) state.ghost.remove();
            requestAnimationFrame(clearTouchDragArtifacts);
	    }

        function getTrackedTouch(event, state) {
            const changed = Array.from(event.changedTouches || []);
            const active = Array.from(event.touches || []);
            return changed.find(touch => touch.identifier === state.pointerId)
                || active.find(touch => touch.identifier === state.pointerId)
                || changed[0]
                || active[0]
                || null;
        }

	    function initTouchDragSupport() {
	        document.addEventListener('pointerdown', event => {
	            if (event.pointerType === 'mouse') return;
	            const source = event.target.closest('[data-drag-type]');
	            if (!source) return;
	            const payload = getTouchPayload(source);
	            if (!payload) return;
	            touchDragState = {
	                source,
	                payload,
	                pointerId: event.pointerId,
	                startX: event.clientX,
	                startY: event.clientY,
	                active: false,
	                ghost: null
	            };
	        }, { passive: true });

	        document.addEventListener('pointermove', event => {
	            const state = touchDragState;
	            if (!state || state.pointerId !== event.pointerId) return;
	            const distance = Math.hypot(event.clientX - state.startX, event.clientY - state.startY);
	            if (!state.active && distance > 8) activateTouchDrag(state, event);
	            if (state.active) {
	                event.preventDefault();
	                moveDragGhost(state, event.clientX, event.clientY);
	            }
	        }, { passive: false });

	        document.addEventListener('pointerup', finishTouchDrag, { passive: false });
	        document.addEventListener('pointercancel', finishTouchDrag, { passive: false });
            document.addEventListener('dragend', clearTouchDragArtifacts);
            document.addEventListener('drop', () => requestAnimationFrame(clearTouchDragArtifacts));
            window.addEventListener('blur', clearTouchDragArtifacts);
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) clearTouchDragArtifacts();
            });

            if (!window.PointerEvent) {
                document.addEventListener('touchstart', event => {
                    const source = event.target.closest('[data-drag-type]');
                    if (!source) return;
                    const payload = getTouchPayload(source);
                    const touch = event.changedTouches && event.changedTouches[0];
                    if (!payload || !touch) return;
                    touchDragState = {
                        source,
                        payload,
                        pointerId: touch.identifier,
                        startX: touch.clientX,
                        startY: touch.clientY,
                        active: false,
                        ghost: null
                    };
                }, { passive: true });

                document.addEventListener('touchmove', event => {
                    const state = touchDragState;
                    if (!state) return;
                    const touch = getTrackedTouch(event, state);
                    if (!touch) return;
                    const distance = Math.hypot(touch.clientX - state.startX, touch.clientY - state.startY);
                    if (!state.active && distance > 8) activateTouchDrag(state, touch);
                    if (state.active) {
                        event.preventDefault();
                        moveDragGhost(state, touch.clientX, touch.clientY);
                    }
                }, { passive: false });

                const finishTouchEvent = event => {
                    const state = touchDragState;
                    if (!state) return;
                    const touch = getTrackedTouch(event, state);
                    finishTouchDrag({
                        clientX: touch ? touch.clientX : state.startX,
                        clientY: touch ? touch.clientY : state.startY,
                        preventDefault() {
                            if (event.cancelable) event.preventDefault();
                        }
                    });
                };

                document.addEventListener('touchend', finishTouchEvent, { passive: false });
                document.addEventListener('touchcancel', finishTouchEvent, { passive: false });
            }
	    }

	    initTouchDragSupport();
