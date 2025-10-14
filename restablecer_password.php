<?php
// =============================================
// ARCHIVO: restablecer_password.php
// Formulario para establecer nueva contraseña
// =============================================

// Mostrar errores para debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'config.php';
session_start();

$token_valido = false;
$mensaje_error = '';
$datos = null;
$debug_info = []; // Para ver qué está pasando

// Verificar que el token existe y es válido
if (isset($_GET['token'])) {
    $token = $_GET['token'];
    $debug_info[] = "Token recibido: " . substr($token, 0, 10) . "...";
    
    try {
        $pdo = conectarDB();
        $debug_info[] = "Conexión a BD exitosa";
        
        $stmt = $pdo->prepare("SELECT pr.*, u.nombre, u.email 
                               FROM password_resets pr 
                               INNER JOIN usuarios u ON pr.usuario_id = u.id 
                               WHERE pr.token = ? AND pr.fecha_expiracion > NOW() AND pr.usado = 0");
        $stmt->execute([$token]);
        $datos = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $debug_info[] = "Consulta ejecutada";
        $debug_info[] = "Datos encontrados: " . ($datos ? "SI" : "NO");
        
        if ($datos) {
            $token_valido = true;
            $debug_info[] = "Email: " . $datos['email'];
        } else {
            // Verificar si el token existe pero está expirado o usado
            $stmt2 = $pdo->prepare("SELECT token, fecha_expiracion, usado, 
                                    (fecha_expiracion > NOW()) as no_expirado 
                                    FROM password_resets WHERE token = ?");
            $stmt2->execute([$token]);
            $check = $stmt2->fetch(PDO::FETCH_ASSOC);
            
            if ($check) {
                if ($check['usado'] == 1) {
                    $mensaje_error = "Este enlace ya fue utilizado. Solicita uno nuevo.";
                } elseif ($check['no_expirado'] == 0) {
                    $mensaje_error = "El enlace ha expirado. Solicita uno nuevo.";
                } else {
                    $mensaje_error = "Error al validar el token.";
                }
            } else {
                $mensaje_error = "El enlace no es válido. Solicita uno nuevo.";
            }
        }
        
    } catch (Exception $e) {
        error_log("Error al verificar token: " . $e->getMessage());
        $mensaje_error = "Error del servidor: " . $e->getMessage();
        $debug_info[] = "ERROR: " . $e->getMessage();
    }
} else {
    header("Location: index.php");
    exit();
}

// Procesar el formulario de nueva contraseña
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $token_valido) {
    $nueva_password = $_POST['password'];
    $confirmar_password = $_POST['confirmar_password'];
    
    // Validaciones
    if (strlen($nueva_password) < 8) {
        $mensaje_error = "La contraseña debe tener al menos 8 caracteres.";
    } elseif ($nueva_password !== $confirmar_password) {
        $mensaje_error = "Las contraseñas no coinciden.";
    } else {
        try {
            $pdo = conectarDB();
            
            // Hash de la nueva contraseña
            $password_hash = password_hash($nueva_password, PASSWORD_DEFAULT);
            
            // Actualizar contraseña del usuario
            $stmt = $pdo->prepare("UPDATE usuarios SET password = ? WHERE id = ?");
            $stmt->execute([$password_hash, $datos['usuario_id']]);
            
            // Marcar el token como usado
            $stmt = $pdo->prepare("UPDATE password_resets SET usado = 1 WHERE token = ?");
            $stmt->execute([$token]);
            
            // Redirigir al login con mensaje de éxito
            header("Location: index.php?mensaje=Contraseña actualizada correctamente&tipo=exito");
            exit();
            
        } catch (Exception $e) {
            error_log("Error al actualizar contraseña: " . $e->getMessage());
            $mensaje_error = "Error al actualizar la contraseña. Intenta de nuevo.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="reset_pas.css">
    <title>Restablecer Contraseña - SENA</title>
    <style>
        .mensaje {
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 8px;
            font-weight: 500;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        .mensaje.error {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        .mensaje.exito {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
    </style>
</head>
<body>
    <div class="recovery-container">
        <?php if ($token_valido): ?>
            <i class="fas fa-lock recovery-icon"></i>
            <h2>Crear Nueva Contraseña</h2>
            <p>Ingresa tu nueva contraseña para la cuenta de <strong><?php echo htmlspecialchars($datos['email']); ?></strong></p>
            
            <?php if ($mensaje_error): ?>
                <div class="mensaje error">
                    <i class="fas fa-exclamation-circle"></i> <?php echo htmlspecialchars($mensaje_error); ?>
                </div>
            <?php endif; ?>
            
            <form method="POST">
                <div class="input-group">
                    <input type="password" name="password" id="password" placeholder="Nueva contraseña (mín. 8 caracteres)" required minlength="8">
                    <i class="fa-solid fa-lock"></i>
                </div>
                
                <div class="input-group">
                    <input type="password" name="confirmar_password" id="confirmar_password" placeholder="Confirmar contraseña" required minlength="8">
                    <i class="fa-solid fa-lock"></i>
                </div>
                
                <div class="password-strength">
                    <div class="strength-bar" id="strengthBar"></div>
                </div>
                <small id="strengthText" class="strength-text"></small>
                
                <button type="submit" class="btn-submit">
                    <i class="fas fa-check-circle"></i> Actualizar Contraseña
                </button>
            </form>
            
        <?php else: ?>
            <i class="fas fa-exclamation-triangle recovery-icon" style="color: #dc3545;"></i>
            <h2>Enlace No Válido</h2>
            <p><?php echo htmlspecialchars($mensaje_error); ?></p>
            
            <div class="back-login">
                <a href="reset_password.php"><i class="fas fa-redo"></i> Solicitar nuevo enlace</a>
            </div>
        <?php endif; ?>
        
        <div class="back-login">
            <a href="index.php"><i class="fa-solid fa-arrow-up-right-from-square"></i> Volver al login</a>
        </div>
    </div>
    
    <script>
        // Validación de fortaleza de contraseña
        const password = document.getElementById('password');
        const strengthBar = document.getElementById('strengthBar');
        const strengthText = document.getElementById('strengthText');
        
        if (password) {
            password.addEventListener('input', function() {
                const value = this.value;
                let strength = 0;
                
                if (value.length >= 8) strength++;
                if (value.match(/[a-z]+/)) strength++;
                if (value.match(/[A-Z]+/)) strength++;
                if (value.match(/[0-9]+/)) strength++;
                if (value.match(/[$@#&!]+/)) strength++;
                
                strengthBar.style.width = (strength * 20) + '%';
                
                switch(strength) {
                    case 0:
                    case 1:
                        strengthBar.style.backgroundColor = '#dc3545';
                        strengthText.textContent = 'Débil';
                        strengthText.style.color = '#dc3545';
                        break;
                    case 2:
                    case 3:
                        strengthBar.style.backgroundColor = '#ffc107';
                        strengthText.textContent = 'Media';
                        strengthText.style.color = '#ffc107';
                        break;
                    case 4:
                    case 5:
                        strengthBar.style.backgroundColor = '#28a745';
                        strengthText.textContent = 'Fuerte';
                        strengthText.style.color = '#28a745';
                        break;
                }
            });
        }
        
        // Validar que las contraseñas coincidan
        const confirmar = document.getElementById('confirmar_password');
        if (confirmar) {
            confirmar.addEventListener('input', function() {
                if (this.value !== password.value) {
                    this.setCustomValidity('Las contraseñas no coinciden');
                } else {
                    this.setCustomValidity('');
                }
            });
        }
    </script>
</body>
</html>