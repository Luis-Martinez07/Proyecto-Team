let currentInstructor = {};
let currentTemplate = '';
let scheduleData = {};
let instructors = [];
let schedules = [];
let ambiences = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateStats();
    initTheme();
});

// === MODO OSCURO / CLARO ===

// Obtener tema guardado
function getTheme() {
    return localStorage.getItem('theme') || 'light';
}

// Guardar tema
function saveTheme(theme) {
    localStorage.setItem('theme', theme);
}

// Cambiar tema manualmente
function toggleTheme() {
    const currentTheme = getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    // Cambia el atributo en el <html>
    document.documentElement.setAttribute('data-theme', newTheme);
    saveTheme(newTheme);

    // Cambia el icono del botón
    const icon = document.getElementById('theme-icon');
    if (newTheme === 'dark') {
        icon.classList.replace('fa-moon', 'fa-sun');
        showNotification('Tema oscuro activado', 'success');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
        showNotification('Tema claro activado', 'success');
    }
}

// Inicializar el tema al cargar la página
function initTheme() {
    const savedTheme = getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Ajustar icono correctamente
    const icon = document.getElementById('theme-icon');
    if (savedTheme === 'dark') {
        icon.classList.replace('fa-moon', 'fa-sun');
    } else {
        icon.classList.replace('fa-sun', 'fa-moon');
    }

    // Asignar evento al botón
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
}

// === LOGOUT FUNCTION - MEJORADA SIN CONFIRMACIÓN ===
function logout() {
    // Notificación especial de despedida con icono personalizado
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
    
    // Efecto de salida suave
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '0';
    }, 800);
    
    // Redirigir al login
    setTimeout(() => {
        window.location.href = '?logout=true';
    }, 2500);
}

// Load data from memory
function loadData() {
    instructors = [];
    schedules = [];
    ambiences = [];
    updateStats();
}

// Update statistics
function updateStats() {
    document.getElementById('totalSchedules').textContent = schedules.length;
    document.getElementById('totalInstructors').textContent = instructors.length;
    document.getElementById('totalAmbiences').textContent = ambiences.length;
    
    // Update badges
    document.getElementById('instructorBadge').textContent = instructors.length;
    document.getElementById('ambienceBadge').textContent = ambiences.length;
    
    // Update schedule count in tab
    const scheduleCountEl = document.getElementById('scheduleCount');
    if (scheduleCountEl) {
        scheduleCountEl.textContent = schedules.length;
    }
    
    let activeClasses = 0;
    schedules.forEach(schedule => {
        if (schedule.data) {
            Object.values(schedule.data).forEach(day => {
                activeClasses += Object.keys(day).length;
            });
        }
    });
    document.getElementById('activeClasses').textContent = activeClasses;
}

// Switch tabs
function switchTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tab + '-tab').classList.add('active');

    // Load data if needed
    if (tab === 'manage') {
        displaySavedSchedules();
    }
}

// Toggle sidebar
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// Show section
function showSection(section) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(section + '-section').classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    event.target.closest('.nav-item').classList.add('active');

    if (section === 'instructor') {
        displaySavedInstructors();
    } else if (section === 'environment') {
        displaySavedAmbiences();
    }

    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}

// Validate instructor
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

// Select template
function selectTemplate(template) {
    if (!currentInstructor.name) {
        showNotification('Primero valida los datos del instructor', 'error');
        return;
    }

    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.getElementById('template' + template.charAt(0).toUpperCase() + template.slice(1)).classList.add('selected');

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

// Get template name
function getTemplateName(template) {
    const names = {
        '3hours': 'Plantilla 3 Horas',
        'complete': 'Horario Completo',
        'university': 'Horario Universidad',
        'blocks': 'Horario por Bloques'
    };
    return names[template] || template;
}

// Generate schedule
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

    let html = '<tr><th>Hora</th>';
    days.forEach(day => html += '<th>' + day + '</th>');
    html += '</tr>';

    hours.forEach(hour => {
        html += '<tr><td>' + hour + '</td>';
        days.forEach(day => {
            html += '<td onclick="toggleCell(this, \'' + day.toLowerCase() + '\', \'' + hour + '\')"></td>';
        });
        html += '</tr>';
    });

    table.innerHTML = html;
}

// Generate university schedule
function generateUniversitySchedule() {
    const table = document.getElementById('scheduleTable');
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    let html = '<tr><th>Hora</th>';
    days.forEach(day => html += '<th>' + day + '</th>');
    html += '</tr>';

    for (let i = 6; i <= 18; i++) {
        html += '<tr><td>' + i + ':00</td>';
        days.forEach(day => {
            const key = day.toLowerCase() + '-' + i;
            const content = scheduleData[key] || '';
            const occupied = content ? 'occupied' : '';
            html += '<td class="' + occupied + '">' + content + '</td>';
        });
        html += '</tr>';
    }

    table.innerHTML = html;
}

// Toggle cell
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

// Add subject to university
function addSubjectToUniversity() {
    const name = document.getElementById('subjectName').value;
    const day = document.getElementById('subjectDay').value;
    const start = document.getElementById('subjectStartTime').value;
    const end = document.getElementById('subjectEndTime').value;

    if (!name || !start || !end) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }

    const startHour = parseInt(start.split(':')[0]);
    const endHour = parseInt(end.split(':')[0]);

    if (startHour >= endHour) {
        showNotification('La hora de inicio debe ser menor que la hora de fin', 'error');
        return;
    }

    for (let i = startHour; i < endHour; i++) {
        const key = day + '-' + i;
        scheduleData[key] = name + '\n' + currentInstructor.name;
    }

    generateUniversitySchedule();
    closeModal('universityModal');
    showNotification('Materia agregada correctamente', 'success');

    document.getElementById('subjectName').value = '';
    document.getElementById('subjectStartTime').value = '';
    document.getElementById('subjectEndTime').value = '';
}

// Save schedule
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
    updateStats();
    showNotification('Horario guardado correctamente', 'success');
    
    // Switch to manage tab to show saved schedule
    setTimeout(() => {
        switchTabProgrammatically('manage');
    }, 1500);
}

// Switch tab programmatically
function switchTabProgrammatically(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-btn')[tab === 'create' ? 0 : 1].classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tab + '-tab').classList.add('active');
    
    if (tab === 'manage') {
        displaySavedSchedules();
    }
}

// Send schedule
function sendSchedule() {
    if (Object.keys(scheduleData).length === 0) {
        showNotification('El horario está vacío', 'error');
        return;
    }
    showNotification('Horario enviado correctamente', 'success');
}

// Clear schedule
function clearSchedule() {
    showConfirm(
        'Se eliminarán todos los datos del horario actual',
        () => {
            scheduleData = {};
            if (currentTemplate === 'university') {
                generateUniversitySchedule();
            } else {
                generateSchedule(currentTemplate);
            }
            showNotification('Horario limpiado correctamente', 'warning');
        },
        '¿Limpiar horario?'
    );
}

// Save new instructor
function saveNewInstructor() {
    const name = document.getElementById('newInstructorName').value;
    const subject = document.getElementById('newInstructorSubject').value;
    const group = document.getElementById('newInstructorGroup').value;
    const id = document.getElementById('newInstructorId').value;
    const email = document.getElementById('newInstructorEmail').value;
    const phone = document.getElementById('newInstructorPhone').value;

    if (!name || !subject || !group || !id) {
        showNotification('Por favor completa los campos obligatorios', 'error');
        return;
    }

    const instructor = { name, subject, group, id, email, phone };
    instructors.push(instructor);
    updateStats();
    displaySavedInstructors();
    clearInstructorForm();
    showNotification('Instructor guardado correctamente', 'success');
}

// Clear instructor form
function clearInstructorForm() {
    document.getElementById('newInstructorName').value = '';
    document.getElementById('newInstructorSubject').value = '';
    document.getElementById('newInstructorGroup').value = '';
    document.getElementById('newInstructorId').value = '';
    document.getElementById('newInstructorEmail').value = '';
    document.getElementById('newInstructorPhone').value = '';
}

// Display saved instructors
function displaySavedInstructors() {
    const container = document.getElementById('savedInstructorsList');
    
    if (instructors.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray); grid-column: 1/-1;">No hay instructores registrados</p>';
        return;
    }

    let html = '';
    instructors.forEach((instructor, index) => {
        html += `
            <div class="item-card">
                <h4>${instructor.name}</h4>
                <p><strong>Materia:</strong> ${instructor.subject}</p>
                <p><strong>Ficha:</strong> ${instructor.group}</p>
                <p><strong>ID:</strong> ${instructor.id}</p>
                ${instructor.email ? '<p><strong>Email:</strong> ' + instructor.email + '</p>' : ''}
                ${instructor.phone ? '<p><strong>Teléfono:</strong> ' + instructor.phone + '</p>' : ''}
                <div class="card-actions">
                    <button class="btn btn-small btn-primary" onclick="useInstructor(${index})">Usar</button>
                    <button class="btn btn-small btn-danger" onclick="deleteInstructor(${index})">Eliminar</button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Use instructor
function useInstructor(index) {
    const instructor = instructors[index];
    document.getElementById('instructorName').value = instructor.name;
    document.getElementById('instructorSubject').value = instructor.subject;
    document.getElementById('instructorGroup').value = instructor.group;
    document.getElementById('instructorId').value = instructor.id;
    validateInstructor();
    showSection('schedules');
}

// Delete instructor
function deleteInstructor(index) {
    showConfirm(
        'Esta acción no se puede deshacer',
        () => {
            instructors.splice(index, 1);
            updateStats();
            displaySavedInstructors();
            showNotification('Instructor eliminado correctamente', 'warning');
        },
        '¿Eliminar instructor?'
    );
}

// Show saved instructors modal
function showSavedInstructors() {
    if (instructors.length === 0) {
        showNotification('No hay instructores guardados', 'error');
        return;
    }

    let html = '<div style="display: grid; gap: 15px;">';
    instructors.forEach((instructor, index) => {
        html += `
            <div style="padding: 15px; border: 2px solid var(--border-color); border-radius: 10px; cursor: pointer; transition: all 0.3s; background: var(--card-bg);" 
                 onclick="useInstructor(${index}); closeModal('instructorModal');"
                 onmouseover="this.style.borderColor='var(--primary)'; this.style.background='var(--hover-bg)';"
                 onmouseout="this.style.borderColor='var(--border-color)'; this.style.background='var(--card-bg)';">
                <h4 style="margin-bottom: 8px; color: var(--text-primary);">${instructor.name}</h4>
                <p style="color: var(--text-secondary); font-size: 14px; margin: 4px 0;"><strong>Materia:</strong> ${instructor.subject}</p>
                <p style="color: var(--text-secondary); font-size: 14px; margin: 4px 0;"><strong>Ficha:</strong> ${instructor.group}</p>
            </div>
        `;
    });
    html += '</div>';

    document.getElementById('instructorModalList').innerHTML = html;
    openModal('instructorModal');
}

// Display saved schedules
function displaySavedSchedules() {
    const container = document.getElementById('savedSchedulesList');
    
    if (schedules.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray); grid-column: 1/-1;">No hay horarios guardados</p>';
        return;
    }

    let html = '';
    schedules.forEach((schedule, index) => {
        const classCount = Object.keys(schedule.data).length;
        html += `
            <div class="item-card">
                <h4>${schedule.instructor.name}</h4>
                <p><strong>Materia:</strong> ${schedule.instructor.subject}</p>
                <p><strong>Ficha:</strong> ${schedule.instructor.group}</p>
                <p><strong>Plantilla:</strong> ${getTemplateName(schedule.template)}</p>
                <p><strong>Clases:</strong> ${classCount}</p>
                <p><strong>Fecha:</strong> ${schedule.date}</p>
                <div class="card-actions">
                    <button class="btn btn-small btn-primary" onclick="viewSchedule(${index})">Ver</button>
                    <button class="btn btn-small btn-warning" onclick="downloadSchedule(${index})">Descargar</button>
                    <button class="btn btn-small btn-danger" onclick="deleteSchedule(${index})">Eliminar</button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// View schedule
function viewSchedule(index) {
    const schedule = schedules[index];
    currentInstructor = schedule.instructor;
    currentTemplate = schedule.template;
    scheduleData = schedule.data;

    document.getElementById('instructorName').value = schedule.instructor.name;
    document.getElementById('instructorSubject').value = schedule.instructor.subject;
    document.getElementById('instructorGroup').value = schedule.instructor.group;
    document.getElementById('instructorId').value = schedule.instructor.id;

    // Switch to create tab
    switchTabProgrammatically('create');
    selectTemplate(schedule.template);
}

// Download schedule
function downloadSchedule(index) {
    const schedule = schedules[index];
    const dataStr = JSON.stringify(schedule, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'horario_' + schedule.instructor.name.replace(/\s/g, '_') + '.json';
    link.click();
    showNotification('Horario descargado', 'success');
}

// Delete schedule
function deleteSchedule(index) {
    showConfirm(
        'Esta acción no se puede deshacer',
        () => {
            schedules.splice(index, 1);
            updateStats();
            displaySavedSchedules();
            showNotification('Horario eliminado correctamente', 'warning');
        },
        '¿Eliminar horario?'
    );
}

// Save new ambience
function saveNewAmbience() {
    const name = document.getElementById('newAmbienceName').value;
    const type = document.getElementById('newAmbienceType').value;
    const capacity = document.getElementById('newAmbienceCapacity').value;

    if (!name || !capacity) {
        showNotification('Por favor completa todos los campos', 'error');
        return;
    }

    const ambience = { name, type, capacity };
    ambiences.push(ambience);
    updateStats();
    displaySavedAmbiences();
    clearAmbienceForm();
    showNotification('Ambiente guardado correctamente', 'success');
}

// Clear ambience form
function clearAmbienceForm() {
    document.getElementById('newAmbienceName').value = '';
    document.getElementById('newAmbienceType').value = 'aula';
    document.getElementById('newAmbienceCapacity').value = '';
}

// Display saved ambiences
function displaySavedAmbiences() {
    const container = document.getElementById('savedAmbiencesList');
    
    if (ambiences.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray); grid-column: 1/-1;">No hay ambientes registrados</p>';
        return;
    }

    let html = '';
    ambiences.forEach((ambience, index) => {
        const typeEmoji = ambience.type === 'laboratorio' ? '🔬' : ambience.type === 'taller' ? '🔧' : '📚';
        html += `
            <div class="item-card">
                <h4>${typeEmoji} ${ambience.name}</h4>
                <p><strong>Tipo:</strong> ${ambience.type.charAt(0).toUpperCase() + ambience.type.slice(1)}</p>
                <p><strong>Capacidad:</strong> ${ambience.capacity} estudiantes</p>
                <div class="card-actions">
                    <button class="btn btn-small btn-primary" onclick="editAmbience(${index})">Editar</button>
                    <button class="btn btn-small btn-danger" onclick="deleteAmbience(${index})">Eliminar</button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Edit ambience
function editAmbience(index) {
    const ambience = ambiences[index];
    document.getElementById('newAmbienceName').value = ambience.name;
    document.getElementById('newAmbienceType').value = ambience.type;
    document.getElementById('newAmbienceCapacity').value = ambience.capacity;
    deleteAmbience(index);
}

// Delete ambience
function deleteAmbience(index) {
    showConfirm(
        'Esta acción no se puede deshacer',
        () => {
            ambiences.splice(index, 1);
            updateStats();
            displaySavedAmbiences();
            showNotification('Ambiente eliminado correctamente', 'warning');
        },
        '¿Eliminar ambiente?'
    );
}

// Modal functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Show notification with Font Awesome icons
function showNotification(message, type = 'success') {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    
    // Define icons and titles based on type
    const config = {
        success: {
            icon: 'fa-circle-check',
            title: '¡Éxito!'
        },
        error: {
            icon: 'fa-circle-xmark',
            title: 'Error'
        },
        warning: {
            icon: 'fa-triangle-exclamation',
            title: 'Advertencia'
        },
        info: {
            icon: 'fa-circle-info',
            title: 'Información'
        }
    };
    
    const currentConfig = config[type] || config.info;
    
    // Build notification HTML
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${currentConfig.icon}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${currentConfig.title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Confirm dialog with icons
function showConfirm(message, onConfirm, title = '¿Estás seguro?') {
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';
    
    dialog.innerHTML = `
        <div class="confirm-icon">
            <i class="fas fa-question-circle"></i>
        </div>
        <div class="confirm-title">${title}</div>
        <div class="confirm-message">${message}</div>
        <div class="confirm-buttons">
            <button class="btn btn-secondary confirm-cancel">
                <i class="fas fa-times"></i> Cancelar
            </button>
            <button class="btn btn-primary confirm-accept">
                <i class="fas fa-check"></i> Confirmar
            </button>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Trigger animation
    setTimeout(() => overlay.classList.add('show'), 10);
    
    // Event listeners
    const cancelBtn = dialog.querySelector('.confirm-cancel');
    const acceptBtn = dialog.querySelector('.confirm-accept');
    
    cancelBtn.onclick = () => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    };
    
    acceptBtn.onclick = () => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
        if (onConfirm) onConfirm();
    };
    
    // Close on overlay click
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('show');
            setTimeout(() => overlay.remove(), 300);
        }
    };
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}