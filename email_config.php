<?php
/**
 * CONFIGURACIÓN DE EMAIL CON PHPMAILER
 * Versión con estilos inline (100% compatible con todos los clientes de email)
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/vendor/autoload.php';

class EmailSender {
    private $mail;
    
    const SMTP_HOST = 'smtp.gmail.com';
    const SMTP_PORT = 587;
    const SMTP_USER = 'luispereamartinez7@gmail.com';
    const SMTP_PASS = 'jxfpikvkzcjsiptw';
    const FROM_EMAIL = 'luispereamartinez7@gmail.com';
    const FROM_NAME = 'SENA - Sistema de Gestión';
    
    public function __construct() {
        $this->mail = new PHPMailer(true);
        $this->configurar();
    }
    
    private function configurar() {
        try {
            $this->mail->isSMTP();
            $this->mail->Host = self::SMTP_HOST;
            $this->mail->SMTPAuth = true;
            $this->mail->Username = self::SMTP_USER;
            $this->mail->Password = self::SMTP_PASS;
            $this->mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $this->mail->Port = self::SMTP_PORT;
            $this->mail->CharSet = 'UTF-8';

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
            
            $this->mail->setFrom(self::FROM_EMAIL, self::FROM_NAME);
            
        } catch (Exception $e) {
            error_log("Error configurando email: " . $e->getMessage());
        }
    }
    
    public function enviarRecuperacion($destinatario, $nombre, $enlace) {
        try {
            $this->mail->clearAddresses();
            $this->mail->clearAttachments();
            
            $this->mail->addAddress($destinatario, $nombre);
            
            $this->mail->isHTML(true);
            $this->mail->Subject = 'Restablecimiento de Contraseña - SENA';
            $this->mail->Body = $this->plantillaRecuperacion($nombre, $enlace);
            $this->mail->AltBody = $this->plantillaTextoPlano($nombre, $enlace);
            
            $resultado = $this->mail->send();
            
            if ($resultado) {
                error_log("✅ Email enviado exitosamente a: $destinatario");
            }
            
            return $resultado;
            
        } catch (Exception $e) {
            error_log("❌ Error enviando email: " . $this->mail->ErrorInfo);
            return false;
        }
    }
    
    private function plantillaRecuperacion($nombre, $enlace) {
        return "
<!DOCTYPE html>
<html lang=\"es\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
</head>
<body style=\"margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;; background: white; min-height: 100vh;\">
    <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"padding: 40px 20px;\">
        <tr>
            <td align=\"center\">
                <table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"background-color: #ffffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);\">
                    
                    <!-- Header con gradiente -->
                    <tr>
                        <td style=\"background: #000000ff; padding: 50px 30px; text-align: center; position: relative;\">
                            <div style=\"width: 100px; height: 100px; border-radius: 50%; margin: 0 auto 25px; background: transparent; backdrop-filter: blur(10px); border: 3px solid rgba(255, 255, 255, 1); display: inline-block; line-height: 100px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);\">
                                <span style=\"font-size: 50px; filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1)); \">🔒</span>
                            </div>
                            <h1 style=\"margin: 0; color: #ffffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);\">
                                Restablecer Contraseña
                            </h1>
                            <p style=\"margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 15px; font-weight: bold  ;\">
                                Sistema de Gestión Académica 
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Contenido principal -->
                    <tr>
                        <td style=\"padding: 50px 40px;\">
                            <div style=\"margin-bottom: 30px;\">
                                <p style=\"margin: 0 0 8px 0; color: #086BFF; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;\">
                                    Hola,
                                </p>
                                <h2 style=\"margin: 0; color: #1f2937; font-size: 24px; font-weight: 700;\">
                                    " . htmlspecialchars($nombre) . "
                                </h2>
                            </div>
                            
                            <p style=\"margin: 0 0 25px 0; color: #000000ff; font-size: 16px; line-height: 1.7;\">
                                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. No te preocupes, esto es común y podemos ayudarte a recuperar el acceso.
                            </p>
                            
                            <p style=\"margin: 0 0 35px 0; color: #000000ff; font-size: 16px; line-height: 1.7;\">
                                Para crear una nueva contraseña segura, haz clic en el botón de abajo
                            </p>
                            
                            <div style=\"text-align: center; margin: 40px 0;\">
                     <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">
                         <tr>
                       <td align=\"center\">
                         <a href=\"" . $enlace . "\" style=\"display: inline-block; padding: 18px 45px; background: #086BFF; color: #ffffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 17px; letter-spacing: 0.5px;\">
                            Nueva Contraseña
                         </a>
                         </td>
                          </tr>
                       </table>
                        </div>
                            
                            <div style=\"margin: 35px 0; padding: 25px; background: transparent; border-radius: 8px; border-left: 4px solid #ffffffff; border: 1px solid #000000;\">
                                <p style=\"margin: 0 0 8px 0; color: #000000ff; font-size: 15px; font-weight: 700;\">
                                  Importante: Este enlace expira pronto
                                </p>
                                <p style=\"margin: 0; color: #086BFF; font-size: 14px; line-height: 1.6;\">
                                    Por tu seguridad, este enlace solo será válido durante <strong>1 hora</strong>. Después de ese tiempo, deberás solicitar uno nuevo.
                                </p>
                            </div>
                            
                            <div style=\"margin: 30px 0 0 0; padding-top: 25px; border-top: 2px dashed #e5e7eb;\">
                                <p style=\"margin: 0; color: #086BFF; font-size: 14px; line-height: 1.7;\">
                                    <strong style=\"color: #000000ff;\">🛡️ ¿No solicitaste este cambio?</strong><br>
                                    Si no fuiste tú quien solicitó restablecer la contraseña, puedes ignorar este correo de forma segura. Tu cuenta permanecerá protegida y tu contraseña actual seguirá siendo válida.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style=\"background: #969696; padding: 35px 40px; border-top: 1px solid #e5e7eb;\">
                            <div style=\"width: 60px; height: 3px; background: #086BFF; margin: 0 auto 25px auto; border-radius: 2px;\"></div>
                            
                            <p style=\"margin: 0 0 12px 0; color: #ffffffff; font-size: 13px; text-align: center; line-height: 1.6;\">
                                Este es un correo automático, por favor no respondas a este mensaje.
                            </p>
                            
                            <p style=\"margin: 0 0 20px 0; color: #ffffffff; font-size: 13px; text-align: center; font-weight: 600;\">
                                © " . date('Y') . " - Sistema de Gestión Académica
                            </p>
                        </td>
                    </tr>
                    
                </table>
                
                <p style=\"margin: 25px 0 0 0; color: rgba(255, 255, 255, 0.8); font-size: 12px; text-align: center;\">
                    ¿Necesitas ayuda? Contacta a nuestro equipo de soporte
                </p>
            </td>
        </tr>
    </table>
</body>
</html>
        ";
    }
    
    private function plantillaTextoPlano($nombre, $enlace) {
        return "
Hola " . $nombre . ",

Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.

Para crear una nueva contraseña, visita el siguiente enlace:
" . $enlace . "

Este enlace expirará en 1 hora por seguridad.

Si no solicitaste este cambio, puedes ignorar este correo.

---
Sistema de Gestión Académica
        ";
    }
    
    public function enviarConfirmacionCambio($destinatario, $nombre) {
        try {
            $this->mail->clearAddresses();
            $this->mail->addAddress($destinatario, $nombre);
            
            $this->mail->isHTML(true);
            $this->mail->Subject = '✓ Contraseña Actualizada';
            $this->mail->Body = $this->plantillaConfirmacion($nombre);
            
            return $this->mail->send();
            
        } catch (Exception $e) {
            error_log("Error enviando confirmación: " . $this->mail->ErrorInfo);
            return false;
        }
    }
    
    private function plantillaConfirmacion($nombre) {
        return "
<!DOCTYPE html>
<html lang=\"es\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
</head>
<body style=\"margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7fa;\">
    <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"background-color: #f4f7fa; padding: 40px 20px;\">
        <tr>
            <td align=\"center\">
                <table width=\"600\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);\">
                    <tr>
                        <td style=\"background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;\">
                            <div style=\"font-size: 60px; margin-bottom: 10px; color: #ffffff;\">✓</div>
                            <h1 style=\"margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;\">
                                Contraseña Actualizada
                            </h1>
                        </td>
                    </tr>
                    <tr>
                        <td style=\"padding: 40px 30px;\">
                            <p style=\"margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;\">
                                Hola <strong>" . htmlspecialchars($nombre) . "</strong>,
                            </p>
                            <p style=\"margin: 0 0 20px 0; color: #000000ff; font-size: 15px; line-height: 1.6;\">
                                Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
                            </p>
                            <div style=\"margin: 20px 0; padding: 15px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;\">
                                <p style=\"margin: 0; color: #92400e; font-size: 14px;\">
                                    Si no realizaste este cambio, contacta al administrador del sistema inmediatamente.
                                </p>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style=\"background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;\">
                            <p style=\"margin: 0; color: #6c757d; font-size: 13px;\">
                                © " . date('Y') . " Sistema de Gestión Académica
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        ";
    }
}
?>