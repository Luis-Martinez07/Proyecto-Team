<?php
session_start();

if (!isset($_SESSION['usuario_id'])) {
    header("Location: index.php?mensaje=Debes iniciar sesión&tipo=error");
    exit();
}

$nombre = $_SESSION['usuario_nombre'] ?? 'Usuario';
$email = $_SESSION['usuario_email'] ?? '';
$rol = $_SESSION['usuario_rol'] ?? '';
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="cambiar.pss.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <title>Cambiar Contraseña</title>
</head>
<body>
    <div class="recovery-container">
        <?php if(isset($_GET['mensaje'])): ?>
            <div class="mensaje <?php echo htmlspecialchars($_GET['tipo']); ?>">
                <i class="fas <?php echo $_GET['tipo'] === 'exito' ? 'fa-check-circle' : 'fa-exclamation-circle'; ?>"></i>
                <?php echo htmlspecialchars($_GET['mensaje']); ?>
            </div>
        <?php endif; ?>

        <div class="form-container">
            <div class="user-info">
                <i class="fas fa-user-shield"></i>
                <h3><?php echo htmlspecialchars($nombre); ?></h3>
                <p><?php echo htmlspecialchars($email); ?></p>
                <span class="role-badge"><?php echo htmlspecialchars($rol); ?></span>
            </div>

            <form method="POST" action="procesar_cambio_password.php">
                <div class="title">
                    <h2>Cambiar Contraseña</h2>
                    <p>Por seguridad, cambia tu contraseña regularmente</p>
                </div>

                <div class="input-group">
                    <input type="password" name="password_actual" id="passwordActual" placeholder=" ">
                    <label for="passwordActual">Contraseña Actual</label>
                    <i class="fa-solid fa-lock"></i>
                </div>

                <div class="input-group">
                    <input type="password" name="password_nueva" id="passwordNueva" placeholder=" ">
                    <label for="passwordNueva">Nueva Contraseña</label>
                    <i class="fa-regular fa-eye" id="toggleEye" style="cursor: pointer;"></i>
                </div>

                <div class="button-password">
                    <button type="submit" class="btn-primary" id="submitBtn" disabled>
                        Cambiar Contraseña
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script>
        const passwordActual = document.getElementById('passwordActual');
        const passwordNueva = document.getElementById('passwordNueva');
        const submitBtn = document.getElementById('submitBtn');
        const toggleEye = document.getElementById('toggleEye');

        function validar() {
            const actual = passwordActual.value;
            const nueva = passwordNueva.value;

            const actualOk = actual.length > 0;
            const nuevaOk = nueva.length >= 8 && 
                            /[A-Z]/.test(nueva) && 
                            /[a-z]/.test(nueva) && 
                            /[0-9]/.test(nueva);
            const diferentes = actual !== nueva;

            const valido = actualOk && nuevaOk && diferentes;

            submitBtn.disabled = !valido;
            submitBtn.style.opacity = valido ? '1' : '0.5';
        }

        passwordActual.addEventListener('input', validar);
        passwordNueva.addEventListener('input', validar);

        toggleEye.addEventListener('click', function() {
            const tipo = passwordNueva.type === 'password' ? 'text' : 'password';
            passwordNueva.type = tipo;
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });

        validar();
    </script>
</body>
</html>