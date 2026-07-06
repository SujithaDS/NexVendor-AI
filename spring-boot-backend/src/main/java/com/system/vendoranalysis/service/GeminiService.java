package com.system.vendoranalysis.service;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${GEMINI_API_KEY}")
    private String apiKey;

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=";

    public String generateVendorComparison(List<Map<String, String>> vendors) {
        RestTemplate restTemplate = new RestTemplate();
        
        // Formulate the prompt using Senior Procurement Consultant instructions
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("You are a Senior Procurement Consultant. Compare all uploaded vendor proposal documents.\n\n");
        
        for (Map<String, String> vendor : vendors) {
            promptBuilder.append("Vendor Name: ").append(vendor.get("name")).append("\n");
            promptBuilder.append("Proposal Text: ").append(vendor.get("text")).append("\n");
            promptBuilder.append("=========================================\n\n");
        }
        
        promptBuilder.append("For each vendor extract the Vendor Name, Quoted Price, Delivery Time, Warranty, Technical Features, Support, Experience, and Certifications.\n")
                .append("Score every vendor out of 100 based on: Price (20), Quality (20), Delivery (15), Support (10), Experience (10), Compliance (10), Risk (5), Innovation (5), Scalability (5).\n")
                .append("Generate a comparison table, a ranking of all vendors, identify the Best Vendor, and detail reasons for selection and rejections.\n")
                .append("Return response strictly in structured JSON matching this schema:\n")
                .append("{\n")
                .append("  \"comparisonTable\": [ {\"vendor\":\"String\", \"price\":\"String\", \"quality\":20, \"delivery\":\"String\", \"support\":10, \"experience\":10, \"compliance\":10, \"risk\":5, \"innovation\":5, \"scalability\":5, \"totalScore\":100, \"ranking\":1} ],\n")
                .append("  \"ranking\": [ \"String\" ],\n")
                .append("  \"bestVendor\": {\"name\":\"String\", \"score\":100, \"recommendation\":\"String\", \"reasons\":[\"String\"], \"advantages\":[\"String\"], \"businessBenefits\":[\"String\"], \"possibleRisks\":[\"String\"], \"finalConclusion\":\"String\"},\n")
                .append("  \"rejections\": [ {\"name\":\"String\", \"reason\":\"String\"} ],\n")
                .append("  \"improvementSuggestions\": [ {\"name\":\"String\", \"suggestions\":[\"String\"]} ]\n")
                .append("}");

        // Build the request body for the @google/genai API endpoint
        JSONObject requestBody = new JSONObject();
        JSONArray contents = new JSONArray();
        JSONObject partsObject = new JSONObject();
        JSONArray partsArray = new JSONArray();
        JSONObject textPart = new JSONObject();
        
        textPart.put("text", promptBuilder.toString());
        partsArray.put(textPart);
        partsObject.put("parts", partsArray);
        contents.put(partsObject);
        requestBody.put("contents", contents);

        // Set response type constraints
        JSONObject generationConfig = new JSONObject();
        generationConfig.put("responseMimeType", "application/json");
        requestBody.put("generationConfig", generationConfig);

        // Prepare HTTP Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("User-Agent", "aistudio-build");

        HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    GEMINI_URL + apiKey,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                // Parse out candidate text field
                JSONObject jsonResponse = new JSONObject(response.getBody());
                return jsonResponse.getJSONArray("candidates")
                        .getJSONObject(0)
                        .getJSONObject("content")
                        .getJSONArray("parts")
                        .getJSONObject(0)
                        .getString("text");
            }
            throw new RuntimeException("Unexpected response status: " + response.getStatusCode());
        } catch (Exception e) {
            throw new RuntimeException("Failed to request Gemini API model: " + e.getMessage(), e);
        }
    }
}
