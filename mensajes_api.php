<?php
// mensajes_api.php – 100% FUNCIONAL con PDO (tu config.php)

ob_start();
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function sendJSON($data) {
    if (ob_get_level()) ob_end_clean();
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

// === VERIFICAR SESIÓN ===
if (!isset($_SESSION['usuario_id'])) {
    sendJSON(['success' => false, 'error' => 'No autenticado']);
}

$usuario_id = (int)$_SESSION['usuario_id'];
$usuario_rol = strtolower(trim($_SESSION['usuario_rol'] ?? ''));
$accion = $_GET['accion'] ?? '';

// === CONEXIÓN DB CON PDO ===
require_once 'config.php';
try {
    $pdo = conectarDB();
} catch (Exception $e) {
    sendJSON(['success' => false, 'error' => 'Error de conexión DB']);
}

try {
    switch ($accion) {

        // === OBTENER CONVERSACIONES ===
        case 'obtener_conversaciones':
            if ($_SERVER['REQUEST_METHOD'] !== 'GET') throw new Exception('Método no permitido');

            $sql = "SELECT 
                        c.id AS conversacion_id,
                        IF(c.coordinador_id = ?, c.instructor_id, c.coordinador_id) AS otro_usuario_id,
                        u.nombre AS otro_usuario_nombre,
                        u.email AS otro_usuario_email,
                        COALESCE((SELECT COUNT(*) FROM mensajes m 
                         WHERE m.conversacion_id = c.id 
                         AND m.remitente_id != ? 
                         AND m.leido = FALSE), 0) AS mensajes_no_leidos,
                        (SELECT fecha_envio FROM mensajes m 
                         WHERE m.conversacion_id = c.id 
                         ORDER BY m.fecha_envio DESC LIMIT 1) AS fecha_ultimo_mensaje
                    FROM conversaciones c
                    INNER JOIN usuarios u ON u.id = IF(c.coordinador_id = ?, c.instructor_id, c.coordinador_id)
                    WHERE (c.coordinador_id = ? OR c.instructor_id = ?)
                    AND c.estado = 'activa'
                    ORDER BY c.ultima_actualizacion DESC";

            $stmt = $pdo->prepare($sql);
            $stmt->execute([$usuario_id, $usuario_id, $usuario_id, $usuario_id, $usuario_id]);
            $conversaciones = [];

            while ($row = $stmt->fetch()) {
                $conversaciones[] = [
                    'conversacion_id' => (int)$row['conversacion_id'],
                    'otro_usuario_id' => (int)$row['otro_usuario_id'],
                    'otro_usuario_nombre' => $row['otro_usuario_nombre'],
                    'otro_usuario_email' => $row['otro_usuario_email'],
                    'mensajes_no_leidos' => (int)$row['mensajes_no_leidos'],
                    'fecha_ultimo_mensaje' => $row['fecha_ultimo_mensaje']
                ];
            }
            sendJSON(['success' => true, 'conversaciones' => $conversaciones]);
            break;

        // === OBTENER MENSAJES ===
        case 'obtener_mensajes':
            if ($_SERVER['REQUEST_METHOD'] !== 'GET') throw new Exception('Método no permitido');
            $conversacion_id = (int)($_GET['conversacion_id'] ?? 0);
            if (!$conversacion_id) throw new Exception('ID inválido');

            $check = $pdo->prepare("SELECT id FROM conversaciones WHERE id = ? AND (coordinador_id = ? OR instructor_id = ?)");
            $check->execute([$conversacion_id, $usuario_id, $usuario_id]);
            if ($check->rowCount() === 0) throw new Exception('Sin acceso');

            // CORRECCIÓN: Usar DISTINCT y GROUP BY para evitar duplicados
            $sql = "SELECT DISTINCT m.id, m.remitente_id, m.mensaje, m.leido, m.fecha_envio, 
                    (m.remitente_id = ?) AS es_propio
                    FROM mensajes m
                    WHERE m.conversacion_id = ? 
                    GROUP BY m.id
                    ORDER BY m.fecha_envio ASC, m.id ASC";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$usuario_id, $conversacion_id]);
            
            $mensajes = [];
            $idsVistos = []; // Array para verificar duplicados en PHP también

            while ($row = $stmt->fetch()) {
                $messageId = (int)$row['id'];
                
                // Verificación adicional en PHP para evitar duplicados
                if (in_array($messageId, $idsVistos)) {
                    continue;
                }
                $idsVistos[] = $messageId;
                
                $mensajes[] = [
                    'id' => $messageId,
                    'es_propio' => (bool)$row['es_propio'],
                    'mensaje' => $row['mensaje'],
                    'leido' => (bool)$row['leido'],
                    'fecha_envio' => $row['fecha_envio']
                ];
            }

            // Marcar como leídos
            $pdo->prepare("UPDATE mensajes SET leido = 1 WHERE conversacion_id = ? AND remitente_id != ?")
                ->execute([$conversacion_id, $usuario_id]);

            sendJSON(['success' => true, 'mensajes' => $mensajes]);
            break;

        // === MARCAR COMO LEÍDOS ===
        case 'marcar_leidos':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') throw new Exception('Método no permitido');
            $input = json_decode(file_get_contents('php://input'), true);
            $conversacion_id = (int)($input['conversacion_id'] ?? 0);
            if (!$conversacion_id) throw new Exception('ID inválido');

            $check = $pdo->prepare("SELECT id FROM conversaciones WHERE id = ? AND (coordinador_id = ? OR instructor_id = ?)");
            $check->execute([$conversacion_id, $usuario_id, $usuario_id]);
            if ($check->rowCount() === 0) throw new Exception('Sin acceso');

            $stmt = $pdo->prepare("UPDATE mensajes SET leido = 1 WHERE conversacion_id = ? AND remitente_id != ?");
            $stmt->execute([$conversacion_id, $usuario_id]);

            sendJSON(['success' => true]);
            break;

        // === ENVIAR MENSAJE ===
        case 'enviar_mensaje':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') throw new Exception('Método no permitido');
            $input = json_decode(file_get_contents('php://input'), true);
            $conversacion_id = (int)($input['conversacion_id'] ?? 0);
            $mensaje = trim($input['mensaje'] ?? '');
            if (!$conversacion_id || !$mensaje) throw new Exception('Datos inválidos');

            $check = $pdo->prepare("SELECT id FROM conversaciones WHERE id = ? AND (coordinador_id = ? OR instructor_id = ?)");
            $check->execute([$conversacion_id, $usuario_id, $usuario_id]);
            if ($check->rowCount() === 0) throw new Exception('Sin acceso');

            $stmt = $pdo->prepare("INSERT INTO mensajes (conversacion_id, remitente_id, mensaje) VALUES (?, ?, ?)");
            $stmt->execute([$conversacion_id, $usuario_id, $mensaje]);

            $pdo->prepare("UPDATE conversaciones SET ultima_actualizacion = NOW() WHERE id = ?")
                ->execute([$conversacion_id]);

            sendJSON(['success' => true, 'mensaje_id' => (int)$pdo->lastInsertId()]);
            break;

        // === CREAR CONVERSACIÓN ===
        case 'crear_conversacion':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST' || $usuario_rol !== 'coordinador') throw new Exception('No autorizado');
            $input = json_decode(file_get_contents('php://input'), true);
            $instructor_id = (int)($input['instructor_id'] ?? 0);
            if (!$instructor_id) throw new Exception('ID inválido');

            // Buscar cualquier conversación (activa o archivada)
            $check = $pdo->prepare("SELECT id FROM conversaciones WHERE coordinador_id = ? AND instructor_id = ?");
            $check->execute([$usuario_id, $instructor_id]);
            $result = $check->fetch();

            if ($result) {
                // Reactivar si estaba archivada
                $stmt = $pdo->prepare("UPDATE conversaciones SET estado = 'activa', ultima_actualizacion = NOW() WHERE id = ?");
                $stmt->execute([$result['id']]);
                sendJSON(['success' => true, 'conversacion_id' => (int)$result['id']]);
            } else {
                // Crear nueva
                $stmt = $pdo->prepare("INSERT INTO conversaciones (coordinador_id, instructor_id) VALUES (?, ?)");
                $stmt->execute([$usuario_id, $instructor_id]);
                sendJSON(['success' => true, 'conversacion_id' => (int)$pdo->lastInsertId()]);
            }
            break;

        // === ELIMINAR CONVERSACIÓN ===
        case 'eliminar_conversacion':
            if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') throw new Exception('Método no permitido');
            $conversacion_id = (int)($_GET['conversacion_id'] ?? 0);
            if (!$conversacion_id) throw new Exception('ID inválido');

            $check = $pdo->prepare("SELECT id FROM conversaciones WHERE id = ? AND (coordinador_id = ? OR instructor_id = ?)");
            $check->execute([$conversacion_id, $usuario_id, $usuario_id]);
            if ($check->rowCount() === 0) throw new Exception('Sin acceso');

            $stmt = $pdo->prepare("UPDATE conversaciones SET estado = 'archivada' WHERE id = ?");
            $stmt->execute([$conversacion_id]);

            sendJSON(['success' => true]);
            break;

        // === OBTENER INSTRUCTORES (para modal) ===
        case 'obtener_instructores':
            if ($_SERVER['REQUEST_METHOD'] !== 'GET' || $usuario_rol !== 'coordinador') throw new Exception('No autorizado');

            $stmt = $pdo->prepare("SELECT id, nombre, email FROM usuarios WHERE rol = 'instructor' ORDER BY nombre");
            $stmt->execute();
            $instructores = [];

            while ($row = $stmt->fetch()) {
                $instructores[] = [
                    'id' => (int)$row['id'],
                    'nombre' => $row['nombre'],
                    'email' => $row['email']
                ];
            }
            sendJSON(['success' => true, 'instructores' => $instructores]);
            break;

        default:
            throw new Exception('Acción no válida');
    }

} catch (Exception $e) {
    http_response_code(400);
    sendJSON(['success' => false, 'error' => $e->getMessage()]);
}

exit;
?>