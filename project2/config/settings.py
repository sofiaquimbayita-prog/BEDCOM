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

# IMPORTANTE: DEBUG = True para desarrollo. Cámbialo a False en producción.
DEBUG = True 

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
    'ia',
    'widget_tweaks',
]

AUTH_USER_MODEL = 'app.usuario' 

# --------------------------------------------------------------------------
# 4. MIDDLEWARE (EL ORDEN ES CRÍTICO AQUÍ)
# --------------------------------------------------------------------------
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    
    # Middlewares personalizados
    'app.middleware.AuthenticationRedirectMiddleware',
    'axes.middleware.AxesMiddleware',
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
# 6. BASE DE DATOS (MYSQL - BEDCOM)
# --------------------------------------------------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'bedcom',
        'USER': 'root',
        'PASSWORD': '123456789',
        'HOST': 'localhost',
        'PORT': '3306',
    }
}

# --------------------------------------------------------------------------
# 7. AUTENTICACIÓN Y BLOQUEO
# --------------------------------------------------------------------------
AUTHENTICATION_BACKENDS = [
    'axes.backends.AxesBackend',
    'app.backends.EmailBackend',
    'django.contrib.auth.backends.ModelBackend',
]

AXES_FAILURE_LIMIT = 3
AXES_COOLOFF_TIME = 0.5
AXES_RESET_ON_SUCCESS = True

# --------------------------------------------------------------------------
# 8. ARCHIVOS ESTÁTICOS (CSS, JS, IMÁGENES)
# --------------------------------------------------------------------------
STATIC_URL = 'static/'
STATICFILES_DIRS = [
    BASE_DIR / 'app' / 'static',
]
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

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'porprobar221@gmail.com'
EMAIL_HOST_PASSWORD = 'fitnkymdfulxiceg' 
DEFAULT_FROM_EMAIL = 'Sistema BEDCOM <porprobar221@gmail.com>'

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

# --------------------------------------------------------------------------
# 11. CONFIGURACIÓN LUNA IA (PIPER - VOZ DE DANIELA)
# --------------------------------------------------------------------------
# Basado en tu estructura: media/piper/
PIPER_BASE_DIR = MEDIA_ROOT / 'piper'

PIPER_CONFIG = {
    'EXE': PIPER_BASE_DIR / 'piper.exe',
    'MODEL': PIPER_BASE_DIR / 'es_AR-daniela-high.onnx',
}

# Carpeta para guardar audios generados temporalmente
LUNA_VOICES_DIR = MEDIA_ROOT / 'luna_voces'