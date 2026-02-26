from django.shortcuts import redirect
from django.contrib import messages
from django.urls import reverse


class AuthenticationRedirectMiddleware:
    """
    Middleware that detects when an unauthenticated user tries to access
    a protected view and adds a message explaining why they were redirected.
    """

    def __init__(self, get_response):
        self.get_response = get_response
        # Paths that should not trigger the message
        self.exempt_paths = [
            '/login/',
            '/logout/',
            '/admin/',
        ]

    def __call__(self, request):
        response = self.get_response(request)
        
        # Check if response is a redirect to login page (302)
        # and user is not authenticated
        if (response.status_code == 302 and 
            not request.user.is_authenticated and
            '/login/' in str(response.url)):
            
            # Check if this is not an exempt path
            if not any(request.path.startswith(path) for path in self.exempt_paths):
                # Add the message only if not already set
                if not messages.get_messages(request):
                    messages.info(
                        request, 
                        'Debe iniciar sesión para acceder a esta página.'
                    )
        
        return response
