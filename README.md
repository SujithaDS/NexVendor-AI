# AI Vendor Analysis and Selection System

A comprehensive, enterprise-ready full-stack application designed to optimize and automate the vendor procurement process using Artificial Intelligence. This system parses vendor proposal documents (PDF, DOCX, TXT), extracts critical metrics, computes weighted multi-criteria scores, ranks vendors, generates outreach emails (with live previews), and compiles professional PDF summaries. 

This project is structured specifically as a final-year engineering capstone project utilizing modern full-stack methodologies.

---

## 🌟 Key System Features

1. **User Authentication Module**: JWT-secured signup and login panels incorporating BCrypt password encryption.
2. **Multi-Document Upload**: Drag-and-drop ingestion supporting simultaneous parsing of multiple `.txt`, `.docx`, and `.pdf` proposals.
3. **Editable Proposal Extractors**: Direct review interface allowing users to tweak or paste raw extracted vendor criteria prior to prompting.
4. **AI Processing Engine**: Incorportates Google Gemini (`gemini-3.5-flash`) for deep context extraction and weighted procurement scoring.
5. **Interactive Recharts Visualizer**: Stately vector dashboard displaying overall comparisons, multi-criteria radars, trendlines, and proportions.
6. **Outbox Communication Center**: Preview, customize, and send automated notifications (Selection/Rejections letters) via integrated simulated JavaMailSender protocols.
7. **Report Compilation**: Elegant printing styles (`@media print` stylesheets) that yield print-ready audit-friendly PDF downloads.
8. **Durable Database Schema**: Multi-document history log management.

---

## 🛠️ Technological Architecture

### Live Workspace / Container Runtime
- **Frontend Framework**: React 19, TypeScript, Tailwind CSS, Lucide-React
- **State Management**: Local React state, localized localStorage persistence
- **Visualizer Charts**: Recharts (fully responsive canvas vectors)
- **Outbox System**: Express API SMTP transmission simulator
- **Core Database Engine**: File-based local JSON repository (`db.json`) serving active audits.

### Production Deployable Deliverables (Included)
- **Backend Framework**: Java 17, Spring Boot 3.2.4 (Spring Web, Spring Security, Spring Mail)
- **Durable Persistent Store**: MongoDB
- **Vector Index Engine**: ChromaDB
- **Deployment Strategy**: Multi-container Docker Compose configuration

---

## 📂 Project Directory Architecture

```
/
├── server.ts                       # Live Express full-stack backend
├── db.json                         # Local persistent store for live container
├── Dockerfile                      # React client deployment specification
├── docker-compose.yml              # Production Orchestration file
├── package.json                    # Workspace dependencies and start configurations
├── README.md                       # Comprehensive System documentation
│
├── src/
│   ├── App.tsx                     # Main React state container & layout router
│   ├── main.tsx                    # React client entry point
│   ├── index.css                   # Global styling with custom typography loads
│   ├── types.ts                    # Global TypeScript interfaces
│   │
│   └── components/
│       ├── LoginRegister.tsx       # Landing page, JWT auth forms, and summaries
│       ├── NewAnalysis.tsx         # Document dropzone and editable extract views
│       ├── ComparisonDashboard.tsx # Results table, winner cards, and Recharts
│       ├── EmailDashboard.tsx      # Multi-template mail compiler and SMTP terminal logs
│       ├── HistoryList.tsx         # Stored audits registry and delete triggers
│       └── ProfileView.tsx         # Authorized profile metrics
│
└── spring-boot-backend/            # COMPLETE Java Spring Boot Codebase
    ├── Dockerfile                  # Multi-stage Maven jar builder
    ├── pom.xml                     # Maven project configuration file
    │
    └── src/main/java/com/system/vendoranalysis/
        ├── VendorAnalysisApplication.java
        ├── config/
        │   ├── SecurityConfig.java
        │   └── MongoConfig.java
        ├── jwt/
        │   ├── JwtUtils.java
        │   └── AuthTokenFilter.java
        ├── entity/
        │   ├── User.java
        │   ├── VendorAnalysis.java
        │   └── GeneratedEmail.java
        ├── repository/
        │   ├── UserRepository.java
        │   └── VendorAnalysisRepository.java
        ├── service/
        │   ├── GeminiService.java  # Prompt structure & RestTemplate client
        │   ├── ChromaService.java  # Vector indexing client
        │   └── EmailService.java   # JavaMailSender connection service
        └── controller/
            ├── AuthController.java
            └── AnalysisController.java # Multi-file upload handlers
```

---

## ⚡ Setup & Launch Guide (Live Sandbox Container)

This workspace is fully optimized to run a live full-stack Express + React application in your current container preview. The system is seeded with mock historical analyses to allow instant, beautiful evaluation testing right out of the box.

To launch the live application preview on **Port 3000**, simply let the development environment boot up automatically. The main Express server (`server.ts`) serves both the REST APIs and the React client simultaneously.

To populate your custom Gemini API key for real LLM evaluations:
1. Open the **Settings > Secrets** panel in the AI Studio interface.
2. Configure your secret environment variable: `GEMINI_API_KEY`.
3. The live container will hot-reload, and subsequent evaluations will utilize live Gemini 3.5 Flash queries.

---

## 🐳 Running with Docker (Production Deliverables)

To run the complete production environment incorporating **Spring Boot, MongoDB, ChromaDB, and React**, use the provided Docker Compose configuration:

### Prerequisites
Make sure you have Docker and Docker Compose installed on your local host system.

### Launch Instructions
1. Navigate to the project root directory.
2. Build and launch all multi-containers in background mode:
   ```bash
   docker-compose up --build -d
   ```
3. The orchestrator will spin up:
   - **React Frontend**: `http://localhost:3000`
   - **Spring Boot Backend**: `http://localhost:8080`
   - **MongoDB Database**: `mongodb://localhost:27017`
   - **ChromaDB**: `http://localhost:8000`

---

## 🧬 Prompt Design Strategy

The system utilizes an advanced system instruction configured within the Gemini service layer:

```
You are a Senior Procurement Consultant. Compare all uploaded vendor proposal documents.
For each vendor, extract metrics: price, quality, delivery, experience, compliance, risk...
Score every vendor out of 100 based on weighted points:
  - Price: 20 pts
  - Quality: 20 pts
  - Delivery: 15 pts
  - Support: 10 pts
  - Experience: 10 pts
  - Compliance: 10 pts
  - Risk: 5 pts
  - Innovation: 5 pts
  - Scalability: 5 pts
Return response strictly in structured JSON matching the database schema.
```

---

## 🔒 Security Configuration
All requests beyond Authentication routes require a JWT authorization token passed inside the HTTP header:
`Authorization: Bearer <JWT_TOKEN>`

User passwords are encrypted with a security factor of `10` rounds via the BCrypt hashing algorithm before persistent write.
