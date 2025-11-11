<?php
// mensajes_api.php – 100% FUNCIONAL (PDO + CORS)
ob_start();
session_start();
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

// === CONEXIÓN DB ===
require_once 'config/config.php';;
try { $pdo = conectarDB(); } catch (Exception $e) { die(json_encode(['success'=>false,'error'=>'DB'])); }

// === SESIÓN ===
if (!isset($_SESSION['usuario_id'])) {
    echo json_encode(['success'=>false,'error'=>'No autenticado']);
    exit;
}
$usuario_id = (int)$_SESSION['usuario_id'];
$rol = strtolower($_SESSION['usuario_rol'] ?? '');

// === RUTAS ===
$accion = $_GET['accion'] ?? '';

switch ($accion) {

    // 1. LISTA DE CONVERSACIONES
    case 'obtener_conversaciones':
        $sql = "SELECT 
                    c.id AS conversacion_id,
                    IF(c.coordinador_id = ?, c.instructor_id, c.coordinador_id) AS otro_id,
                    u.nombre AS otro_usuario_nombre,
                    u.email AS otro_usuario_email,
                    COALESCE((
                        SELECT COUNT(*) FROM mensajes m 
                        WHERE m.conversacion_id = c.id 
                          AND m.remitente_id != ? 
                          AND m.leido = 0
                    ),0) AS mensajes_no_leidos,
                    (SELECT mensaje FROM mensajes m WHERE m.conversacion_id = c.id ORDER BY id DESC LIMIT 1) AS ultimo_mensaje,
                    (SELECT fecha_envio FROM mensajes m WHERE m.conversacion_id = c.id ORDER BY id DESC LIMIT 1) AS fecha_ultimo_mensaje,
                    CASE WHEN ? = c.coordinador_id 
                         THEN IF(TIMESTAMPDIFF(SECOND, c.last_typing_instructor, NOW()) < 10, 1, 0)
                         ELSE IF(TIMESTAMPDIFF(SECOND, c.last_typing_coordinador, NOW()) < 10, 1, 0)
                    END AS is_typing
                FROM conversaciones c
                JOIN usuarios u ON u.id = IF(c.coordinador_id = ?, c.instructor_id, c.coordinador_id)
                WHERE (c.coordinador_id = ? OR c.instructor_id = ?)
                  AND c.estado = 'activa'
                ORDER BY c.ultima_actualizacion DESC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$usuario_id,$usuario_id,$usuario_id,$usuario_id,$usuario_id,$usuario_id]);
        $convs = [];
        while ($r = $stmt->fetch()) {
            $convs[] = [
                'conversacion_id' => (int)$r['conversacion_id'],
                'otro_usuario_nombre' => $r['otro_usuario_nombre'],
                'otro_usuario_email' => $r['otro_usuario_email'],
                'mensajes_no_leidos' => (int)$r['mensajes_no_leidos'],
                'ultimo_mensaje' => $r['ultimo_mensaje'] ?? '',
                'fecha_ultimo_mensaje' => $r['fecha_ultimo_mensaje'],
                'is_typing' => (bool)$r['is_typing']
            ];
        }
        echo json_encode(['success'=>true, 'conversaciones'=>$convs]);
        break;

    // 2. OBTENER MENSAJES
    case 'obtener_mensajes':
        $conv_id = (int)($_GET['conversacion_id'] ?? 0);
        if (!$conv_id) die(json_encode(['success'=>false,'error'=>'ID']));

        $stmt = $pdo->prepare("SELECT id FROM conversaciones WHERE id=? AND (coordinador_id=? OR instructor_id=?)");
        $stmt->execute([$conv_id,$usuario_id,$usuario_id]);
        if ($stmt->rowCount() == 0) die(json_encode(['success'=>false,'error'=>'Acceso']));

        $stmt = $pdo->prepare("SELECT id, mensaje, remitente_id = ? AS es_propio, leido, fecha_envio 
                               FROM mensajes WHERE conversacion_id=? ORDER BY id");
        $stmt->execute([$usuario_id, $conv_id]);
        $msgs = [];
        while ($m = $stmt->fetch()) {
            $msgs[] = [
                'id' => (int)$m['id'],
                'mensaje' => $m['mensaje'],
                'es_propio' => (bool)$m['es_propio'],
                'leido' => (bool)$m['leido'],
                'fecha_envio' => $m['fecha_envio']
            ];
        }

        // Marcar como leídos
        $pdo->prepare("UPDATE mensajes SET leido=1 WHERE conversacion_id=? AND remitente_id != ?")
            ->execute([$conv_id, $usuario_id]);

        echo json_encode(['success'=>true, 'mensajes'=>$msgs]);
        break;

    // 3. ENVIAR MENSAJE
    case 'enviar_mensaje':
        $input = json_decode(file_get_contents('php://input'), true);
        $conv_id = (int)($input['conversacion_id'] ?? 0);
        $texto = trim($input['mensaje'] ?? '');
        if (!$conv_id || !$texto) die(json_encode(['success'=>false,'error'=>'Datos']));

        $stmt = $pdo->prepare("INSERT INTO mensajes (conversacion_id, remitente_id, mensaje) VALUES (?,?,?)");
        $stmt->execute([$conv_id, $usuario_id, $texto]);
        $msg_id = $pdo->lastInsertId();

        $pdo->prepare("UPDATE conversaciones SET ultima_actualizacion=NOW() WHERE id=?")->execute([$conv_id]);

        echo json_encode(['success'=>true, 'mensaje_id'=>$msg_id]);
        break;

    // 4. MARCAR LEÍDOS
    case 'marcar_leidos':
        $input = json_decode(file_get_contents('php://input'), true);
        $conv_id = (int)($input['conversacion_id'] ?? 0);
        $pdo->prepare("UPDATE mensajes SET leido=1 WHERE conversacion_id=? AND remitente_id != ?")
            ->execute([$conv_id, $usuario_id]);
        echo json_encode(['success'=>true]);
        break;

    // 5. ESCRIBIENDO...
    case 'set_typing':
        $input = json_decode(file_get_contents('php://input'), true);
        $conv_id = (int)($input['conversacion_id'] ?? 0);
        $typing = $input['typing'] ? 'NOW()' : 'NULL';

        $campo = ($rol === 'coordinador') ? 'last_typing_coordinador' : 'last_typing_instructor';
        $pdo->prepare("UPDATE conversaciones SET $campo = $typing WHERE id=?")->execute([$conv_id]);
        echo json_encode(['success'=>true]);
        break;

    // 6. LISTA DE INSTRUCTORES
    case 'obtener_instructores':
        if ($rol !== 'coordinador') die(json_encode(['success'=>false,'error'=>'Solo coordinador']));
        $stmt = $pdo->prepare("SELECT id, nombre, email FROM usuarios WHERE rol='instructor' ORDER BY nombre");
        $stmt->execute();
        $inst = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success'=>true, 'instructores'=>$inst]);
        break;

    // 7. CREAR CONVERSACIÓN
    case 'crear_conversacion':
        if ($rol !== 'coordinador') die(json_encode(['success'=>false,'error'=>'Solo coordinador']));
        $input = json_decode(file_get_contents('php://input'), true);
        $inst_id = (int)($input['instructor_id'] ?? 0);

        // Reusar si existe
        $stmt = $pdo->prepare("SELECT id FROM conversaciones WHERE coordinador_id=? AND instructor_id=?");
        $stmt->execute([$usuario_id, $inst_id]);
        if ($row = $stmt->fetch()) {
            $pdo->prepare("UPDATE conversaciones SET estado='activa', ultima_actualizacion=NOW() WHERE id=?")
                ->execute([$row['id']]);
            echo json_encode(['success'=>true, 'conversacion_id'=>(int)$row['id']]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO conversaciones (coordinador_id, instructor_id) VALUES (?,?)");
            $stmt->execute([$usuario_id, $inst_id]);
            echo json_encode(['success'=>true, 'conversacion_id'=>$pdo->lastInsertId()]);
        }
        break;

    default:
        http_response_code(400);
        echo json_encode(['success'=>false,'error'=>'Acción inválida']);
}
?>