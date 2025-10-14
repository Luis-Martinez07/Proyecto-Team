// confi.js (corregido y completo con cambio de contraseña)

// -------------------- Theme toggle --------------------
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');

    body.classList.toggle('dark');

    if (themeIcon) themeIcon.classList.add('rotate');

    const isDark = body.classList.contains('dark');

    setTimeout(() => {
        if (themeIcon) {
            themeIcon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
            themeIcon.classList.remove('rotate');
        }
    }, 150);

    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// -------------------- Tabs --------------------
function showTab(tabName) {
    const targetId = `${tabName}-tab`;
    const allTabs = document.querySelectorAll('.tab-content');

    allTabs.forEach(tab => {
        if (tab.id === targetId) tab.classList.remove('hidden');
        else tab.classList.add('hidden');
    });

    // actualizar estado 'active' en botones de navegación
    document.querySelectorAll('.nav-tab').forEach(btn => {
        if (btn.dataset.tab === tabName) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

// -------------------- Photo / Profile functions --------------------
function changePhoto() {
    document.getElementById('photoInput').click();
}

function handlePhotoChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const avatarLarge = document.querySelector('.avatar-large');
        const headerAvatar = document.querySelector('.header .avatar');

        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '50%';

        if (avatarLarge) {
            avatarLarge.innerHTML = '';
            avatarLarge.appendChild(img.cloneNode());
        }

        if (headerAvatar) {
            headerAvatar.innerHTML = '';
            const headerImg = img.cloneNode();
            headerAvatar.appendChild(headerImg);
        }

        showNotification('<i class="fa-solid fa-check-circle"></i> Foto actualizada correctamente', 'success');
    };
    reader.readAsDataURL(file);
}

// ========================================
// CAMBIO DE CONTRASEÑA - BACKEND
// ========================================
async function cambiarPassword() {
    const passwordActual = document.getElementById('passwordActual').value;
    const passwordNueva = document.getElementById('passwordNueva').value;
    const passwordConfirmar = document.getElementById('passwordConfirmar').value;
    
    // Validaciones en el cliente
    if (!passwordActual || !passwordNueva || !passwordConfirmar) {
        showNotification('<i class="fa-solid fa-exclamation-circle"></i> Todos los campos de contraseña son obligatorios', 'error');
        return false;
    }
    
    if (passwordNueva.length < 8) {
        showNotification('<i class="fa-solid fa-exclamation-circle"></i> La nueva contraseña debe tener al menos 8 caracteres', 'error');
        document.getElementById('passwordNueva').classList.add('error');
        return false;
    }
    
    if (passwordNueva !== passwordConfirmar) {
        showNotification('<i class="fa-solid fa-exclamation-circle"></i> Las contraseñas no coinciden', 'error');
        document.getElementById('passwordConfirmar').classList.add('error');
        return false;
    }
    
    if (passwordActual === passwordNueva) {
        showNotification('<i class="fa-solid fa-exclamation-circle"></i> La nueva contraseña debe ser diferente a la actual', 'error');
        return false;
    }
    
    try {
        const formData = new FormData();
        formData.append('password_actual', passwordActual);
        formData.append('password_nueva', passwordNueva);
        formData.append('password_confirmar', passwordConfirmar);
        
        const response = await fetch('procesar_cambio_password.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('<i class="fa-solid fa-check-circle"></i> ' + result.message, 'success');
            
            // Limpiar campos
            document.getElementById('passwordActual').value = '';
            document.getElementById('passwordNueva').value = '';
            document.getElementById('passwordConfirmar').value = '';
            
            // Quitar clases de error si las hay
            document.getElementById('passwordActual').classList.remove('error', 'success');
            document.getElementById('passwordNueva').classList.remove('error', 'success');
            document.getElementById('passwordConfirmar').classList.remove('error', 'success');
            
            return true;
        } else {
            showNotification('<i class="fa-solid fa-exclamation-circle"></i> ' + result.message, 'error');
            return false;
        }
        
    } catch (error) {
        console.error('Error:', error);
        showNotification('<i class="fa-solid fa-exclamation-circle"></i> Error al conectar con el servidor', 'error');
        return false;
    }
}

// ========================================
// UPDATE PROFILE - MODIFICADA
// ========================================
async function updateProfile() {
    // Verificar si el usuario quiere cambiar la contraseña
    const passwordActual = document.getElementById('passwordActual').value;
    const passwordNueva = document.getElementById('passwordNueva').value;
    const passwordConfirmar = document.getElementById('passwordConfirmar').value;
    
    // Si hay algún campo de contraseña lleno, procesar cambio de contraseña
    if (passwordActual || passwordNueva || passwordConfirmar) {
        const passwordCambiado = await cambiarPassword();
        
        // Si no se cambió la contraseña exitosamente, no continuar
        if (!passwordCambiado) {
            return;
        }
    }
    
    // Tomamos los valores del formulario
    const profileData = {
        nombres: document.getElementById('nombres').value,
        apellidos: document.getElementById('apellidos').value,
        fechaNacimiento: document.getElementById('fechaNacimiento').value,
        emailInstitucional: document.getElementById('emailInstitucional').value,
        emailPersonal: document.getElementById('emailPersonal').value,
        telefono: document.getElementById('telefono').value,
        telefonoFijo: document.getElementById('telefonoFijo').value,
        tituloProfesional: document.getElementById('tituloProfesional').value,
        universidad: document.getElementById('universidad').value,
        anoGraduacion: document.getElementById('anoGraduacion').value,
        experienciaDocente: document.getElementById('experienciaDocente').value,
        especializacion: document.getElementById('especializacion').value,
        certificaciones: document.getElementById('certificaciones').value,
        regional: document.getElementById('regional').value,
        centroFormacion: document.getElementById('centroFormacion').value,
        fechaVinculacion: document.getElementById('fechaVinculacion').value,
        tipoContrato: document.getElementById('tipoContrato').value
    };

    // Validación campos obligatorios
    const requiredFields = ['nombres', 'apellidos', 'emailInstitucional'];
    let hasErrors = false;
    requiredFields.forEach(field => {
        const input = document.getElementById(field);
        if (!input || !input.value.trim()) {
            input && input.classList.add('error');
            hasErrors = true;
        } else {
            input && input.classList.remove('error');
            input && input.classList.add('success');
        }
    });

    if (hasErrors) {
        showNotification('<i class="fa-solid fa-exclamation-circle"></i> Por favor complete todos los campos obligatorios', 'error');
        return;
    }

    // Actualizar cabecera con datos
    const headerName = document.querySelector('.instructor-info h1');
    const headerEmail = document.querySelector('.instructor-info p');
    if (headerName) headerName.textContent = `${profileData.tituloProfesional} ${profileData.nombres} ${profileData.apellidos}`;
    if (headerEmail) headerEmail.textContent = `Instructor SENA • ${profileData.emailInstitucional}`;

    // Animación / feedback del botón
    const btn = document.querySelector('#perfil-tab .btn-primary');
    const originalText = btn ? btn.innerHTML : 'Guardar';
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-check-circle"></i> Perfil Actualizado!';
        btn.style.background = 'linear-gradient(135deg, #16a34a, #059669)';
    }

    setTimeout(() => {
        if (btn) {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }
    }, 2000);

    showNotification('<i class="fa-solid fa-check-circle"></i> Perfil actualizado correctamente', 'success');
}

function resetProfile() {
    const defaultData = {
        nombres: "",
        apellidos: "",
        fechaNacimiento: "",
        emailInstitucional: "",
        emailPersonal: "",
        telefono: "",
        telefonoFijo: "",
        tituloProfesional: "",
        universidad: "",
        anoGraduacion: "",
        experienciaDocente: "",
        especializacion: "",
        certificaciones: "",
        regional: "",
        centroFormacion: "",
        fechaVinculacion: "",
        tipoContrato: ""
    };

    Object.keys(defaultData).forEach(key => {
        const el = document.getElementById(key);
        if (el) {
            el.value = defaultData[key];
            el.classList.remove('error', 'success');
        }
    });

    document.getElementById('passwordActual').value = '';
    document.getElementById('passwordNueva').value = '';
    document.getElementById('passwordConfirmar').value = '';

    showNotification('<i class="fa-solid fa-undo"></i> Cambios restaurados', 'info');
}

// -------------------- Notificaciones (corregida) --------------------
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 18px;
        border-radius: 8px;
        border: 1px solid black;
        color: #000000ff;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 6px 18px rgba(0,0,0,0.12);
        opacity: 0;
        transition: opacity 0.25s ease, transform 0.25s ease;
        transform: translateY(-6px);
        display: flex;
        align-items: center;
        gap: 8px;
    `;

    if (type === 'success') notification.style.background = '#ffffffff';
    else if (type === 'error') notification.style.background = '#dc2626';
    else notification.style.background = '#2563eb';

    // Usar innerHTML para permitir iconos HTML
    notification.innerHTML = message;
    document.body.appendChild(notification);

    // show
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    });

    // hide after 3s
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-6px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// -------------------- Toggle de secciones desplegables --------------------
function toggleSection(header) {
    const content = header.nextElementSibling;
    const chevron = header.querySelector('.chevron-icon');
    
    // Toggle active class
    header.classList.toggle('active');
    content.classList.toggle('active');
}

// -------------------- Funciones auxiliares --------------------
function toggleSwitch(el) {
    if (!el) return;
    el.classList.toggle('active');
}

// -------------------- Funciones de botones con iconos --------------------
function agregarActividad() { 
    showNotification('<i class="fa-solid fa-check-circle"></i> Actividad agregada correctamente', 'success'); 
}

function saveSettings() { 
    showNotification('<i class="fa-solid fa-check-circle"></i> Configuración guardada', 'success'); 
}

function saveCourses() { 
    const programaPrincipal = document.getElementById('programa-principal').value;
    
    // Datos a guardar
    const cursosData = {
        programa: programaPrincipal,
        competencias: selectedCompetencias
    };
    
    console.log('Datos de cursos guardados:', cursosData);
    
    // Simular guardado exitoso
    const saveBtn = document.querySelector('.btn-primary');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> ¡Guardado Exitosamente!';
    saveBtn.style.background = 'linear-gradient(145deg, #27ae60, #2ecc71)';
    
    setTimeout(() => {
        saveBtn.innerHTML = originalText;
        saveBtn.style.background = '';
    }, 2500);
    
    if (selectedCompetencias.length === 0) {
        alert('Recomendación: Asigne al menos una competencia a su programa formativo');
    }
    
    showNotification('<i class="fa-solid fa-check-circle"></i> Programas guardados', 'success');
}

function saveNotifications() { 
    showNotification('<i class="fa-solid fa-check-circle"></i> Configuración de notificaciones guardada', 'success'); 
}

// -------------------- Inicialización DOM --------------------
document.addEventListener('DOMContentLoaded', () => {
    // Tema guardado
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('theme-icon');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        if (themeIcon) themeIcon.className = 'fas fa-sun';
    } else {
        if (themeIcon) themeIcon.className = 'fas fa-moon';
    }

    // Conectar botón de tema si existe
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    // Convertir botones de navegación con onclick inline a listeners más seguros
    document.querySelectorAll('.nav-tab').forEach(btn => {
        const onclick = btn.getAttribute('onclick');
        if (onclick) {
            const m = onclick.match(/showTab\(\s*['"](.+?)['"]\s*\)/);
            if (m) {
                const tabName = m[1];
                btn.dataset.tab = tabName;
                // eliminamos el onclick inline para evitar doble ejecución
                btn.removeAttribute('onclick');
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    showTab(tabName);
                });
            }
        }
    });

    // Mostrar pestaña inicial
    const activeBtn = document.querySelector('.nav-tab.active');
    if (activeBtn && activeBtn.dataset.tab) showTab(activeBtn.dataset.tab);
    else showTab('estadisticas');

    // Inicializar secciones desplegables del perfil
    const profileTab = document.getElementById('perfil-tab');
    if (profileTab) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.target === profileTab && !profileTab.classList.contains('hidden')) {
                    const firstSection = profileTab.querySelector('.config-section .section-header');
                    if (firstSection && !firstSection.classList.contains('active')) {
                        toggleSection(firstSection);
                    }
                }
            });
        });
        
        observer.observe(profileTab, { attributes: true, attributeFilter: ['class'] });
    }
});

// Menu desplegable de Competencias Asignadas
let selectedCompetencias = [];

function toggleCompetenciasCard() {
    const card = document.getElementById('competencias-card');
    const chevron = document.getElementById('chevron-icon');
    
    if (card.classList.contains('active')) {
        card.classList.remove('active');
        chevron.style.transform = 'rotate(0deg)';
    } else {
        card.classList.add('active');
        chevron.style.transform = 'rotate(180deg)';
    }
}

function addCompetencia() {
    const select = document.getElementById('competencia-select');
    const selectedValue = select.value;
    const selectedText = select.options[select.selectedIndex].text;
    
    if (selectedValue && !selectedCompetencias.find(comp => comp.value === selectedValue)) {
        selectedCompetencias.push({
            value: selectedValue,
            text: selectedText
        });
        
        updateCompetenciasDisplay();
        select.value = '';
        showNotification('<i class="fa-solid fa-check-circle"></i> Competencia agregada', 'success');
    } else if (!selectedValue) {
        showNotification('<i class="fa-solid fa-exclamation-circle"></i> Por favor seleccione una competencia', 'error');
    } else {
        showNotification('<i class="fa-solid fa-exclamation-circle"></i> Esta competencia ya está asignada', 'error');
    }
}

function removeCompetencia(value) {
    selectedCompetencias = selectedCompetencias.filter(comp => comp.value !== value);
    updateCompetenciasDisplay();
    showNotification('<i class="fa-solid fa-trash"></i> Competencia eliminada', 'info');
}

function updateCompetenciasDisplay() {
    const container = document.getElementById('selected-competencias');
    
    if (selectedCompetencias.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-inbox" style="color: #bdc3c7; font-size: 20px; margin-bottom: 10px;"></i>
                <p style="color: #7f8c8d; font-style: italic; margin: 0;">No hay competencias asignadas</p>
            </div>
        `;
    } else {
        container.innerHTML = selectedCompetencias.map(comp => `
            <div class="competencia-tag">
                <span>${comp.text}</span>
                <button class="remove-btn" onclick="removeCompetencia('${comp.value}')">
                    <i class="fa-solid fa-times"></i>
                </button>
            </div>
        `).join('');
    }
}

// Función para filtrar competencias según el programa seleccionado
const programaPrincipalSelect = document.getElementById('programa-principal');
if (programaPrincipalSelect) {
    programaPrincipalSelect.addEventListener('change', function() {
        const programa = this.value;
        const select = document.getElementById('competencia-select');
        const allOptions = select.querySelectorAll('option, optgroup');
        
        // Mostrar todas las opciones primero
        allOptions.forEach(option => {
            option.style.display = 'block';
        });
        
        // Lógica para mostrar solo competencias relevantes al programa (opcional)
        if (programa === 'Análisis y Desarrollo de Software') {
            // Destacar las competencias más relevantes
            console.log('Programa seleccionado:', programa);
        }
    });
}