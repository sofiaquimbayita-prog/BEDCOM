from django.urls import reverse_lazy
from django.contrib.auth.views import LoginView, LogoutView as DjangoLogoutView
from django.http import HttpResponseRedirect
from django.contrib.auth import logout as auth_logout

class LoginFormView(LoginView):
    template_name = 'login.html'
    redirect_authenticated_user = True
    success_url = reverse_lazy('menu')

class CustomLogoutView(DjangoLogoutView):
    next_page = reverse_lazy('login:login')
    
    def dispatch(self, request, *args, **kwargs):
        # Handle GET requests by calling logout directly
        if request.method == 'GET':
            auth_logout(request)
            # Use the next_page attribute (resolve it if it's a lazy string)
            next_page = self.next_page
            if callable(next_page):
                next_page = next_page()
            return HttpResponseRedirect(next_page)
        
        return super(DjangoLogoutView, self).dispatch(request, *args, **kwargs)

