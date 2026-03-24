package project.TeamFive.ExLMS.user.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import project.TeamFive.ExLMS.user.dto.response.UserResponse;
import project.TeamFive.ExLMS.user.service.AdminUserService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(adminUserService.getAllUsers(page, size, keyword));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<String> changeStatus(@PathVariable UUID id, @RequestParam String status) {
        return ResponseEntity.ok(adminUserService.changeUserStatus(id, status));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<String> changeRole(@PathVariable UUID id, @RequestParam String role) {
        return ResponseEntity.ok(adminUserService.changeUserRole(id, role));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportExcel() {
        List<UserResponse> users = adminUserService.exportAllUsers();
        try (org.apache.poi.ss.usermodel.Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook()) {
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.createSheet("Users");
            org.apache.poi.ss.usermodel.Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("ID");
            header.createCell(1).setCellValue("FullName");
            header.createCell(2).setCellValue("Email");
            header.createCell(3).setCellValue("Role");
            header.createCell(4).setCellValue("Status");
            header.createCell(5).setCellValue("FailedLoginCount");
            header.createCell(6).setCellValue("LastLoginAt");
            header.createCell(7).setCellValue("CreatedAt");

            int rowIdx = 1;
            for (UserResponse u : users) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(u.getId() != null ? u.getId().toString() : "");
                row.createCell(1).setCellValue(u.getFullName() != null ? u.getFullName() : "");
                row.createCell(2).setCellValue(u.getEmail() != null ? u.getEmail() : "");
                row.createCell(3).setCellValue(u.getRole() != null ? u.getRole() : "");
                row.createCell(4).setCellValue(u.getStatus() != null ? u.getStatus() : "");
                row.createCell(5).setCellValue(u.getFailedLoginCount());
                row.createCell(6).setCellValue(u.getLastLoginAt() != null ? u.getLastLoginAt().toString() : "");
                row.createCell(7).setCellValue(u.getCreatedAt() != null ? u.getCreatedAt().toString() : "");
            }

            java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
            workbook.write(out);
            byte[] excelData = out.toByteArray();

            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=users_export.xlsx");
            headers.set(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

            return ResponseEntity.ok().headers(headers).body(excelData);
        } catch (java.io.IOException e) {
            throw new RuntimeException("Lỗi sinh file Excel", e);
        }
    }
}
