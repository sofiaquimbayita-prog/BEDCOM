from django.contrib.auth.models import User
from app.backends import EmailBackend

# Verificar usuario
try:
    admin = User.objects.get(username='admin')
    print(f"Usuario: {admin.username}")
    print(f"Email: {admin.email}")
    print(f"Es activo: {admin.is_active}")
    print(f"Es staff: {admin.is_staff}")
except User.DoesNotExist:
    print("ERROR: Usuario admin no existe")
    import sys
    sys.exit(1)

# Probar autenticación
backend = EmailBackend()
user = backend.authenticate(request=None, username='admin@bedcom.com', password='admin123')
if user:
    print("✓ Autenticación con email: EXITOSA")
else:
    print("✗ Autenticación con email: FALLIDA")

# Probar con username
user2 = backend.authenticate(request=None, username='admin', password='admin123')
if user2:
    print("✓ Autenticación con username: EXITOSA")
else:
    print("✗ Autenticación con username: FALLIDA")
