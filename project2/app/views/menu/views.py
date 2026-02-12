from django.views.generic import TemplateView
class MenuView(TemplateView):
    template_name = 'menu/menu.html'
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['titulo_pagina'] = 'MENÚ PRINCIPAL'
        return context