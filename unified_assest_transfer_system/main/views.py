from django.shortcuts import render

# Create your views here.

from django.views.generic import TemplateView

class CfeView(TemplateView):
    template_name = 'main/cfe.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['message'] = 'Welcome to the Unified Asset Transfer System!'
        return context  
