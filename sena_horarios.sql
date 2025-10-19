-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 19-10-2025 a las 20:06:54
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
(10, 3, 'carlos.rodriguez@sena.edu.co', '7bc65514ed7e06264d81dd5c9f9740c2b62a5c543ffb110f62bb69517ce532d6', '2025-10-14 04:37:11', 0, '2025-10-14 01:37:11'),
(11, 7, 'luisperea4040@gmail.com', '4e93db01d6c368300beeb1176f10bc34c39590a5932d8d422c3cb31eb8ecdcda', '2025-10-14 04:37:46', 0, '2025-10-14 01:37:46'),
(12, 5, 'luispereamartinez7@gmail.com', 'e96d4248c499421c0ce9df834882e1bd6738aba5129ac2ba3c3c4a84e75a01b7', '2025-10-15 07:38:00', 0, '2025-10-15 04:38:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `perfiles_instructores`
--

CREATE TABLE `perfiles_instructores` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `cedula` varchar(20) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `telefono_fijo` varchar(20) DEFAULT NULL,
  `email_personal` varchar(100) DEFAULT NULL,
  `titulo_profesional` varchar(100) DEFAULT NULL,
  `universidad` varchar(100) DEFAULT NULL,
  `ano_graduacion` year(4) DEFAULT NULL,
  `experiencia_docente` int(11) DEFAULT NULL,
  `especializacion` text DEFAULT NULL,
  `certificaciones` text DEFAULT NULL,
  `regional` varchar(50) DEFAULT NULL,
  `centro_formacion` varchar(100) DEFAULT NULL,
  `fecha_vinculacion` date DEFAULT NULL,
  `tipo_contrato` enum('planta','contrata','honorarios') DEFAULT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(3, 'Carlos Rodríguez', 'carlos.rodriguez@sena.edu.co', '$2y$10$O/cjqGu.Xb8.liMDxrI9veRhh/fkDdsoOFu.u01JbmwJrPelvUUgG', 'coordinador', 1, '2025-10-03 13:16:09', '2025-10-15 23:13:44'),
(5, 'Luis', 'luispereamartinez7@gmail.com', '$2y$10$xfIKK91gmgC7r/ABFeFVZeR0ll6u0PUfVAywr9EqyKnqczVfOFK6O', 'instructor', 1, '2025-10-03 13:51:20', '2025-10-03 16:46:25'),
(6, 'STELLA_VALENCIA', 'stellavalenciamolina@hotmail.com', '$2y$10$zGxovNBK4tYttVYrTDMgcu7uhUnG/8um9ApE5NvcOiGJDH8yBVHz.', 'instructor', 1, '2025-10-03 13:55:31', '2025-10-12 19:11:58'),
(7, 'Luis', 'luisperea4040@gmail.com', '$2y$10$E.up9PLRFniq22hFfiCEN.0IMvxuOan8asEo7SmiIwQsV1OT3Opmy', 'instructor', 1, '2025-10-03 14:00:16', NULL),
(8, 'Luis', 'senacanvatrabajos@gmail.com', '$2y$10$xKOEehc/j6dc9d9sJ.wiIOy8hTZZ8kO4g776DX/iB6Zn7UFq09KU.', 'instructor', 1, '2025-10-03 14:02:35', '2025-10-03 14:02:45'),
(9, 'Luis', 'kkkkk@gmail.com', '$2y$10$t.GjZBObHTnuGGkwG/Q2JuvFPmXuSbfLUiXALhwwcYBJK40WNMOou', 'instructor', 1, '2025-10-03 16:45:24', NULL),
(11, 'Luis', 'luisedinson@gmail.com', '$2y$10$5RWLcRe/nKlyiEfOktbUxexMsJx57rSiT37pdV5eOTgYLbQudeThW', 'instructor', 1, '2025-10-04 11:22:17', '2025-10-14 23:18:57'),
(12, 'Stiven', 'Stiven77@gmail.com', '$2y$10$IB4jBhtUs55/jT0cpqNHp.cLTMJantJm25HEL7/PE.NxwzbZa3fbS', 'instructor', 1, '2025-10-04 11:28:21', '2025-10-04 11:28:36'),
(13, 'Luis', 'coordinador@sena.edu.co', '$2y$10$NxP3XsNwA9rhcfKxbtK3d.GRkbsQqiJB9WI.P4jNcgx/Do/fWiBJ.', 'instructor', 1, '2025-10-07 21:18:02', '2025-10-07 21:18:45'),
(14, 'Usuario_Prueba', 'prueba@test.com', '$2y$10$ibfblifnnWiPF3Ls2zr8HuGFFLm./ntN584OIaCOlI9s8hGtNeFIO', 'instructor', 1, '2025-10-07 21:42:23', '2025-10-07 21:42:39'),
(15, 'Lorenzo', 'Lorenzo@gmail.com', '$2y$10$i.UooogCSXFKtPAGL.6RseQcwqGDnO.dQhe2wthis4BkhLvqUfI8C', 'instructor', 1, '2025-10-09 11:21:40', '2025-10-09 11:21:49'),
(16, 'luis', 'luis@gmail.com', '$2y$10$RlvvTjNROt9mlfuubu.c3Ockm8VNosV9ZaGz92I1uRK2T/DkSBv9q', 'instructor', 1, '2025-10-13 21:38:42', '2025-10-13 21:39:01');

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
  ADD KEY `idx_usuario` (`usuario_id`);

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
-- AUTO_INCREMENT de la tabla `horarios`
--
ALTER TABLE `horarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `instructor_competencias`
--
ALTER TABLE `instructor_competencias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `perfiles_instructores`
--
ALTER TABLE `perfiles_instructores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Restricciones para tablas volcadas
--

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
