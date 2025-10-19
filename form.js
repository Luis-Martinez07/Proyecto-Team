// ===========================================
// THEME TOGGLE - MODO OSCURO
// ===========================================

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    updateThemeIcons(newTheme);
}

function updateThemeIcons(theme) {
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    
    if (theme === 'dark') {
        sunIcon?.classList.remove('active');
        moonIcon?.classList.add('active');
    } else {
        moonIcon?.classList.remove('active');
        sunIcon?.classList.add('active');
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);
}

// ===========================================
// TOGGLE FORM ORIGINAL
// ===========================================

const container = document.getElementById('container');
const panelContent = document.querySelector('.panel-content');

function toggleForm() {
    container.classList.toggle('register-mode');
    
    if (container.classList.contains('register-mode')) {
        panelContent.innerHTML = `
            <h1>¡Bienvenido de nuevo!</h1>
            <p>¿Ya tienes una cuenta?</p>
            <button class="btn-ghost" onclick="toggleForm()">Login</button>
        `;
    } else {
        panelContent.innerHTML = `
            <h1>¡Hola, Bienvenido!</h1>
            <p>¿No tienes una cuenta?</p>
            <button class="btn-ghost" onclick="toggleForm()">Register</button>
        `;
    }
}

// ===========================================
// SISTEMA DE VALIDACIÓN CON ICONOS EXTERNOS
// ===========================================

class FormValidator {
    constructor() {
        this.container = document.getElementById('container');
        this.panelContent = document.querySelector('.panel-content');
        this.isRegisterMode = false;
        
        // URLs de redirección
        this.redirectUrls = {
            login: './panel.html',
            register: './welcome.html'
        };
        
        this.init();
    }

    // 1. INICIALIZACIÓN
    init() {
        this.addValidationElements();
        this.initializeEventListeners();
        this.updateSubmitButtons();
    }

    // 2. AGREGAR ELEMENTOS DE VALIDACIÓN - ICONOS POR FUERA
    addValidationElements() {
        const inputGroups = document.querySelectorAll('.input-group');
        
        inputGroups.forEach((group, index) => {
            const input = group.querySelector('input');
            const inputId = input.id;
            
            // Evitar duplicados
            if (group.parentNode.querySelector(`#validation-${inputId}`)) {
                return;
            }
            
            // Crear contenedor principal que envuelve el input-group y las validaciones
            const fieldWrapper = document.createElement('div');
            fieldWrapper.className = 'field-wrapper';
            fieldWrapper.style.cssText = `
                position: relative;
                margin-bottom: 25px;
                width: 100%;
            `;
            
            // Envolver el input-group
            group.parentNode.insertBefore(fieldWrapper, group);
            fieldWrapper.appendChild(group);
            
            // Crear contenedor de iconos externos (al lado derecho del input)
            const externalIcons = document.createElement('div');
            externalIcons.className = 'external-validation-icons';
            externalIcons.style.cssText = `
                position: absolute;
                right: -40px;
                top: 12px;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10;
            `;
            
            // Iconos de validación
            const successIcon = document.createElement('i');
            successIcon.className = 'fas fa-check-circle validation-success';
            successIcon.style.cssText = `
                color: #28a745;
                font-size: 18px;
                opacity: 0;
                transition: all 0.3s ease;
                position: absolute;
            `;
            
            const errorIcon = document.createElement('i');
            errorIcon.className = 'fas fa-times-circle validation-error';
            errorIcon.style.cssText = `
                color: #dc3545;
                font-size: 18px;
                opacity: 0;
                transition: all 0.3s ease;
                position: absolute;
            `;
            
            externalIcons.appendChild(successIcon);
            externalIcons.appendChild(errorIcon);
            fieldWrapper.appendChild(externalIcons);
            
            // Crear contenedor de validaciones debajo del input
            const validationContainer = document.createElement('div');
            validationContainer.className = 'validation-container';
            validationContainer.id = `validation-${inputId}`;
            validationContainer.style.cssText = `
                width: 100%;
                margin-top: 8px;
            `;
            
            // Para contraseña de registro, agregar indicador de fortaleza
            if (inputId === 'registerPassword') {
                this.addPasswordStrengthIndicator(validationContainer);
            }
            
            // Mensaje de error
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.id = `error-${inputId}`;
            errorMessage.style.cssText = `
                font-size: 12px;
                color: #dc3545;
                background: rgba(220, 53, 69, 0.1);
                padding: 8px 12px;
                border-radius: 6px;
                font-weight: 500;
                border-left: 3px solid #dc3545;
                margin-top: 6px;
                opacity: 0;
                transform: translateY(-10px);
                transition: all 0.3s ease;
                display: none;
            `;
            
            validationContainer.appendChild(errorMessage);
            fieldWrapper.appendChild(validationContainer);
        });
    }

    // 3. INDICADOR DE FORTALEZA DE CONTRASEÑA
    addPasswordStrengthIndicator(container) {
        const strengthWrapper = document.createElement('div');
        strengthWrapper.className = 'password-strength-wrapper';
        
        const strengthBar = document.createElement('div');
        strengthBar.className = 'password-strength-bar';
        strengthBar.style.cssText = `
            height: 4px;
            background: #e9ecef;
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 8px;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        const strengthProgress = document.createElement('div');
        strengthProgress.id = 'strength-progress';
        strengthProgress.style.cssText = `
            height: 100%;
            width: 0%;
            transition: all 0.3s ease;
            border-radius: 2px;
        `;
        
        const strengthText = document.createElement('div');
        strengthText.className = 'strength-text';
        strengthText.id = 'strength-text';
        strengthText.style.cssText = `
            font-size: 11px;
            font-weight: 500;
            opacity: 0;
            transition: all 0.3s ease;
            margin-bottom: 4px;
        `;
        
        strengthBar.appendChild(strengthProgress);
        strengthWrapper.appendChild(strengthBar);
        strengthWrapper.appendChild(strengthText);
        container.appendChild(strengthWrapper);
    }

    // 4. EVENT LISTENERS
    initializeEventListeners() {
        // Login
        const loginUser = document.getElementById('loginUser');
        const loginPassword = document.getElementById('loginPassword');
        const loginForm = document.getElementById('loginForm');

        // Register
        const registerUser = document.getElementById('registerUser');
        const registerEmail = document.getElementById('registerEmail');
        const registerPassword = document.getElementById('registerPassword');
        const registerForm = document.getElementById('registerForm');

        // Validación en tiempo real
        if (loginUser) {
            loginUser.addEventListener('input', (e) => this.validateField(e.target, 'email'));
            loginUser.addEventListener('blur', (e) => this.validateField(e.target, 'email'));
        }

        if (loginPassword) {
            loginPassword.addEventListener('input', (e) => this.validateField(e.target, 'loginPassword'));
            loginPassword.addEventListener('blur', (e) => this.validateField(e.target, 'loginPassword'));
        }

        if (registerUser) {
            registerUser.addEventListener('input', (e) => this.validateField(e.target, 'user'));
            registerUser.addEventListener('blur', (e) => this.validateField(e.target, 'user'));
        }

        if (registerEmail) {
            registerEmail.addEventListener('input', (e) => this.validateField(e.target, 'email'));
            registerEmail.addEventListener('blur', (e) => this.validateField(e.target, 'email'));
        }

        if (registerPassword) {
            registerPassword.addEventListener('input', (e) => {
                this.validateField(e.target, 'registerPassword');
                this.updatePasswordStrength(e.target.value);
            });
            registerPassword.addEventListener('blur', (e) => this.validateField(e.target, 'registerPassword'));
        }

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLoginSubmit(e));
        }

        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegisterSubmit(e));
        }
    }

    // 5. VALIDAR CAMPO
    validateField(field, fieldType) {
        const value = field.value.trim();
        const fieldWrapper = field.closest('.field-wrapper');
        const validationContainer = fieldWrapper.querySelector(`#validation-${field.id}`);
        const errorElement = fieldWrapper.querySelector(`#error-${field.id}`);
        const successIcon = fieldWrapper.querySelector('.validation-success');
        const errorIcon = fieldWrapper.querySelector('.validation-error');

        // Limpiar estado previo
        this.clearFieldState(field, errorElement, successIcon, errorIcon);

        let validation = { isValid: true, message: '' };

        // Validar solo si hay contenido
        if (value.length > 0) {
            switch (fieldType) {
                case 'user':
                    validation = this.validateUsername(value);
                    break;
                case 'email':
                    validation = this.validateEmail(value);
                    break;
                case 'loginPassword':
                    validation = this.validateLoginPassword(value);
                    break;
                case 'registerPassword':
                    validation = this.validateRegisterPassword(value);
                    break;
            }

            // Aplicar estado visual
            this.applyFieldState(field, validation, errorElement, successIcon, errorIcon);
        }

        this.updateSubmitButtons();
        return validation.isValid;
    }

    // 6. LIMPIAR ESTADO
    clearFieldState(field, errorElement, successIcon, errorIcon) {
        field.style.borderColor = '';
        field.style.backgroundColor = '';
        
        if (successIcon) successIcon.style.opacity = '0';
        if (errorIcon) errorIcon.style.opacity = '0';
        
        if (errorElement) {
            errorElement.style.display = 'none';
            errorElement.style.opacity = '0';
        }
        
        const inputGroup = field.closest('.input-group');
        if (inputGroup) {
            inputGroup.classList.remove('valid', 'invalid');
        }
    }

    // 7. APLICAR ESTADO VISUAL
    applyFieldState(field, validation, errorElement, successIcon, errorIcon) {
        const inputGroup = field.closest('.input-group');
        
        if (validation.isValid) {
            field.style.borderColor = '#28a745';
            field.style.backgroundColor = '#f8fff9';
            if (successIcon) successIcon.style.opacity = '1';
            if (inputGroup) inputGroup.classList.add('valid');
        } else {
            field.style.borderColor = '#dc3545';
            field.style.backgroundColor = '#fff8f8';
            if (errorIcon) errorIcon.style.opacity = '1';
            if (inputGroup) inputGroup.classList.add('invalid');
            
            if (errorElement) {
                errorElement.textContent = validation.message;
                errorElement.style.display = 'block';
                setTimeout(() => {
                    errorElement.style.opacity = '1';
                    errorElement.style.transform = 'translateY(0)';
                }, 10);
            }
        }
    }

    // 8. VALIDACIONES ESPECÍFICAS
    validateUsername(username) {
        if (!username) return { isValid: false, message: 'El usuario es requerido' };
        if (username.length < 3) return { isValid: false, message: 'Mínimo 3 caracteres' };
        if (username.length > 20) return { isValid: false, message: 'Máximo 20 caracteres' };
        if (!/^[a-zA-Z0-9_]+$/.test(username)) return { isValid: false, message: 'Solo letras, números y guión bajo' };
        return { isValid: true, message: '' };
    }

    validateEmail(email) {
        if (!email) return { isValid: false, message: 'El correo es requerido' };
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return { isValid: false, message: 'Formato de correo inválido' };
        if (email.length > 100) return { isValid: false, message: 'El correo es demasiado largo' };
        return { isValid: true, message: '' };
    }

    validateLoginPassword(password) {
        if (!password) return { isValid: false, message: 'La contraseña es requerida' };
        if (password.length < 6) return { isValid: false, message: 'Mínimo 6 caracteres' };
        return { isValid: true, message: '' };
    }

    validateRegisterPassword(password) {
        if (!password) return { isValid: false, message: 'La contraseña es requerida' };
        if (password.length < 8) return { isValid: false, message: 'Mínimo 8 caracteres' };
        if (!/(?=.*[a-z])/.test(password)) return { isValid: false, message: 'Debe contener al menos una minúscula' };
        if (!/(?=.*[A-Z])/.test(password)) return { isValid: false, message: 'Debe contener al menos una mayúscula' };
        if (!/(?=.*\d)/.test(password)) return { isValid: false, message: 'Debe contener al menos un número' };
        return { isValid: true, message: '' };
    }

    // 9. INDICADOR DE FORTALEZA
    updatePasswordStrength(password) {
        const strengthBar = document.querySelector('.password-strength-bar');
        const strengthProgress = document.getElementById('strength-progress');
        const strengthText = document.getElementById('strength-text');

        if (!strengthBar || !strengthProgress || !strengthText) return;

        const passwordInput = document.getElementById('registerPassword');
        const inputGroup = passwordInput?.closest('.input-group');
        const hasError = inputGroup?.classList.contains('invalid');

        if (!password || hasError) {
            strengthBar.style.opacity = '0';
            strengthText.style.opacity = '0';
            return;
        }

        strengthBar.style.opacity = '1';
        strengthText.style.opacity = '1';

        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;

        const levels = [
            { width: '25%', color: '#dc3545', text: 'Muy débil' },
            { width: '50%', color: '#ffc107', text: 'Débil' },
            { width: '75%', color: '#fd7e14', text: 'Buena' },
            { width: '100%', color: '#28a745', text: 'Fuerte' },
            { width: '100%', color: '#28a745', text: 'Muy fuerte' }
        ];

        const level = levels[score] || levels[0];
        strengthProgress.style.width = level.width;
        strengthProgress.style.backgroundColor = level.color;
        strengthText.textContent = `Fortaleza: ${level.text}`;
        strengthText.style.color = level.color;
    }

    // 10. ACTUALIZAR BOTONES
    updateSubmitButtons() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');

        if (loginBtn) {
            const loginValid = this.isFieldValid('loginUser') && this.isFieldValid('loginPassword');
            loginBtn.disabled = !loginValid;
            loginBtn.style.opacity = loginValid ? '1' : '0.6';
        }

        if (registerBtn) {
            const registerValid = this.isFieldValid('registerUser') && 
                                this.isFieldValid('registerEmail') && 
                                this.isFieldValid('registerPassword');
            registerBtn.disabled = !registerValid;
            registerBtn.style.opacity = registerValid ? '1' : '0.6';
        }
    }

    // 11. VERIFICAR VALIDEZ
    isFieldValid(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return false;
        
        const fieldWrapper = field.closest('.field-wrapper');
        const successIcon = fieldWrapper?.querySelector('.validation-success');
        
        return field.value.trim().length > 0 && 
               successIcon?.style.opacity === '1';
    }

    // 12. MANEJAR LOGIN
    handleLoginSubmit(e) {
        const user = document.getElementById('loginUser').value.trim();
        const password = document.getElementById('loginPassword').value;

        // Validar campos antes de enviar
        const userValid = this.validateField(document.getElementById('loginUser'), 'email');
        const passValid = this.validateField(document.getElementById('loginPassword'), 'loginPassword');

        if (!userValid || !passValid) {
            e.preventDefault(); // Solo prevenir si hay errores
            this.showMessage('Por favor, corrige los errores antes de continuar', 'error');
            return false;
        }

        // Si todo es válido, el formulario se enviará normalmente a auth.php
        console.log('Formulario válido, enviando a auth.php');
        return true;
    }

     // 13. MANEJAR REGISTRO
    handleRegisterSubmit(e) {
        const user = document.getElementById('registerUser').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;

        // Validar campos antes de enviar
        const userValid = this.validateField(document.getElementById('registerUser'), 'user');
        const emailValid = this.validateField(document.getElementById('registerEmail'), 'email');
        const passValid = this.validateField(document.getElementById('registerPassword'), 'registerPassword');

        if (!userValid || !emailValid || !passValid) {
            e.preventDefault(); // Solo prevenir si hay errores
            this.showMessage('Por favor, corrige los errores antes de continuar', 'error');
            return false;
        }

        // Si todo es válido, el formulario se enviará normalmente a auth.php
        console.log('Formulario de registro válido, enviando a auth.php');
        return true;
    }
    
    // 14. UTILIDADES
    setButtonLoading(button, text) {
        button.disabled = true;
        button.textContent = text;
        button.style.opacity = '0.7';
    }

    showMessage(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            animation: slideInRight 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        
        notification.innerHTML = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    setRedirectUrls(loginUrl, registerUrl) {
        this.redirectUrls.login = loginUrl;
        this.redirectUrls.register = registerUrl;
    }
}

// ===========================================
// INICIALIZACIÓN
// ===========================================
let validator;

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar tema
    initTheme();
    
    // Estilos CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }

        .field-wrapper {
            position: relative;
            margin-bottom: 25px;
            width: 100%;
        }

        .external-validation-icons {
            position: absolute;
            right: -40px;
            top: 12px;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
        }

        .validation-success,
        .validation-error {
            transition: all 0.3s ease;
            opacity: 0;
        }

        .validation-container {
            width: 100%;
            margin-top: 8px;
        }

        .error-message {
            font-size: 12px;
            color: #f10e24ff;
            background: rgba(220, 53, 69, 0.1);
            padding: 8px 12px;
            border-radius: 6px;
            font-weight: 500;
            border-left: 3px solid #ee172dff;
            margin-top: 6px;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            display: none;
        }

        .input-group.valid input {
            border-color: #14ce3fff !important;
            background-color: #f8fff9 !important;
        }

        .input-group.invalid input {
            border-color: #dc3545 !important;
            background-color: #fff8f8 !important;
        }

        .password-strength-bar {
            height: 4px;
            background: #e9ecef;
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 8px;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .strength-text {
            font-size: 11px;
            font-weight: 500;
            opacity: 0;
            transition: all 0.3s ease;
            margin-bottom: 4px;
        }

        @media (max-width: 480px) {
            .external-validation-icons {
                right: -35px;
                width: 25px;
                height: 25px;
            }
            
            .validation-success,
            .validation-error {
                font-size: 16px;
            }
        }
    `;
    document.head.appendChild(style);
    
    validator = new FormValidator();
    console.log('Sistema de validación y tema inicializados correctamente');
});

// ===========================================
// FUNCIONES ADICIONALES
// ===========================================

function setCustomRedirects(loginPage, registerPage) {
    if (validator) {
        validator.setRedirectUrls(loginPage, registerPage);
        console.log('URLs de redirección actualizadas:', { loginPage, registerPage });
    }
}

function isUserLoggedIn() {
    const userData = localStorage.getItem('userData');
    if (userData) {
        const user = JSON.parse(userData);
        return user.isLoggedIn === true;
    }
    return false;
}

function getUserData() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
}

function logout() {
    localStorage.removeItem('userData');
    console.log('Sesión cerrada');
    window.location.href = 'formulario.html';
}