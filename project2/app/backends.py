from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

User = get_user_model()

class EmailBackend(ModelBackend):
    """
    Backend de autenticación que permite login con email en lugar de username.
    Acepta tanto 'email' como 'username' (ambos van al mismo campo en el formulario).
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            # Intenta con email primero
            user = User.objects.get(email=username)
        except User.DoesNotExist:
            try:
                # Si no encuentra por email, intenta con username (para compatibilidad)
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
