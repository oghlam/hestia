# TESTING INSTRUCTIONS

**IMPORTANT: Run these on Windows, NOT on Linux WSL**

## Steps to Test

1. Open PowerShell/Command Prompt
2. Navigate to project:
   ```
   cd C:\laragon\www\hestia
   ```

3. Clean install dependencies:
   ```
   rmdir /s /q node_modules
   del package-lock.json
   npm install
   ```

4. Run TypeScript type check:
   ```
   npm run build
   ```
   This will show ANY type errors from TypeScript compiler

5. Run dev server:
   ```
   npm run dev
   ```
   Open http://localhost:5173 in browser

6. Check browser console for ANY errors
   - If errors appear, note the exact error message and line number
   - Do NOT assume it works if console shows errors

7. Test all tabs:
   - Overview
   - Rooms
   - People
   - Events
   - Care Team
   - Automation
   - Settings

8. Report findings:
   - Which tabs work?
   - Which tabs break?
   - What are exact error messages?

## DO NOT SKIP THIS
- This is the ONLY way to know if code actually works
- Console errors must be FIXED, not ignored
- Must test on Windows (where native bindings match)

