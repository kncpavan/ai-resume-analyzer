# TODO: Convert TypeScript to JavaScript

## Step 1: Update package.json
- [ ] Remove TypeScript dependencies (typescript, @types/*, vite-tsconfig-paths)
- [ ] Add jsconfig.json for IDE support

## Step 2: Convert config files
- [ ] Create jsconfig.json (replacing tsconfig.json)
- [ ] Convert vite.config.ts to vite.config.js
- [ ] Convert react-router.config.ts to react-router.config.js

## Step 3: Create shared types file
- [ ] Create app/types.js with all type definitions using JSDoc

## Step 4: Convert lib files
- [ ] Convert app/lib/pdf2img.ts to pdf2img.js
- [ ] Convert app/lib/puter.ts to puter.js
- [ ] Convert app/lib/utils.ts to utils.js

## Step 5: Convert component files
- [ ] Convert app/components/*.tsx to *.jsx

## Step 6: Convert route files
- [ ] Convert app/routes/*.tsx to *.jsx

## Step 7: Convert root and route files
- [ ] Convert app/root.tsx to root.jsx
- [ ] Convert app/routes.ts to routes.js

## Step 8: Delete TypeScript files
- [ ] Delete tsconfig.json
- [ ] Delete types/*.d.ts files

## Step 9: Test the application
- [ ] Run npm install
- [ ] Run build and verify it works
