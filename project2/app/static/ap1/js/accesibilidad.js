document.addEventListener('DOMContentLoaded', () => {
    // 1. Configuración y Estado Base
    const ACC_STORAGE_KEY = 'bedcom_accessibility_prefs';
    
    const defaultState = {
        textSize: 'normal', // 'normal', 'lg', 'xl'
        highContrast: false,
        lightMode: false,
        highlightLinks: false,
        spacingLg: false,
        dyslexia: false,
        reduceMotion: false,
        speechEnabled: false
    };

    let state = { ...defaultState };

    // 2. Elementos del DOM (Panel y Botón)
    const btnOpenPanel = document.getElementById('acc-widget-btn');
    const panel = document.getElementById('acc-panel');
    const btnClosePanel = document.getElementById('acc-close-btn');
    const btnReset = document.getElementById('acc-reset-btn');

    // 3. Controles del DOM (Switches y Botones)
    const controls = {
        textSizeNormal: document.getElementById('acc-text-normal'),
        textSizeLg: document.getElementById('acc-text-lg'),
        textSizeXl: document.getElementById('acc-text-xl'),
        highContrast: document.getElementById('acc-high-contrast'),
        lightMode: document.getElementById('acc-light-mode'),
        highlightLinks: document.getElementById('acc-highlight-links'),
        spacingLg: document.getElementById('acc-spacing-lg'),
        dyslexia: document.getElementById('acc-dyslexia'),
        reduceMotion: document.getElementById('acc-reduce-motion'),
        speechEnabled: document.getElementById('acc-speech-enabled')
    };

    // 4. Lógica Principal: Inicializar y Aplicar
    function init() {
        try {
            const saved = localStorage.getItem(ACC_STORAGE_KEY);
            if (saved) {
                state = { ...defaultState, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Accesibilidad: No se pudo leer localStorage', e);
        }

        applyStateToDOM();
        updateUI();
        attachEvents();
    }

    function saveState() {
        try {
            localStorage.setItem(ACC_STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Accesibilidad: No se pudo guardar en localStorage', e);
        }
    }

    function applyStateToDOM() {
        const docHtml = document.documentElement;
        const docBody = document.body;

        if (!docBody) return; // Asegurar que el body exista

        // Tamaño de texto (en html)
        docHtml.classList.remove('acc-text-lg', 'acc-text-xl');
        if (state.textSize === 'lg') docHtml.classList.add('acc-text-lg');
        if (state.textSize === 'xl') docHtml.classList.add('acc-text-xl');

        // Clases booleanas en body
        docBody.classList.toggle('acc-high-contrast', state.highContrast);
        docBody.classList.toggle('acc-light-mode', state.lightMode);
        docBody.classList.toggle('acc-highlight-links', state.highlightLinks);
        docBody.classList.toggle('acc-spacing-lg', state.spacingLg);
        docBody.classList.toggle('acc-dyslexia', state.dyslexia);
        docBody.classList.toggle('acc-reduce-motion', state.reduceMotion);

        // Control de TTS
        toggleTTSListeners(state.speechEnabled);
    }

    function updateUI() {
        // Ignorar si el panel no se ha renderizado en el DOM actual
        if (!controls.highContrast) return;

        controls.highContrast.checked = state.highContrast;
        controls.lightMode.checked = state.lightMode;
        controls.highlightLinks.checked = state.highlightLinks;
        controls.spacingLg.checked = state.spacingLg;
        controls.dyslexia.checked = state.dyslexia;
        controls.reduceMotion.checked = state.reduceMotion;
        controls.speechEnabled.checked = state.speechEnabled;

        controls.textSizeNormal.classList.toggle('active', state.textSize === 'normal');
        controls.textSizeLg.classList.toggle('active', state.textSize === 'lg');
        controls.textSizeXl.classList.toggle('active', state.textSize === 'xl');
    }

    function attachEvents() {
        if (!btnOpenPanel) return; // Si no hay botón, no hacer nada

        // Abrir/Cerrar panel
        btnOpenPanel.addEventListener('click', () => panel.classList.toggle('show'));
        btnClosePanel.addEventListener('click', () => panel.classList.remove('show'));

        // Cerrar panel al hacer click afuera
        document.addEventListener('click', (e) => {
            if (panel.classList.contains('show') && !panel.contains(e.target) && !btnOpenPanel.contains(e.target)) {
                panel.classList.remove('show');
            }
        });

        // Eventos de Text Size
        controls.textSizeNormal.addEventListener('click', () => { state.textSize = 'normal'; processChange(); });
        controls.textSizeLg.addEventListener('click', () => { state.textSize = 'lg'; processChange(); });
        controls.textSizeXl.addEventListener('click', () => { state.textSize = 'xl'; processChange(); });

        // Mutuamente excluyentes: Alto contraste y Modo Claro
        controls.highContrast.addEventListener('change', (e) => {
            state.highContrast = e.target.checked;
            if (state.highContrast) state.lightMode = false;
            processChange();
        });

        controls.lightMode.addEventListener('change', (e) => {
            state.lightMode = e.target.checked;
            if (state.lightMode) state.highContrast = false;
            processChange();
        });

        // Otros switches
        const switchMap = {
            'highlightLinks': controls.highlightLinks,
            'spacingLg': controls.spacingLg,
            'dyslexia': controls.dyslexia,
            'reduceMotion': controls.reduceMotion,
            'speechEnabled': controls.speechEnabled
        };

        for (const [key, element] of Object.entries(switchMap)) {
            element.addEventListener('change', (e) => {
                state[key] = e.target.checked;
                processChange();
            });
        }

        // Reset
        btnReset.addEventListener('click', () => {
            state = { ...defaultState };
            processChange();
        });
    }

    function processChange() {
        saveState();
        applyStateToDOM();
        updateUI();
    }

    // ==========================================
    // EXTRA: Lector de Texto (SpeechSynthesis)
    // ==========================================
    let ttsUtterance = null;

    function handleSelectionSpeech() {
        const text = window.getSelection().toString().trim();
        if (text && text.length > 2) {
            window.speechSynthesis.cancel();
            ttsUtterance = new SpeechSynthesisUtterance(text);
            ttsUtterance.lang = 'es-ES';
            window.speechSynthesis.speak(ttsUtterance);
        }
    }

    function toggleTTSListeners(enable) {
        if (!('speechSynthesis' in window)) return;
        
        if (enable) {
            document.addEventListener('mouseup', handleSelectionSpeech);
        } else {
            document.removeEventListener('mouseup', handleSelectionSpeech);
            window.speechSynthesis.cancel();
        }
    }

    // Inicializar todo
    init();
});
