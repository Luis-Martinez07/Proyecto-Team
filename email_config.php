<?php
/**
 * CONFIGURACIÓN DE EMAIL CON PHPMAILER
 * Guarda este archivo en la raíz de tu proyecto o en config/
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Si usas Composer (archivo en la raíz del proyecto)
require_once __DIR__ . '/vendor/autoload.php';

// Si el archivo está en una carpeta "config/", descomenta la línea de abajo y comenta la de arriba
// require_once __DIR__ . '/../vendor/autoload.php';

class EmailSender {
    private $mail;
    
    // ========================================
    // 📝 CONFIGURA TUS DATOS AQUÍ
    // ========================================
    
    // 🔹 Configuración de Gmail
    const SMTP_HOST = 'smtp.gmail.com';
    const SMTP_PORT = 587;
    const SMTP_USER = 'luispereamartinez7@gmail.com';      // ⚠️ REEMPLAZA con tu email de Gmail
    const SMTP_PASS = 'jxfpikvkzcjsiptw';        // ⚠️ REEMPLAZA con la contraseña de aplicación (16 caracteres)
    const FROM_EMAIL = 'luispereamartinez7@gmail.com';     // ⚠️ REEMPLAZA con tu email de Gmail (el mismo de arriba)
    const FROM_NAME = 'SENA - Sistema de Gestión';
    
    // 🔹 Si usas Outlook/Hotmail, comenta Gmail y descomenta esto:
    // const SMTP_HOST = 'smtp-mail.outlook.com';
    // const SMTP_PORT = 587;
    // const SMTP_USER = 'tucorreo@outlook.com';
    // const SMTP_PASS = 'tu_contraseña';
    // const FROM_EMAIL = 'tucorreo@outlook.com';
    
    public function __construct() {
        $this->mail = new PHPMailer(true);
        $this->configurar();
    }
    
    private function configurar() {
        try {
            // Configuración del servidor SMTP
            $this->mail->isSMTP();
            $this->mail->Host = self::SMTP_HOST;
            $this->mail->SMTPAuth = true;
            $this->mail->Username = self::SMTP_USER;
            $this->mail->Password = self::SMTP_PASS;
            $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $this->mail->Port = self::SMTP_PORT;
            $this->mail->CharSet = 'UTF-8';
            
            // Debug detallado (descomenta para ver errores en desarrollo)
            // $this->mail->SMTPDebug = 2;
            // $this->mail->Debugoutput = 'html';

            // Desactivar verificación SSL en localhost (solo desarrollo)
            if (isset($_SERVER['HTTP_HOST']) &&
                ($_SERVER['HTTP_HOST'] === 'localhost' ||
                 strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false)) {
                $this->mail->SMTPOptions = array(
                    'ssl' => array(
                        'verify_peer' => false,
                        'verify_peer_name' => false,
                        'allow_self_signed' => true
                    )
                );
            }
            
            // Remitente
            $this->mail->setFrom(self::FROM_EMAIL, self::FROM_NAME);
            
        } catch (Exception $e) {
            error_log("Error configurando email: " . $e->getMessage());
        }
    }
    
    /**
     * Enviar email de recuperación de contraseña
     * @param string $destinatario Email del destinatario
     * @param string $nombre Nombre del usuario
     * @param string $enlace URL de recuperación
     * @return bool True si se envió, false si falló
     */
    public function enviarRecuperacion($destinatario, $nombre, $enlace) {
        try {
            // Limpiar destinatarios anteriores
            $this->mail->clearAddresses();
            $this->mail->clearAttachments();
            
            // Destinatario
            $this->mail->addAddress($destinatario, $nombre);
            
            // Contenido
            $this->mail->isHTML(true);
            $this->mail->Subject = 'Restablecimiento de Contraseña - SENA';
            $this->mail->Body = $this->plantillaRecuperacion($nombre, $enlace);
            $this->mail->AltBody = $this->plantillaTextoPlano($nombre, $enlace);
            
            // Enviar
            $resultado = $this->mail->send();
            
            if ($resultado) {
                error_log("✅ Email enviado exitosamente a: $destinatario");
            }
            
            return $resultado;
            
        } catch (Exception $e) {
            error_log("❌ Error enviando email: " . $this->mail->ErrorInfo);
            error_log("Detalles: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Plantilla HTML del correo de recuperación
     */
    private function plantillaRecuperacion($nombre, $enlace) {
        return '
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Arial, sans-serif; background-color: #f4f7fa;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f7fa; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #39A900 0%, #2d8400 100%); padding: 40px 30px; text-align: center;">
                            <div style="background: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                                <span style="font-size: 40px;"><i class="fa-solid fa-lock"></i></span>
                            </div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                                Restablecimiento de Contraseña
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px; color: #333; font-size: 16px; line-height: 1.6;">
                                Hola <strong>' . htmlspecialchars($nombre) . '</strong>,
                            </p>
                            
                            <p style="margin: 0 0 20px; color: #000000ff; font-size: 15px; line-height: 1.6;">
                                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en el sistema SENA.
                            </p>
                            
                            <p style="margin: 0 0 30px; color: #000000; font-size: 15px; line-height: 1.6;">
                                Para crear una nueva contraseña, haz clic en el siguiente botón:
                            </p>
                            
                            <!-- Button -->
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="' . $enlace . '" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #39A900 0%, #2d8400 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(57, 169, 0, 0.3);">
                                    Restablecer Mi Contraseña
                                </a>
                            </div>
                            
                            <!-- Alternative Link -->
                            <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #39A900;">
                                <p style="margin: 0 0 10px; color: #666; font-size: 13px; font-weight: 600;">
                                    Si el botón no funciona, copia y pega este enlace en tu navegador:
                                </p>
                                <p style="margin: 0; word-break: break-all; font-size: 12px;">
                                    <a href="' . $enlace . '" style="color: #39A900; text-decoration: none;">
                                        ' . $enlace . '
                                    </a>
                                </p>
                            </div>
                            
                            <!-- Warning -->
                            <div style="margin: 30px 0; padding: 15px; background-color: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
                                <p style="margin: 0; color: #856404; font-size: 14px;">
                                    <strong>⚠️ Importante:</strong> Este enlace expirará en 1 hora por seguridad.
                                </p>
                            </div>
                            
                            <p style="margin: 20px 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                                Si no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña actual seguirá siendo válida.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0 0 10px; color: #6c757d; font-size: 13px;">
                                Este es un correo automático, por favor no respondas a este mensaje.
                            </p>
                            <p style="margin: 0 0 15px; color: #6c757d; font-size: 13px;">
                                © ' . date('Y') . ' SENA - Sistema de Gestión Académica
                            </p>
                            <div style="margin-top: 15px;">
                                <a href="https://www.sena.edu.co" style="color: #39A900; text-decoration: none; font-size: 12px; margin: 0 10px;">
                                    Sitio Web
                                </a>
                                <span style="color: #dee2e6;">|</span>
                                <a href="#" style="color: #39A900; text-decoration: none; font-size: 12px; margin: 0 10px;">
                                    Soporte
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        ';
    }
    
    /**
     * Versión texto plano del email
     */
    private function plantillaTextoPlano($nombre, $enlace) {
        return "
Hola " . $nombre . ",

Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.

Para crear una nueva contraseña, visita el siguiente enlace:
" . $enlace . "

Este enlace expirará en 1 hora por seguridad.

Si no solicitaste este cambio, puedes ignorar este correo.

---
SENA - Sistema de Gestión Académica
Este es un correo automático, por favor no respondas a este mensaje.
        ";
    }
    
    /**
     * Enviar confirmación de cambio exitoso
     * @param string $destinatario Email del destinatario
     * @param string $nombre Nombre del usuario
     * @return bool True si se envió, false si falló
     */
    public function enviarConfirmacionCambio($destinatario, $nombre) {
        try {
            $this->mail->clearAddresses();
            $this->mail->addAddress($destinatario, $nombre);
            
            $this->mail->isHTML(true);
            $this->mail->Subject = '✓ Contraseña Actualizada - SENA';
            $this->mail->Body = $this->plantillaConfirmacion($nombre);
            
            return $this->mail->send();
            
        } catch (Exception $e) {
            error_log("Error enviando confirmación: " . $this->mail->ErrorInfo);
            return false;
        }
    }
    
    /**
     * Plantilla HTML de confirmación
     */
    private function plantillaConfirmacion($nombre) {
        return '
<!DOCTYPE html>
<html lang="es">
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7fa;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f7fa; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                            <div style="font-size: 60px; margin-bottom: 10px;">✓</div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px;">
                                Contraseña Actualizada
                            </h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px; color: #333; font-size: 16px;">
                                Hola <strong>' . htmlspecialchars($nombre) . '</strong>,
                            </p>
                            <p style="margin: 0 0 20px; color: #666; font-size: 15px;">
                                Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
                            </p>
                            <div style="margin: 20px 0; padding: 15px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                                <p style="margin: 0; color: #92400e; font-size: 14px;">
                                    Si no realizaste este cambio, contacta al administrador del sistema inmediatamente.
                                </p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                            <p style="margin: 0; color: #6c757d; font-size: 13px;">
                                © ' . date('Y') . ' SENA - Sistema de Gestión Académica
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        ';
    }
}
?>