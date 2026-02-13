from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpRequest, JsonResponse
from datetime import date
from .models import producto, categoria, reporte, usuario, insumo, calendario


from .calendario import (
    calendario_view,
    eventos_data_view,
    obtener_evento_view,
    crear_evento_view,
    editar_evento_view,
    eliminar_evento_view,
    cambiar_estado_evento_view,
)