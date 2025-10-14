// rs.js - JavaScript Optimizado para Dashboard de Reportes SENA

// ========================
// DATOS SIMULADOS PARA DEMOSTRACIÓN
// ========================
const mockData = {
    instructores: [
        {id: 1, nombre: 'Juan Pérez', centro: 'CEET', regional: 'Bogotá D.C.', horas: 40, competencias: 3},
        {id: 2, nombre: 'María González', centro: 'CGMLTI', regional: 'Bogotá D.C.', horas: 35, competencias: 4},
        {id: 3, nombre: 'Carlos Rodríguez', centro: 'CEET', regional: 'Antioquia', horas: 38, competencias: 2},
        {id: 4, nombre: 'Ana López', centro: 'CGMLTI', regional: 'Valle del Cauca', horas: 42, competencias: 5}
    ],
    horarios: [
        {id: 1, instructor: 'Juan Pérez', dia: 'Lunes', hora: '08:00-10:00', ambiente: 'Lab 101'},
        {id: 2, instructor: 'María González', dia: 'Martes', hora: '10:00-12:00', ambiente: 'Aula 201'},
        {id: 3, instructor: 'Carlos Rodríguez', dia: 'Miércoles', hora: '14:00-16:00', ambiente: 'Taller 301'}
    ],
    fichas: [
        {id: 1, codigo: '2758963', programa: 'Análisis y Desarrollo de Software', aprendices: 25, estado: 'Activa'},
        {id: 2, codigo: '2758964', programa: 'Sistemas de Información', aprendices: 30, estado: 'Activa'},
        {id: 3, codigo: '2758965', programa: 'Mantenimiento de Equipos', aprendices: 20, estado: 'Finalizada'}
    ]
};

// ========================
// SISTEMA DE TABS OPTIMIZADO
// ========================
function openTab(event, tabName) {
    event.preventDefault();
    
    // Remover clases activas
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Activar tab seleccionado
    event.target.classList.add('active');
    const targetTab = document.getElementById(tabName);
    
    if (targetTab) {
        targetTab.classList.add('active');
        updateTabStats(tabName);
    }
}

function updateTabStats(tabName) {
    const badges = document.querySelectorAll(`#${tabName} .record-count`);
    const data = mockData[tabName] || [];
    
    badges.forEach((badge, index) => {
        const count = Math.floor(Math.random() * 100) + data.length;
        badge.textContent = `${count} registros`;
        badge.style.display = 'inline-block';
    });
}

// ========================
// SISTEMA DE FILTROS MEJORADO
// ========================
class FilterManager {
    constructor() {
        this.filters = {
            regional: '',
            centro: '',
            fechaInicio: '',
            fechaFin: '',
            programa: '',
            estado: '',
            instructor: ''
        };
        this.initFilters();
    }
    
    initFilters() {
        // Datos para los selectores
        const regionales = ['Bogotá D.C.', 'Antioquia', 'Valle del Cauca', 'Atlántico', 'Santander','Cundinamarca']
        const centros = {
            'Bogotá D.C.': ['CEET', 'CGMLTI', 'CIDE'],
            'Antioquia': ['CEAI', 'CEM', 'CESGE'],
            'Valle del Cauca': ['ASTIN', 'CEDENAR'],
            'Cundinamarca': ['CECAD', 'CENDA']
        };
        
        this.populateRegionalSelector(regionales);
        this.setupCascadingSelectors(centros);
        this.setupDateFilters();
        this.addAdvancedFilters();
    }
    
    populateRegionalSelector(regionales) {
        const regionalSelect = document.querySelector('.filters-grid select:first-child');
        if (regionalSelect) {
            regionalSelect.innerHTML = '<option value="">Todas las Regionales</option>';
            regionales.forEach(regional => {
                regionalSelect.innerHTML += `<option value="${regional}">${regional}</option>`;
            });
        }
    }
    
    setupCascadingSelectors(centros) {
        const regionalSelect = document.querySelector('.filters-grid select:first-child');
        const centroSelect = document.querySelector('.filters-grid select:nth-child(2)');
        
        if (regionalSelect && centroSelect) {
            regionalSelect.addEventListener('change', (e) => {
                const selectedRegional = e.target.value;
                centroSelect.innerHTML = '<option value="">Todos los Centros</option>';
                
                if (selectedRegional && centros[selectedRegional]) {
                    centros[selectedRegional].forEach(centro => {
                        centroSelect.innerHTML += `<option value="${centro}">${centro}</option>`;
                    });
                }
                this.filters.regional = selectedRegional;
                this.applyFiltersInstantly();
            });
        }
    }
    
    setupDateFilters() {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const dateInputs = document.querySelectorAll('.filters-grid input[type="date"]');
        if (dateInputs.length >= 2) {
            dateInputs[0].value = firstDayOfMonth.toISOString().split('T')[0];
            dateInputs[1].value = today.toISOString().split('T')[0];
            
            dateInputs.forEach(input => {
                input.addEventListener('change', () => this.applyFiltersInstantly());
            });
        }
    }
    
    addAdvancedFilters() {
        const filtersGrid = document.querySelector('.filters-grid');
        
        // Filtro por Programa
        const programaGroup = document.createElement('div');
        programaGroup.className = 'filter-group';
        programaGroup.innerHTML = `
            <label>Programa Formativo</label>
            <select id="programa-filter">
                <option value="">Todos los Programas</option>
                <option value="analisis-software">Análisis y Desarrollo de Software</option>
                <option value="sistemas-info">Sistemas de Información</option>
                <option value="mantenimiento">Mantenimiento de Equipos</option>
                <option value="redes">Gestión de Redes</option>
            </select>
        `;
        
        // Filtro por Estado
        const estadoGroup = document.createElement('div');
        estadoGroup.className = 'filter-group';
        estadoGroup.innerHTML = `
            <label>Estado</label>
            <select id="estado-filter">
                <option value="">Todos los Estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="suspendido">Suspendido</option>
                <option value="finalizado">Finalizado</option>
            </select>
        `;
        
        // Insertar antes del botón de aplicar
        const applyFilters = document.querySelector('.apply-filters');
        filtersGrid.insertBefore(programaGroup, applyFilters);
        filtersGrid.insertBefore(estadoGroup, applyFilters);
        
        // Event listeners
        document.getElementById('programa-filter').addEventListener('change', () => this.applyFiltersInstantly());
        document.getElementById('estado-filter').addEventListener('change', () => this.applyFiltersInstantly());
    }
    
    applyFiltersInstantly() {
        // Recopilar todos los filtros
        this.filters.regional = document.querySelector('.filters-grid select:first-child').value;
        this.filters.centro = document.querySelector('.filters-grid select:nth-child(2)').value;
        this.filters.fechaInicio = document.querySelector('.filters-grid input[type="date"]:first-child').value;
        this.filters.fechaFin = document.querySelector('.filters-grid input[type="date"]:last-child').value;
        this.filters.programa = document.getElementById('programa-filter')?.value || '';
        this.filters.estado = document.getElementById('estado-filter')?.value || '';
        
        // Actualizar contadores en tiempo real
        this.updateFilteredCounts();
        
        // Mostrar indicador de filtros activos
        this.showActiveFilters();
    }
    
    updateFilteredCounts() {
        const activeFilters = Object.values(this.filters).filter(f => f !== '').length;
        const multiplier = activeFilters > 0 ? 0.7 : 1; // Simular reducción por filtros
        
        document.querySelectorAll('.record-count').forEach(badge => {
            const baseCount = parseInt(badge.textContent) || 100;
            const filteredCount = Math.floor(baseCount * multiplier);
            badge.textContent = `${filteredCount} registros`;
            badge.style.background = activeFilters > 0 ? '#e67e22' : '#3498db';
        });
    }
    
    showActiveFilters() {
        let activeFiltersDiv = document.querySelector('.active-filters');
        if (!activeFiltersDiv) {
            activeFiltersDiv = document.createElement('div');
            activeFiltersDiv.className = 'active-filters';
            activeFiltersDiv.style.cssText = `
                margin: 10px 0;
                padding: 15px;
                background: #ecf0f1;
                border-radius: 10px;
                display: none;
            `;
            document.querySelector('.filters-panel').appendChild(activeFiltersDiv);
        }
        
        const activeFilters = Object.entries(this.filters)
            .filter(([key, value]) => value !== '')
            .map(([key, value]) => `<span style="
                background: #3498db; 
                color: white; 
                padding: 4px 8px; 
                border-radius: 12px; 
                font-size: 0.8rem; 
                margin-right: 5px;
                display: inline-block;
                margin-bottom: 5px;
            ">${key}: ${value}</span>`);
        
        if (activeFilters.length > 0) {
            activeFiltersDiv.innerHTML = `<strong>Filtros activos:</strong><br>${activeFilters.join('')}`;
            activeFiltersDiv.style.display = 'block';
        } else {
            activeFiltersDiv.style.display = 'none';
        }
    }
}

// ========================
// SISTEMA DE DESCARGAS REAL
// ========================
class DownloadManager {
    static generateCSV(data, filename) {
        if (!data || data.length === 0) {
            alert('No hay datos para exportar');
            return;
        }
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => 
                    JSON.stringify(row[header] || '')
                ).join(',')
            )
        ].join('\n');
        
        this.downloadFile(csvContent, filename, 'text/csv');
    }
    
    static generateExcel(data, filename) {
        if (!data || data.length === 0) {
            alert('No hay datos para exportar');
            return;
        }
        
        // Crear contenido HTML para Excel
        const headers = Object.keys(data[0]);
        const htmlContent = `
            <table border="1">
                <thead>
                    <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${data.map(row => 
                        `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`
                    ).join('')}
                </tbody>
            </table>
        `;
        
        this.downloadFile(htmlContent, filename, 'application/vnd.ms-excel');
    }
    
    static generatePDF(title, data) {
        // Para PDF usaremos jsPDF (incluir la librería)
        // Por ahora simulamos con HTML
        const htmlContent = `
            <html>
                <head>
                    <title>${title}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #2c3e50; }
                        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    <h1>${title}</h1>
                    <p>Fecha de generación: ${new Date().toLocaleDateString('es-CO')}</p>
                    <p>Total de registros: ${data.length}</p>
                    ${data.length > 0 ? this.createHTMLTable(data) : '<p>No hay datos disponibles</p>'}
                </body>
            </html>
        `;
        
        const newWindow = window.open('', '_blank');
        newWindow.document.write(htmlContent);
        newWindow.document.close();
        newWindow.print();
    }
    
    static createHTMLTable(data) {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        return `
            <table>
                <thead>
                    <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${data.map(row => 
                        `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`
                    ).join('')}
                </tbody>
            </table>
        `;
    }
    
    static downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// ========================
// FUNCIONES DE REPORTES OPTIMIZADAS
// ========================
function showReport(reportType) {
    const data = getReportData(reportType);
    const reportName = getReportName(reportType);
    
    // Crear modal optimizado
    const modal = createReportModal(reportName, reportType, data);
    document.body.appendChild(modal);
    
    // Animar entrada
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
    });
}

function getReportData(reportType) {
    // Simular datos según el tipo de reporte
    switch(reportType) {
        case 'instructor-general':
            return mockData.instructores;
        case 'horarios-centro':
            return mockData.horarios;
        case 'fichas-activas':
            return mockData.fichas;
        default:
            return generateMockData(reportType);
    }
}

function generateMockData(reportType) {
    const baseData = [];
    for (let i = 1; i <= 20; i++) {
        baseData.push({
            id: i,
            nombre: `Item ${i}`,
            fecha: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString('es-CO'),
            estado: ['Activo', 'Inactivo', 'Pendiente'][Math.floor(Math.random() * 3)],
            valor: Math.floor(Math.random() * 1000)
        });
    }
    return baseData;
}

function createReportModal(title, reportType, data) {
    const modal = document.createElement('div');
    modal.className = 'report-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.2s ease;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
        background: white;
        width: 95%;
        max-width: 1000px;
        height: 85%;
        border-radius: 15px;
        display: flex;
        flex-direction: column;
        transform: scale(0.9);
        transition: transform 0.2s ease;
        overflow: hidden;
    `;
    
    modalContent.innerHTML = `
        <div style="padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #f8f9fa;">
            <h2 style="margin: 0; color: #2c3e50;">
                <i class="fas fa-file-alt"></i> ${title}
            </h2>
            <button onclick="closeModal()" style="
                background: #e74c3c; color: white; border: none; 
                width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 16px;
            ">×</button>
        </div>
        
        <div style="padding: 20px; flex: 1; overflow-y: auto;">
            <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
                <button onclick="downloadReport('${reportType}', 'csv')" style="
                    background: #27ae60; color: white; border: none; padding: 10px 20px;
                    border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px;
                ">
                    <i class="fas fa-file-csv"></i> Descargar CSV
                </button>
                <button onclick="downloadReport('${reportType}', 'excel')" style="
                    background: #2ecc71; color: white; border: none; padding: 10px 20px;
                    border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px;
                ">
                    <i class="fas fa-file-excel"></i> Descargar Excel
                </button>
                <button onclick="downloadReport('${reportType}', 'pdf')" style="
                    background: #e74c3c; color: white; border: none; padding: 10px 20px;
                    border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px;
                ">
                    <i class="fas fa-file-pdf"></i> Descargar PDF
                </button>
            </div>
            
            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div><strong>Total de registros:</strong> ${data.length}</div>
                    <div><strong>Fecha de generación:</strong> ${new Date().toLocaleDateString('es-CO')}</div>
                    <div><strong>Estado:</strong> <span style="color: #27ae60;">Generado</span></div>
                </div>
            </div>
            
            <div id="report-data">
                ${createDataTable(data)}
            </div>
        </div>
    `;
    
    modal.appendChild(modalContent);
    
    // Función global para cerrar
    window.closeModal = () => {
        modal.style.opacity = '0';
        modalContent.style.transform = 'scale(0.9)';
        setTimeout(() => {
            if (document.body.contains(modal)) {
                document.body.removeChild(modal);
            }
        }, 200);
    };
    
    return modal;
}

function createDataTable(data) {
    if (!data || data.length === 0) {
        return '<p style="text-align: center; color: #7f8c8d; padding: 40px;">No hay datos disponibles</p>';
    }
    
    const headers = Object.keys(data[0]);
    
    return `
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                <thead>
                    <tr style="background: #34495e; color: white;">
                        ${headers.map(header => 
                            `<th style="padding: 12px; text-align: left; border: 1px solid #ddd;">${header}</th>`
                        ).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${data.slice(0, 50).map((row, index) => 
                        `<tr style="background: ${index % 2 === 0 ? '#f8f9fa' : 'white'};">
                            ${headers.map(header => 
                                `<td style="padding: 10px; border: 1px solid #ddd;">${row[header] || '-'}</td>`
                            ).join('')}
                        </tr>`
                    ).join('')}
                </tbody>
            </table>
            ${data.length > 50 ? `<p style="text-align: center; margin-top: 15px; color: #7f8c8d;">Mostrando 50 de ${data.length} registros</p>` : ''}
        </div>
    `;
}

function downloadReport(reportType, format) {
    const data = getReportData(reportType);
    const reportName = getReportName(reportType);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${reportName.replace(/\s+/g, '_')}_${timestamp}`;
    
    switch(format) {
        case 'csv':
            DownloadManager.generateCSV(data, `${filename}.csv`);
            break;
        case 'excel':
            DownloadManager.generateExcel(data, `${filename}.xls`);
            break;
        case 'pdf':
            DownloadManager.generatePDF(reportName, data);
            break;
    }
    
    showNotification(`${reportName} descargado en formato ${format.toUpperCase()}`, 'success');
}

function getReportName(reportType) {
    const names = {
        'instructor-general': 'Reporte General de Instructores',
        'carga-academica': 'Carga Académica por Instructor',
        'competencias-instructor': 'Competencias por Instructor',
        'disponibilidad-instructores': 'Disponibilidad de Instructores',
        'horarios-centro': 'Horarios por Centro',
        'ocupacion-ambientes': 'Ocupación de Ambientes',
        'conflictos-horarios': 'Conflictos de Horarios',
        'horarios-instructor': 'Horarios por Instructor',
        'fichas-activas': 'Fichas Activas',
        'avance-competencias': 'Avance de Competencias',
        'programas-formativos': 'Programas Formativos',
        'bitacoras': 'Bitácoras de Instructores',
        'productividad': 'Reporte de Productividad',
        'asistencia': 'Asistencia y Participación',
        'dashboard-ejecutivo': 'Dashboard Ejecutivo',
        'utilizacion-recursos': 'Utilización de Recursos',
        'comparativo-periodos': 'Comparativo por Períodos',
        'nomina-academica': 'Nómina Académica',
        'cumplimiento-normativo': 'Cumplimiento Normativo',
        'auditoria': 'Auditoría del Sistema'
    };
    return names[reportType] || 'Reporte Personalizado';
}

// ========================
// ACCIONES RÁPIDAS FUNCIONALES
// ========================
function generateAllReports() {
    showNotification('Iniciando generación masiva de reportes...', 'info');
    
    const reportTypes = Object.keys(getReportName(''));
    let completed = 0;
    
    reportTypes.forEach((reportType, index) => {
        setTimeout(() => {
            const data = getReportData(reportType);
            const reportName = getReportName(reportType);
            DownloadManager.generateExcel(data, `${reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xls`);
            
            completed++;
            const progress = Math.round((completed / reportTypes.length) * 100);
            
            if (completed === reportTypes.length) {
                showNotification('Todos los reportes han sido generados y descargados', 'success');
            } else {
                showNotification(`Progreso: ${progress}% (${completed}/${reportTypes.length})`, 'info');
            }
        }, index * 500); // Espaciar las descargas
    });
}

function scheduleReports() {
    showNotification('Función de programación de reportes en desarrollo', 'info');
}

function exportDashboard() {
    const dashboardData = {
        fecha: new Date().toLocaleDateString('es-CO'),
        resumen: {
            instructores: mockData.instructores.length,
            horarios: mockData.horarios.length,
            fichas: mockData.fichas.length
        },
        filtros_activos: filterManager.filters
    };
    
    DownloadManager.generateExcel([dashboardData], `Dashboard_Resumen_${new Date().toISOString().split('T')[0]}.xls`);
    showNotification('Dashboard exportado exitosamente', 'success');
}

// ========================
// NOTIFICACIONES OPTIMIZADAS
// ========================
function showNotification(message, type = 'success', duration = 3000) {
    // Remover notificaciones anteriores
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        info: '#3498db',
        warning: '#f39c12'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${colors[type] || colors.success};
        color: white;
        border-radius: 10px;
        font-weight: 500;
        z-index: 10001;
        transform: translateX(350px);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        cursor: pointer;
    `;
    
    notification.textContent = message;
    notification.onclick = () => notification.remove();
    
    document.body.appendChild(notification);
    
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    setTimeout(() => {
        notification.style.transform = 'translateX(350px)';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// ========================
// INICIALIZACIÓN GLOBAL
// ========================
let filterManager;

document.addEventListener('DOMContentLoaded', function() {
    filterManager = new FilterManager();
    
    // Agregar badges de conteo a todos los reportes
    document.querySelectorAll('.report-item .report-info h4').forEach(title => {
        if (!title.querySelector('.record-count')) {
            const badge = document.createElement('span');
            badge.className = 'record-count';
            badge.style.cssText = `
                background: #3498db;
                color: white;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 0.7rem;
                margin-left: 10px;
                display: none;
            `;
            title.appendChild(badge);
        }
    });
    
    // Mostrar conteos iniciales
    updateTabStats('instructores');
    
    showNotification('Dashboard de Reportes cargado y optimizado', 'success');
});

// Prevenir clicks en botones de acción
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('action-btn')) {
        event.stopPropagation();
    }
});

// Cerrar modales con Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && window.closeModal) {
        window.closeModal();
    }
});