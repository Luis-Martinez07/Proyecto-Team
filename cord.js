// cord.js - Sistema completo para coordinador

let currentInstructor = {};
let currentTemplate = '';
let scheduleData = {};
let instructors = [];
let schedules = [];
let ambiences = [];

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando panel de coordinador...');
    
    loadData();
    updateStats();
    initTheme();
    initThemeToggleWithLabels();
    
    // Inicializar sistema de mensajes
    if (typeof initMessagesSystem === 'function') {
        console.log('📨 Inicializando sistema de mensajes...');
        initMessagesSystem();
    } else {
        console.warn('⚠️ menss.js no está cargado');
    }
    
    console.log('✅ Panel de coordinador iniciado');
});

// ============================================
// CARGAR DATOS
// ============================================

function loadData() {
    console.log('📂 Cargando datos locales...');
    
    // Cargar desde localStorage
    const savedSchedules = localStorage.getItem('schedules');
    const savedAmbiences = localStorage.getItem('ambiences');
    
    if (savedSchedules) {
        schedules = JSON.parse(savedSchedules);
    }
    
    if (savedAmbiences) {
        ambiences = JSON.parse(savedAmbiences);
    }
    
    console.log(`📊 Datos cargados: ${schedules.length} horarios, ${ambiences.length} ambientes`);
}

// ============================================
// ACTUALIZAR ESTADÍSTICAS
// ============================================

function updateStats() {
    document.getElementById('totalSchedules').textContent = schedules.length;
    document.getElementById('totalInstructors').textContent = instructors.length;
    document.getElementById('totalAmbiences').textContent = ambiences.length;
    document.getElementById('instructorBadge').textContent = instructors.length;
    document.getElementById('ambienceBadge').textContent = ambiences.length;
    
    const scheduleCountEl = document.getElementById('scheduleCount');
    if (scheduleCountEl) {
        scheduleCountEl.textContent = `(${schedules.length})`;
    }
    
    // Contar clases activas
    let activeClasses = 0;
    schedules.forEach(s => {
        if (s.data) {
            Object.values(s.data).forEach(day => {
                activeClasses += Object.keys(day).length;
            });
        }
    });
    document.getElementById('activeClasses').textContent = activeClasses;
}

// ============================================
// GESTIÓN DE TEMA (DARK/LIGHT)
// ============================================

function getTheme() {
    return localStorage.getItem('theme') || 'light';
}

function saveTheme(theme) {
    localStorage.setItem('theme', theme);
}

function toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    saveTheme(newTheme);
    updateThemeIcon(newTheme);
    showNotification(newTheme === 'dark' ? 'Tema oscuro activado' : 'Tema claro activado', 'success');
}

function initTheme() {
    const savedTheme = getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function initThemeToggleWithLabels() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    const currentTheme = getTheme();
    updateThemeIcon(currentTheme);
    themeToggle.addEventListener('click', toggleTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    const themeLabel = document.querySelector('.theme-label');
    
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    if (themeLabel) {
        themeLabel.textContent = theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro';
    }
}

// ============================================
// CERRAR SESIÓN
// ============================================

function logout() {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-door-open"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">¡Hasta pronto!</div>
            <div class="notification-message">Sesión cerrada correctamente</div>
        </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '0';
    }, 800);
    
    setTimeout(() => {
        window.location.href = '?logout=true';
    }, 2500);
}

// ============================================
// NAVEGACIÓN
// ============================================

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}

function showSection(sectionName, event) {
    console.log(`📍 Mostrando sección: ${sectionName}`);
    
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(s => {
        s.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    const target = document.getElementById(sectionName + '-section');
    if (target) {
        target.classList.add('active');
    }
    
    // Actualizar navegación activa
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    } else {
        // Buscar el nav-item correcto
        document.querySelectorAll('.nav-item').forEach(item => {
            const onclick = item.getAttribute('onclick');
            if (onclick && onclick.includes(`'${sectionName}'`)) {
                item.classList.add('active');
            }
        });
    }
    
    // Acciones específicas por sección
    if (sectionName === 'instructor') {
        loadInstructorsFromAPI();
    } else if (sectionName === 'environment') {
        displaySavedAmbiences();
    } else if (sectionName === 'messages') {
        if (typeof showMessagesSection === 'function') {
            showMessagesSection();
        }
    }
    
    // Cerrar sidebar en móvil
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('open');
        }
    }
}

function toggleDropdown() {
    const menu = document.getElementById('navDropdownMenu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

// Cerrar dropdown al hacer click fuera
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.nav-dropdown-container');
    if (dropdown && !dropdown.contains(event.target)) {
        const menu = document.getElementById('navDropdownMenu');
        if (menu) {
            menu.classList.remove('active');
        }
    }
});

// ============================================
// GESTIÓN DE TABS
// ============================================

function switchTab(tab, event) {
    console.log(`🔄 Cambiando a tab: ${tab}`);
    
    // Actualizar botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    
    // Actualizar contenido
    document.querySelectorAll('.tab-content').forEach(c => {
        c.classList.remove('active');
    });
    
    const targetContent = document.getElementById(tab + '-tab');
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    if (tab === 'manage') {
        displaySavedSchedules();
    }
}

function switchTabProgrammatically(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const buttons = document.querySelectorAll('.tab-btn');
    if (buttons[tab === 'create' ? 0 : 1]) {
        buttons[tab === 'create' ? 0 : 1].classList.add('active');
    }
    
    document.querySelectorAll('.tab-content').forEach(c => {
        c.classList.remove('active');
    });
    
    const targetContent = document.getElementById(tab + '-tab');
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    if (tab === 'manage') {
        displaySavedSchedules();
    }
}

// ============================================
// API: GESTIÓN DE INSTRUCTORES
// ============================================

async function loadInstructorsFromAPI() {
    console.log('📡 Cargando instructores desde API...');
    
    try {
        const res = await fetch('instructores_api.php?accion=listar', { 
            credentials: 'include',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('📥 Respuesta de API:', data);
        
        if (data.success) {
            instructors = data.instructores.map(i => ({
                name: i.nombre,
                subject: i.subject || '',
                group: i.group_name || '',
                id: i.instructor_id || '',
                email: i.email || '',
                phone: i.phone || '',
                db_id: i.id
            }));
            
            console.log(`✅ ${instructors.length} instructores cargados`);
            displaySavedInstructors();
            updateStats();
        } else {
            console.error('❌ Error en respuesta:', data.error);
            showNotification(data.error || 'Error al cargar instructores', 'error');
        }
    } catch (err) {
        console.error('❌ Error de conexión:', err);
        showNotification('Error de conexión con el servidor', 'error');
        console.error('Detalles del error:', {
            message: err.message,
            stack: err.stack
        });
    }
}

async function saveNewInstructor() {
    console.log('💾 Guardando nuevo instructor...');
    
    const datos = {
        nombre: document.getElementById('newInstructorName').value.trim(),
        materia: document.getElementById('newInstructorSubject').value.trim(),
        ficha: document.getElementById('newInstructorGroup').value.trim(),
        id_instructor: document.getElementById('newInstructorId').value.trim(),
        email: document.getElementById('newInstructorEmail').value.trim(),
        telefono: document.getElementById('newInstructorPhone').value.trim()
    };

    console.log('📋 Datos a enviar:', datos);

    // Validaciones
    if (!datos.nombre || !datos.email || !datos.materia) {
        showNotification('Por favor completa: Nombre, Email y Materia', 'error');
        return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(datos.email)) {
        showNotification('Email inválido', 'error');
        return;
    }

    try {
        const res = await fetch('instructores_api.php?accion=registrar', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(datos),
            credentials: 'include'
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log('📥 Respuesta:', data);

        if (data.success) {
            clearInstructorForm();
            await loadInstructorsFromAPI();
            
            const mensaje = data.enviado 
                ? '✅ Instructor registrado. Credenciales enviadas por email.'
                : '✅ Instructor registrado. Email no pudo ser enviado.';
            
            showNotification(mensaje, 'success');
        } else {
            console.error('❌ Error:', data.error);
            showNotification(data.error || 'Error desconocido', 'error');
        }
    } catch (err) {
        console.error('❌ Error de conexión:', err);
        showNotification('Error de conexión con el servidor', 'error');
        console.error('Detalles:', {
            message: err.message,
            stack: err.stack
        });
    }
}

async function deleteInstructor(index) {
    const instructor = instructors[index];
    
    if (!instructor || !instructor.db_id) {
        console.error('❌ Instructor sin ID de BD');
        showNotification('Error: Instructor sin ID', 'error');
        return;
    }

    console.log('🗑️ Eliminando instructor:', instructor);

    showConfirm(`¿Eliminar a ${instructor.name}?`, async () => {
        try {
            const res = await fetch(`instructores_api.php?accion=eliminar&id=${instructor.db_id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            
            const data = await res.json();
            console.log('📥 Respuesta:', data);
            
            if (data.success) {
                await loadInstructorsFromAPI();
                showNotification('Instructor eliminado', 'warning');
            } else {
                console.error('❌ Error:', data.error);
                showNotification(data.error || 'Error al eliminar', 'error');
            }
        } catch (err) {
            console.error('❌ Error:', err);
            showNotification('Error de conexión', 'error');
        }
    });
}

function displaySavedInstructors() {
    const container = document.getElementById('savedInstructorsList');
    
    if (!container) {
        console.error('❌ Contenedor de instructores no encontrado');
        return;
    }
    
    if (instructors.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--gray);grid-column:1/-1;">No hay instructores registrados</p>';
        return;
    }
    
    let html = '';
    instructors.forEach((i, index) => {
        html += `
            <div class="item-card">
                <h4>${i.name}</h4>
                <p><strong>Materia:</strong> ${i.subject}</p>
                <p><strong>Ficha:</strong> ${i.group}</p>
                <p><strong>ID:</strong> ${i.id}</p>
                ${i.email ? `<p><strong>Email:</strong> ${i.email}</p>` : ''}
                ${i.phone ? `<p><strong>Teléfono:</strong> ${i.phone}</p>` : ''}
                <div class="card-actions">
                    <button class="btn btn-small btn-primary" onclick="useInstructor(${index})">Usar</button>
                    <button class="btn btn-small btn-danger" onclick="deleteInstructor(${index})">Eliminar</button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function clearInstructorForm() {
    const fields = [
        'newInstructorName',
        'newInstructorSubject', 
        'newInstructorGroup',
        'newInstructorId',
        'newInstructorEmail',
        'newInstructorPhone'
    ];
    
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
}

function useInstructor(index) {
    const instructor = instructors[index];
    document.getElementById('instructorName').value = instructor.name;
    document.getElementById('instructorSubject').value = instructor.subject;
    document.getElementById('instructorGroup').value = instructor.group;
    document.getElementById('instructorId').value = instructor.id;
    validateInstructor();
    showSection('schedules');
    showNotification(`Usando datos de: ${instructor.name}`, 'success');
}

function showSavedInstructors() {
    console.log('📋 Mostrando instructores guardados');
    
    if (instructors.length === 0) {
        showNotification('No hay instructores registrados. Regístralos primero.', 'info');
        return;
    }

    let html = '<div class="modal" id="instructorModal" style="display: block;">';
    html += '<div class="modal-content">';
    html += '<span class="close" onclick="closeModal(\'instructorModal\')">&times;</span>';
    html += '<h2 style="margin-bottom: 20px;">👥 Seleccionar Instructor</h2>';
    html += '<div id="instructorModalList" style="display: grid; gap: 10px; max-height: 400px; overflow-y: auto;">';
    
    instructors.forEach((instr, i) => {
        html += `
            <div class="instructor-select-item" onclick="useInstructorFromModal(${i}); closeModal('instructorModal');"
                 style="padding: 15px; border: 1px solid var(--border-color); border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 12px; transition: all 0.2s;">
                <div class="instructor-select-avatar" 
                     style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary-color); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                    ${getInitials(instr.name)}
                </div>
                <div class="instructor-select-info" style="flex: 1;">
                    <h4 style="margin: 0; font-size: 14px;">${instr.name}</h4>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: var(--text-secondary);">
                        ${instr.subject} - Ficha: ${instr.group}
                    </p>
                </div>
            </div>
        `;
    });
    
    html += '</div></div></div>';
    
    // Remover modal anterior si existe
    const oldModal = document.getElementById('instructorModal');
    if (oldModal) oldModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', html);
}

function useInstructorFromModal(index) {
    const instructor = instructors[index];
    document.getElementById('instructorName').value = instructor.name;
    document.getElementById('instructorSubject').value = instructor.subject;
    document.getElementById('instructorGroup').value = instructor.group;
    document.getElementById('instructorId').value = instructor.id;
    validateInstructor();
    showNotification(`Usando datos de: ${instructor.name}`, 'success');
}

// ============================================
// VALIDAR INSTRUCTOR
// ============================================

function validateInstructor() {
    const name = document.getElementById('instructorName').value;
    const subject = document.getElementById('instructorSubject').value;
    const group = document.getElementById('instructorGroup').value;
    const id = document.getElementById('instructorId').value;
    
    if (!name || !subject || !group || !id) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }
    
    currentInstructor = { name, subject, group, id };
    showNotification('Datos validados correctamente', 'success');
}

// ============================================
// GESTIÓN DE HORARIOS
// ============================================

function selectTemplate(template) {
    if (!currentInstructor.name) {
        showNotification('Primero valida los datos del instructor', 'error');
        return;
    }
    
    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const templateCard = document.getElementById('template' + template.charAt(0).toUpperCase() + template.slice(1));
    if (templateCard) {
        templateCard.classList.add('selected');
    }
    
    currentTemplate = template;
    scheduleData = {};
    
    document.getElementById('scheduleCard').style.display = 'block';
    document.getElementById('selectedTemplate').textContent = getTemplateName(template);
    
    if (template === 'university') {
        document.getElementById('addSubjectBtn').style.display = 'inline-flex';
        generateUniversitySchedule();
    } else {
        document.getElementById('addSubjectBtn').style.display = 'none';
        generateSchedule(template);
    }
}

function getTemplateName(template) {
    const names = {
        '3hours': 'Plantilla 3 Horas',
        'complete': 'Horario Completo',
        'university': 'Horario Universidad',
        'blocks': 'Horario por Bloques'
    };
    return names[template] || template;
}

function generateSchedule(template) {
    const table = document.getElementById('scheduleTable');
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    let hours = [];
    
    if (template === '3hours') {
        hours = ['6:00-9:00', '9:00-12:00', '12:00-15:00', '15:00-18:00'];
    } else if (template === 'complete') {
        for (let i = 6; i <= 18; i++) {
            hours.push(i + ':00-' + (i + 1) + ':00');
        }
    } else if (template === 'blocks') {
        hours = ['Mañana\n6:00-9:00', 'Media Mañana\n9:00-12:00', 'Tarde\n12:00-15:00', 'Media Tarde\n15:00-18:00'];
    }
    
    let html = '<tr><th>Hora</th>' + days.map(d => `<th>${d}</th>`).join('') + '</tr>';
    
    hours.forEach(hour => {
        html += `<tr><td>${hour}</td>`;
        days.forEach(day => {
            html += `<td onclick="toggleCell(this, '${day.toLowerCase()}', '${hour}')"></td>`;
        });
        html += '</tr>';
    });
    
    table.innerHTML = html;
}

function generateUniversitySchedule() {
    const table = document.getElementById('scheduleTable');
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    let html = '<tr><th>Hora</th>' + days.map(d => `<th>${d}</th>`).join('') + '</tr>';
    
    for (let i = 6; i <= 18; i++) {
        html += `<tr><td>${i}:00</td>`;
        days.forEach(day => {
            const key = day.toLowerCase() + '-' + i;
            const content = scheduleData[key] || '';
            const occupied = content ? 'occupied' : '';
            html += `<td class="${occupied}">${content}</td>`;
        });
        html += '</tr>';
    }
    
    table.innerHTML = html;
}

function toggleCell(cell, day, hour) {
    const key = day + '-' + hour;
    
    if (cell.classList.contains('occupied')) {
        cell.classList.remove('occupied');
        cell.textContent = '';
        delete scheduleData[key];
    } else {
        cell.classList.add('occupied');
        const text = currentInstructor.subject + '\n' + currentInstructor.name;
        cell.textContent = text;
        scheduleData[key] = {
            subject: currentInstructor.subject,
            instructor: currentInstructor.name,
            group: currentInstructor.group,
            id: currentInstructor.id
        };
    }
}

function clearSchedule() {
    showConfirm('¿Limpiar el horario completo?', () => {
        scheduleData = {};
        if (currentTemplate === 'university') {
            generateUniversitySchedule();
        } else {
            generateSchedule(currentTemplate);
        }
        showNotification('Horario limpiado', 'info');
    });
}

function saveSchedule() {
    if (Object.keys(scheduleData).length === 0) {
        showNotification('El horario está vacío', 'error');
        return;
    }
    
    const schedule = {
        id: Date.now(),
        instructor: currentInstructor,
        template: currentTemplate,
        data: scheduleData,
        date: new Date().toLocaleDateString()
    };
    
    schedules.push(schedule);
    localStorage.setItem('schedules', JSON.stringify(schedules));
    
    updateStats();
    showNotification('Horario guardado correctamente', 'success');
    
    setTimeout(() => {
        switchTabProgrammatically('manage');
    }, 1500);
}

function sendSchedule() {
    if (Object.keys(scheduleData).length === 0) {
        showNotification('El horario está vacío', 'error');
        return;
    }
    
    showNotification('Funcionalidad de envío en desarrollo', 'info');
}

function displaySavedSchedules() {
    const container = document.getElementById('savedSchedulesList');
    
    if (!container) return;
    
    if (schedules.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--gray);grid-column:1/-1;">No hay horarios guardados</p>';
        return;
    }
    
    let html = '';
    schedules.forEach((s, i) => {
        const count = Object.keys(s.data).length;
        html += `
            <div class="item-card">
                <h4>${s.instructor.name}</h4>
                <p><strong>Materia:</strong> ${s.instructor.subject}</p>
                <p><strong>Ficha:</strong> ${s.instructor.group}</p>
                <p><strong>Plantilla:</strong> ${getTemplateName(s.template)}</p>
                <p><strong>Clases:</strong> ${count}</p>
                <p><strong>Fecha:</strong> ${s.date}</p>
                <div class="card-actions">
                    <button class="btn btn-small btn-primary" onclick="viewSchedule(${i})">Ver</button>
                    <button class="btn btn-small btn-warning" onclick="downloadSchedule(${i})">Descargar</button>
                    <button class="btn btn-small btn-danger" onclick="deleteSchedule(${i})">Eliminar</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function viewSchedule(i) {
    const s = schedules[i];
    currentInstructor = s.instructor;
    currentTemplate = s.template;
    scheduleData = s.data;
    
    document.getElementById('instructorName').value = s.instructor.name;
    document.getElementById('instructorSubject').value = s.instructor.subject;
    document.getElementById('instructorGroup').value = s.instructor.group;
    document.getElementById('instructorId').value = s.instructor.id;
    
    switchTabProgrammatically('create');
    selectTemplate(s.template);
}

function downloadSchedule(i) {
    const s = schedules[i];
    const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `horario_${s.instructor.name.replace(/\s/g, '_')}.json`;
    a.click();
    showNotification('Horario descargado', 'success');
}

function deleteSchedule(i) {
    showConfirm('Esta acción no se puede deshacer', () => {
        schedules.splice(i, 1);
        localStorage.setItem('schedules', JSON.stringify(schedules));
        updateStats();
        displaySavedSchedules();
        showNotification('Horario eliminado', 'warning');
    }, '¿Eliminar horario?');
}

// ============================================
// GESTIÓN DE AMBIENTES
// ============================================

function saveNewAmbience() {
    const name = document.getElementById('newAmbienceName').value.trim();
    const type = document.getElementById('newAmbienceType').value;
    const capacity = document.getElementById('newAmbienceCapacity').value;
    
    if (!name || !capacity) {
        showNotification('Completa nombre y capacidad', 'error');
        return;
    }
    
    ambiences.push({
        name,
        type,
        capacity: parseInt(capacity)
    });
    
    localStorage.setItem('ambiences', JSON.stringify(ambiences));
    updateStats();
    displaySavedAmbiences();
    clearAmbienceForm();
    showNotification('Ambiente guardado', 'success');
}

function clearAmbienceForm() {
    document.getElementById('newAmbienceName').value = '';
    document.getElementById('newAmbienceType').value = 'aula';
    document.getElementById('newAmbienceCapacity').value = '';
}

function displaySavedAmbiences() {
    const container = document.getElementById('savedAmbiencesList');
    
    if (!container) return;
    
    if (ambiences.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--gray);grid-column:1/-1;">No hay ambientes registrados</p>';
        return;
    }
    
    let html = '';
    ambiences.forEach((a, i) => {
        const typeIcons = {
            'laboratorio': 'fa-microscope',
            'taller': 'fa-wrench',
            'aula': 'fa-chalkboard'
        };
        const icon = typeIcons[a.type] || 'fa-building';
        
        html += `
            <div class="item-card">
                <h4><i class="fas ${icon}"></i> ${a.name}</h4>
                <p><strong>Tipo:</strong> ${a.type.charAt(0).toUpperCase() + a.type.slice(1)}</p>
                <p><strong>Capacidad:</strong> ${a.capacity} estudiantes</p>
                <div class="card-actions">
                    <button class="btn btn-small btn-primary" onclick="editAmbience(${i})">Editar</button>
                    <button class="btn btn-small btn-danger" onclick="deleteAmbience(${i})">Eliminar</button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function editAmbience(i) {
    const a = ambiences[i];
    document.getElementById('newAmbienceName').value = a.name;
    document.getElementById('newAmbienceType').value = a.type;
    document.getElementById('newAmbienceCapacity').value = a.capacity;
    deleteAmbience(i);
}

function deleteAmbience(i) {
    showConfirm('Esta acción no se puede deshacer', () => {
        ambiences.splice(i, 1);
        localStorage.setItem('ambiences', JSON.stringify(ambiences));
        updateStats();
        displaySavedAmbiences();
        showNotification('Ambiente eliminado', 'warning');
    }, '¿Eliminar ambiente?');
}

// ============================================
// MODALES
// ============================================

function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Cerrar modal al hacer clic fuera
window.onclick = (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
}

// ============================================
// SISTEMA DE NOTIFICACIONES
// ============================================

function showNotification(message, type = 'success') {
    // Remover notificaciones anteriores
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());
    
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    
    const config = {
        success: { icon: 'fa-circle-check', title: '¡Éxito!' },
        error: { icon: 'fa-circle-xmark', title: 'Error' },
        warning: { icon: 'fa-triangle-exclamation', title: 'Advertencia' },
        info: { icon: 'fa-circle-info', title: 'Información' }
    };
    
    const c = config[type] || config.info;
    
    notif.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${c.icon}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${c.title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(notif);
    
    setTimeout(() => notif.classList.add('show'), 10);
    
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, 4000);
}

function showConfirm(message, onConfirm, title = '¿Estás seguro?') {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
        <div class="confirm-dialog">
            <div class="confirm-icon">
                <i class="fas fa-question-circle"></i>
            </div>
            <div class="confirm-title">${title}</div>
            <div class="confirm-message">${message}</div>
            <div class="confirm-buttons">
                <button class="btn btn-secondary confirm-cancel">Cancelar</button>
                <button class="btn btn-primary confirm-accept">Confirmar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('show'), 10);
    
    overlay.querySelector('.confirm-cancel').onclick = () => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    };
    
    overlay.querySelector('.confirm-accept').onclick = () => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
        if (onConfirm) onConfirm();
    };
    
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
        }
    };
}

// ============================================
// UTILIDADES
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

// ============================================
// MODAL DE MATERIAS (HORARIO UNIVERSIDAD)
// ============================================

function addSubjectToUniversity() {
    const subjectName = document.getElementById('subjectName').value.trim();
    const day = document.getElementById('subjectDay').value;
    const startTime = document.getElementById('subjectStartTime').value;
    const endTime = document.getElementById('subjectEndTime').value;
    
    if (!subjectName || !startTime || !endTime) {
        showNotification('Completa todos los campos', 'error');
        return;
    }
    
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    
    if (startHour >= endHour) {
        showNotification('La hora de fin debe ser mayor a la de inicio', 'error');
        return;
    }
    
    // Agregar a las celdas correspondientes
    for (let hour = startHour; hour < endHour; hour++) {
        const key = day + '-' + hour;
        scheduleData[key] = subjectName;
    }
    
    generateUniversitySchedule();
    closeModal('universityModal');
    showNotification('Materia agregada', 'success');
    
    // Limpiar formulario
    document.getElementById('subjectName').value = '';
    document.getElementById('subjectStartTime').value = '';
    document.getElementById('subjectEndTime').value = '';
}

// ============================================
// MENSAJE DE BIENVENIDA
// ============================================

window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const fromLogin = urlParams.get('fromLogin');
    
    if (fromLogin === 'true') {
        const welcomeMsg = document.getElementById('welcomeMessage');
        if (welcomeMsg) {
            welcomeMsg.classList.add('show');
            
            setTimeout(() => {
                welcomeMsg.classList.remove('show');
            }, 5000);
            
            // Limpiar URL
            window.history.replaceState({}, document.title, 'coordinador.php');
        }
    }
});

console.log('✅ cord.js cargado completamente')