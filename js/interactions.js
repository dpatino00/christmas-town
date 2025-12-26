/**
 * Space Cabin Christmas - Interactions
 * Lightweight vanilla JS for click interactions and state management
 */

(function () {
    'use strict';

    // ========================================
    // Utility Functions
    // ========================================
    
    function injectStyles(styleId, cssText) {
        if (!document.querySelector(`#${styleId}`)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = cssText;
            document.head.appendChild(style);
        }
    }

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
        giftsRevealed: 0, // New: track how many gifts have appeared
        snowmanWaved: false,
        snowmanTransformed: false, // Track if snowman has been transformed to image
        secretFound: false,
        discoveries: 0,
        snowIntensity: 'medium', // light, medium, heavy
        catAdopted: false // Track if cat has been adopted from gift
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
        giftsContainer: document.getElementById('gifts-container'),
        snowman: document.getElementById('snowman'),
        secretSpot: document.getElementById('secret-spot'),
        secretReveal: document.getElementById('secret-reveal')
    };

    // ========================================
    // Snow System
    // ========================================
    const snowflakes = ['❄', '❅', '❆', '•'];
    let snowflakeElements = [];

    const snowIntensityConfig = {
        light: { baseDuration: 15, initialCount: 20, maxSnowflakes: 25, interval: 500 },
        medium: { baseDuration: 10, initialCount: 30, maxSnowflakes: 40, interval: 500 },
        heavy: { baseDuration: 6, initialCount: 50, maxSnowflakes: 60, interval: 200 }
    };

    function getSnowConfig() {
        return snowIntensityConfig[state.snowIntensity] || snowIntensityConfig.medium;
    }

    function createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
        snowflake.style.left = Math.random() * 100 + 'vw';
        snowflake.style.fontSize = (Math.random() * 0.8 + 0.5) + 'em';
        snowflake.style.opacity = Math.random() * 0.5 + 0.3;

        const config = getSnowConfig();
        const duration = config.baseDuration + Math.random() * 5;
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
        const config = getSnowConfig();
        
        // Create initial batch
        for (let i = 0; i < config.initialCount; i++) {
            setTimeout(() => createSnowflake(), Math.random() * 3000);
        }

        // Continuously add snowflakes
        setInterval(() => {
            const config = getSnowConfig();
            if (snowflakeElements.length < config.maxSnowflakes) {
                createSnowflake();
            }
        }, config.interval);
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
    function toggleWindow(windowElement, stateKey, stateBeforeKey) {
        state[stateKey] = !state[stateKey];
        windowElement.classList.toggle('lit', state[stateKey]);

        if (state[stateKey] && !state[stateBeforeKey]) {
            state[stateBeforeKey] = true;
            incrementDiscoveries();
        }

        updateSmoke();
        saveState();
    }

    function toggleMainWindow() {
        toggleWindow(elements.windowMain, 'windowLit', 'windowLitBefore');
    }

    function toggleSideWindow() {
        toggleWindow(elements.windowSide, 'sideWindowLit', 'sideWindowLitBefore');
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
    // Enhanced Gift System (Progressive Reveals)
    // ========================================
    const giftReveals = [
        { emoji: '💝', className: 'heart', message: 'You always wanted a little friend to keep us company...', special: 'cat' },
        { emoji: '⭐', className: 'star', message: 'You\'re my star!' },
        { emoji: '✨', className: 'sparkle', message: 'You make life sparkle!' },
        { emoji: '🌟', className: 'star', message: 'Shining bright together!' },
        { emoji: '💎', className: 'sparkle', message: 'You\'re precious to me!' }
    ];

    function revealNextGift() {
        const nextGiftIndex = state.giftsRevealed || 0;
        if (nextGiftIndex < 5) {
            const giftElement = document.getElementById(`gift-${nextGiftIndex + 1}`);
            if (giftElement && giftElement.style.opacity === '0') {
                giftElement.classList.add('gift-revealing');
                giftElement.style.opacity = '1';
                state.giftsRevealed = nextGiftIndex + 1;
                saveState();
            }
        }
    }

    function openGift(giftId) {
        const giftIndex = parseInt(giftId.split('-')[1]) - 1;
        const gift = document.getElementById(giftId);

        if (!state.giftsOpened.includes(giftId)) {
            state.giftsOpened.push(giftId);
            const reveal = giftReveals[giftIndex];

            gift.classList.add('opened');
            gift.classList.add(`gift-opened-${reveal.className}`);

            // Show message briefly
            showGiftMessage(reveal.message);

            // Handle special gift effects
            if (reveal.special === 'cat' && !state.catAdopted) {
                setTimeout(() => {
                    summonCat();
                }, 1500);
            }

            incrementDiscoveries();
            saveState();
        } else {
            // Already opened - show message again and animate
            const reveal = giftReveals[giftIndex];
            showGiftMessage(reveal.message);

            // If it's the cat gift and cat exists, make it do something cute
            if (reveal.special === 'cat' && state.catAdopted) {
                makeKittyCute();
            }

            gift.style.animation = 'none';
            gift.offsetHeight;
            gift.style.animation = 'unwrap 0.3s ease';
        }
    }

    function showGiftMessage(message) {
        // Create temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = 'gift-message';
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 30%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 170, 68, 0.9);
            color: #1a1510;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 16px;
            font-weight: bold;
            z-index: 150;
            animation: message-fade 2s ease forwards;
            pointer-events: none;
        `;

        // Add keyframes for message animation
        injectStyles('gift-message-styles', `
            @keyframes message-fade {
                0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
                20% { opacity: 1; transform: translateX(-50%) translateY(0); }
                80% { opacity: 1; transform: translateX(-50%) translateY(0); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
            }
        `);

        document.body.appendChild(messageEl);

        // Remove after animation
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 2000);
    }

    function restoreGifts() {
        // Show revealed gifts
        for (let i = 1; i <= (state.giftsRevealed || 0); i++) {
            const gift = document.getElementById(`gift-${i}`);
            if (gift) {
                gift.style.opacity = '1';
            }
        }

        // Update opened gifts
        state.giftsOpened.forEach(giftId => {
            const giftIndex = parseInt(giftId.split('-')[1]) - 1;
            const gift = document.getElementById(giftId);
            if (gift) {
                const reveal = giftReveals[giftIndex];
                // Keep original gift emoji - don't change appearance
                // gift.textContent = reveal.emoji;
                gift.classList.add('opened');
            }
        });

        // Restore cat if adopted
        if (state.catAdopted) {
            createCatShadows();
        }
    }

    // ========================================
    // Cat Gift System
    // ========================================
    function summonCat() {
        showGiftMessage("Meet your new furry friend! 🐱");

        // Create cat element
        const cat = document.createElement('div');
        cat.id = 'adopted-cat';
        cat.className = 'cat-sprite';
        cat.innerHTML = '🐱';
        cat.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: -50px;
            font-size: 24px;
            z-index: 90;
            animation: cat-run-to-house 3s ease-in-out forwards;
        `;

        document.querySelector('.layer--foreground').appendChild(cat);

        // Add CSS animation for cat running to house
        injectStyles('cat-animations', `
            @keyframes cat-run-to-house {
                0% { right: -50px; }
                70% { right: 280px; }
                100% { right: 280px; opacity: 0; }
            }
            @keyframes cat-shadow-walk {
                0% { 
                    left: 10%; 
                    transform: translateY(0px) scaleX(1);
                }
                8% { 
                    left: 15%; 
                    transform: translateY(-1px) scaleX(1);
                }
                15% { 
                    left: 25%; 
                    transform: translateY(0px) scaleX(1);
                }
                20% {
                    left: 30%;
                    transform: translateY(-0.5px) scaleX(1);
                }
                30% {
                    left: 40%;
                    transform: translateY(0px) scaleX(1);
                }
                35% {
                    left: 42%;
                    transform: translateY(0px) scaleX(1);
                }
                45% { 
                    left: 50%; 
                    transform: translateY(-1px) scaleX(1);
                }
                50% {
                    left: 52%;
                    transform: translateY(0px) scaleX(1);
                }
                55% {
                    left: 55%;
                    transform: translateY(0px) scaleX(-1);
                }
                65% {
                    left: 50%;
                    transform: translateY(-0.5px) scaleX(-1);
                }
                75% { 
                    left: 35%; 
                    transform: translateY(0px) scaleX(-1);
                }
                85% {
                    left: 20%;
                    transform: translateY(-1px) scaleX(-1);
                }
                95% { 
                    left: 12%; 
                    transform: translateY(0px) scaleX(-1);
                }
                100% { 
                    left: 10%; 
                    transform: translateY(0px) scaleX(1);
                }
            }
            @keyframes tail-sway {
                0% { transform: rotate(-20deg); }
                50% { transform: rotate(-5deg); }
                100% { transform: rotate(-20deg); }
            }
            @keyframes cat-shadow-sit {
                0%, 80% { 
                    transform: scaleX(1) scaleY(1);
                    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
                }
                90% { 
                    transform: scaleX(0.9) scaleY(1.3);
                    border-radius: 50% 50% 50% 50% / 70% 70% 30% 30%;
                }
                100% { 
                    transform: scaleX(1) scaleY(1);
                    border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
                }
            }
        `);

        // After cat runs to house, show it went inside
        setTimeout(() => {
            cat.remove();
            showGiftMessage("Your cat found a cozy spot inside! Look for its shadow moving around 🏠");
            state.catAdopted = true;
            saveState();
            createCatShadows();
        }, 3000);
    }

    function createCatShadows() {
        // Remove existing shadows
        document.querySelectorAll('.cat-shadow').forEach(el => el.remove());

        // Add shadow to main window
        const mainWindow = document.querySelector('.cabin__window--main');

        if (mainWindow) {
            // Main cat body
            const catShadow = document.createElement('div');
            catShadow.className = 'cat-shadow';
            catShadow.style.cssText = `
                position: absolute;
                bottom: 15px;
                left: 20%;
                width: 35px;
                height: 16px;
                background: rgba(0, 0, 0, 0.5);
                border-radius: 50% 80% 80% 50% / 70% 70% 30% 30%;
                animation: cat-shadow-walk 12s ease-in-out infinite;
                opacity: 0.7;
            `;

            // Cat head (overlapping with body)
            const catHead = document.createElement('div');
            catHead.style.cssText = `
                position: absolute;
                top: -1px;
                right: -5px;
                width: 14px;
                height: 14px;
                background: rgba(0, 0, 0, 0.5);
                border-radius: 60% 40% 40% 60%;
            `;

            // Cat ears
            const leftEar = document.createElement('div');
            leftEar.style.cssText = `
                position: absolute;
                top: -2px;
                left: 2px;
                width: 3px;
                height: 4px;
                background: rgba(0, 0, 0, 0.5);
                border-radius: 50% 0 50% 0;
                transform: rotate(-20deg);
            `;

            const rightEar = document.createElement('div');
            rightEar.style.cssText = `
                position: absolute;
                top: -2px;
                right: 2px;
                width: 3px;
                height: 4px;
                background: rgba(0, 0, 0, 0.5);
                border-radius: 0 50% 0 50%;
                transform: rotate(20deg);
            `;

            // Cat tail (properly attached to body)
            const catTail = document.createElement('div');
            catTail.style.cssText = `
                position: absolute;
                top: 2px;
                left: -8px;
                width: 12px;
                height: 4px;
                background: rgba(0, 0, 0, 0.4);
                border-radius: 0 50% 50% 0;
                transform: rotate(-20deg);
                transform-origin: right center;
                animation: tail-sway 3s ease-in-out infinite;
            `;

            // Tail tip for more realism
            const tailTip = document.createElement('div');
            tailTip.style.cssText = `
                position: absolute;
                top: -1px;
                left: -6px;
                width: 8px;
                height: 3px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 0 60% 60% 0;
                transform: rotate(-10deg);
            `;

            catHead.appendChild(leftEar);
            catHead.appendChild(rightEar);
            catShadow.appendChild(catHead);
            catShadow.appendChild(catTail);
            catTail.appendChild(tailTip);
            mainWindow.appendChild(catShadow);

            // Occasionally show cat sitting by window
            setInterval(() => {
                if (Math.random() > 0.7) {
                    catShadow.style.animation = 'cat-shadow-sit 2s ease-in-out';
                    setTimeout(() => {
                        catShadow.style.animation = 'cat-shadow-walk 8s ease-in-out infinite';
                    }, 2000);
                }
            }, 10000);
        }
    }

    function makeKittyCute() {
        const shadows = document.querySelectorAll('.cat-shadow');
        shadows.forEach(shadow => {
            shadow.style.animation = 'cat-shadow-sit 1s ease-in-out 3';
        });
        showGiftMessage("Your kitty says hello! 🐱💕");
    }

    // ========================================
    // Snowman Interaction
    // ========================================
    function waveToSnowman() {
        if (!state.snowmanTransformed) {
            // First click - transform to image
            const snowmanImg = document.createElement('img');
            snowmanImg.src = './assets/asnow.png';
            snowmanImg.alt = 'Snowman';
            snowmanImg.className = 'snowman-image';
            elements.snowman.appendChild(snowmanImg);

            setTimeout(() => {
                elements.snowman.classList.add('transformed');
            }, 50);

            state.snowmanTransformed = true;
            if (!state.snowmanWaved) {
                state.snowmanWaved = true;
                incrementDiscoveries();
            }
            saveState();
        } else {
            // Subsequent clicks - wave animation
            elements.snowman.classList.add('waving');
            setTimeout(() => elements.snowman.classList.remove('waving'), 500);
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

        // Reveal gifts based on discoveries
        const giftsToReveal = Math.min(Math.floor(state.discoveries / 2), 5);
        if (giftsToReveal > (state.giftsRevealed || 0)) {
            setTimeout(() => revealNextGift(), 500);
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

        // Snowman
        if (state.snowmanTransformed) {
            const snowmanImg = document.createElement('img');
            snowmanImg.src = './assets/asnow.png';
            snowmanImg.alt = 'Snowman';
            snowmanImg.className = 'snowman-image';
            elements.snowman.appendChild(snowmanImg);
            elements.snowman.classList.add('transformed');
        }

        // Snow intensity
        elements.scene.classList.add('snow-' + state.snowIntensity);

        // Warmth & counter
        updateWarmth();
        updateCounter();
    }

    // ========================================
    // Event Listeners
    // ========================================
    function addInteractionListeners(element, callback) {
        if (!element) return;
        
        element.addEventListener('click', callback);
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                callback();
            }
        });
    }

    function initEventListeners() {
        // Windows
        addInteractionListeners(elements.windowMain, toggleMainWindow);
        addInteractionListeners(elements.windowSide, toggleSideWindow);

        // Door
        addInteractionListeners(elements.door, knockDoor);

        // String lights
        addInteractionListeners(elements.stringLights, cycleLights);

        // Tree
        addInteractionListeners(elements.tree, decorateTree);

        // Gifts (now 5 gifts)
        for (let i = 1; i <= 5; i++) {
            const gift = document.getElementById(`gift-${i}`);
            gift?.addEventListener('click', () => openGift(`gift-${i}`));
        }

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
