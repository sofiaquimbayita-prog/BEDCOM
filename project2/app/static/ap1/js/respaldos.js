$(document).ready(function() {

    console.log('Respaldos JS activo');

    // ================= SUBIDA DE ARCHIVO SQL =================

    $('#archivo-respaldo').on('change', function() {
        
        const archivo = this.files[0];

        if (!archivo) return;

        // Validar extensión .sql
        if (!archivo.name.endsWith('.sql')) {
            alert('Por favor selecciona un archivo .sql válido');
            $(this).val('');
            return;
        }

        // Crear FormData
        const formData = new FormData();
        formData.append('archivo', archivo);

        // Enviar al backend (AJAX)
        fetch('/vistas/restaurar-datos/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': getCSRFToken()
            }
        })
        .then(response => {
            return response.json().then(data => {
                if (!response.ok) {
                    throw new Error(data.mensaje || 'Error en la solicitud');
                }
                return data;
            });
        })
        .then(data => {
            alert(data.mensaje || 'Restauración exitosa');
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message || 'Error al restaurar la base de datos');
        });

    });

    // ================= OBTENER CSRF TOKEN =================
    function getCSRFToken() {
        let cookieValue = null;
        const name = 'csrftoken';
        
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }

        return cookieValue;
    }

});