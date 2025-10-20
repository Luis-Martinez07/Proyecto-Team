<?php
session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="index.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <title>Login</title>
</head>
<body>
<div class="theme-toggle" onclick="toggleTheme()">
    <i class="fas fa-sun theme-icon sun-icon active"></i>
    <div class="toggle-switch"></div>
    <i class="fas fa-moon theme-icon moon-icon"></i>
</div>

<div class="container" id="container">
    
    <?php if(isset($_GET['mensaje'])): ?>
    <div class="mensaje <?php echo htmlspecialchars($_GET['tipo']); ?>">
        <span><?php echo htmlspecialchars($_GET['mensaje']); ?></span>
        <?php if($_GET['tipo'] === 'exito'): ?>
            <i class="fas fa-check-circle"></i>
        <?php elseif($_GET['tipo'] === 'error'): ?>
            <i class="fas fa-exclamation-circle"></i>
        <?php endif; ?>
    </div>
    <script>
        // Mostrar el mensaje por 3 segundos y luego limpiarlo
        setTimeout(function() {
            const mensaje = document.querySelector('.mensaje');
            if (mensaje) {
                mensaje.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                mensaje.style.opacity = '0';
                mensaje.style.transform = 'translateY(-20px)';
                
                setTimeout(function() {
                    const url = new URL(window.location);
                    url.searchParams.delete('mensaje');
                    url.searchParams.delete('tipo');
                    window.history.replaceState({}, document.title, url.pathname);
                    mensaje.remove();
                }, 500);
            }
        }, 3000);
    </script>
<?php endif; ?>

    <!-- Login Form -->
    <div class="form-container login">
        <h2>Login</h2>
        <p>¡Bienvenido de nuevo! Inicia sesión en tu cuenta.</p>
        
        <form id="loginForm" action="auth.php" method="POST">
            <input type="hidden" name="accion" value="login">
            
            <div class="input-group">
                <input type="email" name="email" id="loginUser" placeholder="Correo electrónico" required>
                <i class="fa-regular fa-user"></i>
            </div>
            
            <div class="input-group">
                <input type="password" name="password" id="loginPassword" placeholder="Contraseña" required>
                <i class="fa-regular fa-eye"></i>
            </div>
            
            <button type="submit" class="btn-primary">Iniciar Sesión</button>
            
            <div class="social-login">
                <p>Acceder con redes</p>
                <div class="social-icons">
                    <a href="#"><i class="fab fa-google"></i></a>
                </div>
            </div>
            <div class="forgot-password">
                <a href="reset_password.php">¿Olvidaste tu contraseña?</a>
            </div>
        </form>
    </div>

    <!-- Register Form -->
    <div class="form-container register">
        <h2>Crear Cuenta</h2>
        <p>Regístrate para comenzar.</p>
        
        <form id="registerForm" action="auth.php" method="POST">
            <input type="hidden" name="accion" value="registro">
            
            <div class="input-group">
                <input type="text" name="nombre" id="registerUser" placeholder="Nombre completo" required>
                <i class="fa-regular fa-user"></i>
            </div>
            
            <div class="input-group">
                <input type="email" name="email" id="registerEmail" placeholder="Correo electrónico" required>
                <i class="fa-regular fa-envelope"></i>
            </div>
            
            <div class="input-group">
                <input type="password" name="password" id="registerPassword" placeholder="Contraseña (mín. 8 caracteres)" required>
              <i class="fa-regular fa-eye"></i>
            </div>
            
            <button type="submit" class="btn-primary">Crear cuenta</button>
            
            <div class="social-login">
                <p>Crear cuenta con esta red</p>
                <div class="social-icons">
                    <a href="#"><i class="fab fa-google"></i></a>
                </div>
            </div>
        </form>
    </div>

    <!-- Panel -->
    <div class="panel">
        <div class="panel-content">
            <h1>¡Hola, Bienvenido!</h1>
            <p>¿No tienes una cuenta?</p>
            <button class="btn-ghost" onclick="toggleForm()">Crear Cuenta</button>
        </div>
    </div>
</div>
<script src="form.js"></script>
</body>
</html>