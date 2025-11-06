// menss.js - Sistema de mensajería universal (Coordinador e Instructor)

let conversations = [];
let currentConversation = null;
let unreadMessages = 0;
const API_URL = 'mensajes_api.php';

// Detectar rol automáticamente
const isCoordinator = document.getElementById('environment-section') !== null;
const userRole = isCoordinator ? 'coordinador' : 'instructor';

console.log(`🔍 Rol detectado: ${userRole}`);

// ============================================
// INICIALIZACIÓN
// ============================================

function initMessagesSystem() {
    console.log('📨 Inicializando sistema de mensajes...');
    
    // Verificar que los elementos existan
    if (!document.getElementById('conversationsList')) {
        console.error('❌ Elemento conversationsList no encontrado');
        return;
    }
    
    if (!document.getElementById('chatMessages')) {
        console.error('❌ Elemento chatMessages no encontrado');
        return;
    }
    
    loadConversationsFromAPI();
    updateMessagesBadge();
    startPolling();
    setupEnterToSend();
    
    console.log('✅ Sistema de mensajes inicializado');
}

// ============================================
// CARGAR CONVERSACIONES DESDE API
// ============================================

async function loadConversationsFromAPI() {
    try {
        console.log('🔄 Cargando conversaciones desde API...');
        
        const response = await fetch(`${API_URL}?accion=obtener_conversaciones`, {
            credentials: 'include',
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('📡 Respuesta recibida, status:', response.status);
        
        // Leer la respuesta como texto primero
        const responseText = await response.text();
        console.log('📄 Respuesta del servidor:', responseText);
        
        // Intentar parsear como JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('❌ Error parseando JSON:', e);
            console.error('📄 Texto recibido:', responseText.substring(0, 500));
            
            // Si no es JSON, mostrar error al usuario
            const container = document.getElementById('conversationsList');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                        <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 15px; color: #dc3545;"></i>
                        <p style="color: #dc3545;">Error del servidor</p>
                        <p style="font-size: 12px;">Verifica la consola para más detalles</p>
                    </div>`;
            }
            return;
        }

        if (data.success) {
            conversations = data.conversaciones.map(c => ({
                id: c.conversacion_id,
                instructor: {
                    id: c.otro_usuario_id,
                    name: c.otro_usuario_nombre,
                    email: c.otro_usuario_email
                },
                lastMessage: c.fecha_ultimo_mensaje,
                unread: c.mensajes_no_leidos
            }));
            
            calculateUnreadMessages();
            displayConversationsList();
            updateMessagesBadge();
            updateMessagesCounter();
            
            console.log(`✅ ${conversations.length} Conversaciones cargadas`);
        } else {
            console.error('❌ Error en respuesta:', data.error);
            
            const container = document.getElementById('conversationsList');
            if (container) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                        <i class="fas fa-exclamation-circle" style="font-size: 48px; margin-bottom: 15px; opacity: 0.3;"></i>
                        <p>${data.error || 'Error desconocido'}</p>
                    </div>`;
            }
        }
    } catch (err) {
        console.error('❌ Error cargando conversaciones:', err);
        console.error('Stack trace:', err.stack);
        
        const container = document.getElementById('conversationsList');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 15px; color: #dc3545;"></i>
                    <p style="color: #dc3545;">Error de conexión</p>
                    <p style="font-size: 12px;">No se pudo conectar con el servidor</p>
                </div>`;
        }
    }
}
// ============================================
// CARGAR MENSAJES DE UNA CONVERSACIÓN
// ============================================

async function loadMessages(conversacion_id) {
    try {
        console.log('📬 Cargando mensajes de conversación:', conversacion_id);
        
        const response = await fetch(`${API_URL}?accion=obtener_mensajes&conversacion_id=${conversacion_id}`, {
            credentials: 'include',
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Respuesta no JSON:', text);
            throw new Error('La respuesta del servidor no es JSON válido');
        }
        
        const data = await response.json();

        if (data.success) {
            const conv = conversations.find(c => c.id === conversacion_id);
            
            if (!conv) {
                console.error('❌ Conversación no encontrada');
                return;
            }
            
            currentConversation = {
                id: conversacion_id,
                instructor: conv.instructor,
                messages: data.mensajes.map(m => ({
                    id: m.id,
                    sender: m.es_propio ? userRole : (userRole === 'coordinador' ? 'instructor' : 'coordinador'),
                    text: m.mensaje,
                    timestamp: m.fecha_envio,
                    read: m.leido
                }))
            };

            await markAsRead(conversacion_id);
            displayChatMessages();
            displayConversationsList();
            
            console.log(`✅ ${currentConversation.messages.length} mensajes cargados`);
        } else {
            console.error('❌ Error:', data.error);
        }
    } catch (err) {
        console.error('❌ Error cargando mensajes:', err);
    }
}

// ============================================
// MARCAR MENSAJES COMO LEÍDOS
// ============================================

async function markAsRead(conversacion_id) {
    try {
        await fetch(`${API_URL}?accion=marcar_leidos`, {
            method: 'POST',
            credentials: 'include',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ conversacion_id })
        });
        
        // Actualizar contador local
        const conv = conversations.find(c => c.id === conversacion_id);
        if (conv) {
            conv.unread = 0;
        }
        
        calculateUnreadMessages();
        updateMessagesBadge();
        updateMessagesCounter();
    } catch (err) {
        console.error('❌ Error marcando como leído:', err);
    }
}

// ============================================
// ENVIAR MENSAJE
// ============================================

async function sendMessage() {
    const input = document.getElementById('messageInput');
    
    if (!input) {
        console.error('❌ Input de mensaje no encontrado');
        return;
    }
    
    const text = input.value.trim();
    
    if (!text || !currentConversation) {
        console.warn('⚠️ No hay texto o conversación activa');
        return;
    }

    // Deshabilitar input mientras se envía
    input.disabled = true;

    try {
        const response = await fetch(`${API_URL}?accion=enviar_mensaje`, {
            method: 'POST',
            credentials: 'include',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                conversacion_id: currentConversation.id,
                mensaje: text
            })
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Respuesta no JSON:', text);
            throw new Error('Error del servidor');
        }

        const data = await response.json();
        
        if (data.success) {
            input.value = '';
            await loadMessages(currentConversation.id);
            console.log('✅ Mensaje enviado');
        } else {
            alert('Error al enviar mensaje: ' + (data.error || 'Error desconocido'));
            console.error('❌ Error:', data.error);
        }
    } catch (err) {
        alert('Error de conexión al enviar mensaje');
        console.error('❌ Error enviando mensaje:', err);
    } finally {
        input.disabled = false;
        input.focus();
    }
}

// ============================================
// ABRIR MODAL NUEVA CONVERSACIÓN (Solo Coordinador)
// ============================================

async function openNewMessageModal() {
    if (!isCoordinator) {
        alert('Solo el coordinador puede iniciar conversaciones');
        return;
    }

    try {
        console.log('🔍 Obteniendo lista de instructores...');
        
        const response = await fetch(`${API_URL}?accion=obtener_instructores`, {
            credentials: 'include',
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Respuesta no JSON:', text);
            throw new Error('Error del servidor');
        }
        
        const data = await response.json();

        if (!data.success) {
            alert(data.error || 'Error al cargar instructores');
            return;
        }
        
        if (data.instructores.length === 0) {
            alert('No hay instructores registrados. Primero debes registrar instructores en la sección "Instructores".');
            return;
        }

        let html = '<div style="display: grid; gap: 10px; max-height: 400px; overflow-y: auto;">';
        
        data.instructores.forEach(instr => {
            const conv = conversations.find(c => c.instructor.id === instr.id);
            const hasConversation = !!conv;
            
            html += `
                <div class="instructor-select-item ${hasConversation ? 'has-conversation' : ''}" 
                     onclick="startNewConversation(${instr.id}); closeModal('newMessageModal');"
                     style="padding: 15px; border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: all 0.2s;">
                    <div class="instructor-select-avatar" 
                         style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                        ${getInitials(instr.nombre)}
                    </div>
                    <div class="instructor-select-info" style="flex: 1;">
                        <h4 style="margin: 0; font-size: 14px;">${escapeHtml(instr.nombre)}</h4>
                        <p style="margin: 4px 0 0 0; font-size: 12px; color: var(--text-secondary);">${escapeHtml(instr.email)}</p>
                    </div>
                    ${hasConversation ? '<span class="existing-conv-badge" style="background: var(--success-color); color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px;">Activa</span>' : ''}
                </div>
            `;
        });
        
        html += '</div>';

        const modalContent = document.getElementById('newMessageModalContent');
        if (modalContent) {
            modalContent.innerHTML = html;
            openModal('newMessageModal');
        }
        
        console.log(`📋 ${data.instructores.length} instructores disponibles`);
    } catch (err) {
        alert('Error cargando instructores');
        console.error('❌ Error:', err);
    }
}

// ============================================
// INICIAR NUEVA CONVERSACIÓN
// ============================================

async function startNewConversation(instructor_id) {
    try {
        console.log('💬 Iniciando conversación con instructor:', instructor_id);
        
        // Verificar si ya existe conversación
        const existingConv = conversations.find(c => c.instructor.id === instructor_id);
        
        if (existingConv) {
            // Abrir conversación existente
            const index = conversations.indexOf(existingConv);
            openConversation(index);
            alert('Conversación abierta');
            return;
        }

        // Crear nueva conversación
        const response = await fetch(`${API_URL}?accion=crear_conversacion`, {
            method: 'POST',
            credentials: 'include',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ instructor_id })
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Respuesta no JSON:', text);
            throw new Error('Error del servidor');
        }

        const data = await response.json();
        
        if (data.success) {
            await loadConversationsFromAPI();
            const conv = conversations.find(c => c.id === data.conversacion_id);
            
            if (conv) {
                const index = conversations.indexOf(conv);
                openConversation(index);
            }
            
            alert('Conversación iniciada exitosamente');
            console.log('✅ Nueva conversación creada');
        } else {
            alert(data.error || 'Error al crear conversación');
        }
    } catch (err) {
        alert('Error iniciando conversación');
        console.error('❌ Error:', err);
    }
}

// ============================================
// ABRIR CONVERSACIÓN
// ============================================

function openConversation(index) {
    const conv = conversations[index];
    
    if (!conv) {
        console.error('❌ Conversación no encontrada');
        return;
    }

    console.log(`📬 Abriendo conversación con: ${conv.instructor.name}`);

    // Resetear conversación actual
    currentConversation = null;
    
    const chatHeader = document.getElementById('chatHeader');
    const chatInputArea = document.getElementById('chatInputArea');
    
    if (chatHeader) chatHeader.style.display = 'none';
    if (chatInputArea) chatInputArea.style.display = 'none';

    // Cargar mensajes
    loadMessages(conv.id);
    displayConversationsList();
    
    // Cerrar sidebar en móvil
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('open');
    }
}

// ============================================
// ELIMINAR CONVERSACIÓN
// ============================================

async function deleteConversation() {
    if (!currentConversation) return;

    if (!confirm('¿Eliminar esta conversación? Se archivará permanentemente.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}?accion=eliminar_conversacion&conversacion_id=${currentConversation.id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Respuesta no JSON:', text);
            throw new Error('Error del servidor');
        }
        
        const data = await response.json();

        if (data.success) {
            currentConversation = null;
            await loadConversationsFromAPI();
            displayChatMessages();
            alert('Conversación archivada');
            console.log('🗑️ Conversación eliminada');
        } else {
            alert(data.error || 'Error al eliminar');
        }
    } catch (err) {
        alert('Error de conexión');
        console.error('❌ Error:', err);
    }
}

// ============================================
// BUSCAR CONVERSACIONES
// ============================================

function searchConversations() {
    const searchInput = document.getElementById('conversationSearch');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const items = document.querySelectorAll('.conversation-item');
    
    let visibleCount = 0;
    
    items.forEach(item => {
        const nameElement = item.querySelector('h4');
        if (!nameElement) return;
        
        const name = nameElement.textContent.toLowerCase();
        const matches = name.includes(searchTerm);
        
        item.style.display = matches ? 'flex' : 'none';
        if (matches) visibleCount++;
    });
    
    console.log(`🔍 ${visibleCount} conversaciones encontradas`);
}

// ============================================
// POLLING AUTOMÁTICO
// ============================================

function startPolling() {
    setInterval(async () => {
        // Solo hacer polling si la sección de mensajes está activa
        const messagesSection = document.getElementById('messages-section');
        const isMessagesActive = messagesSection && messagesSection.classList.contains('active');
        
        if (currentConversation && isMessagesActive) {
            await loadMessages(currentConversation.id);
        }
        
        await loadConversationsFromAPI();
    }, 10000); // Cada 10 segundos
    
    console.log('🔄 Polling iniciado (cada 10s)');
}

// ============================================
// MOSTRAR LISTA DE CONVERSACIONES
// ============================================

function displayConversationsList() {
    const container = document.getElementById('conversationsList');
    
    if (!container) {
        console.error('❌ Contenedor de conversaciones no encontrado');
        return;
    }

    if (conversations.length === 0) {
        const emptyMessage = isCoordinator 
            ? '<button class="btn btn-primary" onclick="openNewMessageModal()" style="margin-top: 15px;"><i class="fas fa-plus"></i> Iniciar Conversación</button>'
            : '<p style="font-size: 12px; margin-top: 10px;">Espera a que el coordinador te escriba</p>';
        
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                <i class="fas fa-comments" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                <p>No hay conversaciones activas</p>
                ${emptyMessage}
            </div>`;
        return;
    }

    let html = '';
    
    conversations.forEach((conv, index) => {
        const unread = conv.unread || 0;
        const isActive = currentConversation?.id === conv.id;
        const lastMsg = conv.lastMessage || 'Sin mensajes';
        const displayName = isCoordinator ? conv.instructor.name : 'Coordinador';

        html += `
            <div class="conversation-item ${isActive ? 'active' : ''} ${unread > 0 ? 'unread' : ''}" 
                 onclick="openConversation(${index})">
                <div class="conversation-avatar">${getInitials(displayName)}</div>
                <div class="conversation-info">
                    <div class="conversation-header">
                        <h4>${escapeHtml(displayName)}</h4>
                        <span class="conversation-time">${formatTime(lastMsg)}</span>
                    </div>
                    <div class="conversation-preview">
                        <span class="preview-text">${unread > 0 ? 'Nuevo mensaje' : 'Último mensaje'}</span>
                        ${unread > 0 ? `<span class="unread-badge">${unread}</span>` : ''}
                    </div>
                </div>
            </div>`;
    });
    
    container.innerHTML = html;
}

// ============================================
// MOSTRAR MENSAJES DEL CHAT
// ============================================

function displayChatMessages() {
    const container = document.getElementById('chatMessages');
    const header = document.getElementById('chatHeader');
    const inputArea = document.getElementById('chatInputArea');

    if (!container) {
        console.error('❌ Contenedor de mensajes no encontrado');
        return;
    }

    if (!currentConversation) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                <i class="fas fa-comment-dots" style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;"></i>
                <h3>Selecciona una conversación</h3>
                <p>${isCoordinator ? 'Elige un instructor para comenzar a chatear' : 'Selecciona la conversación con el coordinador'}</p>
            </div>`;
        if (header) header.style.display = 'none';
        if (inputArea) inputArea.style.display = 'none';
        return;
    }

    // Mostrar header y área de input
    if (header) header.style.display = 'flex';
    if (inputArea) inputArea.style.display = 'flex';
    
    const displayName = isCoordinator ? currentConversation.instructor.name : 'Coordinador';
    const displaySubject = isCoordinator 
        ? currentConversation.instructor.email 
        : 'Coordinación Académica';
    
    const nameElement = document.getElementById('chatInstructorName');
    if (nameElement) nameElement.textContent = displayName;
    
    const subjectElement = document.getElementById('chatInstructorSubject');
    if (subjectElement) subjectElement.textContent = displaySubject;

    // Renderizar mensajes
    let html = '';
    
    if (currentConversation.messages.length === 0) {
        html = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">
                <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 15px; opacity: 0.3;"></i>
                <p>No hay mensajes todavía</p>
                <p style="font-size: 12px;">Escribe el primer mensaje para iniciar la conversación</p>
            </div>`;
    } else {
        currentConversation.messages.forEach(msg => {
            const isSent = msg.sender === userRole;
            
            html += `
                <div class="message ${isSent ? 'sent' : 'received'}">
                    <div class="message-content">
                        <p>${escapeHtml(msg.text)}</p>
                        <span class="message-time">${formatTime(msg.timestamp)}</span>
                    </div>
                </div>`;
        });
    }
    
    container.innerHTML = html;
    
    // Scroll al final
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 100);
}

// ============================================
// CALCULAR MENSAJES NO LEÍDOS
// ============================================

function calculateUnreadMessages() {
    unreadMessages = conversations.reduce((sum, c) => sum + (c.unread || 0), 0);
}

// ============================================
// ACTUALIZAR BADGE DE MENSAJES
// ============================================

function updateMessagesBadge() {
    const badge = document.getElementById('messageBadge');
    
    if (!badge) return;
    
    if (unreadMessages > 0) {
        badge.textContent = unreadMessages > 99 ? '99+' : unreadMessages;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

// ============================================
// ACTUALIZAR CONTADOR EN DASHBOARD
// ============================================

function updateMessagesCounter() {
    const counter = document.getElementById('messagesCounter');
    
    if (!counter) return;
    
    if (unreadMessages > 0) {
        counter.textContent = unreadMessages;
        counter.style.display = 'inline-block';
    } else {
        counter.style.display = 'none';
    }
}

// ============================================
// CONFIGURAR ENTER PARA ENVIAR
// ============================================

function setupEnterToSend() {
    const input = document.getElementById('messageInput');
    
    if (!input) {
        console.warn('⚠️ Input de mensaje no encontrado');
        return;
    }
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    console.log('⌨️ Enter configurado para enviar mensajes');
}

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

function getInitials(name) {
    if (!name) return 'IN';
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2) || 'IN';
}

function formatTime(timestamp) {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // Hace menos de 1 minuto
    if (diff < 60000) return 'Ahora';
    
    // Hace menos de 1 hora
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `Hace ${minutes} min`;
    }
    
    // Hoy
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    // Ayer
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Ayer';
    }
    
    // Fecha completa
    return date.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// FUNCIONES PARA MODALES (COMPATIBILIDAD)
// ============================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = 'none';
    }
}

// ============================================
// AUTO-INICIALIZACIÓN
// ============================================

// Esperar a que el DOM esté completamente cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 DOM cargado, inicializando sistema de mensajes...');
        setTimeout(() => {
            initMessagesSystem();
        }, 500);
    });
} else {
    // El DOM ya está cargado
    console.log('🚀 DOM ya cargado, inicializando sistema de mensajes...');
    setTimeout(() => {
        initMessagesSystem();
    }, 500);
}

console.log('✅ menss.js cargado correctamente');