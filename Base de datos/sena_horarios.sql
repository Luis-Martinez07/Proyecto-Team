-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3307
-- Tiempo de generación: 06-11-2025 a las 06:53:04
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sena_horarios`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ambientes`
--

CREATE TABLE `ambientes` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo` enum('aula','laboratorio','taller') NOT NULL,
  `capacidad` int(11) NOT NULL,
  `centro_formacion` varchar(100) DEFAULT NULL,
  `datos_horario` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_horario`)),
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `competencias`
--

CREATE TABLE `competencias` (
  `id` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `programa_formativo` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `competencias`
--

INSERT INTO `competencias` (`id`, `codigo`, `nombre`, `programa_formativo`, `descripcion`) VALUES
(1, '220501001', 'Comprender la lógica de programación', 'Análisis y Desarrollo de Software', NULL),
(2, '220501002', 'Programar el sistema según el diseño realizado', 'Análisis y Desarrollo de Software', NULL),
(3, '228101001', 'Analizar los requerimientos del cliente', 'Sistemas de Información', NULL),
(4, '220204001', 'Diagnosticar el estado del equipo', 'Mantenimiento de Equipos de Cómputo', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `conversaciones`
--

CREATE TABLE `conversaciones` (
  `id` int(11) NOT NULL,
  `coordinador_id` int(11) NOT NULL,
  `instructor_id` int(11) NOT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `ultima_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `estado` enum('activa','archivada') DEFAULT 'activa'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `conversaciones`
--

INSERT INTO `conversaciones` (`id`, `coordinador_id`, `instructor_id`, `fecha_creacion`, `ultima_actualizacion`, `estado`) VALUES
(1, 3, 1, '2025-11-06 00:27:54', '2025-11-06 00:35:47', 'archivada'),
(2, 3, 5, '2025-11-06 00:28:11', '2025-11-06 00:35:41', 'archivada'),
(3, 3, 19, '2025-11-06 00:39:01', '2025-11-06 00:39:01', 'activa');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios`
--

CREATE TABLE `horarios` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `template_tipo` varchar(50) NOT NULL,
  `nombre_horario` varchar(100) NOT NULL,
  `datos_json` text NOT NULL,
  `total_clases` int(11) DEFAULT 0,
  `fecha_creacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `horarios`
--

INSERT INTO `horarios` (`id`, `usuario_id`, `template_tipo`, `nombre_horario`, `datos_json`, `total_clases`, `fecha_creacion`) VALUES
(3, 5, 'semanal', 'Sena', '{\"hora_inicio\":\"01:00\",\"hora_fin\":\"02:00 a.m.\",\"duracion_bloque\":60,\"descanso\":10,\"dias_activos\":[\"Lunes\",\"Martes\",\"Mi\\u00e9rcoles\",\"Jueves\",\"Viernes\"],\"bloques\":[{\"dia\":\"Lunes\",\"hora\":\"01:00 a.m. - 02:00 a.m.\",\"materia\":\"Matematicas\",\"instructor\":\"Luis\",\"aula\":\"26\",\"notas\":\"\"}]}', 1, '2025-11-05 01:31:09'),
(8, 5, 'semanal', 'Sena', '{\"hora_inicio\":\"09:00\",\"hora_fin\":\"10:00 a.m.\",\"duracion_bloque\":60,\"descanso\":10,\"dias_activos\":[\"Lunes\",\"Martes\",\"Mi\\u00e9rcoles\",\"Jueves\",\"Viernes\"],\"bloques\":[{\"dia\":\"Lunes\",\"hora\":\"09:00 a.m. - 10:00 a.m.\",\"materia\":\"Luis\",\"instructor\":\"Los\",\"aula\":\"jdd\",\"notas\":\"ond\"}]}', 1, '2025-11-05 02:13:08'),
(9, 5, 'semanal', 'Sena', '{\"hora_inicio\":\"09:00\",\"hora_fin\":\"09:30 a.m.\",\"duracion_bloque\":30,\"descanso\":10,\"dias_activos\":[\"Lunes\",\"Martes\",\"Mi\\u00e9rcoles\",\"Jueves\",\"Viernes\"],\"bloques\":[{\"dia\":\"Lunes\",\"hora\":\"09:00 a.m. - 09:30 a.m.\",\"materia\":\"Sistemas\",\"instructor\":\"Lis\",\"aula\":\"23\",\"notas\":\"\"}]}', 1, '2025-11-05 02:15:52');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `instructor_competencias`
--

CREATE TABLE `instructor_competencias` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `competencia_id` int(11) NOT NULL,
  `fecha_asignacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensajes`
--

CREATE TABLE `mensajes` (
  `id` int(11) NOT NULL,
  `conversacion_id` int(11) NOT NULL,
  `remitente_id` int(11) NOT NULL,
  `mensaje` text NOT NULL,
  `leido` tinyint(1) DEFAULT 0,
  `fecha_envio` datetime DEFAULT current_timestamp(),
  `fecha_lectura` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `mensajes`
--

INSERT INTO `mensajes` (`id`, `conversacion_id`, `remitente_id`, `mensaje`, `leido`, `fecha_envio`, `fecha_lectura`) VALUES
(1, 2, 3, 'Hola Luis Como estas', 1, '2025-11-06 00:28:24', NULL),
(2, 2, 5, 'Melo papi bello', 1, '2025-11-06 00:29:28', NULL),
(3, 2, 5, 'Melo papi bello', 1, '2025-11-06 00:29:28', NULL),
(4, 2, 3, '.', 0, '2025-11-06 00:35:18', NULL),
(5, 2, 3, '.', 0, '2025-11-06 00:35:18', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `tipo` enum('mensaje','horario','sistema') DEFAULT 'mensaje',
  `titulo` varchar(255) NOT NULL,
  `contenido` text NOT NULL,
  `referencia_id` int(11) DEFAULT NULL,
  `leida` tinyint(1) DEFAULT 0,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_lectura` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `token` varchar(100) NOT NULL,
  `fecha_expiracion` datetime NOT NULL,
  `usado` tinyint(1) DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `password_resets`
--

INSERT INTO `password_resets` (`id`, `usuario_id`, `email`, `token`, `fecha_expiracion`, `usado`, `fecha_creacion`) VALUES
(8, 6, 'stellavalenciamolina@hotmail.com', 'c0d7af80425f882f36f1e62f33cb526b496e6acd042d939762c0cb932d913359', '2025-10-13 03:03:35', 1, '2025-10-13 00:03:35'),
(45, 5, 'luispereamartinez7@gmail.com', 'e1e8441328a5c8a4915d0615876a0a74d2dc6cf409a57da2a20b5e9b28c85de0', '2025-10-31 00:12:02', 1, '2025-10-30 22:12:02'),
(71, 7, 'luisperea4040@gmail.com', '83b00f282b7248e892651478fc19eb5af20dd3c9e5f14bdf60f5583e1cd39034', '2025-10-31 01:36:47', 0, '2025-10-30 23:36:47'),
(78, 5, 'luispereamartinez7@gmail.com', 'c1ba18b8ead489ac44f58d6b857c74fdab45d39f3fb09d45359ce428acf90e23', '2025-10-31 02:06:57', 1, '2025-10-31 00:06:57'),
(84, 3, 'carlos.rodriguez@sena.edu.co', '9a15eebdb9b87291db2006a4be56b995057e697a1f8be529912c9cdf50f70790', '2025-10-31 02:24:18', 0, '2025-10-31 00:24:18'),
(85, 6, 'stellavalenciamolina@hotmail.com', 'f3dfbe6ef17c1aba6f5b35bdcbe40c942a778355fff6ce259afc789e5fb41dc2', '2025-10-31 02:24:29', 0, '2025-10-31 00:24:29'),
(86, 18, 'sofjaramillo777@gmail.com', 'a50aec8d306adf9508b3f36effd43089999f83064c55acbea45e2b8ae1fee3eb', '2025-10-31 02:26:15', 0, '2025-10-31 00:26:15'),
(98, 19, 'darinjrper@gmail.com', '97f9fcf570c873378e3b7b51c09a42c03dd56b2c0f7b82c9f4cec59e1d6790ea', '2025-10-31 06:02:04', 0, '2025-10-31 04:02:04'),
(99, 5, 'luispereamartinez7@gmail.com', '9cbaa3f1523ca05b5b1a96c1cae3743fd8b828eacff32904ed210891a20a5466', '2025-11-03 00:12:37', 0, '2025-11-02 22:12:37');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `perfiles_instructores`
--

CREATE TABLE `perfiles_instructores` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `cedula` varchar(20) DEFAULT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `especialidad` varchar(100) DEFAULT NULL,
  `titulo_profesional` varchar(100) DEFAULT NULL,
  `fecha_vinculacion` date DEFAULT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `perfiles_instructores`
--

INSERT INTO `perfiles_instructores` (`id`, `usuario_id`, `cedula`, `telefono`, `fecha_nacimiento`, `especialidad`, `titulo_profesional`, `fecha_vinculacion`, `estado`, `created_at`, `updated_at`) VALUES
(1, 5, '1111671928', '3007901333', '2025-11-05', 'Matematicas', 'Sistemas', NULL, 'activo', '2025-11-02 19:38:58', '2025-11-05 22:28:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('instructor','coordinador','admin') DEFAULT 'instructor',
  `activo` tinyint(1) DEFAULT 1,
  `fecha_registro` datetime DEFAULT current_timestamp(),
  `ultimo_acceso` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol`, `activo`, `fecha_registro`, `ultimo_acceso`) VALUES
(1, 'Juan Pérez', 'juan.perez@sena.edu.co', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'instructor', 1, '2025-10-03 13:16:09', NULL),
(2, 'María González', 'maria.gonzalez@sena.edu.co', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'instructor', 1, '2025-10-03 13:16:09', NULL),
(3, 'Carlos Rodríguez', 'carlos.rodriguez@sena.edu.co', '$2y$10$O/cjqGu.Xb8.liMDxrI9veRhh/fkDdsoOFu.u01JbmwJrPelvUUgG', 'coordinador', 1, '2025-10-03 13:16:09', '2025-11-06 00:32:41'),
(5, 'Luis', 'luispereamartinez7@gmail.com', '$2y$10$pWdQ4BqpzLZx61EJLqBKSOz7laMkHpfPTyVyKgmOAJWE5MojZyK02', 'instructor', 1, '2025-10-03 13:51:20', '2025-11-06 00:28:59'),
(6, 'STELLA_VALENCIA', 'stellavalenciamolina@hotmail.com', '$2y$10$zGxovNBK4tYttVYrTDMgcu7uhUnG/8um9ApE5NvcOiGJDH8yBVHz.', 'instructor', 1, '2025-10-03 13:55:31', '2025-10-12 19:11:58'),
(7, 'Luis', 'luisperea4040@gmail.com', '$2y$10$E.up9PLRFniq22hFfiCEN.0IMvxuOan8asEo7SmiIwQsV1OT3Opmy', 'instructor', 1, '2025-10-03 14:00:16', NULL),
(8, 'Luis', 'senacanvatrabajos@gmail.com', '$2y$10$xKOEehc/j6dc9d9sJ.wiIOy8hTZZ8kO4g776DX/iB6Zn7UFq09KU.', 'instructor', 1, '2025-10-03 14:02:35', '2025-10-03 14:02:45'),
(9, 'Luis', 'kkkkk@gmail.com', '$2y$10$t.GjZBObHTnuGGkwG/Q2JuvFPmXuSbfLUiXALhwwcYBJK40WNMOou', 'instructor', 1, '2025-10-03 16:45:24', NULL),
(11, 'Luis', 'luisedinson@gmail.com', '$2y$10$5RWLcRe/nKlyiEfOktbUxexMsJx57rSiT37pdV5eOTgYLbQudeThW', 'instructor', 1, '2025-10-04 11:22:17', '2025-10-30 10:46:32'),
(12, 'Stiven', 'Stiven77@gmail.com', '$2y$10$IB4jBhtUs55/jT0cpqNHp.cLTMJantJm25HEL7/PE.NxwzbZa3fbS', 'instructor', 1, '2025-10-04 11:28:21', '2025-10-04 11:28:36'),
(13, 'Luis', 'coordinador@sena.edu.co', '$2y$10$NxP3XsNwA9rhcfKxbtK3d.GRkbsQqiJB9WI.P4jNcgx/Do/fWiBJ.', 'instructor', 1, '2025-10-07 21:18:02', '2025-10-07 21:18:45'),
(14, 'Usuario_Prueba', 'prueba@test.com', '$2y$10$ibfblifnnWiPF3Ls2zr8HuGFFLm./ntN584OIaCOlI9s8hGtNeFIO', 'instructor', 1, '2025-10-07 21:42:23', '2025-10-07 21:42:39'),
(15, 'Lorenzo', 'Lorenzo@gmail.com', '$2y$10$i.UooogCSXFKtPAGL.6RseQcwqGDnO.dQhe2wthis4BkhLvqUfI8C', 'instructor', 1, '2025-10-09 11:21:40', '2025-10-09 11:21:49'),
(16, 'luis', 'luis@gmail.com', '$2y$10$RlvvTjNROt9mlfuubu.c3Ockm8VNosV9ZaGz92I1uRK2T/DkSBv9q', 'instructor', 1, '2025-10-13 21:38:42', '2025-10-13 21:39:01'),
(17, 'Daniel', 'Daniel@gmail.com', '$2y$10$0yJc8y2RP/yGENffG/ifAuq3juXIHLLRB2AteaMCxiXC7rKYW1pAe', 'instructor', 1, '2025-10-21 01:38:44', '2025-10-21 01:38:54'),
(18, 'Sofia', 'sofjaramillo777@gmail.com', '$2y$10$Tkps0EP.E4Hi5al1sOvFj.9l5yv/mXNMj515LashY86KqIYxQ98uO', 'instructor', 1, '2025-10-30 19:25:36', '2025-10-30 19:54:58'),
(19, 'Darinson', 'darinjrper@gmail.com', '$2y$10$tisFP2AbV.M5SfvMgSc9Muk2bHfWQe1ZMHzDXd/wUNbLR1XSyY2km', 'instructor', 1, '2025-10-30 23:01:36', '2025-10-30 23:01:45');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `ambientes`
--
ALTER TABLE `ambientes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_centro` (`centro_formacion`);

--
-- Indices de la tabla `competencias`
--
ALTER TABLE `competencias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_codigo` (`codigo`),
  ADD KEY `idx_programa` (`programa_formativo`);

--
-- Indices de la tabla `conversaciones`
--
ALTER TABLE `conversaciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_conversation` (`coordinador_id`,`instructor_id`),
  ADD KEY `instructor_id` (`instructor_id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_ultima_actualizacion` (`ultima_actualizacion`);

--
-- Indices de la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_fecha` (`fecha_creacion`);

--
-- Indices de la tabla `instructor_competencias`
--
ALTER TABLE `instructor_competencias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_instructor_competencia` (`usuario_id`,`competencia_id`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_competencia` (`competencia_id`);

--
-- Indices de la tabla `mensajes`
--
ALTER TABLE `mensajes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `remitente_id` (`remitente_id`),
  ADD KEY `idx_conversacion` (`conversacion_id`),
  ADD KEY `idx_leido` (`leido`),
  ADD KEY `idx_fecha_envio` (`fecha_envio`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario_leida` (`usuario_id`,`leida`),
  ADD KEY `idx_fecha` (`fecha_creacion`);

--
-- Indices de la tabla `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `idx_token` (`token`),
  ADD KEY `idx_email` (`email`);

--
-- Indices de la tabla `perfiles_instructores`
--
ALTER TABLE `perfiles_instructores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_id` (`usuario_id`),
  ADD UNIQUE KEY `cedula` (`cedula`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_activo` (`activo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `ambientes`
--
ALTER TABLE `ambientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `competencias`
--
ALTER TABLE `competencias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `conversaciones`
--
ALTER TABLE `conversaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `horarios`
--
ALTER TABLE `horarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `instructor_competencias`
--
ALTER TABLE `instructor_competencias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `mensajes`
--
ALTER TABLE `mensajes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

--
-- AUTO_INCREMENT de la tabla `perfiles_instructores`
--
ALTER TABLE `perfiles_instructores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `conversaciones`
--
ALTER TABLE `conversaciones`
  ADD CONSTRAINT `conversaciones_ibfk_1` FOREIGN KEY (`coordinador_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conversaciones_ibfk_2` FOREIGN KEY (`instructor_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD CONSTRAINT `horarios_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `instructor_competencias`
--
ALTER TABLE `instructor_competencias`
  ADD CONSTRAINT `instructor_competencias_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `instructor_competencias_ibfk_2` FOREIGN KEY (`competencia_id`) REFERENCES `competencias` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `mensajes`
--
ALTER TABLE `mensajes`
  ADD CONSTRAINT `mensajes_ibfk_1` FOREIGN KEY (`conversacion_id`) REFERENCES `conversaciones` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mensajes_ibfk_2` FOREIGN KEY (`remitente_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `perfiles_instructores`
--
ALTER TABLE `perfiles_instructores`
  ADD CONSTRAINT `perfiles_instructores_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
