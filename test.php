<?php
echo "<h1>Test de Conexión</h1>";

$host = 'localhost';
$port = '3307';  // ← AGREGAMOS EL PUERTO
$dbname = 'sena_horarios';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $username, $password);
    echo "✅ <strong>CONEXIÓN EXITOSA!</strong>";
    echo "<br>Base de datos: $dbname";
    echo "<br>Puerto: $port";
} catch (PDOException $e) {
    echo "❌ <strong>ERROR DE CONEXIÓN:</strong><br>";
    echo $e->getMessage();
}
?>