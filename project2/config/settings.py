import os
from pathlib import Path

# --------------------------------------------------------------------------
# 1. CONFIGURACIÓN DE RUTAS
# --------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# --------------------------------------------------------------------------
# 2. SEGURIDAD (MODO PRODUCCIÓN)
# --------------------------------------------------------------------------
SECRET_KEY = 'django-insecure-e9je!_k_o@3bt)xz5@km&er@)#@01^w=o&hg_i(^mox(gqor+g'

# IMPORTANTE: DEBUG = False protege tu código de ojos curiosos
DEBUG = True 

# Dominios permitidos para acceder al servidor
ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'testserver']

# --------------------------------------------------------------------------
# 3. DEFINICIÓN DE APLICACIONES
# --------------------------------------------------------------------------
INSTALLED_APPS = [
    'login',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    'app',
    
    'axes',
    
    'usuarios',
    'widget_tweaks',
]
AUTH_USER_MODEL = 'app.usuario'  # Uncomment after migrations if needed

# --------------------------------------------------------------------------
# 4. MIDDLEWARE (EL ORDEN ES CRÍTICO AQUÍ)
# --------------------------------------------------------------------------
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Para servir CSS/JS en DEBUG=False
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    
    # Middlewares personalizados
    'app.middleware.AuthenticationRedirectMiddleware',
    'axes.middleware.AxesMiddleware',  # Vigilante de fuerza bruta
]

ROOT_URLCONF = 'config.urls'

# --------------------------------------------------------------------------
# 5. MOTOR DE PLANTILLAS
# --------------------------------------------------------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'app.context_processors.usuario_context',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# --------------------------------------------------------------------------
# 6. BASE DE DATOS
# --------------------------------------------------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# --------------------------------------------------------------------------
# 7. AUTENTICACIÓN Y BLOQUEO
# --------------------------------------------------------------------------
AUTHENTICATION_BACKENDS = [
    'axes.backends.AxesBackend',                 # Verifica bloqueos antes que nada
    'app.backends.EmailBackend',                # Login por Email
    'django.contrib.auth.backends.ModelBackend', # Login por Username (respaldo)
]

# Configuración de Django-Axes
AXES_FAILURE_LIMIT = 3               # Intentos permitidos
AXES_COOLOFF_TIME = 0.5             # Horas que dura el bloqueo
AXES_RESET_ON_SUCCESS = True         # Limpia fallos si el usuario entra bien

# --------------------------------------------------------------------------
# 8. ARCHIVOS ESTÁTICOS (CSS, JS, IMÁGENES)
# --------------------------------------------------------------------------
STATIC_URL = 'static/'

# Carpeta donde están tus archivos originales
STATICFILES_DIRS = [
    BASE_DIR / 'app' / 'static',
]

# Carpeta donde WhiteNoise servirá los archivos en producción
STATIC_ROOT = BASE_DIR / 'staticfiles' 

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.StaticFilesStorage", 
    },
}

# --------------------------------------------------------------------------
# 9. OTROS (MEDIA, EMAIL, URLS)
# --------------------------------------------------------------------------
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Configuración para enviar correos reales
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'porprobar221@gmail.com'
EMAIL_HOST_PASSWORD = 'fitnkymdfulxiceg'  
DEFAULT_FROM_EMAIL = 'Sistema BEDCOM <porprobar221@gmail.com>'

# Redirecciones
LOGIN_REDIRECT_URL = 'menu'  
LOGOUT_REDIRECT_URL = 'login'
LOGIN_URL = 'login:login'


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# --------------------------------------------------------------------------
# 10. LOCALIZACIÓN
# --------------------------------------------------------------------------
LANGUAGE_CODE = 'es-co'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

git 