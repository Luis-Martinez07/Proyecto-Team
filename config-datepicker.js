// ========================================
// DATE PICKER CONFIGURACIÓN - Variables Globales
// ========================================
const datePickerConfigData = {
    birth: {
        currentDate: new Date(),
        selectedDate: null
    },
    vinculacion: {
        currentDate: new Date(),
        selectedDate: null
    }
};

// ========================================
// DATE PICKER CONFIGURACIÓN - Inicialización
// ========================================
function initConfigDatePickers() {
    const birthInput = document.getElementById('editFechaNacimiento');
    const vinculacionInput = document.getElementById('editFechaVinculacion');
    
    if (birthInput) {
        initConfigDatePicker('birth');
        renderConfigCalendar('birth');
    }
    
    if (vinculacionInput) {
        initConfigDatePicker('vinculacion');
        renderConfigCalendar('vinculacion');
    }
}

function initConfigDatePicker(type) {
    const inputId = type === 'birth' ? 'editFechaNacimiento' : 'editFechaVinculacion';
    const dropdownId = type === 'birth' ? 'birthDateDropdown' : 'vinculacionDateDropdown';
    
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);

    if (!input || !dropdown) return;

    // Click en el input para abrir/cerrar dropdown
    input.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAllConfigDateDropdowns();
        
        // Posicionar el dropdown
        const rect = input.getBoundingClientRect();
        const dropdownHeight = 400;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
            dropdown.style.top = 'auto';
            dropdown.style.bottom = (window.innerHeight - rect.top + 5) + 'px';
        } else {
            dropdown.style.top = (rect.bottom + 5) + 'px';
            dropdown.style.bottom = 'auto';
        }
        
        dropdown.style.left = rect.left + 'px';
        
        const dropdownWidth = 320;
        if (rect.left + dropdownWidth > window.innerWidth) {
            dropdown.style.left = (window.innerWidth - dropdownWidth - 20) + 'px';
        }
        
        dropdown.style.display = 'flex';
        renderConfigCalendar(type);
    });
}

function closeAllConfigDateDropdowns() {
    const dropdowns = [
        document.getElementById('birthDateDropdown'),
        document.getElementById('vinculacionDateDropdown')
    ];
    
    dropdowns.forEach(d => {
        if (d) {
            d.style.display = 'none';
            d.style.top = '';
            d.style.bottom = '';
            d.style.left = '';
        }
    });
}

// Cerrar dropdowns al hacer click fuera
document.addEventListener('click', (e) => {
    if (!e.target.closest('.time-picker-wrapper')) {
        closeAllConfigDateDropdowns();
    }
});

// ========================================
// DATE PICKER CONFIGURACIÓN - Calendario
// ========================================
function renderConfigCalendar(type) {
    const date = datePickerConfigData[type].currentDate;
    const year = date.getFullYear();
    const month = date.getMonth();

    const calendarId = type === 'birth' ? 'birth' : 'vinculacion';
    const monthElement = document.getElementById(calendarId + 'CalendarMonth');
    
    if (monthElement) {
        monthElement.textContent = `${monthNames[month]} ${year}`;
    }

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const daysContainer = document.getElementById(calendarId + 'CalendarDays');
    if (!daysContainer) return;

    daysContainer.innerHTML = '';

    // Días del mes anterior
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayEl = createConfigDayElement(day, true, type, year, month - 1);
        daysContainer.appendChild(dayEl);
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
        const dayEl = createConfigDayElement(day, false, type, year, month);
        daysContainer.appendChild(dayEl);
    }

    // Días del mes siguiente
    const remainingDays = 42 - daysContainer.children.length;
    for (let day = 1; day <= remainingDays; day++) {
        const dayEl = createConfigDayElement(day, true, type, year, month + 1);
        daysContainer.appendChild(dayEl);
    }
}

function createConfigDayElement(day, isOtherMonth, type, year, month) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    dayEl.textContent = day;

    if (isOtherMonth) dayEl.classList.add('other-month');

    const selectedDate = datePickerConfigData[type].selectedDate;
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
        e.stopPropagation();
        selectConfigDate(new Date(year, month, day), type);
    });

    return dayEl;
}

function selectConfigDate(date, type) {
    datePickerConfigData[type].selectedDate = date;
    
    const inputId = type === 'birth' ? 'editFechaNacimiento' : 'editFechaVinculacion';
    const input = document.getElementById(inputId);
    
    if (input) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        input.value = `${day}/${month}/${year}`;
    }
    
    renderConfigCalendar(type);
    
    // Cerrar dropdown después de seleccionar
    setTimeout(() => {
        closeAllConfigDateDropdowns();
    }, 200);
}

// ========================================
// DATE PICKER CONFIGURACIÓN - Controles
// ========================================
function changeConfigMonth(delta, type) {
    const date = datePickerConfigData[type].currentDate;
    date.setMonth(date.getMonth() + delta);
    renderConfigCalendar(type);
}

function selectConfigToday(type) {
    const today = new Date();
    datePickerConfigData[type].selectedDate = today;
    datePickerConfigData[type].currentDate = new Date(today);
    selectConfigDate(today, type);
}

function clearConfigSelection(type) {
    datePickerConfigData[type].selectedDate = null;
    
    const inputId = type === 'birth' ? 'editFechaNacimiento' : 'editFechaVinculacion';
    const input = document.getElementById(inputId);
    
    if (input) {
        input.value = '';
    }
    
    renderConfigCalendar(type);
}

// ========================================
// MODIFICAR changeMonth ORIGINAL
// ========================================
// Actualizar la función changeMonth existente para incluir los nuevos tipos
const originalChangeMonth = window.changeMonth;
window.changeMonth = function(delta, type) {
    if (type === 'birth' || type === 'vinculacion') {
        changeConfigMonth(delta, type);
    } else if (originalChangeMonth) {
        originalChangeMonth(delta, type);
    }
};

// ========================================
// MODIFICAR selectToday ORIGINAL
// ========================================
const originalSelectToday = window.selectToday;
window.selectToday = function(type) {
    if (type === 'birth' || type === 'vinculacion') {
        selectConfigToday(type);
    } else if (originalSelectToday) {
        originalSelectToday(type);
    }
};

// ========================================
// MODIFICAR clearSelection ORIGINAL
// ========================================
const originalClearSelection = window.clearSelection;
window.clearSelection = function(type) {
    if (type === 'birth' || type === 'vinculacion') {
        clearConfigSelection(type);
    } else if (originalClearSelection) {
        originalClearSelection(type);
    }
};

// ========================================
// ACTUALIZAR showConfigView
// ========================================
// Modificar la función showConfigView existente
const originalShowConfigView = window.showConfigView;
window.showConfigView = function(view) {
    // Llamar a la función original si existe
    if (originalShowConfigView) {
        originalShowConfigView(view);
    }
    
    // Si se muestra la vista de edición, inicializar los date pickers
    if (view === 'edit') {
        setTimeout(() => {
            initConfigDatePickers();
        }, 100);
    }
};

// ========================================
// ACTUALIZAR cargarDatosInstructor
// ========================================
// Modificar la función para convertir fechas al formato correcto
const originalCargarDatosInstructor = window.cargarDatosInstructor;
window.cargarDatosInstructor = async function() {
    try {
        const response = await fetch('obtener_datos_instructor.php');
        const data = await response.json();
        
        if (data.success && data.instructor) {
            const i = data.instructor;
            document.getElementById('editCedula').value = i.cedula || '';
            document.getElementById('editTelefono').value = i.telefono || '';
            document.getElementById('editTituloProfesional').value = i.titulo_profesional || '';
            document.getElementById('editEspecialidad').value = i.especialidad || '';
            
            // Convertir y mostrar fecha de nacimiento
            if (i.fecha_nacimiento) {
                const birthDate = new Date(i.fecha_nacimiento);
                datePickerConfigData.birth.selectedDate = birthDate;
                const day = birthDate.getDate().toString().padStart(2, '0');
                const month = (birthDate.getMonth() + 1).toString().padStart(2, '0');
                const year = birthDate.getFullYear();
                document.getElementById('editFechaNacimiento').value = `${day}/${month}/${year}`;
            }
            
            // Convertir y mostrar fecha de vinculación
            if (i.fecha_vinculacion) {
                const vincDate = new Date(i.fecha_vinculacion);
                datePickerConfigData.vinculacion.selectedDate = vincDate;
                const day = vincDate.getDate().toString().padStart(2, '0');
                const month = (vincDate.getMonth() + 1).toString().padStart(2, '0');
                const year = vincDate.getFullYear();
                document.getElementById('editFechaVinculacion').value = `${day}/${month}/${year}`;
            }
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
};

// ========================================
// LOG DE CONFIRMACIÓN
// ========================================
console.log('✅ Date Pickers de Configuración cargados correctamente');