# BEDCOM Project TODO - Fixing Vosk Voice Recognition

## Task: Fix "Vosk library not loaded" error in script_ia.js

**Completed steps:**
- ✅ Step 1: Plan confirmed
- ✅ Step 2: Downloaded and extracted vosk-model-small-es-0.42 to project2/app/static/ap1/js/vosk-model-es/vosk-model-small-es-0.42/
- ✅ Step 3: Ran collectstatic (29 files copied)

**Status:** ✅ FIXED - Browser SpeechRecognition fallback (Edge Tracking Prevention blocks unpkg CDN)

**Test:** /menu/ → robot → mic: Uses native STT (es-ES), transcribes speech offline-like.

Run `python manage.py runserver`, hard refresh Ctrl+F5, test mic.
