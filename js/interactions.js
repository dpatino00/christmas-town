/**
 * Space Cabin Christmas - Interactions
 * Lightweight vanilla JS for click interactions and state management
 */

(function () {
    'use strict';

    // ========================================
    // Utility Functions
    // ========================================

    // Configuration constants
    const SNOWMAN_IMAGE_PATH = './assets/asnow.png';

    function injectStyles(styleId, cssText) {
        if (!document.querySelector(`#${styleId}`)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = cssText;
            document.head.appendChild(style);
        }
    }

    function createStyledElement(tag, className, cssText) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (cssText) element.style.cssText = cssText;
        return element;
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
        catAdopted: false, // Track if cat has been adopted from gift
        northernLightsActive: false // Track if Northern Lights are active
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
        { emoji: '⭐', className: 'star', message: 'You\'re my star!', special: 'constellation' },
        { emoji: '📮', className: 'postcards', message: 'Postcards from our adventures...', special: 'postcards' },
        { emoji: '🌟', className: 'star', message: 'A quiet moment under the stars.', special: 'northernLights' },
        { emoji: '💎', className: 'sparkle', message: 'You\'re precious to me!' }
    ];

    // Capricorn constellation data (based on actual star coordinates)
    const CAPRICORN_CONSTELLATION = {
        points: [
            { x: 15, y: 10 },  // Alpha² Capricorni (α² Cap) - RA 20h 18m, Dec -12° 30′
            { x: 17, y: 14 },  // Beta Capricorni (β Cap) - RA 20h 21m, Dec -14° 47′  
            { x: 47, y: 13 },  // Theta Capricorni (θ Cap) - RA 21h 06m, Dec -14° 17′
            { x: 62, y: 29 },  // Zeta Capricorni (ζ Cap) - RA 21h 27m, Dec -22° 25′
            { x: 71, y: 18 },  // Gamma Capricorni (γ Cap) - RA 21h 40m, Dec -16° 49′
            { x: 75, y: 17 },  // Delta Capricorni (δ Cap) - RA 21h 47m, Dec -16° 08′
            { x: 49, y: 35 }   // Omega Capricorni (ω Cap) - RA 21h 08m, Dec -25° 28′
        ],
        edges: [
            [0, 1], [1, 2], [2, 4], [4, 5], // Top curved line: α²→β→θ→γ→δ
            [1, 6], [6, 3], [3, 4]  // Bottom triangle: β→ω→ζ→γ
        ],
        glyph: { x: 45, y: 5, text: '♑' }
    };

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
        const reveal = giftReveals[giftIndex];

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
            } else if (reveal.special === 'constellation') {
                setTimeout(() => {
                    triggerCapricornConstellation();
                }, 800);
            } else if (reveal.special === 'postcards') {
                setTimeout(() => {
                    loadPostcards();
                }, 600);
            } else if (reveal.special === 'northernLights' && !state.northernLightsActive) {
                setTimeout(() => {
                    triggerNorthernLights();
                }, 800);
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
            } else if (reveal.special === 'constellation') {
                setTimeout(() => {
                    triggerCapricornConstellation();
                }, 400);
            } else if (reveal.special === 'postcards') {
                loadPostcards();
            } else if (reveal.special === 'northernLights' && state.northernLightsActive) {
                pulseNorthernLights();
            }

            gift.style.animation = 'none';
            gift.offsetHeight;
            gift.style.animation = 'unwrap 0.3s ease';
        }
    }

    function showGiftMessage(message) {
        // Remove any existing gift messages first
        const existingMessages = document.querySelectorAll('.gift-message');
        existingMessages.forEach(msg => msg.remove());

        // Create temporary message element
        const messageEl = createStyledElement('div', 'gift-message', `
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
        `);
        messageEl.textContent = message;

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
    // Postcards Gift System
    // ========================================
    function loadPostcards() {
        // Fetch and display the postcards fragment
        fetch('./fragments/space-postcards.html')
            .then(response => response.text())
            .then(html => {
                elements.secretReveal.innerHTML = html;
                // Trigger overlay display
                elements.secretReveal.parentElement.style.display = 'flex';

                // Move modal to body for proper centering
                const modal = document.getElementById('postcard-modal');
                if (modal && modal.parentElement !== document.body) {
                    document.body.appendChild(modal);
                }

                // Attach click handlers to location cards
                setTimeout(() => {
                    const locationCards = document.querySelectorAll('.location-card');
                    const enlargedContainer = document.getElementById('postcard-enlarged');

                    locationCards.forEach(card => {
                        card.addEventListener('click', function (e) {
                            e.stopPropagation();

                            const location = this.dataset.location;

                            // Get the postcard template for this location
                            const template = document.querySelector(`[data-template="${location}"]`);
                            if (template) {
                                // Clone the postcard back
                                const clone = template.cloneNode(true);

                                // Clear and add clone to modal
                                enlargedContainer.innerHTML = '';
                                enlargedContainer.appendChild(clone);

                                // Show modal
                                modal.style.display = 'flex';
                            }
                        });
                    });

                    // Close modal when clicking backdrop
                    const backdrop = document.querySelector('.postcard-modal-backdrop');
                    if (backdrop) {
                        backdrop.addEventListener('click', function () {
                            modal.style.display = 'none';
                        });
                    }

                    // Add global close function
                    window.closePostcardsCollection = function () {
                        // Remove modal from DOM
                        const modal = document.getElementById('postcard-modal');
                        if (modal) {
                            modal.remove();
                        }
                        // Then remove the collection
                        const collection = document.querySelector('.space-postcards');
                        if (collection) {
                            htmx.remove(collection);
                        }
                        // Also hide overlay
                        if (elements.secretReveal && elements.secretReveal.parentElement) {
                            elements.secretReveal.parentElement.style.display = 'none';
                        }
                    };
                }, 100);
            })
            .catch(error => {
                console.error('Error loading postcards:', error);
                // Fallback message
                showGiftMessage('Check your mailbox for postcards from our adventures! 📮');
            });
    }

    // ========================================
    // Constellation Gift System
    // ========================================
    function triggerCapricornConstellation() {
        // Remove any existing constellation
        const existing = document.getElementById('capricorn-constellation');
        if (existing) {
            existing.remove();
        }

        // Create constellation container
        const constellationContainer = createStyledElement('div', 'constellation-container', `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 60%;
            pointer-events: none;
            z-index: 15;
        `);
        constellationContainer.id = 'capricorn-constellation';

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 100 60');
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        svg.style.cssText = `
            width: 100%;
            height: 100%;
            overflow: visible;
        `;

        // Add stars (points)
        CAPRICORN_CONSTELLATION.points.forEach((point, index) => {
            const star = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            star.setAttribute('cx', point.x);
            star.setAttribute('cy', point.y);
            star.setAttribute('r', '0.8');
            star.setAttribute('fill', '#fff');
            star.setAttribute('opacity', '0');
            star.classList.add('constellation-star');
            star.style.animationDelay = (index * 0.15) + 's';
            svg.appendChild(star);
        });

        // Add constellation lines
        CAPRICORN_CONSTELLATION.edges.forEach((edge, index) => {
            const [startIdx, endIdx] = edge;
            const start = CAPRICORN_CONSTELLATION.points[startIdx];
            const end = CAPRICORN_CONSTELLATION.points[endIdx];

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', start.x);
            line.setAttribute('y1', start.y);
            line.setAttribute('x2', end.x);
            line.setAttribute('y2', end.y);
            line.setAttribute('stroke', 'rgba(255, 255, 255, 0.6)');
            line.setAttribute('stroke-width', '0.3');
            line.setAttribute('opacity', '0');
            line.classList.add('constellation-line');
            line.style.animationDelay = (CAPRICORN_CONSTELLATION.points.length * 0.15 + index * 0.1) + 's';
            svg.appendChild(line);
        });

        // Add Capricorn glyph
        const glyph = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        glyph.setAttribute('x', CAPRICORN_CONSTELLATION.glyph.x);
        glyph.setAttribute('y', CAPRICORN_CONSTELLATION.glyph.y);
        glyph.setAttribute('fill', '#ffaa44');
        glyph.setAttribute('font-size', '4');
        glyph.setAttribute('text-anchor', 'middle');
        glyph.setAttribute('opacity', '0');
        glyph.classList.add('constellation-glyph');
        glyph.textContent = CAPRICORN_CONSTELLATION.glyph.text;
        const glyphDelay = (CAPRICORN_CONSTELLATION.points.length * 0.15 + CAPRICORN_CONSTELLATION.edges.length * 0.1 + 0.3);
        glyph.style.animationDelay = glyphDelay + 's';
        svg.appendChild(glyph);

        constellationContainer.appendChild(svg);

        // Add to sky layer
        const skyLayer = document.querySelector('.layer--sky');
        if (skyLayer) {
            skyLayer.appendChild(constellationContainer);
        } else {
            const overlayLayer = document.querySelector('.layer--overlay');
            if (overlayLayer) {
                overlayLayer.appendChild(constellationContainer);
            }
        }

        // Inject constellation animations
        injectStyles('constellation-animations', `
            @keyframes constellation-star-appear {
                0% { opacity: 0; transform: scale(0.5); }
                50% { opacity: 1; transform: scale(1.2); }
                100% { opacity: 0.8; transform: scale(1); }
            }
            @keyframes constellation-line-draw {
                0% { opacity: 0; }
                100% { opacity: 0.6; }
            }
            @keyframes constellation-glyph-pulse {
                0% { opacity: 0; transform: scale(0.8); }
                30% { opacity: 1; transform: scale(1.3); }
                70% { opacity: 1; transform: scale(1.1); }
                100% { opacity: 0.9; transform: scale(1); }
            }
            .constellation-star {
                animation: constellation-star-appear 0.6s ease-out forwards;
            }
            .constellation-line {
                animation: constellation-line-draw 0.4s ease-out forwards;
            }
            .constellation-glyph {
                animation: constellation-glyph-pulse 1.2s ease-out forwards;
            }
            @keyframes constellation-fade-out {
                0% { opacity: 1; }
                100% { opacity: 0; }
            }
        `);

        // Auto-remove after animation completes
        setTimeout(() => {
            constellationContainer.style.animation = 'constellation-fade-out 1s ease-out forwards';
            setTimeout(() => {
                if (constellationContainer.parentNode) {
                    constellationContainer.remove();
                }
            }, 1000);
        }, 4000);
    }

    // ========================================
    // Cat Gift System
    // ========================================
    function summonCat() {
        showGiftMessage("Meet your new furry friend! 🐱");

        // Create cat element
        const cat = createStyledElement('div', 'cat-sprite', `
            position: absolute;
            bottom: 20px;
            right: -50px;
            font-size: 24px;
            z-index: 90;
            animation: cat-run-to-house 3s ease-in-out forwards;
        `);
        cat.id = 'adopted-cat';
        cat.innerHTML = '🐱';

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

    function createCatEar(side) {
        const isLeft = side === 'left';
        return createStyledElement('div', '', `
            position: absolute;
            top: -2px;
            ${isLeft ? 'left' : 'right'}: 2px;
            width: 3px;
            height: 4px;
            background: rgba(0, 0, 0, 0.5);
            border-radius: ${isLeft ? '50% 0 50% 0' : '0 50% 0 50%'};
            transform: rotate(${isLeft ? '-20deg' : '20deg'});
        `);
    }

    function createCatShadows() {
        // Remove existing shadows
        document.querySelectorAll('.cat-shadow').forEach(el => el.remove());

        // Add shadow to main window
        const mainWindow = document.querySelector('.cabin__window--main');

        if (mainWindow) {
            // Main cat body
            const catShadow = createStyledElement('div', 'cat-shadow', `
                position: absolute;
                bottom: 15px;
                left: 20%;
                width: 35px;
                height: 16px;
                background: rgba(0, 0, 0, 0.5);
                border-radius: 50% 80% 80% 50% / 70% 70% 30% 30%;
                animation: cat-shadow-walk 12s ease-in-out infinite;
                opacity: 0.7;
            `);

            // Cat head (overlapping with body)
            const catHead = createStyledElement('div', '', `
                position: absolute;
                top: -1px;
                right: -5px;
                width: 14px;
                height: 14px;
                background: rgba(0, 0, 0, 0.5);
                border-radius: 60% 40% 40% 60%;
            `);

            // Cat tail (properly attached to body)
            const catTail = createStyledElement('div', '', `
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
            `);

            // Tail tip for more realism
            const tailTip = createStyledElement('div', '', `
                position: absolute;
                top: -1px;
                left: -6px;
                width: 8px;
                height: 3px;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 0 60% 60% 0;
                transform: rotate(-10deg);
            `);

            // Assemble cat shadow
            catHead.appendChild(createCatEar('left'));
            catHead.appendChild(createCatEar('right'));
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
    // Northern Lights System
    // ========================================
    function createAuroraContainer() {
        const auroraContainer = document.createElement('div');
        auroraContainer.id = 'northern-lights';
        auroraContainer.className = 'northern-lights-container';

        // Create 3 overlapping aurora layers for depth and realism
        for (let i = 1; i <= 3; i++) {
            const layer = document.createElement('div');
            layer.className = `aurora-layer aurora-layer-${i}`;
            auroraContainer.appendChild(layer);
        }

        return auroraContainer;
    }

    function triggerNorthernLights() {
        const skyLayer = document.querySelector('.layer--sky');
        if (!skyLayer) return;

        // Check if already exists
        if (document.getElementById('northern-lights')) return;

        skyLayer.appendChild(createAuroraContainer());

        // Activate state
        state.northernLightsActive = true;
        saveState();

        // Add subtle glow to cabin and snow
        elements.scene.classList.add('aurora-glow');

        showGiftMessage("The sky dances with light... 🌌");
    }

    function pulseNorthernLights() {
        const lights = document.getElementById('northern-lights');
        if (lights) {
            lights.style.animation = 'none';
            lights.offsetHeight; // Trigger reflow
            lights.style.animation = '';
            showGiftMessage("The aurora brightens... ✨");
        }
    }

    function restoreNorthernLights() {
        if (state.northernLightsActive) {
            const skyLayer = document.querySelector('.layer--sky');
            if (skyLayer && !document.getElementById('northern-lights')) {
                skyLayer.appendChild(createAuroraContainer());
                elements.scene.classList.add('aurora-glow');
            }
        }
    }

    // ========================================
    // Snowman Interaction
    // ========================================
    function createSnowmanImage() {
        const snowmanImg = document.createElement('img');
        snowmanImg.src = SNOWMAN_IMAGE_PATH;
        snowmanImg.alt = 'Snowman';
        snowmanImg.className = 'snowman-image';
        return snowmanImg;
    }

    function waveToSnowman() {
        if (!state.snowmanTransformed) {
            // First click - transform to image
            const snowmanImg = createSnowmanImage();
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
            const snowmanImg = createSnowmanImage();
            elements.snowman.appendChild(snowmanImg);
            elements.snowman.classList.add('transformed');
        }

        // Snow intensity
        elements.scene.classList.add('snow-' + state.snowIntensity);

        // Northern Lights
        restoreNorthernLights();

        // Warmth & counter
        updateWarmth();
        updateCounter();
    }

    // ========================================
    // Event Listeners
    // ========================================
    function addClickAndKeyListeners(element, callback) {
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
        addClickAndKeyListeners(elements.windowMain, toggleMainWindow);
        addClickAndKeyListeners(elements.windowSide, toggleSideWindow);

        // Door
        addClickAndKeyListeners(elements.door, knockDoor);

        // String lights
        addClickAndKeyListeners(elements.stringLights, cycleLights);

        // Tree
        addClickAndKeyListeners(elements.tree, decorateTree);

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
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
