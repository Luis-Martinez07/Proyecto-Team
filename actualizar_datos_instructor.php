<?php
session_start();
header('Content-Type: application/json');

// IMPORTANTE: Agregar logs para debug
error_log("=== INICIO actualizar_datos_instructor.php ===");

// Verificar sesión
if (!isset($_SESSION['usuario_id'])) {
    error_log("ERROR: No hay sesión activa");
    echo json_encode(['success' => false, 'message' => 'No hay sesión activa']);
    exit;
}

error_log("Usuario ID: " . $_SESSION['usuario_id']);

// Incluir conexión a BD
require_once 'conexion.php'; // o el archivo que tengas para la conexión

try {
    // Recibir datos JSON
    $json = file_get_contents('php://input');
    error_log("JSON recibido: " . $json);
    
    $data = json_decode($json, true);
    
    if (!$data) {
        error_log("ERROR: No se pudieron decodificar los datos JSON");
        throw new Exception('No se recibieron datos válidos');
    }
    
    error_log("Datos decodificados: " . print_r($data, true));
    
    $usuario_id = $_SESSION['usuario_id'];
    
    // Validar campos requeridos
    if (empty($data['cedula']) || empty($data['telefono'])) {
        error_log("ERROR: Faltan campos requeridos");
        throw new Exception('Cédula y teléfono son obligatorios');
    }
    
    // Convertir fechas del formato DD/MM/YYYY a YYYY-MM-DD
    $fecha_nacimiento = null;
    if (!empty($data['fecha_nacimiento'])) {
        $fecha_partes = explode('/', $data['fecha_nacimiento']);
        if (count($fecha_partes) === 3) {
            $fecha_nacimiento = $fecha_partes[2] . '-' . $fecha_partes[1] . '-' . $fecha_partes[0];
            error_log("Fecha de nacimiento convertida: " . $fecha_nacimiento);
        }
    }
    
    $fecha_vinculacion = null;
    if (!empty($data['fecha_vinculacion'])) {
        $fecha_partes = explode('/', $data['fecha_vinculacion']);
        if (count($fecha_partes) === 3) {
            $fecha_vinculacion = $fecha_partes[2] . '-' . $fecha_partes[1] . '-' . $fecha_partes[0];
            error_log("Fecha de vinculación convertida: " . $fecha_vinculacion);
        }
    }
    
    // Preparar consulta SQL
    $sql = "UPDATE usuarios SET 
            cedula = :cedula,
            telefono = :telefono,
            fecha_nacimiento = :fecha_nacimiento,
            fecha_vinculacion = :fecha_vinculacion,
            titulo_profesional = :titulo_profesional,
            especialidad = :especialidad
            WHERE id = :usuario_id";
    
    error_log("SQL a ejecutar: " . $sql);
    
    $stmt = $pdo->prepare($sql);
    
    // Ejecutar consulta
    $params = [
        ':cedula' => $data['cedula'],
        ':telefono' => $data['telefono'],
        ':fecha_nacimiento' => $fecha_nacimiento,
        ':fecha_vinculacion' => $fecha_vinculacion,
        ':titulo_profesional' => $data['titulo_profesional'] ?? null,
        ':especialidad' => $data['especialidad'] ?? null,
        ':usuario_id' => $usuario_id
    ];
    
    error_log("Parámetros: " . print_r($params, true));
    
    $resultado = $stmt->execute($params);
    
    if ($resultado) {
        error_log("✅ Actualización exitosa");
        echo json_encode([
            'success' => true,
            'message' => 'Información actualizada correctamente'
        ]);
    } else {
        error_log("ERROR: No se pudo actualizar");
        throw new Exception('No se pudo actualizar la información');
    }
    
} catch (PDOException $e) {
    error_log("ERROR PDO: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Error en la base de datos: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    error_log("ERROR: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

error_log("=== FIN actualizar_datos_instructor.php ===");
?>