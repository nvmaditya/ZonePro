# Lessons Learned - ZonePro Transformation

## Pattern: File-not-read errors in Write/Edit tools
**Problem**: The Write tool requires reading a file before writing to it, even for new files.
**Solution**: Use Bash with cat/heredoc for new file creation, or use subagents which handle this internally.

## Pattern: Linter auto-formatting between Read and Edit
**Problem**: A Prettier/ESLint linter runs on file save, modifying files between when they're read and when the edit is applied, causing "File has been modified since read" errors.
**Solution**: Re-read files immediately before editing, or use subagents that handle read-edit atomically.

## Pattern: TypeScript null checks in closures
**Problem**: After replacing `any` with proper types like `YTPlayer`, TypeScript reports `ref.current` as possibly null inside closures (setInterval/setTimeout callbacks).
**Solution**: Capture the ref value in a local variable before the closure: `const player = ref.current; if (player) { ... }`.

## Pattern: React state setter types for updater functions
**Problem**: Typing `setCourses: (courses: CourseProgress[]) => void` doesn't allow the React updater pattern `setCourses(prev => ...)`.
**Solution**: Type as `(courses: CourseProgress[] | ((prev: CourseProgress[]) => CourseProgress[])) => void` or use `React.Dispatch<React.SetStateAction<T>>`.

## Pattern: pnpm not in PATH on Windows Git Bash
**Problem**: `pnpm` command not found despite being installed.
**Solution**: Use `npx pnpm` as a fallback.

## Pattern: Next.js 16 middleware deprecation
**Problem**: Next.js 16 deprecates the "middleware" file convention in favor of "proxy".
**Note**: The middleware still works but shows a deprecation warning during build. Consider migrating to the proxy pattern in future.

## Pattern: localStorage key migration
**Problem**: Renaming the app requires migrating localStorage data from old key to new key.  
**Solution**: Check for old key on load, copy data to new key, then delete old key. One-time migration.

## Principle: Extract hooks early
**Insight**: A monolithic 540-line page.tsx with all state was hard to reason about. Extracting 5 focused hooks made each concern testable and the main component just ~200 lines of composition.

## Principle: Semantic color tokens for dark mode
**Insight**: Using Tailwind semantic tokens (bg-background, text-foreground, text-muted-foreground, bg-card, bg-muted) instead of hardcoded colors (bg-white, text-gray-900, bg-blue-50) makes dark mode work automatically with the theme system.
