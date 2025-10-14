<?php
require_once 'config.php';

echo "<h2>Probando conexión...</h2>";

try {
    $pdo = conectarDB();
    echo "✅ Conexión exitosa<br>";
    
    // Contar usuarios
    $stmt = $pdo->query("SELECT COUNT(*) FROM usuarios");
    $total = $stmt->fetchColumn();
    echo "Total usuarios: $total<br>";
    
    // Mostrar usuarios
    $stmt = $pdo->query("SELECT id, nombre, email, rol FROM usuarios");
    echo "<h3>Usuarios:</h3><ul>";
    while($user = $stmt->fetch()) {
        echo "<li>{$user['nombre']} - {$user['email']} ({$user['rol']})</li>";
    }
    echo "</ul>";
    
} catch(Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>