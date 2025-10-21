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
    
    // Agregar clase active al item clickeado
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    
    console.log('Navegando a sección:', sectionName);
    
    // Aquí puedes agregar la lógica para mostrar diferentes secciones
    // Por ejemplo:
    // document.querySelectorAll('.content-section').forEach(section => {
    //     section.classList.remove('active');
    // });
    // document.getElementById(sectionName + '-section').classList.add('active');
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