// ========================================
// TOGGLE SIDEBAR (Mobile)
// ========================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
}

// ========================================
// THEME TOGGLE FUNCTIONALITY
// ========================================
function toggleTheme() {
    const html = document.documentElement;
    const themeIcon = document.getElementById('theme-icon');
    const currentTheme = html.getAttribute('data-theme');
    
    if (currentTheme === 'light') {
        html.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'dark');
    } else {
        html.setAttribute('data-theme', 'light');
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'light');
    }
}

// ========================================
// LOAD SAVED THEME ON PAGE LOAD
// ========================================
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const html = document.documentElement;
    const themeIcon = document.getElementById('theme-icon');
    
    html.setAttribute('data-theme', savedTheme);
    
    if (savedTheme === 'light') {
        themeIcon.className = 'fas fa-sun';
    } else {
        themeIcon.className = 'fas fa-moon';
    }
}

// ========================================
// CUSTOM ALERT - ELEGANTE Y MODERNO
// ========================================
function showCustomAlert(title, message, type = 'info', onConfirm = null) {
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'custom-alert-overlay';
    
    // Configuración de iconos según el tipo
    const iconConfig = {
        info: { icon: 'fa-circle-info', color: '#3b82f6' },
        success: { icon: 'fa-circle-check', color: '#22c55e' },
        warning: { icon: 'fa-triangle-exclamation', color: '#f59e0b' },
        error: { icon: 'fa-solid fa-circle-xmark', color: '#ef4444' },
        question: { icon: 'fa-circle-question', color: '#000000ff' }
    };
    
    const config = iconConfig[type] || iconConfig.info;
    
    // Crear el dialog
    const dialog = document.createElement('div');
    dialog.className = 'custom-alert-dialog';
    dialog.innerHTML = `
        <div class="custom-alert-icon" style="color: ${config.color};">
            <i class="fas ${config.icon}"></i>
        </div>
        <div class="custom-alert-title">${title}</div>
        <div class="custom-alert-message">${message}</div>
        <div class="custom-alert-buttons">
            ${onConfirm ? `
                <button class="custom-alert-btn cancel-btn">
                <i class="fa-solid fa-circle-xmark"></i> Cancelar
                </button>
            ` : ''}
            <button class="custom-alert-btn confirm-btn">
               <h3><i class="fas fa-check-circle"></i> ${onConfirm ? 'Aceptar' : 'OK'}
            </button>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // Trigger animation
    setTimeout(() => overlay.classList.add('show'), 10);
    
    // Event listeners
    const confirmBtn = dialog.querySelector('.confirm-btn');
    const cancelBtn = dialog.querySelector('.cancel-btn');
    
    const closeAlert = () => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    };
    
    confirmBtn.onclick = () => {
        closeAlert();
        if (onConfirm) onConfirm();
    };
    
    if (cancelBtn) {
        cancelBtn.onclick = closeAlert;
    }
    
    // Cerrar con ESC
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeAlert();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
    
    // Cerrar al hacer click en el overlay
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            closeAlert();
        }
    };
}

// ========================================
// LOGOUT FUNCTION - CON ALERT PERSONALIZADO
// ========================================
function logout() {
    showCustomAlert(
        '¿Cerrar sesión?',
        '¿Estás por cerrar sesión, continuar?',
        'question',
        () => {
            // Mostrar notificación de salida
            const notification = document.createElement('div');
            notification.className = 'logout-notification';
            notification.innerHTML = `
                <div class="logout-icon">
                    <i class="fas fa-door-open"></i>
                </div>
                <div class="logout-text">
                    <div class="logout-title">¡Hasta pronto!</div>
                    <div class="logout-message">Cerrando sesión...</div>
                </div>
            `;
            
            document.body.appendChild(notification);
            setTimeout(() => notification.classList.add('show'), 10);
            
            // Efecto de salida
            setTimeout(() => {
                document.body.style.transition = 'opacity 0.5s ease';
                document.body.style.opacity = '0';
            }, 600);
            
            // Redirigir
            setTimeout(() => {
                window.location.href = '?logout=true';
            }, 1500);
        }
    );
}

// ========================================
// NAV ITEMS CLICK FUNCTIONALITY
// ========================================
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
        // Si es el botón de tema, manejar por separado
        if (this.id === 'theme-toggle') {
            e.preventDefault();
            toggleTheme();
            return;
        }
        
        // Si tiene onclick con logout, no hacer nada (ya se maneja)
        if (this.getAttribute('onclick')?.includes('logout')) {
            return;
        }
        
        const href = this.getAttribute('href');
        
        // Si el enlace tiene un href válido y no es "#", permitir la navegación normal
        if (href && href !== '#' && href.trim() !== '' && !href.includes('javascript:')) {
            console.log('Navegando a:', href);
            return;
        }
        
        // Solo prevenir el comportamiento por defecto para enlaces vacíos o con #
        e.preventDefault();
        
        // Remove active class from all nav-item links (not buttons)
        document.querySelectorAll('.nav-item:not(button)').forEach(nav => {
            nav.classList.remove('active');
        });
        
        // Add active class to clicked item if it's not a button
        if (this.tagName !== 'BUTTON') {
            this.classList.add('active');
        }
        
        // Optional: Close sidebar on mobile after selection
        if (window.innerWidth <= 768) {
            closeSidebar();
        }
    });
});

// ========================================
// CLOSE SIDEBAR WITH ESCAPE KEY
// ========================================
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeSidebar();
    }
});

// ========================================
// HANDLE WINDOW RESIZE
// ========================================
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        closeSidebar();
    }
});

// ========================================
// INITIALIZE ON DOM LOADED
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    
    // Mostrar mensaje de bienvenida si viene del login
    const urlParams = new URLSearchParams(window.location.search);
    const fromLogin = urlParams.get('fromLogin');
    
    if (fromLogin === 'true') {
        const welcomeMsg = document.getElementById('welcomeMessage');
        if (welcomeMsg) {
            welcomeMsg.classList.add('show');
            
            setTimeout(() => {
                welcomeMsg.classList.remove('show');
            }, 5000);
            
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
});

// ========================================
// CARRUSEL DE IMÁGENES
// ========================================
const images = document.querySelectorAll('.Carrusel img');
const indicators = document.querySelectorAll('.indicator');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
let currentIndex = 0;
let autoPlayInterval;

function showImage(index) {
    images.forEach(img => img.classList.remove('active'));
    indicators.forEach(ind => ind.classList.remove('active'));
    
    images[index].classList.add('active');
    indicators[index].classList.add('active');
    currentIndex = index;
}

function nextImage() {
    let newIndex = (currentIndex + 1) % images.length;
    showImage(newIndex);
}

function prevImage() {
    let newIndex = (currentIndex - 1 + images.length) % images.length;
    showImage(newIndex);
}

function startAutoPlay() {
    autoPlayInterval = setInterval(nextImage, 4000);
}

function stopAutoPlay() {
    clearInterval(autoPlayInterval);
}

// Event listeners para el carrusel
if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
        prevImage();
        stopAutoPlay();
        startAutoPlay();
    });

    nextBtn.addEventListener('click', () => {
        nextImage();
        stopAutoPlay();
        startAutoPlay();
    });
}

if (indicators.length > 0) {
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            showImage(index);
            stopAutoPlay();
            startAutoPlay();
        });
    });
}

// Pausar autoplay al hacer hover
const carrusel = document.querySelector('.Carrusel');
if (carrusel) {
    carrusel.addEventListener('mouseenter', stopAutoPlay);
    carrusel.addEventListener('mouseleave', startAutoPlay);
    
    // Iniciar autoplay
    startAutoPlay();
}