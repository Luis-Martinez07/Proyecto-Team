// ========================================
// VARIABLES GLOBALES
// ========================================
let currentDate = new Date();
let selectedDate = new Date();
let horarioEnEdicion = null;
let currentCell = null;

// Time Picker Variables
const timePickerData = {
    start: {
        currentDate: new Date(),
        selectedDate: null,
        selectedTime: null
    },
    end: {
        currentDate: new Date(),
        selectedDate: null,
        selectedTime: null
    }
};

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateBadges();
    updateStats();
    checkWelcomeMessage();
    
    // Inicializar time pickers después de un pequeño delay
    setTimeout(() => {
        initializeTimePickers();
    }, 300);
});

function initializeTimePickers() {
    const startTimeInput = document.getElementById('scheduleStartTime');
    const endTimeInput = document.getElementById('scheduleEndTime');
    
    if (startTimeInput) {
        console.log('Inicializando time picker start');
        initTimePicker('start');
        renderTimeCalendar('start');
    }
    
    if (endTimeInput) {
        console.log('Inicializando time picker end');
        initTimePicker('end');
        renderTimeCalendar('end');
    }
}

function initializeApp() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function setupEventListeners() {
    const modal = document.getElementById('assignModal');
    if (modal) {
        document.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeAssignModal();
            }
        });
    }
    
    document.addEventListener('click', function(event) {
        const dropdown = document.querySelector('.nav-dropdown-container');
        if (dropdown && !dropdown.contains(event.target)) {
            closeDropdown();
        }
    });
    
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', closeMobileSidebar);
        });
    }
}

// ========================================
// TIME PICKER - INICIALIZACIÓN
// ========================================
function initTimePicker(type) {
    const input = document.getElementById(type === 'start' ? 'scheduleStartTime' : 'scheduleEndTime');
    const dropdown = document.getElementById(type + 'TimeDropdown');

    if (!input || !dropdown) return;

    input.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllTimeDropdowns();
        
        // Posicionar el dropdown
        const rect = input.getBoundingClientRect();
        const dropdownHeight = 500; // Altura máxima del dropdown
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        // Decidir si mostrar arriba o abajo
        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
            // Mostrar arriba
            dropdown.style.top = 'auto';
            dropdown.style.bottom = (window.innerHeight - rect.top + 5) + 'px';
        } else {
            // Mostrar abajo
            dropdown.style.top = (rect.bottom + 5) + 'px';
            dropdown.style.bottom = 'auto';
        }
        
        // Posicionar horizontalmente
        dropdown.style.left = rect.left + 'px';
        
        // Ajustar si se sale por la derecha
        const dropdownWidth = 520; // Ancho aproximado del dropdown
        if (rect.left + dropdownWidth > window.innerWidth) {
            dropdown.style.left = (window.innerWidth - dropdownWidth - 20) + 'px';
        }
        
        dropdown.classList.add('active');
        renderTimeCalendar(type);
        renderTimeSlots(type);
    });

    generateTimeSlots(type);
}

function closeAllTimeDropdowns() {
    document.querySelectorAll('.time-picker-dropdown').forEach(d => {
        d.classList.remove('active');
        // limpiar posición inline si se puso
        d.style.top = '';
        d.style.bottom = '';
        d.style.left = '';
    });
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.time-picker-wrapper')) {
        closeAllTimeDropdowns();
    }
});

// ========================================
// TIME PICKER - CALENDARIO
// ========================================
function renderTimeCalendar(type) {
    const date = timePickerData[type].currentDate;
    const year = date.getFullYear();
    const month = date.getMonth();

    const monthElement = document.getElementById(type + 'CalendarMonth');
    if (monthElement) {
        monthElement.textContent = `${monthNames[month]} ${year}`;
    }

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const daysContainer = document.getElementById(type + 'CalendarDays');
    if (!daysContainer) return;

    daysContainer.innerHTML = '';

    // Días del mes anterior
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayEl = createTimeDayElement(day, true, type, year, month - 1);
        daysContainer.appendChild(dayEl);
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = createTimeDayElement(day, false, type, year, month);
        daysContainer.appendChild(dayEl);
    }

    // Días del mes siguiente
    const remainingDays = 42 - daysContainer.children.length;
    for (let day = 1; day <= remainingDays; day++) {
        const dayEl = createTimeDayElement(day, true, type, year, month + 1);
        daysContainer.appendChild(dayEl);
    }
}

function createTimeDayElement(day, isOtherMonth, type, year, month) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    dayEl.textContent = day;

    if (isOtherMonth) dayEl.classList.add('other-month');

    const selectedDate = timePickerData[type].selectedDate;
    if (selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === month && 
        selectedDate.getFullYear() === year &&
        !isOtherMonth) {
        dayEl.classList.add('selected');
    }

    const today = new Date();
    if (!isOtherMonth &&
        today.getDate() === day && 
        today.getMonth() === month && 
        today.getFullYear() === year) {
        dayEl.classList.add('today');
    }

    dayEl.addEventListener('click', (e) => {
        e.stopPropagation(); // <- importante
        timePickerData[type].selectedDate = new Date(year, month, day);
        renderTimeCalendar(type);
        updateTimeInput(type);

        // si ya hay hora, cerrar el dropdown correspondiente
        if (timePickerData[type].selectedTime) {
            const dropdown = document.getElementById(type + 'TimeDropdown');
            if (dropdown) {
                dropdown.classList.remove('active');
                dropdown.style.top = '';
                dropdown.style.bottom = '';
                dropdown.style.left = '';
            }
        }
    });

    return dayEl;
}


function selectTimeSlot(timeValue, timeDisplay, type) {
    timePickerData[type].selectedTime = { value: timeValue, display: timeDisplay };
    renderTimeSlots(type);
    updateTimeInput(type);

    // ✅ Si también se ha elegido una fecha, cerrar el dropdown manualmente
    if (timePickerData[type].selectedDate) {
        const dropdown = document.getElementById(type + 'TimeDropdown');
        if (dropdown) dropdown.classList.remove('active');
    }
}


function changeMonth(delta, type) {
    const date = timePickerData[type].currentDate;
    date.setMonth(date.getMonth() + delta);
    renderTimeCalendar(type);
}

function selectToday(type) {
    timePickerData[type].selectedDate = new Date();
    timePickerData[type].currentDate = new Date();
    renderTimeCalendar(type);
    updateTimeInput(type);
}

function clearSelection(type) {
    timePickerData[type].selectedDate = null;
    timePickerData[type].selectedTime = null;
    const input = document.getElementById(type === 'start' ? 'scheduleStartTime' : 'scheduleEndTime');
    if (input) {
        input.value = '';
        delete input.dataset.timeValue;
    }
    renderTimeCalendar(type);
    renderTimeSlots(type);
}

// ========================================
// TIME PICKER - HORAS
// ========================================
function generateTimeSlots(type) {
    const container = document.getElementById(type + 'TimeSlots');
    if (!container) return;

    const times = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let min = 0; min < 60; min += 30) {
            const isPM = hour >= 12;
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            const displayMin = min.toString().padStart(2, '0');
            const period = isPM ? 'PM' : 'AM';
            const timeValue = `${hour.toString().padStart(2, '0')}:${displayMin}`;
            const timeDisplay = `${displayHour.toString().padStart(2, '0')}:${displayMin} ${period}`;
            times.push({ value: timeValue, display: timeDisplay });
        }
    }

    container.innerHTML = ''; // vaciar

    times.forEach(time => {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.textContent = time.display;

        // evitar burbujeo y manejar selección
        slot.addEventListener('click', (e) => {
            e.stopPropagation();
            selectTimeSlot(time.value, time.display, type);
            // cerrar el dropdown si ya hay fecha seleccionada (seguro)
            if (timePickerData[type].selectedDate) {
                const dropdown = document.getElementById(type + 'TimeDropdown');
                if (dropdown) {
                    dropdown.classList.remove('active');
                    dropdown.style.top = '';
                    dropdown.style.bottom = '';
                    dropdown.style.left = '';
                }
            }
        });

        container.appendChild(slot);
    });
}

function selectTimeSlot(timeValue, timeDisplay, type) {
    timePickerData[type].selectedTime = { value: timeValue, display: timeDisplay };
    renderTimeSlots(type);
    updateTimeInput(type);
    closeAllTimeDropdowns(); // ✅ Cierra el selector después de elegir la hora
}

function renderTimeSlots(type) {
    const selectedTime = timePickerData[type].selectedTime;
    const slots = document.querySelectorAll(`#${type}TimeSlots .time-slot`);
    
    slots.forEach(slot => {
        if (selectedTime && slot.textContent === selectedTime.display) {
            slot.classList.add('selected');
        } else {
            slot.classList.remove('selected');
        }
    });
}

function updateTimeInput(type) {
    const picker = timePickerData[type];
    const input = document.getElementById(type === 'start' ? 'scheduleStartTime' : 'scheduleEndTime');

    if (!input) return;

    if (picker.selectedDate && picker.selectedTime) {
        const date = picker.selectedDate;
        const dateStr = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        input.value = `${dateStr} - ${picker.selectedTime.display}`;
        input.dataset.timeValue = picker.selectedTime.value;
    }
}

function convertTo12Hour(time24) {
    const [hour, min] = time24.split(':').map(Number);
    const isPM = hour >= 12;
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const period = isPM ? 'PM' : 'AM';
    return `${displayHour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')} ${period}`;
}

// ========================================
// NAVEGACIÓN Y SIDEBAR
// ========================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay') || document.querySelector('.sidebar-overlay');
    
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}

function closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay') || document.querySelector('.sidebar-overlay');
    
    if (sidebar && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }
}

function showSection(sectionName) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        const itemText = item.textContent.toLowerCase();
        if ((sectionName === 'schedules' && itemText.includes('horarios')) ||
            (sectionName === 'appointments' && itemText.includes('agendar')) ||
            (sectionName === 'classes' && itemText.includes('reporte')) ||
            (sectionName === 'students' && itemText.includes('estudiantes')) ||
            (sectionName === 'dashboard' && itemText.includes('dashboard'))) {
            item.classList.add('active');
        }
    });
    
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    if (sectionName === 'schedules') {
        showScheduleView('main');
        cargarHorariosDesdeDB();
    } else if (sectionName === 'appointments') {
        setTimeout(initializeAppointmentSection, 100);
    }
}

// ========================================
// TEMA CLARO/OSCURO
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
});

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    const themeLabel = document.querySelector('.theme-label');
    
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
    if (themeLabel) {
        themeLabel.textContent = theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro';
    }
}

// ========================================
// DROPDOWN Y LOGOUT
// ========================================
function toggleDropdown() {
    const dropdownMenu = document.getElementById('navDropdownMenu');
    const dropdownToggle = document.querySelector('.nav-dropdown-toggle');
    
    if (dropdownMenu) dropdownMenu.classList.toggle('active');
    if (dropdownToggle) dropdownToggle.classList.toggle('active');
}

function closeDropdown() {
    const dropdownMenu = document.getElementById('navDropdownMenu');
    const dropdownToggle = document.querySelector('.nav-dropdown-toggle');
    
    if (dropdownMenu) dropdownMenu.classList.remove('active');
    if (dropdownToggle) dropdownToggle.classList.remove('active');
}

function logout() {
    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';
    
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
    if (overlay) overlay.classList.remove('show');
    
    showLogoutNotification();
    setTimeout(() => { window.location.href = '?logout=true'; }, 1000);
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
// MENSAJE DE BIENVENIDA Y BADGES
// ========================================
function checkWelcomeMessage() {
    const urlParams = new URLSearchParams(window.location.search);
    const fromLogin = urlParams.get('fromLogin');
    
    if (fromLogin === 'true') {
        const welcomeMsg = document.getElementById('welcomeMessage');
        if (welcomeMsg) {
            welcomeMsg.classList.add('show');
            setTimeout(() => welcomeMsg.classList.remove('show'), 5000);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

function updateBadges() {
    const badges = {
        instructorBadge: '5',
        ambienceBadge: '12',
        classesBadge: '3',
        studentsBadge: '45'
    };
    
    Object.entries(badges).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

function updateStats() {
    const stats = {
        totalClasses: '8',
        totalStudents: '156',
        totalSchedules: '12'
    };
    
    Object.entries(stats).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

// ========================================
// GESTIÓN DE HORARIOS - VISTAS
// ========================================
function showScheduleView(view) {
    document.querySelectorAll('.schedules-view').forEach(v => v.classList.remove('active'));
    
    const viewMap = {
        'main': 'schedules-main',
        'create': 'schedules-create',
        'view': 'schedules-view'
    };
    
    const viewElement = document.getElementById(viewMap[view]);
    if (viewElement) {
        viewElement.classList.add('active');
        if (view === 'create' && !horarioEnEdicion) {
            limpiarFormularioHorario();
        }
    }
}

// ========================================
// GESTIÓN DE HORARIOS - GENERACIÓN
// ========================================
function generateScheduleGrid() {
    const scheduleName = document.getElementById('scheduleName');
    const startTimeInput = document.getElementById('scheduleStartTime');
    const endTimeInput = document.getElementById('scheduleEndTime');
    
    if (!scheduleName || !startTimeInput || !endTimeInput) {
        console.error('Elementos del formulario no encontrados');
        return;
    }
    
    if (!scheduleName.value.trim()) {
        alert('Por favor ingresa un nombre para el horario');
        return;
    }

    if (!startTimeInput.value || !endTimeInput.value) {
        alert('Por favor selecciona las horas de inicio y fin');
        return;
    }

    const startTime = startTimeInput.dataset.timeValue || '07:00';
    const endTime = endTimeInput.dataset.timeValue || '18:00';
    
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const blockDurationValue = 60;
    
    if (startMinutes >= endMinutes) {
        alert('La hora de fin debe ser mayor que la hora de inicio');
        return;
    }
    
    const timeSlots = [];
    let currentTime = startMinutes;
    
    while (currentTime + blockDurationValue <= endMinutes) {
        const blockStart = formatTime(currentTime);
        const blockEnd = formatTime(currentTime + blockDurationValue);
        timeSlots.push({ start: blockStart, end: blockEnd });
        currentTime += blockDurationValue;
    }
    
    if (timeSlots.length === 0) {
        alert('No se pueden generar bloques con esta configuración');
        return;
    }
    
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    
    const tableBody = document.getElementById('scheduleTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    timeSlots.forEach(slot => {
        const row = document.createElement('tr');
        
        const timeCell = document.createElement('td');
        timeCell.className = 'time-cell';
        timeCell.textContent = `${slot.start} - ${slot.end}`;
        row.appendChild(timeCell);
        
        days.forEach(() => {
            const cell = document.createElement('td');
            cell.className = 'schedule-cell';
            cell.onclick = function() { openAssignModal(this); };
            cell.innerHTML = '<div class="empty-cell"><i class="fa-solid fa-plus"></i></div>';
            row.appendChild(cell);
        });
        
        tableBody.appendChild(row);
    });
    
    const thead = document.querySelector('#scheduleGridCard .schedule-table thead tr');
    if (thead) {
        thead.innerHTML = '<th class="time-column">Hora</th>';
        days.forEach(day => {
            const th = document.createElement('th');
            th.textContent = day;
            thead.appendChild(th);
        });
    }
    
    const scheduleGridCard = document.getElementById('scheduleGridCard');
    if (scheduleGridCard) {
        scheduleGridCard.style.display = 'block';
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

// ========================================
// GESTIÓN DE HORARIOS - MODAL
// ========================================
function openAssignModal(cell) {
    if (!cell) return;
    
    currentCell = cell;
    const modal = document.getElementById('assignModal');
    
    if (modal) {
        modal.classList.add('active');
        
        ['modalSubject', 'modalInstructor', 'modalRoom', 'modalNotes'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
    }
}

function closeAssignModal() {
    const modal = document.getElementById('assignModal');
    if (modal) modal.classList.remove('active');
    currentCell = null;
}

function assignClass() {
    const subject = document.getElementById('modalSubject');
    const instructor = document.getElementById('modalInstructor');
    const room = document.getElementById('modalRoom');
    const notes = document.getElementById('modalNotes');
    
    if (!subject || !instructor || !room) {
        console.error('Campos del modal no encontrados');
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
    
    const instructorText = instructor.options[instructor.selectedIndex].text;
    const subjectText = subject.options[subject.selectedIndex].text;
    
    const subjectColors = {
        'matematicas': { bg: 'rgba(66, 133, 244, 0.1)', border: '#4285f4' },
        'fisica': { bg: 'rgba(52, 168, 83, 0.1)', border: '#34a853' },
        'quimica': { bg: 'rgba(251, 188, 4, 0.1)', border: '#fbbc04' },
        'ingles': { bg: 'rgba(234, 67, 53, 0.1)', border: '#ea4335' },
        'historia': { bg: 'rgba(156, 39, 176, 0.1)', border: '#9c27b0' }
    };
    
    const colors = subjectColors[subject.value] || { bg: 'rgba(66, 133, 244, 0.1)', border: '#4285f4' };
    
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
    
    delete cell.dataset.subject;
    delete cell.dataset.instructor;
    delete cell.dataset.room;
    delete cell.dataset.notes;
}

// ========================================
// GESTIÓN DE HORARIOS - BASE DE DATOS
// ========================================
async function cargarHorariosDesdeDB() {
    try {
        const response = await fetch('cargar_horarios.php');
        const data = await response.json();
        
        if (data.success) {
            mostrarHorariosEnGrid(data.horarios);
            actualizarBadgesHorarios(data.horarios);
        } else {
            console.error('Error al cargar horarios:', data.message);
        }
    } catch (error) {
        console.error('Error en la petición:', error);
    }
}

function mostrarHorariosEnGrid(horarios) {
    const container = document.querySelector('.schedules-grid');
    if (!container) return;
    
    if (horarios.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fa-solid fa-calendar-xmark" style="font-size: 64px; color: var(--text-secondary); margin-bottom: 20px;"></i>
                <h3 style="margin-bottom: 10px;">No tienes horarios creados</h3>
                <p style="color: var(--text-secondary);">Crea tu primer horario haciendo clic en "Crear Nuevo Horario"</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = horarios.map(horario => {
        const diasTexto = Array.isArray(horario.dias_activos) ? horario.dias_activos.join(', ') : 'No definido';
        const badgeClass = horario.estado === 'Activo' ? 'badge-success' : 'badge-warning';
        
        return `
            <div class="schedule-card">
                <div class="schedule-card-header">
                    <div>
                        <h3>${horario.nombre || 'Sin nombre'}</h3>
                        <p class="schedule-meta">
                            <i class="fa-solid fa-calendar-days"></i>
                            ${diasTexto} • ${horario.hora_inicio || '00:00'} - ${horario.hora_fin || '00:00'}
                        </p>
                    </div>
                    <span class="badge ${badgeClass}">${horario.estado}</span>
                </div>
                <div class="schedule-card-body">
                    <div class="schedule-stats">
                        <div class="stat-item">
                            <i class="fa-solid fa-book"></i>
                            <span>${horario.total_clases || 0} Clases</span>
                        </div>
                        <div class="stat-item">
                            <i class="fa-solid fa-clock"></i>
                            <span>${horario.bloques || 0} Bloques</span>
                        </div>
                        <div class="stat-item">
                            <i class="fa-solid fa-calendar"></i>
                            <span>${new Date(horario.fecha_creacion).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div class="schedule-card-footer">
                    <button class="btn btn-secondary btn-sm" onclick="verHorarioDB(${horario.id})">
                        <i class="fa-solid fa-eye"></i>
                        Ver Horario
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="editarHorarioDB(${horario.id})">
                        <i class="fa-solid fa-edit"></i>
                        Editar
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarHorarioDB(${horario.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function actualizarBadgesHorarios(horarios) {
    const classesBadge = document.getElementById('classesBadge');
    if (classesBadge) {
        const totalClases = horarios.reduce((sum, h) => sum + (h.total_clases || 0), 0);
        classesBadge.textContent = totalClases;
    }
}

async function saveSchedule() {
    const scheduleName = document.getElementById('scheduleName');
    const startTimeInput = document.getElementById('scheduleStartTime');
    const endTimeInput = document.getElementById('scheduleEndTime');
    
    if (!scheduleName || !scheduleName.value.trim()) {
        alert('Por favor ingresa un nombre para el horario');
        return;
    }
    
    if (!startTimeInput || !endTimeInput) {
        alert('Por favor completa las horas de inicio y fin');
        return;
    }

    if (!startTimeInput.value || !endTimeInput.value) {
        alert('Por favor selecciona las horas de inicio y fin');
        return;
    }

    const startTime = startTimeInput.dataset.timeValue || '07:00';
    const endTime = endTimeInput.dataset.timeValue || '18:00';
    const diasActivos = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
    
    const bloques = [];
    const assignedCells = document.querySelectorAll('.schedule-cell.assigned');
    
    assignedCells.forEach(cell => {
        const row = cell.closest('tr');
        const timeCell = row.querySelector('.time-cell');
        const cellIndex = Array.from(row.querySelectorAll('.schedule-cell')).indexOf(cell);
        
        if (timeCell && cellIndex >= 0 && cellIndex < diasActivos.length) {
            bloques.push({
                dia: diasActivos[cellIndex],
                hora: timeCell.textContent,
                materia: cell.dataset.subject || '',
                instructor: cell.dataset.instructor || '',
                aula: cell.dataset.room || '',
                notas: cell.dataset.notes || ''
            });
        }
    });
    
    const horarioData = {
        id: horarioEnEdicion ? horarioEnEdicion.id : null,
        nombre_horario: scheduleName.value,
        hora_inicio: startTime,
        hora_fin: endTime,
        duracion_bloque: 60,
        dias_activos: diasActivos,
        bloques: bloques,
        template_tipo: 'semanal'
    };
    
    try {
        const response = await fetch('guardar_horario.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(horarioData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
            showScheduleView('main');
            cargarHorariosDesdeDB();
            limpiarFormularioHorario();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error al guardar:', error);
        alert('Error al guardar el horario');
    }
}

async function verHorarioDB(id) {
    try {
        const response = await fetch(`obtener_horario.php?id=${id}`);
        const data = await response.json();
        
        if (data.success) {
            mostrarHorarioVisualizacion(data.horario);
            showScheduleView('view');
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el horario');
    }
}

function mostrarHorarioVisualizacion(horario) {
    const viewSection = document.getElementById('schedules-view');
    if (!viewSection) return;
    
    const header = viewSection.querySelector('.content-header h1');
    if (header) header.textContent = horario.nombre_horario || 'Horario';
    
    const container = viewSection.querySelector('.schedule-view-container');
    if (!container) return;
    
    const diasActivos = horario.dias_activos || [];
    const bloques = horario.bloques || [];
    const horariosUnicos = [...new Set(bloques.map(b => b.hora))].sort();
    
    let theadHTML = '<tr><th class="time-column">Hora</th>';
    diasActivos.forEach(dia => { theadHTML += `<th>${dia}</th>`; });
    theadHTML += '</tr>';
    
    let tbodyHTML = '';
    horariosUnicos.forEach(hora => {
        tbodyHTML += '<tr>';
        tbodyHTML += `<td class="time-cell">${hora}</td>`;
        
        diasActivos.forEach(dia => {
            const bloque = bloques.find(b => b.hora === hora && b.dia === dia);
            
            if (bloque) {
                const colors = getSubjectColors(bloque.materia);
                tbodyHTML += `
                    <td class="schedule-cell assigned view-mode" style="background: ${colors.bg}; border-left: 3px solid ${colors.border}">
                        <div class="assigned-cell">
                            <div class="cell-title">${bloque.materia || 'Sin materia'}</div>
                            <div class="cell-info">
                                <i class="fa-solid fa-door-open"></i> ${bloque.aula || 'Sin aula'}
                            </div>
                            ${bloque.notas ? `<div class="cell-info"><i class="fa-solid fa-note-sticky"></i> ${bloque.notas}</div>` : ''}
                        </div>
                    </td>
                `;
            } else {
                tbodyHTML += '<td class="schedule-cell"></td>';
            }
        });
        
        tbodyHTML += '</tr>';
    });
    
    container.innerHTML = `
        <table class="schedule-table view-mode">
            <thead>${theadHTML}</thead>
            <tbody>${tbodyHTML}</tbody>
        </table>
    `;
}

async function editarHorarioDB(id) {
    try {
        const response = await fetch(`obtener_horario.php?id=${id}`);
        const data = await response.json();
        
        if (data.success) {
            horarioEnEdicion = data.horario;
            cargarDatosEnFormulario(data.horario);
            showScheduleView('create');
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el horario');
    }
}

function cargarDatosEnFormulario(horario) {
    const scheduleName = document.getElementById('scheduleName');
    if (scheduleName) scheduleName.value = horario.nombre_horario || '';
    
    if (horario.hora_inicio) {
        const startInput = document.getElementById('scheduleStartTime');
        if (startInput) {
            const today = new Date();
            const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
            startInput.value = `${dateStr} - ${convertTo12Hour(horario.hora_inicio)}`;
            startInput.dataset.timeValue = horario.hora_inicio;
            
            timePickerData.start.selectedDate = today;
            timePickerData.start.selectedTime = {
                value: horario.hora_inicio,
                display: convertTo12Hour(horario.hora_inicio)
            };
        }
    }
    
    if (horario.hora_fin) {
        const endInput = document.getElementById('scheduleEndTime');
        if (endInput) {
            const today = new Date();
            const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
            endInput.value = `${dateStr} - ${convertTo12Hour(horario.hora_fin)}`;
            endInput.dataset.timeValue = horario.hora_fin;
            
            timePickerData.end.selectedDate = today;
            timePickerData.end.selectedTime = {
                value: horario.hora_fin,
                display: convertTo12Hour(horario.hora_fin)
            };
        }
    }
    
    generateScheduleGrid();
    
    setTimeout(() => {
        if (horario.bloques && Array.isArray(horario.bloques)) {
            horario.bloques.forEach(bloque => cargarBloqueEnCelda(bloque));
        }
    }, 200);
}

function cargarBloqueEnCelda(bloque) {
    const rows = document.querySelectorAll('#scheduleTableBody tr');
    
    rows.forEach(row => {
        const timeCell = row.querySelector('.time-cell');
        if (timeCell && timeCell.textContent === bloque.hora) {
            const cells = row.querySelectorAll('.schedule-cell');
            const thead = document.querySelector('#scheduleGridCard .schedule-table thead tr');
            const headers = thead ? Array.from(thead.querySelectorAll('th')).slice(1) : [];
            
            cells.forEach((cell, index) => {
                if (headers[index] && headers[index].textContent === bloque.dia) {
                    const colors = getSubjectColors(bloque.materia);
                    
                    cell.className = 'schedule-cell assigned';
                    cell.style.background = colors.bg;
                    cell.style.borderLeft = `3px solid ${colors.border}`;
                    
                    cell.innerHTML = `
                        <div class="assigned-cell">
                            <div class="cell-title">${bloque.materia}</div>
                            <div class="cell-info">
                                <i class="fa-solid fa-door-open"></i> ${bloque.aula}
                            </div>
                            ${bloque.notas ? `<div class="cell-info"><i class="fa-solid fa-note-sticky"></i> ${bloque.notas}</div>` : ''}
                            <button class="cell-remove" onclick="event.stopPropagation(); removeAssignment(this)">
                                <i class="fa-solid fa-times"></i>
                            </button>
                        </div>
                    `;
                    
                    cell.dataset.subject = bloque.materia;
                    cell.dataset.instructor = bloque.instructor;
                    cell.dataset.room = bloque.aula;
                    cell.dataset.notes = bloque.notas || '';
                }
            });
        }
    });
}

async function eliminarHorarioDB(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este horario? Esta acción no se puede deshacer.')) {
        return;
    }
    
    try {
        const response = await fetch('eliminar_horario.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(data.message);
            cargarHorariosDesdeDB();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al eliminar el horario');
    }
}

function limpiarFormularioHorario() {
    horarioEnEdicion = null;
    
    const scheduleName = document.getElementById('scheduleName');
    if (scheduleName) scheduleName.value = '';
    
    ['start', 'end'].forEach(type => {
        timePickerData[type].selectedDate = null;
        timePickerData[type].selectedTime = null;
        timePickerData[type].currentDate = new Date();
        
        const input = document.getElementById(type === 'start' ? 'scheduleStartTime' : 'scheduleEndTime');
        if (input) {
            input.value = '';
            delete input.dataset.timeValue;
        }
    });
    
    const scheduleGridCard = document.getElementById('scheduleGridCard');
    if (scheduleGridCard) scheduleGridCard.style.display = 'none';
}

function getSubjectColors(materia) {
    const colors = {
        'matematicas': { bg: 'rgba(66, 133, 244, 0.1)', border: '#4285f4' },
        'fisica': { bg: 'rgba(52, 168, 83, 0.1)', border: '#34a853' },
        'quimica': { bg: 'rgba(251, 188, 4, 0.1)', border: '#fbbc04' },
        'ingles': { bg: 'rgba(234, 67, 53, 0.1)', border: '#ea4335' },
        'historia': { bg: 'rgba(156, 39, 176, 0.1)', border: '#9c27b0' }
    };
    return colors[materia] || { bg: 'rgba(66, 133, 244, 0.1)', border: '#4285f4' };
}

// ========================================
// AGENDAR CITAS - CALENDARIO
// ========================================
function initializeAppointmentSection() {
    if (document.getElementById('calendarDays')) {
        generateCalendar();
        updateSelectedDateDisplay();
    }
}

function generateCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const calendarMonthEl = document.getElementById('calendarMonth');
    if (calendarMonthEl) {
        calendarMonthEl.textContent = `${monthNames[month]} ${year}`;
    }
    
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevLastDate = new Date(year, month, 0).getDate();
    
    const calendarDays = document.getElementById('calendarDays');
    if (!calendarDays) return;
    
    calendarDays.innerHTML = '';
    
    for (let i = firstDay; i > 0; i--) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = prevLastDate - i + 1;
        calendarDays.appendChild(day);
    }
    
    const today = new Date();
    for (let i = 1; i <= lastDate; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.textContent = i;
        
        if (year === today.getFullYear() && month === today.getMonth() && i === today.getDate()) {
            day.classList.add('today');
        }
        
        if (year === selectedDate.getFullYear() && month === selectedDate.getMonth() && i === selectedDate.getDate()) {
            day.classList.add('selected');
        }
        
        day.addEventListener('click', () => selectDate(year, month, i));
        calendarDays.appendChild(day);
    }
    
    const remainingDays = 42 - (firstDay + lastDate);
    for (let i = 1; i <= remainingDays; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = i;
        calendarDays.appendChild(day);
    }
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    generateCalendar();
}

function selectDate(year, month, day) {
    selectedDate = new Date(year, month, day);
    generateCalendar();
    updateSelectedDateDisplay();
}

function selectTodayAppointment() {
    selectedDate = new Date();
    currentDate = new Date();
    generateCalendar();
    updateSelectedDateDisplay();
}

function clearCalendar() {
    document.querySelectorAll('.calendar-day.selected').forEach(el => {
        el.classList.remove('selected');
    });
}

function updateSelectedDateDisplay() {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const dayName = days[selectedDate.getDay()];
    const day = selectedDate.getDate();
    const month = months[selectedDate.getMonth()];
    const year = selectedDate.getFullYear();
    
    const selectedDateEl = document.getElementById('selectedDate');
    if (selectedDateEl) {
        selectedDateEl.textContent = `${dayName} ${day} ${month} ${year}`;
    }
}

function selectTime(element, time) {
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('active');
    });
    element.classList.add('active');
}

// ========================================
// FUNCIONES DE DEMOSTRACIÓN
// ========================================
function viewSchedule(id) {
    console.log('Ver horario ID:', id);
    showScheduleView('view');
}

function editSchedule(id) {
    console.log('Editar horario ID:', id);
    showScheduleView('create');
}

function deleteSchedule(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este horario?')) {
        console.log('Eliminar horario ID:', id);
        alert('Horario eliminado (funcionalidad de demostración)');
    }
}

// ========================================
// LOG DE CONFIRMACIÓN
// ========================================
console.log('✅ Panel JavaScript cargado correctamente');
console.log('✅ Time Picker integrado correctamente');
console.log('✅ Funciones de horarios con BD activas');
console.log('✅ Funciones de calendario de citas activas');