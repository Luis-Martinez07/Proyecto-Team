<?php
// config.php
function conectarDB() {
    $host = 'localhost';
    $dbname = 'sena_horarios'; // ⚠️ Cambia esto por el nombre real
    $username = 'root'; // o tu usuario de MySQL
    $password = ''; // tu contraseña de MySQL
    
    try {
        $pdo = new PDO(
            "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
            $username,
            $password,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        error_log("Error de conexión: " . $e->getMessage());
        die("Error de conexión a la base de datos. Por favor verifica config.php");
    }
}
?>