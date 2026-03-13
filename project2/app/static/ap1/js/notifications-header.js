// notifications-header.js - Gestión global header notificaciones
// Polling count, badge, dropdown preview 5 recent, mark read click

$(document).ready(function() {
    let pollInterval;
    
    function initHeaderNotifications() {
        updateNotifCount();
        pollInterval = setInterval(updateNotifCount, 30000); // 30s
        
        $('#noti').on('click', function(e) {
            e.stopPropagation();
            toggleNotifDropdown();
        });
        
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.notif-wrapper').length) {
                $('#noti-menu').addClass('oculto');
            }
        });
        
        // Mark read on dropdown li click
        $(document).on('click', '.notif-dropdown-item', function() {
            const id = $(this).data('id');
            markNotifRead(id, $(this));
        });
    }
    
    function updateNotifCount() {
        $.get('/app/notificaciones/count/')
            .done(function(data) {
                const count = data.no_leidas || 0;
                const badge = $('#notif-badge-count');
                badge.text(count > 99 ? '99+' : count).toggleClass('empty', count === 0);
            })
            .fail(function() {
                console.log('Error fetching notif count');
            });
    }
    
    function toggleNotifDropdown() {
        const dropdown = $('#notif-menu');
        if (dropdown.hasClass('oculto')) {
            loadRecentNotifications();
            dropdown.removeClass('oculto');
        } else {
            dropdown.addClass('oculto');
        }
    }
    
    function loadRecentNotifications() {
        $('#notif-loading').show();
        $('#notif-empty, #notif-view-all').hide();
        $('#notif-dropdown-list').children('.notif-dropdown-item').remove();
        
        $.get('/app/notificaciones/recent/')
            .done(function(data) {
                $('#notif-loading').hide();
                const recent = data.recent || [];
                if (recent.length === 0) {
                    $('#notif-empty').show();
                } else {
                    recent.forEach(function(notif) {
                        const li = $(`
                            <li class="notif-dropdown-item ${notif.leida ? 'read' : 'unread'}" data-id="${notif.id}">
                                <strong>${notif.titulo}</strong>
                                <small>${notif.fecha}</small>
                            </li>
                        `);
                        $('#notif-dropdown-list').append(li);
                    });
                    $('#notif-view-all').removeClass('oculto');
                }
            })
            .fail(function() {
                $('#notif-loading').hide();
                $('#notif-empty').text('Error cargando notificaciones').show();
            });
    }
    
    function markNotifRead(id, $li) {
        $.ajax({
            url: `/app/notificaciones/mark-read/${id}/`,
            method: 'POST',
            headers: { 'X-CSRFToken': $('[name=csrfmiddlewaretoken]').val() || getCookie('csrftoken') },
            success: function(data) {
                if (data.success) {
                    $li.removeClass('unread').addClass('read');
                    updateNotifCount();
                }
            }
        });
    }
    
    // Get CSRF cookie
    function getCookie(name) {
        let cookieValue = null;
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
    
    // Cleanup
    $(window).on('beforeunload', function() {
        if (pollInterval) clearInterval(pollInterval);
    });
    
    initHeaderNotifications();
});
