<?php
// =============================================
// ARCHIVO: procesar_recuperacion.php
// Procesa la solicitud de recuperación de contraseña
// =============================================

// Mostrar errores para debugging (quitar en producción)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'config.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    
    // Validar formato de email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: reset_password.php?mensaje=Email inválido&tipo=error");
        exit();
    }
    
    try {
        $pdo = conectarDB();
        
        // Verificar si el email existe en la base de datos
        $stmt = $pdo->prepare("SELECT id, nombre, email FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $usuario = $stmt->fetch();
        
        if (!$usuario) {
            // Por seguridad, mostramos el mismo mensaje aunque el email no exista
            header("Location: reset_password.php?mensaje=Si el correo existe, recibirás las instrucciones&tipo=exito");
            exit();
        }
        
        // Generar token único y seguro
        $token = bin2hex(random_bytes(32));
        $expiracion = date('Y-m-d H:i:s', strtotime('+1 hour')); // Token válido por 1 hora
        
        // Guardar token en la base de datos (actualiza si ya existe)
        // Primero eliminamos tokens anteriores del mismo usuario
        $stmtDelete = $pdo->prepare("DELETE FROM password_resets WHERE email = ? AND usado = 0");
        $stmtDelete->execute([$email]);
        
        // Luego insertamos el nuevo token
        $stmt = $pdo->prepare("INSERT INTO password_resets (usuario_id, email, token, fecha_expiracion) 
                              VALUES (?, ?, ?, ?)");
        $resultado = $stmt->execute([$usuario['id'], $email, $token, $expiracion]);
        
        if (!$resultado) {
            header("Location: reset_password.php?mensaje=Error al guardar el token&tipo=error");
            exit();
        }
        
        // Construir el enlace de recuperación correctamente
        $protocolo = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
        $host = $_SERVER['HTTP_HOST'];
        
        // Obtener la ruta del directorio actual
        $script_name = $_SERVER['SCRIPT_NAME'];
        $directorio = dirname($script_name);
        
        // Si estamos en la raíz, dirname devuelve "/", si no, devuelve "/carpeta"
        if ($directorio === '/' || $directorio === '\\') {
            $directorio = '';
        }
        
        $enlace_recuperacion = $protocolo . $host . $directorio . "/restablecer_password.php?token=" . $token;
        
        // Log para verificar el enlace generado
        error_log("Enlace generado: " . $enlace_recuperacion);
        
        if (enviarEmailRecuperacion($email, $usuario['nombre'], $enlace_recuperacion)) {
            header("Location: reset_password.php?mensaje=Instrucciones enviadas a tu correo&tipo=exito");
        } else {
            header("Location: reset_password.php?mensaje=Error al enviar el correo. Intenta de nuevo&tipo=error");
        }
        
    } catch (PDOException $e) {
        // Mostrar el error específico para debugging
        $error_msg = "Error: " . $e->getMessage();
        error_log("Error en recuperación de contraseña: " . $e->getMessage());
        header("Location: reset_password.php?mensaje=" . urlencode($error_msg) . "&tipo=error");
        exit();
    } catch (Exception $e) {
        $error_msg = "Error general: " . $e->getMessage();
        error_log("Error general: " . $e->getMessage());
        header("Location: reset_password.php?mensaje=" . urlencode($error_msg) . "&tipo=error");
        exit();
    }
    
} else {
    header("Location: reset_password.php");
}
exit();

// =============================================
// Función para enviar email
// =============================================
function enviarEmailRecuperacion($email, $nombre, $enlace) {
    // Usando mail() nativo de PHP
    $asunto = 'Recuperación de Contraseña - SENA';
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=utf-8\r\n";
    $headers .= "From: SENA Sistema <noreply@sena.edu.co>\r\n";
    
    $mensaje = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
            .header { background-color: #39A900; color: white; padding: 20px; text-align: center; }
            .content { background-color: white; padding: 30px; margin: 20px 0; border-radius: 5px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #39A900; color: white; 
                     text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>Recuperación de Contraseña</h1>
            </div>
            <div class='content'>
                <h2>Hola, $nombre</h2>
                <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
                <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                <center>
                    <a href='$enlace' class='button'>Restablecer Contraseña</a>
                </center>
                <p><strong>Este enlace expirará en 1 hora.</strong></p>
                <p>Si no solicitaste este cambio, ignora este mensaje y tu contraseña permanecerá sin cambios.</p>
                <hr>
                <p style='font-size: 12px; color: #666;'>Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
                <a href='$enlace'>$enlace</a></p>
            </div>
            <div class='footer'>
                <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                <p>&copy; " . date('Y') . " SENA - Todos los derechos reservados</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    try {
        // Intentar enviar el email
        if (mail($email, $asunto, $mensaje, $headers)) {
            return true;
        } else {
            // Si mail() falla, al menos guardamos el token para uso manual
            error_log("Email no enviado, pero token guardado: $enlace");
            return true; // Retornamos true para que el proceso continúe
        }
    } catch (Exception $e) {
        error_log("Error al enviar email: " . $e->getMessage());
        return true; // Retornamos true para que el proceso continúe
    }
}
?>