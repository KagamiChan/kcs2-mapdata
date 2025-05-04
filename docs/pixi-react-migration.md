# PixiJS and React Migration Documentation

## Current Issues
1. Import issues:
   - ~~`@inlet/react-pixi` needs to be replaced with `@pixi/react`~~ ✅ Fixed
   - ~~`pixi.js` imports need to be updated (DisplayObject and interaction are no longer available)~~ ✅ Fixed
   - ~~TextureLoader.get() expects string but receives number~~ ✅ Fixed

2. Type issues:
   - ~~TextStyle options have changed (strokeThickness is no longer available)~~ ✅ Fixed
   - ~~Interaction types need to be updated~~ ✅ Fixed

## Current Versions
- pixi.js: 8.9.2
- @pixi/react: 8.0.1 (latest version)
- React: 19.1.0

## Migration Plan

### Breaking Changes
1. Package name change from `@inlet/react-pixi` to `@pixi/react`
2. Component registration using `extend` function
3. Component prefixing with `pixi` (e.g., `<pixiContainer>`, `<pixiSprite>`, etc.)
4. Event handler names follow React naming convention (e.g., `onPointerDown` instead of `pointerdown`)
5. TextStyle changes to match PixiJS v8 API

### Implementation Steps
1. Update package.json dependencies:
   - Remove `@inlet/react-pixi`
   - Add `@pixi/react@9.0.1`
   - Update `pixi.js` to version 8.x

2. Code changes:
   - Import components from `@pixi/react` instead of `@inlet/react-pixi`
   - Register PixiJS components using the `extend` function
   - Update component names to use `pixi` prefix
   - Update event handler names to follow React naming convention
   - Update TextStyle usage to match PixiJS v8 API

### Testing Plan
1. Visual regression testing:
   - Compare rendered output before and after migration
   - Check for any visual artifacts or positioning issues
   - Verify text rendering and styles
   - Verify sprite rendering and positioning

2. Interaction testing:
   - Verify all interactive elements work as expected
   - Test drag and drop functionality
   - Test click/tap events
   - Test hover states

### Progress Tracking

#### Completed
- [x] Update package.json dependencies
- [x] Update imports in preview.tsx
- [x] Register components using extend function
- [x] Update component names with pixi prefix
- [x] Update event handler names to React convention

#### In Progress
- [ ] Update TextStyle usage
- [ ] Test interactive features
- [ ] Visual regression testing

#### To Do
- [ ] Update remaining files using PixiJS components
- [ ] Document any additional breaking changes discovered during migration
- [ ] Create test cases for new component usage
- [ ] Performance testing and optimization

### Notes
- The `extend` function from `@pixi/react` is required to register PixiJS components for use in JSX
- Event handler names now follow React naming convention (e.g., `onPointerDown`, `onPointerUp`, etc.)
- Components from PixiJS need to be imported and registered using `extend` before they can be used
- All PixiJS components in JSX should use the `pixi` prefix (e.g., `<pixiContainer>`, `<pixiSprite>`, etc.)

## Progress Tracking

### May 4, 2024
- Created migration documentation
- Identified current issues and versions
- Outlined migration plan and testing strategy
- Fixed all type and import issues in preview.tsx
- Updated TextureLoader.get() calls to use string parameters
- Updated TextStyle options to use new stroke API

## Notes
- Keep this document updated with any changes made during the migration process
- Document any issues encountered and their solutions
- Track performance improvements or regressions
