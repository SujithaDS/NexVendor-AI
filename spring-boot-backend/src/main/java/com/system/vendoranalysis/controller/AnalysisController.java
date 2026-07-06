package com.system.vendoranalysis.controller;

import com.system.vendoranalysis.entity.VendorAnalysis;
import com.system.vendoranalysis.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AnalysisController {

    @Autowired
    private GeminiService geminiService;

    // Simulate in-memory MongoDB structure or connect to MongoTemplate
    private final List<Map<String, Object>> mockDb = new ArrayList<>();

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFiles(@RequestParam("files") MultipartFile[] files) {
        try {
            List<Map<String, Object>> processedFiles = new ArrayList<>();
            for (MultipartFile file : files) {
                String name = file.getOriginalFilename();
                String text = "";
                
                // Read text depending on file types (TXT, PDF, or DOCX)
                if (name != null && name.endsWith(".txt")) {
                    text = new String(file.getBytes(), StandardCharsets.UTF_8);
                } else {
                    // Fallback simulation text for PDF/DOCX parsing in standard pipelines
                    text = "SPECIFICATIONS EXTRACTED FROM: " + name + "\n" +
                           "Contains pricing tables, warranty descriptions, and support matrices.";
                }

                Map<String, Object> doc = new HashMap<>();
                doc.put("id", "doc-" + UUID.randomUUID().toString().substring(0, 8));
                doc.put("name", name);
                doc.put("size", (file.getSize() / (1024.0 * 1024.0)) + " MB");
                doc.put("type", name != null ? name.substring(name.lastIndexOf(".") + 1) : "txt");
                doc.put("extractedText", text);
                doc.put("uploadedAt", new Date().toString());
                
                processedFiles.add(doc);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("files", processedFiles);
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "Error reading uploaded file bytes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeVendors(@RequestBody Map<String, Object> payload) {
        try {
            List<Map<String, String>> vendors = (List<Map<String, String>>) payload.get("vendors");
            if (vendors == null || vendors.isEmpty()) {
                Map<String, Object> err = new HashMap<>();
                err.put("error", "Please provide vendor proposal specifications to analyze.");
                return ResponseEntity.badRequest().body(err);
            }

            // Call real Gemini API endpoint using Java Prompt engineering
            String promptResults = geminiService.generateVendorComparison(vendors);
            
            // Generate clean response payload and write to Audit database
            Map<String, Object> analysisRecord = new HashMap<>();
            analysisRecord.put("id", "analysis-" + UUID.randomUUID().toString().substring(0, 8));
            analysisRecord.put("date", new Date().toString());
            analysisRecord.put("rawResultJson", promptResults);

            mockDb.add(analysisRecord);

            return ResponseEntity.status(HttpStatus.CREATED).body(analysisRecord);

        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("error", "LLM processing or persistence error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getHistory() {
        return ResponseEntity.ok(mockDb);
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<Map<String, String>> deleteHistory(@PathVariable String id) {
        boolean removed = mockDb.removeIf(item -> id.equals(item.get("id")));
        Map<String, String> res = new HashMap<>();
        if (removed) {
            res.put("message", "History log successfully removed.");
            return ResponseEntity.ok(res);
        } else {
            res.put("error", "Historical item not found.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res);
        }
    }
}
