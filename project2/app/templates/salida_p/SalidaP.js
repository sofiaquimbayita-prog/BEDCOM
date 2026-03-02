document.addEventListener('DOMContentLoaded', () => {
    
    // --- ELEMENTOS DE LA BARRA SUPERIOR ---
    const perfilBtn = document.getElementById('perfilBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const notiBtn = document.getElementById('noti');
    const notiMenu = document.getElementById('noti-menu');
    const accesibilidadBtn = document.getElementById('btn-accesibilidad');
    const menuAccesibilidad = document.getElementById('menu-accesibilidad');

    // --- FORMULARIO DE SALIDA ---
    const formSalida = document.getElementById('formSalida');

    // --- FUNCIONES DE LOS MENÚS (Dropdowns) ---
    
    // Cerrar todos los menús
    function cerrarMenus() {
        dropdownMenu.classList.add('oculto');
        notiMenu.classList.add('oculto');
        menuAccesibilidad.classList.add('oculto');
    }

    // Toggle Perfil
    perfilBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const estaOculto = dropdownMenu.classList.contains('oculto');
        cerrarMenus();
        if (estaOculto) dropdownMenu.classList.remove('oculto');
    });

    // Toggle Notificaciones
    notiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const estaOculto = notiMenu.classList.contains('oculto');
        cerrarMenus();
        if (estaOculto) notiMenu.classList.remove('oculto');
    });

    // Toggle Accesibilidad
    accesibilidadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const estaOculto = menuAccesibilidad.style.display === 'none' || menuAccesibilidad.style.display === '';
        cerrarMenus();
        if (estaOculto) {
            menuAccesibilidad.style.display = 'block';
        } else {
            menuAccesibilidad.style.display = 'none';
        }
    });

    // Cerrar menús al hacer click fuera
    document.addEventListener('click', () => {
        cerrarMenus();
        // Reset estilo display para accesibilidad
        menuAccesibilidad.style.display = 'none';
    });

    // --- MANEJO DEL FORMULARIO DE SALIDA ---
    
    formSalida.addEventListener('submit', (e) => {
        e.preventDefault(); // Evita que la página se recargue

        // Capturar los valores
        const formData = new FormData(formSalida);
        const datosSalida = {
            producto: formData.get('producto'),
            cantidad: formData.get('cantidad'),
            fecha: formData.get('fecha'),
            motivo: formData.get('motivo'),
            responsable: formData.get('responsable')
        };

        // --- AQUÍ VA TU LÓGICA DE BACKEND ---
        console.log('Datos a registrar:', datosSalida);
        alert('Salida de producto registrada con éxito (ver consola)');
        
        // Opcional: Limpiar el formulario
        formSalida.reset();
    });
});