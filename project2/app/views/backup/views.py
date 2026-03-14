from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin

class RespaldosListView(LoginRequiredMixin, TemplateView):
    template_name = 'respaldos/respaldos.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Respaldos'
        context['subtitle'] = 'Gestión de Respaldos del Sistema'
        context['titulo_pagina'] = 'RESPALDOS'
        return context

