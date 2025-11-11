// === SISTEMA DE MENSAJES MODERNIZADO ===
// Compatible con coordinador.php y mensajes_api.php

// Variables globales
let currentConversationId = null;
let conversations = {};
let unreadMessages = 0;
let isTyping = false;
let typingTimeout = null;
let messagePollingInterval = null;

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', function() {
    loadConversations();
    startMessagePolling();

    // Input de mensaje
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        messageInput.addEventListener('input', handleTyping);
    }

    // Botón nueva conversación
    const newMsgBtn = document.getElementById('newMessageBtn');
    if (newMsgBtn) newMsgBtn.onclick = openNewMessageModal;

    // Búsqueda de conversaciones
    const searchInput = document.getElementById('conversationSearch');
    if (searchInput) searchInput.addEventListener('input', searchConversations);

    // Botón volver (móvil)
    const backBtn = document.querySelector('.back-to-conversations');
    if (backBtn) backBtn.onclick = backToConversations;

    // Búsqueda en modal (instructores)
    const instructorSearch = document.getElementById('instructorSearch');
    if (instructorSearch) {
        instructorSearch.addEventListener('input', function(e) {
            const term = e.target.value.toLowerCase().trim();
            document.querySelectorAll('.instructor-select-item').forEach(item => {
                const name = (item.querySelector('h4')?.textContent || '').toLowerCase();
                const email = (item.querySelector('p')?.textContent || '').toLowerCase();
                item.style.display = (name.includes(term) || email.includes(term)) ? 'flex' : 'none';
            });
        });
    }
});

// === "ESCRIBIENDO..." ===
function handleTyping(e) {
    if (!currentConversationId) return;
    const hasText = e.target.value.trim().length > 0;

    if (hasText && !isTyping) {
        isTyping = true;
        sendTypingStatus(true);
        if (typingTimeout) clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            isTyping = false;
            sendTypingStatus(false);
        }, 2000);
    } else if (!hasText && isTyping) {
        isTyping = false;
        sendTypingStatus(false);
        if (typingTimeout) clearTimeout(typingTimeout);
    }
}

function sendTypingStatus(typing) {
    fetch('mensajes_api.php?accion=set_typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversacion_id: currentConversationId, typing })
    }).catch(() => {});
}

// === CARGAR CONVERSACIONES ===
function loadConversations() {
    fetch('mensajes_api.php?accion=obtener_conversaciones')
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                conversations = {};
                data.conversaciones.forEach(conv => {
                    conversations[conv.conversacion_id] = {
                        id: conv.conversacion_id,
                        name: conv.otro_usuario_nombre,
                        email: conv.otro_usuario_email,
                        unread: conv.mensajes_no_leidos,
                        lastMessageTime: conv.fecha_ultimo_mensaje,
                        lastMessage: conv.ultimo_mensaje || '',
                        isTyping: conv.is_typing || false
                    };
                });
                displayConversations(conversations);
                updateUnreadCount();
            }
        })
        .catch(() => {});
}

// === MOSTRAR CONVERSACIONES ===
function displayConversations(convList) {
    const container = document.getElementById('conversationsList');
    if (!container) return;

    if (Object.keys(convList).length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-secondary);">
            <i class="fas fa-inbox" style="font-size:48px;opacity:0.3;margin-bottom:15px;"></i>
            <p>No tienes conversaciones</p>
        </div>`;
        return;
    }

    container.innerHTML = '';
    const sorted = Object.values(convList).sort((a, b) => 
        new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0)
    );

    sorted.forEach(conv => container.appendChild(createConversationItem(conv)));
}

function createConversationItem(conv) {
    const div = document.createElement('div');
    div.className = `conversation-item ${conv.unread > 0 ? 'unread' : ''} ${currentConversationId === conv.id ? 'active' : ''}`;
    div.onclick = () => openConversation(conv.id);

    const initials = getInitials(conv.name);
    const timeAgo = getTimeAgo(conv.lastMessageTime);
    const isOnline = Math.random() > 0.5;

    const preview = conv.isTyping 
        ? `<span class="typing-indicator"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></span> Escribiendo...`
        : escapeHtml(truncateText(conv.lastMessage || 'Nueva conversación', 50));

    div.innerHTML = `
        <div class="conversation-avatar">
            ${initials}
            <span class="online-status ${isOnline ? '' : 'offline'}"></span>
        </div>
        <div class="conversation-info">
            <div class="conversation-header">
                <h4>${escapeHtml(conv.name)}</h4>
                <span class="conversation-time">${timeAgo}</span>
            </div>
            <div class="conversation-preview">
                <span class="preview-text">${preview}</span>
                ${conv.unread > 0 ? `<span class="unread-badge">${conv.unread}</span>` : ''}
            </div>
        </div>
    `;

    return div;
}

// === ABRIR CONVERSACIÓN ===
function openConversation(conversationId) {
    currentConversationId = conversationId;
    const conv = conversations[conversationId];
    if (!conv) return;

    document.getElementById('chatHeader').style.display = 'flex';
    document.getElementById('chatInputArea').style.display = 'flex';
    document.getElementById('chatInstructorName').textContent = conv.name;
    document.getElementById('chatInstructorSubject').textContent = conv.email || 'Conversación';

    loadMessages(conversationId);
    markAsRead(conversationId);

    if (window.innerWidth <= 768) {
        document.querySelector('.conversations-panel').classList.remove('active');
        document.querySelector('.chat-panel').classList.add('active');
    }

    document.querySelectorAll('.conversation-item').forEach(i => i.classList.remove('active'));
    const activeItem = document.querySelector(`.conversation-item[onclick*="${conversationId}"]`);
    if (activeItem) activeItem.classList.add('active');
}

// === CARGAR MENSAJES ===
function loadMessages(conversationId) {
    fetch(`mensajes_api.php?accion=obtener_mensajes&conversacion_id=${conversationId}`)
        .then(r => r.json())
        .then(data => {
            if (data.success) displayMessages(data.mensajes);
        })
        .catch(() => {});
}

function displayMessages(messages) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    const wasAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
    container.innerHTML = '';

    if (messages.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-secondary);">
            <i class="fas fa-comment-dots" style="font-size:64px;margin-bottom:20px;opacity:0.3;"></i>
            <h3>Sin mensajes aún</h3>
            <p>Envía el primer mensaje</p>
        </div>`;
        return;
    }

    messages.forEach(msg => container.appendChild(createMessageElement(msg)));
    if (wasAtBottom) scrollToBottom();
}

function createMessageElement(msg) {
    const div = document.createElement('div');
    div.className = `message ${msg.es_propio ? 'sent' : 'received'}`;
    div.dataset.messageId = msg.id;

    const time = formatMessageTime(msg.fecha_envio);
    const status = msg.es_propio ? getMessageStatusIcon(msg.leido ? 'read' : 'sent') : '';
    const text = formatMessageText(msg.mensaje);

    div.innerHTML = `
        <div class="message-content">
            <p>${text}</p>
            <span class="message-time">
                ${time}
                ${msg.es_propio && status ? `<span class="message-status ${msg.leido ? 'read' : 'sent'}">${status}</span>` : ''}
            </span>
        </div>
    `;
    return div;
}

// === ENVIAR MENSAJE ===
function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text || !currentConversationId) return;

    input.disabled = true;

    const tempMsg = { id: 'temp_' + Date.now(), mensaje: text, es_propio: true, fecha_envio: new Date().toISOString(), leido: false };
    const container = document.getElementById('chatMessages');
    container.appendChild(createMessageElement(tempMsg));
    input.value = '';
    scrollToBottom();

    fetch('mensajes_api.php?accion=enviar_mensaje', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversacion_id: currentConversationId, mensaje: text })
    })
    .then(r => r.json())
    .then(data => {
        input.disabled = false;
        if (data.success) {
            const msgDiv = container.querySelector(`[data-message-id="temp_${tempMsg.id.split('_')[1]}"]`);
            if (msgDiv) msgDiv.dataset.messageId = data.mensaje_id;
            loadConversations();
        } else {
            showNotification('Error al enviar', 'error');
        }
    })
    .catch(() => {
        input.disabled = false;
        showNotification('Sin conexión', 'error');
    });
}

// === POLLING (solo lista) ===
function startMessagePolling() {
    if (messagePollingInterval) clearInterval(messagePollingInterval);
    messagePollingInterval = setInterval(loadConversations, 5000);
}

// === NUEVA CONVERSACIÓN (MODAL) ===
function openNewMessageModal() {
    const modal = document.getElementById('newMessageModal');
    if (!modal) return;
    modal.style.display = 'block';

    const content = document.getElementById('newMessageModalContent');
    if (content) {
        content.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-secondary);">Cargando instructores...</div>';
    }

    fetch('mensajes_api.php?accion=obtener_instructores')
        .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(data => {
            if (data.success) displayInstructorList(data.instructores);
            else throw new Error(data.error || 'Error');
        })
        .catch(err => {
            console.error(err);
            if (content) content.innerHTML = `<p style="color:#dc3545;text-align:center;">Error: ${err.message}</p>`;
        });
}

function displayInstructorList(instructores) {
    const content = document.getElementById('newMessageModalContent');
    if (!content) return;

    content.innerHTML = '';

    if (!instructores || instructores.length === 0) {
        content.innerHTML = `<p style="text-align:center;color:var(--text-secondary);padding:40px;">No hay instructores</p>`;
        return;
    }

    instructores.forEach(inst => {
        const existing = Object.values(conversations).find(c => c.name === inst.nombre);
        const initials = getInitials(inst.nombre);

        const div = document.createElement('div');
        div.className = 'instructor-select-item';
        div.onclick = () => {
            if (existing) {
                openConversation(existing.id);
                closeModal('newMessageModal');
            } else {
                createConversation(inst.id);
            }
        };

        div.innerHTML = `
            <div class="instructor-select-avatar">${initials}</div>
            <div class="instructor-select-info">
                <h4>${escapeHtml(inst.nombre)}</h4>
                <p>${escapeHtml(inst.email)}</p>
            </div>
            ${existing ? '<span class="existing-conv-badge">Ya existe</span>' : ''}
        `;
        content.appendChild(div);
    });
}

function createConversation(instructorId) {
    fetch('mensajes_api.php?accion=crear_conversacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructor_id: instructorId })
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            closeModal('newMessageModal');
            loadConversations();
            setTimeout(() => openConversation(data.conversacion_id), 500);
        }
    });
}

// === BÚSQUEDA ===
function searchConversations() {
    const term = document.getElementById('conversationSearch').value.toLowerCase();
    document.querySelectorAll('.conversation-item').forEach(item => {
        const name = item.querySelector('h4').textContent.toLowerCase();
        const preview = item.querySelector('.preview-text')?.textContent.toLowerCase() || '';
        item.style.display = (name.includes(term) || preview.includes(term)) ? 'flex' : 'none';
    });
}

// === NAVEGACIÓN ===
function backToConversations() {
    currentConversationId = null;
    document.getElementById('chatHeader').style.display = 'none';
    document.getElementById('chatInputArea').style.display = 'none';
    document.getElementById('chatMessages').innerHTML = '';
    if (window.innerWidth <= 768) {
        document.querySelector('.chat-panel').classList.remove('active');
        document.querySelector('.conversations-panel').classList.add('active');
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
}

// === UTILIDADES ===
function getInitials(name) {
    return (name || '').split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2) || 'U';
}

function getTimeAgo(ts) {
    if (!ts) return '';
    const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (diff < 60) return 'Ahora';
    if (diff < 3600) return `${Math.floor(diff/60)}m`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h`;
    if (diff < 604800) return `${Math.floor(diff/86400)}d`;
    return new Date(ts).toLocaleDateString('es-ES', {day:'2-digit', month:'2-digit'});
}

function formatMessageTime(ts) {
    const d = new Date(ts);
    const now = new Date();
    return d.toDateString() === now.toDateString()
        ? d.toLocaleTimeString('es-ES', {hour:'2-digit', minute:'2-digit'})
        : d.toLocaleDateString('es-ES', {day:'2-digit', month:'2-digit', year:'2-digit'});
}

function formatMessageText(t) {
    if (!t) return '';
    return t
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" class="message-link" target="_blank">$1</a>')
        .replace(/\n/g, '<br>')
        .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function truncateText(text, max) {
    return text.length > max ? text.substring(0, max) + '...' : text;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getMessageStatusIcon(s) {
    const icons = { read: 'fa-check-double', sent: 'fa-check' };
    return `<i class="fas ${icons[s] || ''}"></i>`;
}

function scrollToBottom() {
    const c = document.getElementById('chatMessages');
    if (c) c.scrollTo({ top: c.scrollHeight, behavior: 'smooth' });
}

function markAsRead(id) {
    fetch('mensajes_api.php?accion=marcar_leidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversacion_id: id })
    }).then(() => {
        if (conversations[id]) conversations[id].unread = 0;
        updateUnreadCount();
    });
}

function updateUnreadCount() {
    const total = Object.values(conversations).reduce((a, c) => a + (c.unread || 0), 0);
    document.querySelectorAll('#messageBadge, #messagesCounter').forEach(b => {
        b.textContent = total;
        b.style.display = total > 0 ? 'inline-block' : 'none';
    });
    document.title = total > 0 ? `(${total}) Mensajes` : 'Mensajes';
}
