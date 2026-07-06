#  NexVendor AI – AI-Powered Vendor Analysis and Selection System

NexVendor AI is a full-stack, AI-powered procurement platform that automates vendor proposal analysis and helps organizations select the best vendor through intelligent document processing, multi-criteria evaluation, and AI-driven recommendations.

---

##  Project Overview

Traditional vendor evaluation is a manual, time-consuming, and error-prone process involving multiple proposal documents and spreadsheet-based comparisons. NexVendor AI streamlines this workflow by using Artificial Intelligence to analyze vendor proposals, generate objective scores, compare vendors, and recommend the most suitable vendor.

---

##  Features

-  User Authentication (Login & Registration)
-  Upload Vendor Proposals (PDF, DOCX, TXT)
-  AI-Powered Proposal Analysis using Google Gemini AI
-  Automated Vendor Scoring & Ranking
-  Interactive Dashboard with Charts
-  AI-Generated Selection & Rejection Emails
-  Vendor Comparison Dashboard
-  Analysis History Management
-  SQLite Database Integration
-  Docker Support

---

##  System Architecture

```
User
   │
   ▼
React Frontend
   │
REST API
   │
   ▼
Express.js Server
   │
   ├── Google Gemini AI
   └── SQLite Database
```

---

##  Technology Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React
- Recharts

### Backend
- Node.js
- Express.js
- Java Spring Boot (Enterprise Backend)

### Database
- SQLite

### AI
- Google Gemini AI

### Deployment
- Docker
- Docker Compose

---

##  Project Structure

```
NexVendor-AI
│── src/
│── assets/
│── spring-boot-backend/
│── server.ts
│── db.sqlite
│── docker-compose.yml
│── package.json
│── vite.config.ts
│── README.md
```

---

##  Installation

### Clone Repository

```bash
git clone https://github.com/SujithaDS/NexVendor-AI.git
cd NexVendor-AI
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build Project

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

---

##  Environment Variables

Create a `.env` file and configure:

```env
GEMINI_API_KEY=your_google_gemini_api_key
JWT_SECRET=your_secret_key
```

---

##  Workflow

1. User logs in.
2. Uploads vendor proposal documents.
3. Backend extracts document content.
4. Google Gemini AI analyzes proposals.
5. Vendors are scored based on predefined criteria.
6. Dashboard displays rankings and comparisons.
7. AI generates recommendation reports and draft emails.

---

##  Future Enhancements

- MongoDB Integration
- ChromaDB for Semantic Search
- Role-Based Access Control
- Email Notifications
- Multi-Language Support
- Cloud Deployment

