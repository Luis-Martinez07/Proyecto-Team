// ========================================
// TOGGLE SIDEBAR (MOBILE)
// ========================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay') || document.querySelector('.sidebar-overlay');
    
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
    
    if (overlay) {
        overlay.classList.toggle('active');
    }
}

// Cerrar sidebar al hacer clic en un nav-item (mobile)
document.addEventListener('DOMContentLoaded', function() {
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function() {
                const sidebar = document.getElementById('sidebar');
                const overlay = document.getElementById('sidebarOverlay') || document.querySelector('.sidebar-overlay');
                
                if (sidebar && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                    if (overlay) overlay.classList.remove('active');
                }
            });
        });
    }
});

// ========================================
// TOGGLE DROPDOWN DE MI CUENTA
// ========================================
function toggleDropdown() {
    const dropdownMenu = document.getElementById('navDropdownMenu');
    const dropdownToggle = document.querySelector('.nav-dropdown-toggle');
    
    if (dropdownMenu) {
        dropdownMenu.classList.toggle('active');
    }
    
    if (dropdownToggle) {
        dropdownToggle.classList.toggle('active');
    }
}

// Cerrar dropdown al hacer click fuera
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.nav-dropdown-container');
    const dropdownMenu = document.getElementById('navDropdownMenu');
    const dropdownToggle = document.querySelector('.nav-dropdown-toggle');
    
    if (dropdown && !dropdown.contains(event.target)) {
        if (dropdownMenu) dropdownMenu.classList.remove('active');
        if (dropdownToggle) dropdownToggle.classList.remove('active');
    }
});

// ========================================
// LOGOUT CON CONFIRMACIÓN MEJORADA
// ========================================
function logout() {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';
    
    // Crear dialog
    const dialog = document.createElement('div');
    dialog.className = 'custom-alert-dialog';
    dialog.innerHTML = `
        <div class="custom-alert-icon">
            <i class="fas fa-sign-out-alt"></i>
        </div>
        <h2 class="custom-alert-title">¿Cerrar Sesión?</h2>
        <p class="custom-alert-message">¿Estás seguro de que deseas cerrar tu sesión?</p>
        <div class="custom-alert-buttons">
            <button class="custom-alert-btn cancel-btn" onclick="closeLogoutAlert()">
                <i class="fa-solid fa-circle-xmark"></i>
                Cancelar
            </button>
            <button class="custom-alert-btn confirm-btn" onclick="confirmLogout()">
                <i class="fas fa-check-circle"></i>
                Cerrar Sesión
            </button>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Mostrar con animación
    setTimeout(() => overlay.classList.add('show'), 10);
}

function closeLogoutAlert() {
    const overlay = document.querySelector('.custom-alert-overlay');
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    }
}

function confirmLogout() {
    const overlay = document.querySelector('.custom-alert-overlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
    
    // Mostrar notificación de cierre
    showLogoutNotification();
    
    // Redirigir después de 1 segundo
    setTimeout(() => {
        window.location.href = '?logout=true';
    }, 1000);
}

function showLogoutNotification() {
    const notification = document.createElement('div');
    notification.className = 'logout-notification';
    notification.innerHTML = `
        <div class="logout-icon">
            <i class="fas fa-door-open"></i>
        </div>
        <div class="logout-text">
            <div class="logout-title">Cerrando sesión...</div>
            <div class="logout-message">Hasta pronto</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
}

// ========================================
// CAMBIAR TEMA (CLARO/OSCURO)
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const themeLabel = document.querySelector('.theme-label');
    
    if (!themeToggle || !themeIcon) return;
    
    // Cargar tema guardado o usar 'light' por defecto
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
    
    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-moon';
            if (themeLabel) themeLabel.textContent = 'Modo Oscuro';
        } else {
            themeIcon.className = 'fas fa-sun';
            if (themeLabel) themeLabel.textContent = 'Modo Claro';
        }
    }
});

// ========================================
// NAVEGACIÓN ENTRE SECCIONES
// ========================================
function showSection(sectionName) {
    // Remover clase active de todos los nav-items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Buscar y activar el nav-item correspondiente
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        const itemText = item.textContent.toLowerCase();
        if ((sectionName === 'schedules' && itemText.includes('horarios')) ||
            (sectionName === 'classes' && itemText.includes('reporte')) ||
            (sectionName === 'students' && itemText.includes('estudiantes')) ||
            (sectionName === 'dashboard' && itemText.includes('dashboard'))) {
            item.classList.add('active');
        }
    });
    
    console.log('Navegando a sección:', sectionName);
    
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Scroll suave hacia arriba al cambiar de sección
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Si es la sección de horarios, mostrar la vista principal por defecto
    if (sectionName === 'schedules') {
        showScheduleView('main');
    }
}

// ========================================
// ACTUALIZAR BADGES DE NAVEGACIÓN
// ========================================
function updateBadges() {
    // Para Coordinador
    const instructorBadge = document.getElementById('instructorBadge');
    const ambienceBadge = document.getElementById('ambienceBadge');
    
    // Para Instructor
    const classesBadge = document.getElementById('classesBadge');
    const studentsBadge = document.getElementById('studentsBadge');
    
    // Aquí puedes hacer una petición AJAX para obtener los números reales
    // Por ahora usamos valores de ejemplo
    if (instructorBadge) {
        instructorBadge.textContent = '5';
    }
    
    if (ambienceBadge) {
        ambienceBadge.textContent = '12';
    }
    
    if (classesBadge) {
        classesBadge.textContent = '3';
    }
    
    if (studentsBadge) {
        studentsBadge.textContent = '45';
    }
}

// Actualizar badges al cargar la página
document.addEventListener('DOMContentLoaded', updateBadges);

// ========================================
// MENSAJE DE BIENVENIDA
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const fromLogin = urlParams.get('fromLogin');
    
    if (fromLogin === 'true') {
        const welcomeMsg = document.getElementById('welcomeMessage');
        
        if (welcomeMsg) {
            welcomeMsg.classList.add('show');
            
            // Ocultar después de 5 segundos
            setTimeout(() => {
                welcomeMsg.classList.remove('show');
            }, 5000);
        }
        
        // Limpiar el parámetro de la URL sin recargar
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});

// ========================================
// ACTUALIZAR STATS (Dashboard)
// ========================================
function updateStats() {
    // Actualizar estadísticas del dashboard
    const totalClasses = document.getElementById('totalClasses');
    const totalStudents = document.getElementById('totalStudents');
    const totalSchedules = document.getElementById('totalSchedules');
    
    // Aquí puedes hacer peticiones AJAX para obtener datos reales
    if (totalClasses) totalClasses.textContent = '8';
    if (totalStudents) totalStudents.textContent = '156';
    if (totalSchedules) totalSchedules.textContent = '12';
}

// Actualizar stats al cargar
document.addEventListener('DOMContentLoaded', updateStats);

// ========================================
// FUNCIONES DE HORARIOS
// ========================================

function showScheduleView(view) {
    // Ocultar todas las vistas
    document.querySelectorAll('.schedules-view').forEach(v => v.classList.remove('active'));
    
    // Mostrar la vista seleccionada
    const viewMap = {
        'main': 'schedules-main',
        'create': 'schedules-create',
        'view': 'schedules-view'
    };
    
    const viewId = viewMap[view];
    if (viewId) {
        const viewElement = document.getElementById(viewId);
        if (viewElement) {
            viewElement.classList.add('active');
        }
    }
}

function generateScheduleGrid() {
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const blockDuration = parseInt(document.getElementById('blockDuration').value);
    const breakDuration = parseInt(document.getElementById('breakDuration').value);
    
    if (!startTime || !endTime) {
        alert('Por favor completa todos los campos requeridos');
        return;
    }
    
    // Convertir horas a minutos
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    
    if (startMinutes >= endMinutes) {
        alert('La hora de fin debe ser mayor que la hora de inicio');
        return;
    }
    
    // Generar bloques de tiempo
    const timeSlots = [];
    let currentTime = startMinutes;
    
    while (currentTime + blockDuration <= endMinutes) {
        const blockStart = formatTime(currentTime);
        const blockEnd = formatTime(currentTime + blockDuration);
        timeSlots.push({ start: blockStart, end: blockEnd });
        currentTime += blockDuration + breakDuration;
    }
    
    if (timeSlots.length === 0) {
        alert('No se pueden generar bloques con esta configuración. Verifica las horas y duraciones.');
        return;
    }
    
    // Obtener días seleccionados
    const days = [];
    const dayCheckboxes = document.querySelectorAll('.day-checkbox input');
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    dayCheckboxes.forEach((checkbox, index) => {
        if (checkbox.checked) {
            days.push(dayNames[index]);
        }
    });
    
    if (days.length === 0) {
        alert('Selecciona al menos un día de la semana');
        return;
    }
    
    // Generar tabla
    const tableBody = document.getElementById('scheduleTableBody');
    if (!tableBody) {
        console.error('No se encontró el elemento scheduleTableBody');
        return;
    }
    
    tableBody.innerHTML = '';
    
    timeSlots.forEach(slot => {
        const row = document.createElement('tr');
        
        // Celda de hora
        const timeCell = document.createElement('td');
        timeCell.className = 'time-cell';
        timeCell.textContent = `${slot.start} - ${slot.end}`;
        row.appendChild(timeCell);
        
        // Celdas para cada día
        days.forEach(day => {
            const cell = document.createElement('td');
            cell.className = 'schedule-cell';
            cell.onclick = function() { openAssignModal(this); };
            cell.innerHTML = '<div class="empty-cell"><i class="fa-solid fa-plus"></i></div>';
            row.appendChild(cell);
        });
        
        tableBody.appendChild(row);
    });
    
    // Actualizar encabezados de la tabla
    const thead = document.querySelector('#scheduleGridCard .schedule-table thead tr');
    if (thead) {
        thead.innerHTML = '<th class="time-column">Hora</th>';
        days.forEach(day => {
            const th = document.createElement('th');
            th.textContent = day;
            thead.appendChild(th);
        });
    }
    
    // Mostrar la tarjeta con la tabla generada
    const scheduleGridCard = document.getElementById('scheduleGridCard');
    if (scheduleGridCard) {
        scheduleGridCard.style.display = 'block';
        
        // Scroll suave hacia la tabla
        setTimeout(() => {
            scheduleGridCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

function formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

let currentCell = null;

function openAssignModal(cell) {
    if (!cell) return;
    
    currentCell = cell;
    const modal = document.getElementById('assignModal');
    
    if (modal) {
        modal.classList.add('active');
        
        // Limpiar campos
        const modalSubject = document.getElementById('modalSubject');
        const modalInstructor = document.getElementById('modalInstructor');
        const modalRoom = document.getElementById('modalRoom');
        const modalNotes = document.getElementById('modalNotes');
        
        if (modalSubject) modalSubject.value = '';
        if (modalInstructor) modalInstructor.value = '';
        if (modalRoom) modalRoom.value = '';
        if (modalNotes) modalNotes.value = '';
    }
}

function closeAssignModal() {
    const modal = document.getElementById('assignModal');
    if (modal) {
        modal.classList.remove('active');
    }
    currentCell = null;
}

function assignClass() {
    const subject = document.getElementById('modalSubject');
    const instructor = document.getElementById('modalInstructor');
    const room = document.getElementById('modalRoom');
    const notes = document.getElementById('modalNotes');
    
    if (!subject || !instructor || !room) {
        console.error('No se encontraron los campos del modal');
        return;
    }
    
    if (!subject.value || !instructor.value || !room.value) {
        alert('Por favor completa todos los campos requeridos');
        return;
    }
    
    if (!currentCell) {
        alert('Error: No se ha seleccionado una celda');
        return;
    }
    
    // Obtener texto del instructor
    const instructorText = instructor.options[instructor.selectedIndex].text;
    const subjectText = subject.options[subject.selectedIndex].text;
    
    // Colores por materia
    const subjectColors = {
        'matematicas': { bg: 'rgba(66, 133, 244, 0.1)', border: '#4285f4' },
        'fisica': { bg: 'rgba(52, 168, 83, 0.1)', border: '#34a853' },
        'quimica': { bg: 'rgba(251, 188, 4, 0.1)', border: '#fbbc04' },
        'ingles': { bg: 'rgba(234, 67, 53, 0.1)', border: '#ea4335' },
        'historia': { bg: 'rgba(156, 39, 176, 0.1)', border: '#9c27b0' }
    };
    
    const colors = subjectColors[subject.value] || { bg: 'rgba(66, 133, 244, 0.1)', border: '#4285f4' };
    
    // Crear contenido de la celda
    currentCell.className = 'schedule-cell assigned';
    currentCell.style.background = colors.bg;
    currentCell.style.borderLeft = `3px solid ${colors.border}`;
    
    const notesValue = notes ? notes.value : '';
    
    currentCell.innerHTML = `
        <div class="assigned-cell">
            <div class="cell-title">${subjectText}</div>
            <div class="cell-info">
                <i class="fa-solid fa-user"></i> ${instructorText}
            </div>
            <div class="cell-info">
                <i class="fa-solid fa-door-open"></i> ${room.value}
            </div>
            ${notesValue ? `<div class="cell-info"><i class="fa-solid fa-note-sticky"></i> ${notesValue}</div>` : ''}
            <button class="cell-remove" onclick="event.stopPropagation(); removeAssignment(this)">
                <i class="fa-solid fa-times"></i>
            </button>
        </div>
    `;
    
    // Guardar datos en la celda para persistencia
    currentCell.dataset.subject = subject.value;
    currentCell.dataset.instructor = instructor.value;
    currentCell.dataset.room = room.value;
    currentCell.dataset.notes = notesValue;
    
    closeAssignModal();
}

function removeAssignment(button) {
    const cell = button.closest('.schedule-cell');
    if (!cell) return;
    
    cell.className = 'schedule-cell';
    cell.style.background = '';
    cell.style.borderLeft = '';
    cell.innerHTML = '<div class="empty-cell"><i class="fa-solid fa-plus"></i></div>';
    cell.onclick = function() { openAssignModal(this); };
    
    // Limpiar datos
    delete cell.dataset.subject;
    delete cell.dataset.instructor;
    delete cell.dataset.room;
    delete cell.dataset.notes;
}

function saveSchedule() {
    const scheduleName = document.getElementById('scheduleName');
    
    if (!scheduleName || !scheduleName.value) {
        alert('Por favor ingresa un nombre para el horario');
        return;
    }
    
    // Verificar que haya al menos una clase asignada
    const assignedCells = document.querySelectorAll('.schedule-cell.assigned');
    if (assignedCells.length === 0) {
        alert('Debes asignar al menos una clase antes de guardar');
        return;
    }
    
    // Recopilar datos del horario
    const scheduleData = {
        name: scheduleName.value,
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value,
        blockDuration: document.getElementById('blockDuration').value,
        breakDuration: document.getElementById('breakDuration').value,
        days: [],
        assignments: []
    };
    
    // Obtener días seleccionados
    const dayCheckboxes = document.querySelectorAll('.day-checkbox input');
    const dayNames = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    dayCheckboxes.forEach((checkbox, index) => {
        if (checkbox.checked) {
            scheduleData.days.push(dayNames[index]);
        }
    });
    
    // Obtener asignaciones
    const rows = document.querySelectorAll('#scheduleTableBody tr');
    rows.forEach((row, rowIndex) => {
        const timeCell = row.querySelector('.time-cell');
        if (timeCell) {
            const timeCellText = timeCell.textContent;
            const cells = row.querySelectorAll('.schedule-cell');
            
            cells.forEach((cell, cellIndex) => {
                if (cell.classList.contains('assigned')) {
                    scheduleData.assignments.push({
                        time: timeCellText,
                        day: scheduleData.days[cellIndex] || 'unknown',
                        subject: cell.dataset.subject || '',
                        instructor: cell.dataset.instructor || '',
                        room: cell.dataset.room || '',
                        notes: cell.dataset.notes || ''
                    });
                }
            });
        }
    });
    
    console.log('Guardando horario:', scheduleData);
    
    // Aquí harías la petición AJAX a tu backend PHP
    /*
    fetch('save_schedule.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Horario guardado exitosamente');
            showScheduleView('main');
        } else {
            alert('Error al guardar: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al guardar el horario');
    });
    */
    
    alert('Horario guardado exitosamente');
    showScheduleView('main');
}

function viewSchedule(id) {
    console.log('Ver horario ID:', id);
    // Aquí cargarías los datos del horario desde el servidor
    showScheduleView('view');
}

function editSchedule(id) {
    console.log('Editar horario ID:', id);
    // Aquí cargarías los datos del horario para editar
    showScheduleView('create');
}

function deleteSchedule(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este horario?')) {
        console.log('Eliminar horario ID:', id);
        // Aquí harías la petición para eliminar
        /*
        fetch('delete_schedule.php?id=' + id, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Horario eliminado exitosamente');
                location.reload();
            } else {
                alert('Error al eliminar: ' + data.message);
            }
        });
        */
        alert('Horario eliminado (funcionalidad de demostración)');
    }
}

// ========================================
// EVENT LISTENERS
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    // Cerrar modal al hacer clic fuera de él
    document.addEventListener('click', function(event) {
        const modal = document.getElementById('assignModal');
        if (modal && event.target === modal) {
            closeAssignModal();
        }
    });
    
    // Validar que la hora de fin sea mayor que la de inicio
    const endTimeInput = document.getElementById('endTime');
    if (endTimeInput) {
        endTimeInput.addEventListener('change', function() {
            const startTimeInput = document.getElementById('startTime');
            if (!startTimeInput) return;
            
            const startTime = startTimeInput.value;
            const endTime = this.value;
            
            if (startTime && endTime && endTime <= startTime) {
                alert('La hora de fin debe ser mayor que la hora de inicio');
                this.value = '';
            }
        });
    }
});