document.addEventListener('DOMContentLoaded', () => {
    const draggableWindows = [
        { elementId: 'brightnessControls', handleSelector: '.controls-header' },
        { elementId: 'infoWindow', handleSelector: '#windowHeader' },
        { elementId: 'lyricsWindow', handleSelector: '#lyricsHeader' },
        { elementId: 'mouseGuide', handleSelector: '.guide-header' },
        { elementId: 'musicPlayer', handleSelector: '#playerHeader' }
    ];

    let highestZIndex = 60;

    const bringToFront = (element) => {
        highestZIndex += 1;
        element.style.zIndex = String(highestZIndex);
    };

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const shouldIgnoreDragTarget = (target) => Boolean(
        target.closest('button, input, a, textarea, select, label')
    );

    const preparePositionedElement = (element) => {
        const rect = element.getBoundingClientRect();
        element.style.left = `${rect.left}px`;
        element.style.top = `${rect.top}px`;
        element.style.right = 'auto';
        element.style.bottom = 'auto';
        return rect;
    };

    const setupDraggable = (element, handle) => {
        if (!element || !handle) {
            return;
        }

        element.addEventListener('mousedown', () => {
            bringToFront(element);
        });

        handle.addEventListener('mousedown', (event) => {
            if (event.button !== 0 || shouldIgnoreDragTarget(event.target)) {
                return;
            }

            event.preventDefault();
            bringToFront(element);

            const rect = preparePositionedElement(element);
            const startX = event.clientX;
            const startY = event.clientY;

            const onMouseMove = (moveEvent) => {
                const nextLeft = clamp(
                    rect.left + (moveEvent.clientX - startX),
                    0,
                    Math.max(0, window.innerWidth - element.offsetWidth)
                );
                const nextTop = clamp(
                    rect.top + (moveEvent.clientY - startY),
                    0,
                    Math.max(0, window.innerHeight - element.offsetHeight)
                );

                element.style.left = `${nextLeft}px`;
                element.style.top = `${nextTop}px`;
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    };

    const setupResizable = (element) => {
        if (!element) {
            return;
        }

        const handles = element.querySelectorAll('[class*="resize-handle-"]');
        handles.forEach((handle) => {
            const direction = [...handle.classList]
                .find((className) => className.startsWith('resize-handle-'))
                ?.replace('resize-handle-', '');

            if (!direction) {
                return;
            }

            handle.addEventListener('mousedown', (event) => {
                if (event.button !== 0) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();
                bringToFront(element);

                const rect = preparePositionedElement(element);
                const startX = event.clientX;
                const startY = event.clientY;
                const minWidth = Math.max(parseFloat(getComputedStyle(element).minWidth) || 240, 180);
                const minHeight = Math.max(parseFloat(getComputedStyle(element).minHeight) || 120, 80);

                const onMouseMove = (moveEvent) => {
                    const deltaX = moveEvent.clientX - startX;
                    const deltaY = moveEvent.clientY - startY;

                    let nextLeft = rect.left;
                    let nextTop = rect.top;
                    let nextWidth = rect.width;
                    let nextHeight = rect.height;

                    if (direction.includes('e')) {
                        nextWidth = clamp(rect.width + deltaX, minWidth, window.innerWidth - rect.left);
                    }

                    if (direction.includes('s')) {
                        nextHeight = clamp(rect.height + deltaY, minHeight, window.innerHeight - rect.top);
                    }

                    if (direction.includes('w')) {
                        nextLeft = clamp(rect.left + deltaX, 0, rect.left + rect.width - minWidth);
                        nextWidth = rect.width - (nextLeft - rect.left);
                    }

                    if (direction.includes('n')) {
                        nextTop = clamp(rect.top + deltaY, 0, rect.top + rect.height - minHeight);
                        nextHeight = rect.height - (nextTop - rect.top);
                    }

                    element.style.left = `${nextLeft}px`;
                    element.style.top = `${nextTop}px`;
                    element.style.width = `${nextWidth}px`;
                    element.style.height = `${nextHeight}px`;
                };

                const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                };

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });
        });
    };

    draggableWindows.forEach(({ elementId, handleSelector }) => {
        const element = document.getElementById(elementId);
        const handle = element?.querySelector(handleSelector) || document.querySelector(handleSelector);
        setupDraggable(element, handle);
    });

    document.querySelectorAll('.resizable').forEach((element) => {
        setupResizable(element);
    });
});
