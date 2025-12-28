# Copilot Instructions for Christmas Town

## Project Overview

This is an interactive Christmas-themed web application called "Space Cabin Christmas" - a festive, interactive scene featuring a cozy cabin in a winter wonderland with various clickable elements and progressive reveals.

## Technology Stack

- **HTML5**: Semantic markup with ARIA labels for accessibility
- **CSS3**: Custom properties (CSS variables) for theming, animations, and responsive design
- **Vanilla JavaScript**: ES6+ with IIFE pattern for encapsulation
- **htmx**: For dynamic content loading (v1.9.10)
- **No build tools**: Pure front-end application, no compilation required

## Code Style and Conventions

### JavaScript
- Use strict mode (`'use strict'`)
- Use IIFE (Immediately Invoked Function Expression) pattern for encapsulation
- Use ES6+ features (const, let, arrow functions, template literals)
- Follow camelCase for variables and functions
- Use UPPERCASE_WITH_UNDERSCORES for constants
- Use descriptive variable names (e.g., `STATE_KEY`, `defaultState`, `SNOWMAN_IMAGE_PATH`)
- Add JSDoc-style comments for major sections and complex functions

### CSS
- Use CSS custom properties (CSS variables) defined in `:root` for theming
- Follow BEM-like naming convention for classes (e.g., `cabin__window`, `cabin__window--main`)
- Organize styles by component/layer (sky, horizon, cabin, foreground, etc.)
- Use meaningful class names that describe purpose (e.g., `layer--sky`, `object--gift`)
- Group related styles with section comments (e.g., `/* ======================================== */`)

### HTML
- Use semantic HTML5 elements
- Include ARIA attributes for accessibility (`role`, `tabindex`, `aria-label`, `aria-live`)
- Use descriptive IDs for interactive elements
- Follow consistent indentation (4 spaces)
- Add comments for major sections of the layout

## File Organization

```
/
├── index.html           # Main HTML structure
├── css/
│   └── style.css       # All styles in a single file
├── js/
│   └── interactions.js # All JavaScript interactions and state management
├── fragments/
│   └── secret-message.html # htmx fragment for secret reveal
└── assets/
    └── *.png           # Image assets (e.g., asnow.png)
```

## Key Features and Patterns

### State Management
- Uses localStorage for persistence with key `'christmas-cabin-state'`
- State includes: window lights, tree decorations, gifts, discoveries, snow intensity
- State is saved after each interaction
- Default state is defined in `defaultState` object

### Interactive Elements
All interactive elements should:
- Have appropriate `role` attributes for accessibility
- Include `tabindex="0"` for keyboard navigation
- Have descriptive `aria-label` attributes
- Use event listeners (not inline handlers except for htmx-loaded content)

### Progressive Reveals
- Gifts appear progressively based on interaction count
- Boston skyline reveals at higher warmth levels
- Snowman can transform from emoji to image on wave
- Secret message revealed via htmx

### Animation and Visual Effects
- CSS animations for snowflakes, lights, and transitions
- Warmth meter tracks interaction progress
- CSS custom property `--warmth` controlled by JS for dynamic theming

## Working with This Codebase

### Testing Changes
- Open `index.html` in a browser (supports live server or direct file:// protocol)
- Test all interactive elements: windows, doors, tree, gifts, snowman, lights
- Verify localStorage persistence by refreshing the page
- Test keyboard navigation with Tab and Enter keys
- Clear localStorage with browser DevTools if needed to reset state

### Adding New Interactive Elements
1. Add HTML structure with appropriate ARIA attributes
2. Define CSS styles using existing conventions and CSS variables
3. Add event listeners in `interactions.js`
4. Update state management if persistence is needed
5. Test interaction and state persistence

### Modifying Styles
- Update CSS variables in `:root` for global theme changes
- Follow existing layer system (sky, horizon, cabin, foreground, overlay)
- Use existing animation patterns for consistency
- Test with different warmth levels

### Code Quality
- Keep JavaScript functions focused and single-purpose
- Use utility functions for repeated operations
- Maintain consistent naming conventions across HTML, CSS, and JS
- Avoid inline styles in HTML (use CSS classes)
- Minimize dependencies (keep it lightweight)

## Common Tasks

### Adding a new interaction:
1. Add element to `index.html` with proper ID and ARIA attributes
2. Style the element in `css/style.css` using BEM-like naming
3. Add event listener in `js/interactions.js`
4. Update `defaultState` if state tracking is needed
5. Call `saveState()` after interaction

### Modifying warmth progression:
1. Update `updateWarmth()` function in `interactions.js`
2. Adjust CSS transitions tied to `--warmth` variable
3. Test all warmth levels (0 to 1 scale)

### Adding new animations:
1. Define keyframes in CSS
2. Use CSS custom properties for timing consistency
3. Apply animation classes via JavaScript when needed
4. Consider performance and reduce motion preferences

## Accessibility Guidelines

- Always include ARIA labels for interactive elements
- Ensure keyboard navigation works (`tabindex`, proper focus management)
- Use semantic HTML elements
- Provide visual feedback for interactions
- Test with screen readers when making significant changes

## Performance Considerations

- Minimize DOM manipulation (batch updates when possible)
- Use CSS transforms for animations (better performance)
- Debounce or throttle frequent events if added
- Keep asset sizes small (optimize images)
- No external dependencies except htmx (keep bundle size minimal)

## Refactoring Patterns (Applied in 2025 Cleanup)

### DRY Principles
- Extract common DOM creation logic into reusable functions
- Use parameterized functions for variations (e.g., `createCatEar(side)`)
- Consolidate duplicate animation keyframes using CSS variables

### CSS Variables for Variation
- Use CSS custom properties within animations for customization
- Example: `--float-distance`, `--reveal-scale`, `--light-index`
- Enables single animation definition with multiple visual variants

### Calculation-based Patterns
- Use CSS `calc()` for mathematical positioning/timing patterns
- Example: `left: calc(5% + var(--light-index) * 10%)`
- Example: `animation-delay: calc(var(--light-index) * 0.15s)`
- Reduces repetitive declarations and improves scalability

### Code Organization
- Keep related logic together (e.g., aurora creation in one function)
- Use helper functions for repeated element creation patterns
- Document refactoring decisions in DESIGN_DOC.md
