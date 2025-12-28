'use strict';

/* ========================================
   BOOK WRAPPED - MAIN JAVASCRIPT
   Interactive slide progression system
======================================== */

(function () {
    // ======================================== 
    // State Management
    // ======================================== 
    const STATE_KEY = 'book-wrapped-state';

    const defaultState = {
        currentSlide: 0,
        viewedSlides: [0], // Track which slides have been viewed
        hasCompletedOnce: false
    };

    let state = loadState();

    // Total number of slides
    const TOTAL_SLIDES = 6;

    // ======================================== 
    // State Persistence
    // ======================================== 
    function loadState() {
        try {
            const saved = localStorage.getItem(STATE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...defaultState, ...parsed };
            }
        } catch (e) {
            console.error('Error loading state:', e);
        }
        return { ...defaultState };
    }

    function saveState() {
        try {
            localStorage.setItem(STATE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('Error saving state:', e);
        }
    }

    function resetState() {
        state = { ...defaultState };
        saveState();
        location.reload();
    }

    // ======================================== 
    // Slide Navigation
    // ======================================== 
    function showSlide(index) {
        // Bounds checking
        if (index < 0 || index >= TOTAL_SLIDES) return;

        // Update state
        state.currentSlide = index;
        if (!state.viewedSlides.includes(index)) {
            state.viewedSlides.push(index);
        }

        // Mark as completed if reached final slide
        if (index === TOTAL_SLIDES - 1) {
            state.hasCompletedOnce = true;
        }

        saveState();

        // Update DOM
        updateSlideVisibility();
        updateProgressDots();

        // Trigger animations for current slide
        animateCurrentSlide(index);
    }

    function updateSlideVisibility() {
        const slides = document.querySelectorAll('.slide');
        slides.forEach((slide, index) => {
            if (index === state.currentSlide) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
    }

    function updateProgressDots() {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.remove('active', 'viewed');

            if (index === state.currentSlide) {
                dot.classList.add('active');
            } else if (state.viewedSlides.includes(index)) {
                dot.classList.add('viewed');
            }
        });
    }

    function nextSlide() {
        if (state.currentSlide < TOTAL_SLIDES - 1) {
            showSlide(state.currentSlide + 1);
        }
    }

    function prevSlide() {
        if (state.currentSlide > 0) {
            showSlide(state.currentSlide - 1);
        }
    }

    // ======================================== 
    // Slide-Specific Animations
    // ======================================== 
    function animateCurrentSlide(index) {
        const slide = document.querySelector(`.slide[data-slide="${index}"]`);
        if (!slide) return;

        switch (index) {
            case 0:
                animateCounters(slide);
                break;
            case 2:
                animatePeakMonth(slide);
                break;
            // Other slides use CSS animations automatically
        }
    }

    // Animate number counters (Slide 1 & 3)
    function animateCounters(container) {
        const counters = container.querySelectorAll('[data-target]');

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 1500; // 1.5 seconds
            const steps = 60;
            const increment = target / steps;
            let current = 0;
            let step = 0;

            const timer = setInterval(() => {
                step++;
                current = Math.min(Math.floor(increment * step), target);
                counter.textContent = current.toLocaleString();

                if (step >= steps) {
                    clearInterval(timer);
                    counter.textContent = target.toLocaleString();
                    counter.style.animation = 'counter-pulse 0.4s ease';
                }
            }, duration / steps);
        });
    }

    // Animate peak month counter (Slide 3)
    function animatePeakMonth(container) {
        const bigNumber = container.querySelector('.big-number');
        if (bigNumber) {
            const target = parseInt(bigNumber.getAttribute('data-target'));
            const duration = 1200;
            const steps = 40;
            const increment = target / steps;
            let current = 0;
            let step = 0;

            const timer = setInterval(() => {
                step++;
                current = Math.min(Math.floor(increment * step), target);
                bigNumber.textContent = current;

                if (step >= steps) {
                    clearInterval(timer);
                    bigNumber.textContent = target;
                    bigNumber.style.animation = 'counter-pulse 0.5s ease';
                }
            }, duration / steps);
        }
    }

    // ======================================== 
    // Event Listeners
    // ======================================== 
    function initEventListeners() {
        // Navigation zones
        const prevZone = document.querySelector('.nav-zone-prev');
        const nextZone = document.querySelector('.nav-zone-next');

        if (prevZone) {
            prevZone.addEventListener('click', prevSlide);
        }

        if (nextZone) {
            nextZone.addEventListener('click', nextSlide);
        }

        // Progress dots - click to jump to slide
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent nav zone click
                showSlide(index);
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowRight':
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    nextSlide();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    prevSlide();
                    break;
            }
        });

        // Replay button (Slide 6)
        const replayButton = document.getElementById('replayButton');
        if (replayButton) {
            replayButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent nav zone click
                resetState();
            });
        }

        // Touch swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left - next slide
                    nextSlide();
                } else {
                    // Swipe right - previous slide
                    prevSlide();
                }
            }
        }
    }

    // ======================================== 
    // Initialization
    // ======================================== 
    function init() {
        console.log('📚 Book Wrapped initialized');

        // Show current slide
        showSlide(state.currentSlide);

        // Set up event listeners
        initEventListeners();

        // Add subtle floating animation to certain elements
        addAmbientAnimations();
    }

    function addAmbientAnimations() {
        // Add subtle animations to enhance the experience
        // This could be expanded with floating particles, etc.
    }

    // ======================================== 
    // Run on page load
    // ======================================== 
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
