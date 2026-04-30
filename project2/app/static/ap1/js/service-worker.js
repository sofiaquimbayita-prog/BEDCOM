self.addEventListener('push', function (event) {
    const data = event.data
        ? event.data.json()
        : {
            title: 'BEDCOM',
            body: 'Nueva notificación'
        };

    const options = {
        body: data.body,
        icon: '/static/ap1/img/icono.png',
        badge: '/static/ap1/img/icono.png',
        data: {
            url: data.url || '/vistas/menu/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});