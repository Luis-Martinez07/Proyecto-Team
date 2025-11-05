// ========================================
// VARIABLES GLOBALES
// ========================================
let currentDate = new Date();
let selectedDate = new Date();
let horarioEnEdicion = null;
let currentCell = null;
let blockDuration = 60;
let horarioActualId = null;

// ========================================
// INICIALIZACIÓN
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateBadges();
    checkWelcomeMessage();
    setupDurationDropdown();
});

function initializeApp() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function setupEventListeners() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.time-picker-wrapper') && !e.target.closest('.duration-dropdown')) {
            closeAllConfigDateDropdowns();
        }
    });
}

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    const themeLabel = document.querySelector('.theme-label');
    if (themeIcon) themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    if (themeLabel) themeLabel.textContent = theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro';
}

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
    const badges = { classesBadge: '0', studentsBadge: '0' };
    Object.entries(badges).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

// ========================================
// NAVEGACIÓN
// ========================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
}

function showSection(sectionName) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));

    const navItem = document.querySelector(`.nav-item[onclick*="'${sectionName}'"]`);
    if (navItem) navItem.classList.add('active');

    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (sectionName === 'schedules') {
        showScheduleView('main');
    }
}

function toggleDropdown() {
    const dropdownMenu = document.getElementById('navDropdownMenu');
    if (dropdownMenu) dropdownMenu.classList.toggle('active');
}

function logout() {
    if (confirm('¿Cerrar sesión?')) {
        window.location.href = '?logout=true';
    }
}

// ========================================
// DURACIÓN DROPDOWN
// ========================================
function setupDurationDropdown() {
    const horaInicio = document.getElementById('horaInicio');
    const horaDisplay = document.getElementById('horaDisplay');
    const durationButton = document.getElementById('durationButton');
    const durationText = document.getElementById('durationText');
    const durationMenu = document.getElementById('durationMenu');

    // Actualizar hora
    function updateTimeDisplay() {
        const time = horaInicio.value;
        if (!time) {
            horaDisplay.textContent = '--:--';
            return;
        }
        const [h, m] = time.split(':').map(Number);
        const period = h < 12 ? 'a.m.' : 'p.m.';
        const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
        horaDisplay.textContent = `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
    }

    horaInicio.addEventListener('input', updateTimeDisplay);
    horaInicio.addEventListener('change', updateTimeDisplay);
    updateTimeDisplay();

    // Dropdown
    durationButton.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = durationMenu.classList.contains('show');
        closeAllDropdowns();
        if (!isOpen) {
            durationMenu.classList.add('show');
            durationButton.classList.add('active');
        }
    });

    document.querySelectorAll('.duration-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.duration-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            blockDuration = parseInt(this.dataset.minutes);
            durationText.textContent = this.textContent.trim(); // Solo el texto real
            durationMenu.classList.remove('show');
            durationButton.classList.remove('active');
        });
    });

    function closeAllDropdowns() {
        durationMenu.classList.remove('show');
        durationButton.classList.remove('active');
    }

    document.addEventListener('click', closeAllDropdowns);
}

// ========================================
// GENERAR TABLA
// ========================================
function generateScheduleGrid() {
    const scheduleName = document.getElementById('scheduleName').value.trim();
    const horaInicio = document.getElementById('horaInicio').value;

    if (!scheduleName) return showError('scheduleName', 'Nombre requerido');
    if (!horaInicio) return showError('horaInicio', 'Hora de inicio requerida');

    clearErrors(['scheduleName', 'horaInicio']);

    const [h, m] = horaInicio.split(':').map(Number);
    const start = h * 60 + m;
    const end = start + blockDuration;
    if (end > 1440) return alert('El horario excede el día');

    const timeSlots = [];
    let current = start;
    while (current + blockDuration <= end) {
        timeSlots.push({
            start: formatTime(current),
            end: formatTime(current + blockDuration)
        });
        current += blockDuration;
    }

    const tbody = document.getElementById('scheduleTableBody');
    tbody.innerHTML = '';
    timeSlots.forEach(slot => {
        const tr = document.createElement('tr');
        const tdTime = document.createElement('td');
        tdTime.className = 'time-cell';
        tdTime.textContent = `${slot.start} - ${slot.end}`;
        tr.appendChild(tdTime);

        ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].forEach(() => {
            const td = document.createElement('td');
            td.className = 'schedule-cell';
            td.onclick = () => openAssignModal(td);
            td.innerHTML = '<div class="empty-cell"><i class="fa-solid fa-plus"></i></div>';
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    document.getElementById('scheduleGridCard').style.display = 'block';
}

// ========================================
// GUARDAR HORARIO
// ========================================
async function saveSchedule() {
    const scheduleName = document.getElementById('scheduleName').value.trim();
    const horaInicio = document.getElementById('horaInicio').value;
    if (!scheduleName || !horaInicio) return;

    const [h, m] = horaInicio.split(':').map(Number);
    const horaFin = formatTime(h * 60 + m + blockDuration);

    const bloques = [];
    document.querySelectorAll('.schedule-cell.assigned').forEach(cell => {
        const row = cell.closest('tr');
        const timeCell = row.querySelector('.time-cell').textContent;
        const diaIndex = Array.from(row.cells).indexOf(cell) - 1;
        const dia = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'][diaIndex];
        bloques.push({
            dia,
            hora: timeCell,
            materia: cell.dataset.subject || '',
            instructor: cell.dataset.instructor || '',
            aula: cell.dataset.room || '',
            notas: cell.dataset.notes || ''
        });
    });

    const horarioData = {
        id: horarioEnEdicion?.id || null,
        nombre_horario: scheduleName,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        duracion_bloque: blockDuration,
        dias_activos: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
        bloques,
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
            const nuevoId = data.horario_id || horarioEnEdicion?.id;
            const nuevoHorario = { ...horarioData, id: nuevoId, total_clases: bloques.length, estado: 'Activo' };
            if (horarioEnEdicion) {
                actualizarTarjetaHorario(nuevoHorario);
            } else {
                agregarTarjetaHorario(nuevoHorario);
            }
            showScheduleView('main');
            limpiarFormularioHorario();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        alert('Error al guardar');
    }
}

// ========================================
// TARJETAS DINÁMICAS
// ========================================
function agregarTarjetaHorario(horario) {
    const container = document.getElementById('schedulesGrid');
    const empty = container.querySelector('.empty-state');
    if (empty) empty.remove();

    const dias = horario.dias_activos.join(', ');
    const badge = horario.estado === 'Activo' ? 'badge-success' : 'badge-warning';

    const card = document.createElement('div');
    card.className = 'schedule-card';
    card.dataset.id = horario.id;
    card.innerHTML = `
        <div class="schedule-card-header">
            <div>
                <h3>${horario.nombre_horario}</h3>
                <p class="schedule-meta">
                    <i class="fa-solid fa-calendar-days"></i> ${dias} • ${horario.hora_inicio} - ${horario.hora_fin}
                </p>
            </div>
            <span class="badge ${badge}">${horario.estado}</span>
        </div>
        <div class="schedule-card-body">
            <div class="schedule-stats">
                <div class="stat-item"><i class="fa-solid fa-book"></i><span>${horario.total_clases} Clases</span></div>
                <div class="stat-item"><i class="fa-solid fa-clock"></i><span>${horario.bloques?.length || 0} Bloques</span></div>
            </div>
        </div>
        <div class="schedule-card-footer">
            <button class="btn btn-secondary btn-sm" onclick="verHorarioDB(${horario.id})">Ver</button>
            <button class="btn btn-secondary btn-sm" onclick="editarHorarioDB(${horario.id})">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="eliminarHorarioDB(${horario.id})"></button>
        </div>
    `;
    container.appendChild(card);
}

function actualizarTarjetaHorario(horario) {
    const card = document.querySelector(`.schedule-card[data-id="${horario.id}"]`);
    if (card) {
        const dias = horario.dias_activos.join(', ');
        const badge = horario.estado === 'Activo' ? 'badge-success' : 'badge-warning';
        card.querySelector('h3').textContent = horario.nombre_horario;
        card.querySelector('.schedule-meta').innerHTML = `<i class="fa-solid fa-calendar-days"></i> ${dias} • ${horario.hora_inicio} - ${horario.hora_fin}`;
        card.querySelector('.badge').className = `badge ${badge}`;
        card.querySelector('.badge').textContent = horario.estado;
        card.querySelectorAll('.stat-item span')[0].textContent = `${horario.total_clases} Clases`;
        card.querySelectorAll('.stat-item span')[1].textContent = `${horario.bloques?.length || 0} Bloques`;
    }
}

// ========================================
// VER / EDITAR / ELIMINAR
// ========================================
async function verHorarioDB(id) {
    try {
        const response = await fetch(`obtener_horario.php?id=${id}`);
        const data = await response.json();
        if (data.success) {
            mostrarHorarioVisualizacion(data.horario);
            showScheduleView('view');
            horarioActualId = id;
            document.getElementById('btnEditarDesdeVista').onclick = () => editarHorarioDB(id);
        }
    } catch (error) {
        alert('Error al cargar');
    }
}

function mostrarHorarioVisualizacion(horario) {
    document.getElementById('viewHorarioNombre').textContent = horario.nombre_horario;
    const container = document.getElementById('viewScheduleContainer');
    const dias = horario.dias_activos;
    const bloques = horario.bloques || [];
    const horas = [...new Set(bloques.map(b => b.hora))].sort();

    let html = '<table class="schedule-table view-mode"><thead><tr><th class="time-column">Hora</th>';
    dias.forEach(d => html += `<th>${d}</th>`);
    html += '</tr></thead><tbody>';

    horas.forEach(hora => {
        html += `<tr><td class="time-cell">${hora}</td>`;
        dias.forEach(dia => {
            const b = bloques.find(x => x.hora === hora && x.dia === dia);
            if (b) {
                const colors = getSubjectColors(b.materia);
                html += `<td class="schedule-cell assigned view-mode" style="background:${colors.bg};border-left:3px solid ${colors.border}">
                    <div class="assigned-cell">
                        <div class="cell-title">${b.materia}</div>
                        <div class="cell-info"><i class="fa-solid fa-door-open"></i> ${b.aula}</div>
                        ${b.notas ? `<div class="cell-info"><i class="fa-solid fa-note-sticky"></i> ${b.notas}</div>` : ''}
                    </div>
                </td>`;
            } else {
                html += '<td class="schedule-cell"></td>';
            }
        });
        html += '</tr>';
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

async function editarHorarioDB(id) {
    try {
        const response = await fetch(`obtener_horario.php?id=${id}`);
        const data = await response.json();
        if (data.success) {
            horarioEnEdicion = data.horario;
            cargarDatosEnFormulario(data.horario);
            document.getElementById('createEditTitle').textContent = 'Editar Horario';
            showScheduleView('create');
        }
    } catch (error) {
        alert('Error al cargar');
    }
}

async function eliminarHorarioDB(id) {
    if (!confirm('¿Eliminar este horario?')) return;
    try {
        const response = await fetch('eliminar_horario.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        const data = await response.json();
        if (data.success) {
            const card = document.querySelector(`.schedule-card[data-id="${id}"]`);
            if (card) {
                card.remove();
                if (document.querySelectorAll('.schedule-card').length === 0) {
                    document.getElementById('schedulesGrid').innerHTML = `
                        <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                            <i class="fa-solid fa-calendar-xmark" style="font-size: 64px; color: var(--text-secondary); margin-bottom: 20px;"></i>
                            <h3 style="margin-bottom: 10px;">No tienes horarios creados</h3>
                            <p style="color: var(--text-secondary);">Haz clic en "Crear Nuevo Horario" para comenzar</p>
                        </div>
                    `;
                }
            }
            alert(data.message);
        }
    } catch (error) {
        alert('Error al eliminar');
    }
}

// ========================================
// CONFIGURACIÓN
// ========================================
function showConfigView(view) {
    document.querySelectorAll('#classes-section .schedules-view').forEach(v => v.classList.remove('active'));
    const viewMap = { 'main': 'config-main', 'edit': 'config-edit' };
    const el = document.getElementById(viewMap[view]);
    if (el) {
        el.classList.add('active');
        if (view === 'edit') setTimeout(cargarDatosInstructor, 100);
    }
}

async function cargarDatosInstructor() {
    try {
        const response = await fetch('obtener_datos_instructor.php');
        const data = await response.json();
        if (data.success) {
            const i = data.instructor;
            document.getElementById('editCedula').value = i.cedula || '';
            document.getElementById('editTelefono').value = i.telefono || '';
            document.getElementById('editFechaNacimiento').value = i.fecha_nacimiento || '';
            document.getElementById('editFechaVinculacion').value = i.fecha_vinculacion || '';
            document.getElementById('editTituloProfesional').value = i.titulo_profesional || '';
            document.getElementById('editEspecialidad').value = i.especialidad || '';
        }
    } catch (error) {
        console.error(error);
    }
}

async function savePersonalInfo() {
    const formData = {
        cedula: document.getElementById('editCedula').value.trim(),
        telefono: document.getElementById('editTelefono').value.trim(),
        fecha_nacimiento: document.getElementById('editFechaNacimiento').value,
        fecha_vinculacion: document.getElementById('editFechaVinculacion').value,
        titulo_profesional: document.getElementById('editTituloProfesional').value.trim(),
        especialidad: document.getElementById('editEspecialidad').value.trim()
    };

    if (!formData.cedula || !formData.telefono) {
        alert('Cédula y teléfono son obligatorios');
        return;
    }

    try {
        const response = await fetch('actualizar_datos_instructor.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (data.success) {
            alert('Datos guardados');
            showConfigView('main');
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Error de conexión');
    }
}

// ========================================
// UTILIDADES
// ========================================
function formatTime(minutes) {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    const period = h < 12 ? 'a.m.' : 'p.m.';
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
}

function getSubjectColors(materia) {
    const colors = {
        'matematicas': { bg: 'rgba(66, 133, 244, 0.1)', border: '#4285f4' },
        'fisica': { bg: 'rgba(52, 168, 83, 0.1)', border: '#34a853' },
        'quimica': { bg: 'rgba(251, 188, 4, 0.1)', border: '#fbbc04' }
    };
    return colors[materia?.toLowerCase()] || { bg: 'rgba(66, 133, 244, 0.1)', border: '#4285f4' };
}

function limpiarFormularioHorario() {
    horarioEnEdicion = null;
    blockDuration = 60;
    document.getElementById('scheduleName').value = '';
    document.getElementById('horaInicio').value = '09:00';
    document.getElementById('durationButton').innerHTML = '1 hora <span class="arrow-down">Down Arrow</span>';
    document.querySelectorAll('.duration-option').forEach(opt => opt.classList.toggle('selected', opt.dataset.minutes == '60'));
    document.getElementById('scheduleGridCard').style.display = 'none';
    document.getElementById('createEditTitle').textContent = 'Crear Nuevo Horario';
}

function showScheduleView(view) {
    document.querySelectorAll('#schedules-section .schedules-view').forEach(v => v.classList.remove('active'));
    const viewMap = { 'main': 'schedules-main', 'create': 'schedules-create', 'view': 'schedules-view' };
    const el = document.getElementById(viewMap[view]);
    if (el) el.classList.add('active');
    if (view === 'create' && !horarioEnEdicion) limpiarFormularioHorario();
}

function showError(id, msg) {
    const input = document.getElementById(id);
    if (input) {
        input.classList.add('error');
        const err = document.createElement('div');
        err.className = 'error-message';
        err.textContent = msg;
        input.parentNode.appendChild(err);
        setTimeout(() => {
            input.classList.remove('error');
            err.remove();
        }, 3000);
    }
}

function clearErrors(ids) {
    ids.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.classList.remove('error');
            const err = input.parentNode.querySelector('.error-message');
            if (err) err.remove();
        }
    });
}

// ========================================
// MODAL Y CALENDARIO
// ========================================
let modalCalendarType = null;
let modalCurrentDate = new Date();

function openDateModal(type) {
    modalCalendarType = type;
    modalCurrentDate = new Date();
    document.getElementById('calendarModal').classList.add('active');
    renderModalCalendar();
}

function closeCalendarModal() {
    document.getElementById('calendarModal').classList.remove('active');
}

function previousMonthModal() {
    modalCurrentDate.setMonth(modalCurrentDate.getMonth() - 1);
    renderModalCalendar();
}

function nextMonthModal() {
    modalCurrentDate.setMonth(modalCurrentDate.getMonth() + 1);
    renderModalCalendar();
}

function renderModalCalendar() {
    const year = modalCurrentDate.getFullYear();
    const month = modalCurrentDate.getMonth();
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    document.getElementById('modalCalendarMonth').textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const container = document.getElementById('modalCalendarDays');
    container.innerHTML = '';

    for (let i = firstDay - 1; i >= 0; i--) {
        const el = document.createElement('div');
        el.className = 'calendar-day other-month';
        el.textContent = new Date(year, month, 0).getDate() - i;
        container.appendChild(el);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const el = document.createElement('div');
        el.className = 'calendar-day';
        el.textContent = day;
        if (day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
            el.classList.add('today');
        }
        el.onclick = () => {
            const inputId = modalCalendarType === 'nacimiento' ? 'editFechaNacimiento' : 'editFechaVinculacion';
            const input = document.getElementById(inputId);
            if (input) {
                input.value = `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`;
            }
            closeCalendarModal();
        };
        container.appendChild(el);
    }

    const remaining = 42 - container.children.length;
    for (let day = 1; day <= remaining; day++) {
        const el = document.createElement('div');
        el.className = 'calendar-day other-month';
        el.textContent = day;
        container.appendChild(el);
    }
}

function selectCurrentModalDate() {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    const formatted = `${day}/${month}/${year}`;
    const inputId = modalCalendarType === 'nacimiento' ? 'editFechaNacimiento' : 'editFechaVinculacion';
    const input = document.getElementById(inputId);
    if (input) input.value = formatted;
    closeCalendarModal();
}

function cargarDatosEnFormulario(horario) {
    document.getElementById('scheduleName').value = horario.nombre_horario;
    document.getElementById('horaInicio').value = horario.hora_inicio;
    blockDuration = horario.duracion_bloque;
    document.getElementById('durationButton').innerHTML = `${blockDuration === 30 ? '30 minutos' : blockDuration === 120 ? '2 horas' : '1 hora'} <span class="arrow-down">Down Arrow</span>`;
    document.querySelectorAll('.duration-option').forEach(opt => opt.classList.toggle('selected', parseInt(opt.dataset.minutes) === blockDuration));
    generateScheduleGrid();
    setTimeout(() => {
        horario.bloques.forEach(b => {
            const [start, end] = b.hora.split(' - ');
            const [sh, sm] = start.split(':').map(Number);
            const minutes = sh * 60 + sm;
            const rowIndex = Math.floor((minutes - (sh * 60 + sm)) / blockDuration);
            const diaIndex = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].indexOf(b.dia);
            const cell = document.querySelectorAll('#scheduleTableBody tr')[rowIndex]?.querySelectorAll('.schedule-cell')[diaIndex];
            if (cell) {
                const colors = getSubjectColors(b.materia);
                cell.className = 'schedule-cell assigned';
                cell.style.background = colors.bg;
                cell.style.borderLeft = `3px solid ${colors.border}`;
                cell.innerHTML = `
                    <div class="assigned-cell">
                        <div class="cell-title">${b.materia}</div>
                        <div class="cell-info"><i class="fa-solid fa-user"></i> ${b.instructor}</div>
                        <div class="cell-info"><i class="fa-solid fa-door-open"></i> ${b.aula}</div>
                        ${b.notas ? `<div class="cell-info"><i class="fa-solid fa-note-sticky"></i> ${b.notas}</div>` : ''}
                        <button class="cell-remove" onclick="event.stopPropagation(); removeAssignment(this)"><i class="fa-solid fa-times"></i></button>
                    </div>
                `;
                cell.dataset.subject = b.materia;
                cell.dataset.instructor = b.instructor;
                cell.dataset.room = b.aula;
                cell.dataset.notes = b.notas;
            }
        });
    }, 100);
}

function openAssignModal(cell) {
    currentCell = cell;
    // Aquí iría el modal de asignación
    const materia = prompt('Materia:');
    const instructor = prompt('Instructor:');
    const aula = prompt('Aula:');
    const notas = prompt('Notas (opcional):');
    if (materia && instructor && aula) {
        const colors = getSubjectColors(materia);
        cell.className = 'schedule-cell assigned';
        cell.style.background = colors.bg;
        cell.style.borderLeft = `3px solid ${colors.border}`;
        cell.innerHTML = `
            <div class="assigned-cell">
                <div class="cell-title">${materia}</div>
                <div class="cell-info"><i class="fa-solid fa-user"></i> ${instructor}</div>
                <div class="cell-info"><i class="fa-solid fa-door-open"></i> ${aula}</div>
                ${notas ? `<div class="cell-info"><i class="fa-solid fa-note-sticky"></i> ${notas}</div>` : ''}
                <button class="cell-remove" onclick="event.stopPropagation(); removeAssignment(this)"><i class="fa-solid fa-times"></i></button>
            </div>
        `;
        cell.dataset.subject = materia;
        cell.dataset.instructor = instructor;
        cell.dataset.room = aula;
        cell.dataset.notes = notas;
    }
}

function removeAssignment(btn) {
    const cell = btn.closest('.schedule-cell');
    cell.className = 'schedule-cell';
    cell.style.background = '';
    cell.style.borderLeft = '';
    cell.innerHTML = '<div class="empty-cell"><i class="fa-solid fa-plus"></i></div>';
    cell.onclick = () => openAssignModal(cell);
    delete cell.dataset.subject;
    delete cell.dataset.instructor;
    delete cell.dataset.room;
    delete cell.dataset.notes;
}

function exportarPDF() {
    alert('Exportar PDF (próximamente)');
}