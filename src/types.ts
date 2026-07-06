/**
 * Shared Type Definitions for the AI Vendor Analysis and Selection System
 */

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Encrypted with bcrypt
  totalAnalyses: number;
  reportsGenerated: number;
  createdAt: string;
}

export interface VendorDocument {
  id: string;
  name: string; // File name
  size: string; // Pretty size, e.g., "1.2 MB"
  type: string; // "pdf" | "docx" | "txt"
  extractedText: string;
  uploadedAt: string;
}

export interface VendorComparisonRow {
  vendor: string;
  price: string;
  quality: number;
  delivery: string;
  support: number;
  experience: number;
  compliance: number;
  risk: number;
  innovation: number;
  scalability: number;
  totalScore: number;
  ranking: number;
}

export interface BestVendorDetails {
  name: string;
  score: number;
  recommendation: string;
  reasons: string[];
  advantages: string[];
  businessBenefits: string[];
  possibleRisks: string[];
  finalConclusion: string;
}

export interface VendorRejectionDetail {
  name: string;
  reason: string;
}

export interface VendorImprovementSuggestion {
  name: string;
  suggestions: string[];
}

export interface VendorAnalysis {
  id: string;
  userId: string;
  date: string;
  uploadedVendors: string[];
  comparisonTable: VendorComparisonRow[];
  ranking: string[];
  bestVendor: BestVendorDetails;
  rejections: VendorRejectionDetail[];
  improvementSuggestions: VendorImprovementSuggestion[];
}

export interface GeneratedEmail {
  id: string;
  analysisId: string;
  vendorName: string;
  type: 'selected' | 'rejected';
  subject: string;
  body: string;
  status: 'draft' | 'sent';
  sentAt?: string;
  recipientEmail: string;
}

export interface DatabaseSchema {
  users: User[];
  analyses: VendorAnalysis[];
  emails: GeneratedEmail[];
}
