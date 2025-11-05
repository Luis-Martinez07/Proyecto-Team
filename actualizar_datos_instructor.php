<?php
session_start();
header('Content-Type: application/json');

// Verificar sesión
if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'No hay sesión activa']);
    exit;
}

// Incluir archivo de configuración
require_once 'config.php';

try {
    // Obtener conexión
    $pdo = conectarDB();
    
    // Recibir datos JSON
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (!$data) {
        throw new Exception('No se recibieron datos válidos');
    }
    
    $usuario_id = $_SESSION['usuario_id'];
    
    // Validar campos requeridos
    if (empty($data['cedula']) || empty($data['telefono'])) {
        throw new Exception('Cédula y teléfono son obligatorios');
    }
    
    // Convertir fechas del formato DD/MM/YYYY a YYYY-MM-DD
    $fecha_nacimiento = null;
    if (!empty($data['fecha_nacimiento'])) {
        $fecha_partes = explode('/', $data['fecha_nacimiento']);
        if (count($fecha_partes) === 3) {
            $fecha_nacimiento = $fecha_partes[2] . '-' . $fecha_partes[1] . '-' . $fecha_partes[0];
        }
    }
    
    $fecha_vinculacion = null;
    if (!empty($data['fecha_vinculacion'])) {
        $fecha_partes = explode('/', $data['fecha_vinculacion']);
        if (count($fecha_partes) === 3) {
            $fecha_vinculacion = $fecha_partes[2] . '-' . $fecha_partes[1] . '-' . $fecha_partes[0];
        }
    }
    
    // Primero verificar si ya existe un perfil para este usuario
    $checkSql = "SELECT id FROM perfiles_instructores WHERE usuario_id = ?";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([$usuario_id]);
    $exists = $checkStmt->fetch();
    
    if ($exists) {
        // Actualizar perfil existente
        $sql = "UPDATE perfiles_instructores SET 
                cedula = :cedula,
                telefono = :telefono,
                fecha_nacimiento = :fecha_nacimiento,
                fecha_vinculacion = :fecha_vinculacion,
                titulo_profesional = :titulo_profesional,
                especialidad = :especialidad,
                updated_at = NOW()
                WHERE usuario_id = :usuario_id";
    } else {
        // Insertar nuevo perfil
        $sql = "INSERT INTO perfiles_instructores 
                (usuario_id, cedula, telefono, fecha_nacimiento, fecha_vinculacion, 
                 titulo_profesional, especialidad, estado, created_at) 
                VALUES 
                (:usuario_id, :cedula, :telefono, :fecha_nacimiento, :fecha_vinculacion, 
                 :titulo_profesional, :especialidad, 'activo', NOW())";
    }
    
    $stmt = $pdo->prepare($sql);
    
    // Ejecutar consulta
    $resultado = $stmt->execute([
        ':cedula' => $data['cedula'],
        ':telefono' => $data['telefono'],
        ':fecha_nacimiento' => $fecha_nacimiento,
        ':fecha_vinculacion' => $fecha_vinculacion,
        ':titulo_profesional' => $data['titulo_profesional'] ?? null,
        ':especialidad' => $data['especialidad'] ?? null,
        ':usuario_id' => $usuario_id
    ]);
    
    if ($resultado) {
        echo json_encode([
            'success' => true,
            'message' => 'Información actualizada correctamente'
        ]);
    } else {
        throw new Exception('No se pudo actualizar la información');
    }
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error en la base de datos: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>