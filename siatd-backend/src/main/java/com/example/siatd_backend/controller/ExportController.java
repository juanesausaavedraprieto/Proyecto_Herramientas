package com.example.siatd_backend.controller;

import com.example.siatd_backend.model.Decision;
import com.example.siatd_backend.repository.DecisionRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.util.List;

@RestController
@RequestMapping("/api/admin/export")
@CrossOrigin(origins = "http://localhost:5173")
public class ExportController {

    private final DecisionRepository decisionRepository;

    public ExportController(DecisionRepository decisionRepository) {
        this.decisionRepository = decisionRepository;
    }

    @GetMapping("/excel")
    public ResponseEntity<byte[]> exportDecisionsToExcel() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            // 1. Crear la hoja
            Sheet sheet = workbook.createSheet("Auditoría de Decisiones");

            // 2. Estilos para la cabecera
            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font headerFont = workbook.createFont();
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            // 3. Crear Fila de Cabeceras
            Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "Usuario", "Correo", "Dilema", "Fecha", "Nivel de Estrés", "Opción Ganadora"};
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // 4. Llenar con datos reales
            List<Decision> decisions = decisionRepository.findAll();
            int rowIdx = 1;
            for (Decision d : decisions) {
                Row row = sheet.createRow(rowIdx++);
                
                row.createCell(0).setCellValue(d.getId() != null ? d.getId().toString() : "N/A");
                row.createCell(1).setCellValue(d.getUser() != null && d.getUser().getName() != null ? d.getUser().getName() : "Desconocido");
                row.createCell(2).setCellValue(d.getUser() != null && d.getUser().getEmail() != null ? d.getUser().getEmail() : "N/A");
                row.createCell(3).setCellValue(d.getTitle() != null ? d.getTitle() : "Sin Título");
                row.createCell(4).setCellValue(d.getCreatedAt() != null ? d.getCreatedAt().toString() : "Sin Fecha");
                
                // 🚨 EL FIX ESTÁ AQUÍ: Evitamos el NullPointerException convirtiéndolo a String de forma segura
                row.createCell(5).setCellValue(d.getStressLevel() != null ? String.valueOf(d.getStressLevel()) : "N/A");
                
                row.createCell(6).setCellValue(d.getRecommendedOption() != null ? d.getRecommendedOption().getName() : "En Proceso");
            }

            // Auto-ajustar tamaño de columnas
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            // 5. Escribir al flujo de bytes
            workbook.write(out);

            // 6. Preparar la respuesta para forzar la descarga en el navegador
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "SIATD_Auditoria.xlsx");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(out.toByteArray());

        } catch (Exception e) {
            System.err.println("Error al generar Excel: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}