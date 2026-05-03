# BEDCOM Lockout Timer Task

## Pending Steps
- [ ] 2. Test with `python manage.py runserver` - Trigger lockout (3 failed logins), verify real-time countdown
- [ ] 3. Handle edge cases (e.g., if lockout_until missing, fallback to 30min)

## Completed Steps
- [x] 1. Edit `project2/app/templates/axes/lockout.html` - Added dynamic JS countdown using axes `lockout_until` context + 30min fallback

**Next step: Test the implementation**

