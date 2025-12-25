/**
 * Space Cabin Christmas - Interactions
 * Lightweight vanilla JS for click interactions and state management
 */

(function () {
    'use strict';

    // ========================================
    // State Management
    // ========================================
    const STATE_KEY = 'christmas-cabin-state';

    const defaultState = {
        windowLit: false,
        sideWindowLit: false,
        lightsMode: 'off', // off, on, chase, warm
        treeDecorations: 0,
        giftsOpened: [],
        snowmanWaved: false,
        secretFound: false,
        discoveries: 0,
        snowIntensity: 'medium' // light, medium, heavy
    };

    let state = loadState();

    function loadState() {
        try {
            const saved = localStorage.getItem(STATE_KEY);
            return saved ? { ...defaultState, ...JSON.parse(saved) } : { ...defaultState };
        } catch (e) {
            return { ...defaultState };
        }
    }

    function saveState() {
        try {
            localStorage.setItem(STATE_KEY, JSON.stringify(state));
        } catch (e) {
            // localStorage not available, continue without persistence
        }
    }

    function incrementDiscoveries() {
        state.discoveries++;
        saveState();
        updateWarmth();
        updateCounter();
    }

    // ========================================
    // DOM Elements
    // ========================================
    const elements = {
        scene: document.getElementById('scene'),
        windowMain: document.getElementById('window-main'),
        windowSide: document.getElementById('window-side'),
        door: document.getElementById('door'),
        stringLights: document.getElementById('string-lights'),
        tree: document.getElementById('space-tree'),
        treeStar: document.getElementById('tree-star'),
        treeOrnaments: document.getElementById('tree-ornaments'),
        smoke: document.getElementById('smoke'),
        snowContainer: document.getElementById('snow-container'),
        snowToggle: document.getElementById('snow-toggle'),
        resetBtn: document.getElementById('reset-btn'),
        warmthFill: document.querySelector('.warmth-meter__fill'),
        counterText: document.getElementById('counter-text'),
        gift1: document.getElementById('gift-1'),
        gift2: document.getElementById('gift-2'),
        snowman: document.getElementById('snowman'),
        secretSpot: document.getElementById('secret-spot'),
        secretReveal: document.getElementById('secret-reveal')
    };

    // ========================================
    // Snow System
    // ========================================
    const snowflakes = ['❄', '❅', '❆', '•'];
    let snowflakeElements = [];

    function createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
        snowflake.style.left = Math.random() * 100 + 'vw';
        snowflake.style.fontSize = (Math.random() * 0.8 + 0.5) + 'em';
        snowflake.style.opacity = Math.random() * 0.5 + 0.3;

        const baseDuration = state.snowIntensity === 'light' ? 15 :
            state.snowIntensity === 'heavy' ? 6 : 10;
        const duration = baseDuration + Math.random() * 5;
        snowflake.style.animationDuration = duration + 's';
        snowflake.style.animationDelay = Math.random() * duration + 's';

        elements.snowContainer.appendChild(snowflake);
        snowflakeElements.push(snowflake);

        // Remove after animation completes
        setTimeout(() => {
            if (snowflake.parentNode) {
                snowflake.parentNode.removeChild(snowflake);
            }
            const index = snowflakeElements.indexOf(snowflake);
            if (index > -1) snowflakeElements.splice(index, 1);
        }, (duration + parseFloat(snowflake.style.animationDelay)) * 1000);
    }

    function initSnow() {
        // Create initial batch
        const count = state.snowIntensity === 'light' ? 20 :
            state.snowIntensity === 'heavy' ? 50 : 30;

        for (let i = 0; i < count; i++) {
            setTimeout(() => createSnowflake(), Math.random() * 3000);
        }

        // Continuously add snowflakes
        setInterval(() => {
            const maxSnowflakes = state.snowIntensity === 'light' ? 25 :
                state.snowIntensity === 'heavy' ? 60 : 40;
            if (snowflakeElements.length < maxSnowflakes) {
                createSnowflake();
            }
        }, state.snowIntensity === 'heavy' ? 200 : 500);
    }

    function cycleSnowIntensity() {
        const intensities = ['light', 'medium', 'heavy'];
        const currentIndex = intensities.indexOf(state.snowIntensity);
        state.snowIntensity = intensities[(currentIndex + 1) % intensities.length];

        elements.scene.classList.remove('snow-light', 'snow-medium', 'snow-heavy');
        elements.scene.classList.add('snow-' + state.snowIntensity);

        saveState();

        // Visual feedback
        elements.snowToggle.style.transform = 'scale(1.2)';
        setTimeout(() => {
            elements.snowToggle.style.transform = '';
        }, 200);
    }

    // ========================================
    // Window Interactions
    // ========================================
    function toggleMainWindow() {
        state.windowLit = !state.windowLit;
        elements.windowMain.classList.toggle('lit', state.windowLit);

        if (state.windowLit && !state.windowLitBefore) {
            state.windowLitBefore = true;
            incrementDiscoveries();
        }

        updateSmoke();
        saveState();
    }

    function toggleSideWindow() {
        state.sideWindowLit = !state.sideWindowLit;
        elements.windowSide.classList.toggle('lit', state.sideWindowLit);

        if (state.sideWindowLit && !state.sideWindowLitBefore) {
            state.sideWindowLitBefore = true;
            incrementDiscoveries();
        }

        updateSmoke();
        saveState();
    }

    function updateSmoke() {
        const anyWindowLit = state.windowLit || state.sideWindowLit;
        elements.smoke.classList.toggle('active', anyWindowLit);
    }

    // ========================================
    // Door Interaction
    // ========================================
    function knockDoor() {
        elements.door.style.transform = 'translateX(-50%) scale(0.98)';
        setTimeout(() => {
            elements.door.style.transform = 'translateX(-50%) scale(1.02)';
            setTimeout(() => {
                elements.door.style.transform = 'translateX(-50%)';
            }, 100);
        }, 100);

        if (!state.doorKnocked) {
            state.doorKnocked = true;
            incrementDiscoveries();
            saveState();
        }
    }

    // ========================================
    // String Lights Interactions
    // ========================================
    const lightModes = ['off', 'on', 'chase', 'warm'];

    function cycleLights() {
        const currentIndex = lightModes.indexOf(state.lightsMode);
        state.lightsMode = lightModes[(currentIndex + 1) % lightModes.length];

        // Remove all mode classes
        elements.stringLights.classList.remove('on', 'chase', 'warm');

        // Add new mode class
        if (state.lightsMode !== 'off') {
            elements.stringLights.classList.add(state.lightsMode);
        }

        if (!state.lightsToggled) {
            state.lightsToggled = true;
            incrementDiscoveries();
        }

        saveState();
    }

    // ========================================
    // Tree Decoration
    // ========================================
    const ornamentEmojis = ['🔴', '🟡', '🔵', '🟢', '🟣', '⚪'];

    function decorateTree() {
        if (state.treeDecorations < 6) {
            state.treeDecorations++;
            addOrnament(state.treeDecorations);

            if (state.treeDecorations === 1) {
                incrementDiscoveries();
            }

            // Light up star when fully decorated
            if (state.treeDecorations >= 6) {
                elements.tree.classList.add('decorated');
                if (!state.treeFullyDecorated) {
                    state.treeFullyDecorated = true;
                    incrementDiscoveries();
                }
            }

            saveState();
        } else {
            // Wiggle animation when already full
            elements.tree.style.animation = 'none';
            elements.tree.offsetHeight; // Trigger reflow
            elements.tree.style.animation = 'wave 0.3s ease';
        }
    }

    function addOrnament(index) {
        const ornament = document.createElement('span');
        ornament.className = `ornament ornament--${index}`;
        ornament.textContent = ornamentEmojis[index - 1];
        elements.treeOrnaments.appendChild(ornament);

        // Animate in
        setTimeout(() => ornament.classList.add('visible'), 50);
    }

    function restoreOrnaments() {
        for (let i = 1; i <= state.treeDecorations; i++) {
            addOrnament(i);
        }
        if (state.treeDecorations >= 6) {
            elements.tree.classList.add('decorated');
        }
    }

    // ========================================
    // Gift Interactions
    // ========================================
    function openGift(giftId) {
        const gift = document.getElementById(giftId);
        if (!state.giftsOpened.includes(giftId)) {
            state.giftsOpened.push(giftId);
            gift.classList.add('opened');

            // Change emoji after opening
            setTimeout(() => {
                gift.textContent = '🎄';
            }, 500);

            incrementDiscoveries();
            saveState();
        } else {
            // Already opened - just wiggle
            gift.style.animation = 'none';
            gift.offsetHeight;
            gift.style.animation = 'unwrap 0.3s ease';
        }
    }

    function restoreGifts() {
        state.giftsOpened.forEach(giftId => {
            const gift = document.getElementById(giftId);
            if (gift) {
                gift.textContent = '🎄';
                gift.classList.add('opened');
            }
        });
    }

    // ========================================
    // Snowman Interaction
    // ========================================
    function waveToSnowman() {
        elements.snowman.classList.add('waving');
        setTimeout(() => elements.snowman.classList.remove('waving'), 500);

        if (!state.snowmanWaved) {
            state.snowmanWaved = true;
            incrementDiscoveries();
            saveState();
        }
    }

    // ========================================
    // Secret Reveal (htmx fallback)
    // ========================================
    function closeSecret() {
        elements.secretReveal.innerHTML = '';
    }

    // Fallback if htmx isn't available
    function showSecretFallback() {
        if (!state.secretFound) {
            state.secretFound = true;
            incrementDiscoveries();
            saveState();
        }

        elements.secretReveal.innerHTML = `
      <h2>✨ You found a secret! ✨</h2>
      <p>In this cozy corner of space, warmth isn't just about heat—it's about the moments we create and the discoveries we make.</p>
      <p>Merry Christmas from this little cabin among the stars! 🌟</p>
      <button onclick="window.closeSecret()">Close</button>
    `;
    }

    // ========================================
    // Warmth & Counter Updates
    // ========================================
    function updateWarmth() {
        const maxDiscoveries = 10;
        const warmthPercent = Math.min((state.discoveries / maxDiscoveries) * 100, 100);

        if (elements.warmthFill) {
            elements.warmthFill.style.height = warmthPercent + '%';
        }

        // Update scene warmth level
        const warmthLevel = Math.floor(state.discoveries / 2.5);
        elements.scene.classList.remove('warm-1', 'warm-2', 'warm-3', 'warm-4');
        if (warmthLevel > 0) {
            elements.scene.classList.add('warm-' + Math.min(warmthLevel, 4));
        }
    }

    function updateCounter() {
        if (elements.counterText) {
            elements.counterText.textContent = `Discoveries: ${state.discoveries}`;
        }
    }

    // ========================================
    // Reset Scene
    // ========================================
    function resetScene() {
        if (confirm('Reset all discoveries and start fresh?')) {
            localStorage.removeItem(STATE_KEY);
            location.reload();
        }
    }

    // ========================================
    // Restore State
    // ========================================
    function restoreState() {
        // Windows
        if (state.windowLit) {
            elements.windowMain.classList.add('lit');
        }
        if (state.sideWindowLit) {
            elements.windowSide.classList.add('lit');
        }
        updateSmoke();

        // Lights
        if (state.lightsMode !== 'off') {
            elements.stringLights.classList.add(state.lightsMode);
        }

        // Tree
        restoreOrnaments();

        // Gifts
        restoreGifts();

        // Snow intensity
        elements.scene.classList.add('snow-' + state.snowIntensity);

        // Warmth & counter
        updateWarmth();
        updateCounter();
    }

    // ========================================
    // Event Listeners
    // ========================================
    function initEventListeners() {
        // Windows
        elements.windowMain?.addEventListener('click', toggleMainWindow);
        elements.windowMain?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') toggleMainWindow();
        });

        elements.windowSide?.addEventListener('click', toggleSideWindow);
        elements.windowSide?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') toggleSideWindow();
        });

        // Door
        elements.door?.addEventListener('click', knockDoor);
        elements.door?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') knockDoor();
        });

        // String lights
        elements.stringLights?.addEventListener('click', cycleLights);
        elements.stringLights?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') cycleLights();
        });

        // Tree
        elements.tree?.addEventListener('click', decorateTree);
        elements.tree?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') decorateTree();
        });

        // Gifts
        elements.gift1?.addEventListener('click', () => openGift('gift-1'));
        elements.gift2?.addEventListener('click', () => openGift('gift-2'));

        // Snowman
        elements.snowman?.addEventListener('click', waveToSnowman);

        // Secret spot (htmx fallback)
        elements.secretSpot?.addEventListener('click', (e) => {
            // Check if htmx will handle it
            if (typeof htmx === 'undefined') {
                e.preventDefault();
                showSecretFallback();
            } else {
                // htmx handles it, but track discovery
                if (!state.secretFound) {
                    state.secretFound = true;
                    incrementDiscoveries();
                    saveState();
                }
            }
        });

        // Controls
        elements.snowToggle?.addEventListener('click', cycleSnowIntensity);
        elements.resetBtn?.addEventListener('click', resetScene);

        // Close secret on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeSecret();
        });
    }

    // ========================================
    // Initialize
    // ========================================
    function init() {
        restoreState();
        initEventListeners();
        initSnow();

        // Expose close function for htmx fragment
        window.closeSecret = closeSecret;

        console.log('🎄 Space Cabin Christmas loaded! Click around to discover...');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
