from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.http import HttpRequest
import logging
import json

from app.views.notificaciones.views import api_check_triggers

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Ejecuta check de triggers de notificaciones para todos los usuarios activos, incluyendo auto-resolucion'

    def handle(self, *args, **options):
        User = get_user_model()
        users = User.objects.filter(is_active=True)
        total_created = 0
        total_resolved = 0
        
        self.stdout.write(f'🔍 Verificando triggers de notificaciones para {users.count()} usuarios activos...')

        for user in users:
            # Crear HttpRequest mockeado
            request = HttpRequest()
            request.user = user
            request.method = 'POST'
            
            try:
                # Ejecutar la lógica unificada del backend
                response = api_check_triggers(request)
                if response.status_code == 200:
                    data = json.loads(response.content)
                    nuevas = data.get('nuevas', 0)
                    resueltas = data.get('resueltas', 0)
                    total_created += nuevas
                    total_resolved += resueltas
                    logger.info(f'Usuario {user.username}: {nuevas} creadas, {resueltas} resueltas')
                else:
                    logger.error(f'Error al verificar triggers para {user.username}: status_code={response.status_code}')
            except Exception as e:
                logger.error(f'Excepción al verificar triggers para {user.username}: {str(e)}')
        
        self.stdout.write(
            self.style.SUCCESS(f'✅ Completado: {total_created} nuevas notificaciones creadas y {total_resolved} auto-resueltas para todos los usuarios')
        )
