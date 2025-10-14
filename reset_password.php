<?php
// =============================================
// ARCHIVO: recuperar_password.php
// Formulario para solicitar recuperación
// =============================================
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="reset_pas.css">
    <title>Recuperar Contraseña - SENA</title>
</head>
<body>
     <div class="recovery-container">
        <?php if(isset($_GET['mensaje'])): ?>
            <div class="mensaje <?php echo htmlspecialchars($_GET['tipo']); ?>">
                <i class="fas <?php echo $_GET['tipo'] === 'exito' ? 'fa-check-circle' : 'fa-exclamation-circle'; ?>"></i>
                <?php echo htmlspecialchars($_GET['mensaje']); ?>
            </div>
        <?php endif; ?>
        
        <i class="fas fa-key recovery-icon"></i>
        <h2>¿Olvidaste tu contraseña?</h2>
        <p>Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña de forma segura.</p>
        
        <form action="procesar_recuperacion.php" method="POST">
            <div class="input-group">
                <input type="email" name="email" placeholder="Correo electrónico" required>
                <i class="fa-regular fa-envelope"></i>
            </div>
            
            <button type="submit" class="btn-submit">
                <i class="fas fa-paper-plane"></i> Enviar Instrucciones
            </button>
        </form>
        
        <div class="back-login">
            <a href="index.php"><i class="fa-solid fa-arrow-up-right-from-square"></i> Volver al login</a>
        </div>
    </div>
</body>
</html>