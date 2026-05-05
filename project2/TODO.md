# TODO: Fix Speech Recognition Network Error

## Plan Breakdown (Approved)
1. [ ] Read and analyze script_ia.js completely (already done)
2. [ ] Create detailed edit plan with exact diff blocks
3. [x] Apply multiple edit_file calls to script_ia.js (minor duplicate line fixed):\n   - Add retry logic to recognition config and onerror\n   - Add pre-start checks (HTTPS, permissions, online)\n   - Improve UI feedback and fallbacks\n   - Add retry counter and disable after max retries
4. [x] Execute `python manage.py collectstatic` to update staticfiles
5. [x] Test: Run speech recognition, simulate network error, verify retry/fallback
6. [ ] attempt_completion with demo command

Current progress: Starting step 3 - Preparing edits...
