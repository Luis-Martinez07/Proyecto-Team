<?php
session_start();
header('Content-Type: application/json');

// === 1. VERIFICAR SESIÓN ===
if (!isset($_SESSION['usuario_id'])) {
    responder(false, 'Sesión expirada. Por favor, inicia sesión nuevamente.');
    exit;
}

require_once 'config.php';

try {
    $pdo = conectarDB();
    $data = json_decode(file_get_contents('php://input'), true);
    $usuario_id = $_SESSION['usuario_id'];

    // === 2. VALIDACIÓN DE CAMPOS ===
    $errores = [];

    if (empty($data['cedula'])) {
        $errores[] = 'La cédula es obligatoria';
    } elseif (!preg_match('/^\d{7,10}$/', $data['cedula'])) {
        $errores[] = 'Cédula inválida (7-10 dígitos)';
    }

    if (empty($data['telefono'])) {
        $errores[] = 'El teléfono es obligatorio';
    } elseif (!preg_match('/^\d{10,11}$/', $data['telefono'])) {
        $errores[] = 'Teléfono inválido (10-11 dígitos)';
    }

    if (!empty($data['fecha_nacimiento']) && !validarFecha($data['fecha_nacimiento'])) {
        $errores[] = 'Fecha de nacimiento inválida (usa dd/mm/aaaa)';
    }

    if (!empty($data['fecha_vinculacion']) && !validarFecha($data['fecha_vinculacion'])) {
        $errores[] = 'Fecha de vinculación inválida (usa dd/mm/aaaa)';
    }

    if (!empty($errores)) {
        responder(false, 'Corrige los siguientes errores:', $errores);
        exit;
    }

    // === 3. CONVERTIR FECHAS ===
    $fecha_nacimiento = convertirFecha($data['fecha_nacimiento']);
    $fecha_vinculacion = convertirFecha($data['fecha_vinculacion']);

    // === 4. VERIFICAR PERFIL EXISTENTE ===
    $check = $pdo->prepare("SELECT id FROM perfiles_instructores WHERE usuario_id = ?");
    $check->execute([$usuario_id]);
    $exists = $check->fetch();

    // === 5. GUARDAR DATOS ===
    if ($exists) {
        $sql = "UPDATE perfiles_instructores SET 
                cedula = ?, telefono = ?, fecha_nacimiento = ?, 
                titulo_profesional = ?, especialidad = ?, fecha_vinculacion = ?
                WHERE usuario_id = ?";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['cedula'],
            $data['telefono'],
            $fecha_nacimiento,
            $data['titulo_profesional'] ?? '',
            $data['especialidad'] ?? '',
            $fecha_vinculacion,
            $usuario_id
        ]);

        responder(true, '¡Perfil actualizado correctamente!');
    } else {
        $sql = "INSERT INTO perfiles_instructores 
                (usuario_id, cedula, telefono, fecha_nacimiento, titulo_profesional, especialidad, fecha_vinculacion) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $usuario_id,
            $data['cedula'],
            $data['telefono'],
            $fecha_nacimiento,
            $data['titulo_profesional'] ?? '',
            $data['especialidad'] ?? '',
            $fecha_vinculacion
        ]);

        responder(true, '¡Perfil creado exitosamente!');
    }

} catch (Exception $e) {
    error_log("Error en actualizar_datos_instructor.php: " . $e->getMessage());
    responder(false, 'Error del servidor. Inténtalo más tarde.');
}

// ========================================
// FUNCIONES AUXILIARES
// ========================================

/**
 * Responde con JSON dinámico
 */
function responder(bool $success, string $mensaje, array $detalles = []) {
    $respuesta = [
        'success' => $success,
        'message' => htmlspecialchars($mensaje, ENT_QUOTES, 'UTF-8')
    ];

    if (!empty($detalles)) {
        $respuesta['errors'] = array_map(fn($e) => htmlspecialchars($e, ENT_QUOTES, 'UTF-8'), $detalles);
    }

    echo json_encode($respuesta);
    exit;
}

/**
 * Valida formato dd/mm/aaaa
 */
function validarFecha(string $fecha): bool {
    if (!preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $fecha)) return false;
    $partes = explode('/', $fecha);
    return checkdate((int)$partes[1], (int)$partes[0], (int)$partes[2]);
}

/**
 * Convierte dd/mm/aaaa → YYYY-MM-DD
 */
function convertirFecha(?string $fecha): ?string {
    if (empty($fecha)) return null;
    $partes = explode('/', $fecha);
    return "$partes[2]-$partes[1]-$partes[0]";
}
?>