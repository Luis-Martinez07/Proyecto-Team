<?php
/**
 * PROCESAR RECUPERACIÓN CON PHPMAILER
 * Reemplaza tu procesar_recuperacion.php actual con este
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once 'config.php';
require_once('email_config.php');
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
        
        // Verificar si el email existe
        $stmt = $pdo->prepare("SELECT id, nombre, email FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $usuario = $stmt->fetch();
        
        if (!$usuario) {
            // Por seguridad, mostramos mensaje genérico
            header("Location: reset_password.php?mensaje=Si el correo existe, recibirás las instrucciones&tipo=exito");
            exit();
        }
        
        // Generar token seguro
        $token = bin2hex(random_bytes(32));
        $expiracion = date('Y-m-d H:i:s', strtotime('+1 hour'));
        
        // Eliminar tokens anteriores del usuario
        $stmtDelete = $pdo->prepare("DELETE FROM password_resets WHERE email = ? AND usado = 0");
        $stmtDelete->execute([$email]);
        
        // Insertar nuevo token
        $stmt = $pdo->prepare("INSERT INTO password_resets (usuario_id, email, token, fecha_expiracion) 
                              VALUES (?, ?, ?, ?)");
        $resultado = $stmt->execute([$usuario['id'], $email, $token, $expiracion]);
        
        if (!$resultado) {
            throw new Exception("Error al guardar el token");
        }
        
        // Construir enlace de recuperación
        $protocolo = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
        $host = $_SERVER['HTTP_HOST'];
        $directorio = dirname($_SERVER['SCRIPT_NAME']);
        
        if ($directorio === '/' || $directorio === '\\') {
            $directorio = '';
        }
        
        $enlace_recuperacion = $protocolo . $host . $directorio . "/restablecer_password.php?token=" . $token;
        
        // Log para debugging
        error_log("🔗 Enlace generado: " . $enlace_recuperacion);
        error_log("📧 Enviando a: " . $email);
        
        // ========================================
        // ENVIAR EMAIL CON PHPMAILER
        // ========================================
        $emailSender = new EmailSender();
        $emailEnviado = $emailSender->enviarRecuperacion($email, $usuario['nombre'], $enlace_recuperacion);
        
        if ($emailEnviado) {
            error_log("✅ Email enviado exitosamente a: " . $email);
            header("Location: reset_password.php?mensaje=Revisa tu correo electrónico. Te hemos enviado las instrucciones&tipo=exito");
        } else {
            error_log("❌ Error al enviar email a: " . $email);
            // Aún así mostramos el enlace en los logs para testing
            error_log("⚠️ Usa este enlace manualmente: " . $enlace_recuperacion);
            header("Location: reset_password.php?mensaje=Error al enviar el correo. Contacta al administrador&tipo=error");
        }
        
    } catch (PDOException $e) {
        error_log("Error en recuperación: " . $e->getMessage());
        header("Location: reset_password.php?mensaje=Error del servidor. Intenta de nuevo&tipo=error");
        exit();
    } catch (Exception $e) {
        error_log("Error general: " . $e->getMessage());
        header("Location: reset_password.php?mensaje=Error al procesar la solicitud&tipo=error");
        exit();
    }
    
} else {
    header("Location: reset_password.php");
}
exit();
?>