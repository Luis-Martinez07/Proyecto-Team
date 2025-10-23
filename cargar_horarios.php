<?php
session_start();
require_once 'config.php';

// Verificar que el usuario esté logueado y sea instructor
if (!isset($_SESSION['usuario_id']) || strtolower(trim($_SESSION['usuario_rol'] ?? '')) !== 'instructor') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

try {
    $pdo = conectarDB();
    $usuario_id = $_SESSION['usuario_id'];
    
    // Obtener todos los horarios del instructor
    $sql = "SELECT id, nombre_horario, template_tipo, datos_json, total_clases, fecha_creacion 
            FROM horarios 
            WHERE usuario_id = :usuario_id 
            ORDER BY fecha_creacion DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':usuario_id' => $usuario_id]);
    
    $horarios = $stmt->fetchAll();
    
    // Procesar cada horario para extraer información relevante
    $horarios_procesados = [];
    foreach ($horarios as $horario) {
        $datos = json_decode($horario['datos_json'], true);
        
        // Determinar estado (podrías agregar un campo 'estado' en la BD)
        $estado = ($horario['total_clases'] > 0) ? 'Activo' : 'Borrador';
        
        $horarios_procesados[] = [
            'id' => $horario['id'],
            'nombre' => $horario['nombre_horario'],
            'tipo' => $horario['template_tipo'],
            'total_clases' => $horario['total_clases'],
            'fecha_creacion' => $horario['fecha_creacion'],
            'estado' => $estado,
            'dias_activos' => $datos['dias_activos'] ?? [],
            'hora_inicio' => $datos['hora_inicio'] ?? '',
            'hora_fin' => $datos['hora_fin'] ?? '',
            'bloques' => count($datos['bloques'] ?? [])
        ];
    }
    
    echo json_encode([
        'success' => true,
        'horarios' => $horarios_procesados
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al cargar los horarios: ' . $e->getMessage()
    ]);
}
?>