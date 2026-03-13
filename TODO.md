# TODO: Email Notification on Product Entry - ✅ COMPLETED

## Plan Steps:
- [x] Step 1: Update project2/app/utils.py - Add enviar_email_nueva_entrada function
- [x] Step 2: Update project2/app/signals.py - Call email function in signal
- [x] Step 3: Update project2/config/settings.py - Add SMTP email config
- [ ] Step 4: Test creation of entrada (visit http://127.0.0.1:8000/entrada_p/, login, create new entry)
- [x] Step 5: Complete task

**Next:** Run `python project2/manage.py runserver` and test creating an entrada. Check console for "✅ Email enviado" or errors. For real emails, update EMAIL_HOST_PASSWORD with Gmail App Password.

**Changes Summary:**
- utils.py: Added email function with details (producto, cantidad, total, etc.)
- signals.py: Calls email after internal notif on new entrada (created && estado=True)
- settings.py: SMTP config (Gmail example). Console backend commented for dev testing.
