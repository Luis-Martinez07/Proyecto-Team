<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success' => false, 'message' => 'No autorizado']);
    exit;
}

require_once 'config.php';

try {
    $pdo = conectarDB();
    $data = json_decode(file_get_contents('php://input'), true);
    $usuario_id = $_SESSION['usuario_id'];
    
    // Verificar si existe
    $check = $pdo->prepare("SELECT id FROM perfiles_instructores WHERE usuario_id = ?");
    $check->execute([$usuario_id]);
    $exists = $check->fetch();
    
    if ($exists) {
        // UPDATE
        $sql = "UPDATE perfiles_instructores SET 
                cedula = ?, 
                telefono = ?, 
                fecha_nacimiento = ?, 
                especialidad = ?,
                titulo_profesional = ?, 
                fecha_vinculacion = ?
                WHERE usuario_id = ?";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $data['cedula'],
            $data['telefono'],
            $data['fecha_nacimiento'],
            $data['especialidad'],
            $data['titulo_profesional'],
            $data['fecha_vinculacion'],
            $usuario_id
        ]);
    } else {
        // INSERT
        $sql = "INSERT INTO perfiles_instructores 
                (usuario_id, cedula, telefono, fecha_nacimiento, especialidad, 
                titulo_profesional, fecha_vinculacion) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $usuario_id,
            $data['cedula'],
            $data['telefono'],
            $data['fecha_nacimiento'],
            $data['especialidad'],
            $data['titulo_profesional'],
            $data['fecha_vinculacion']
        ]);
    }
    
    echo json_encode([
        'success' => true, 
        'message' => 'Información actualizada correctamente'
    ]);
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>