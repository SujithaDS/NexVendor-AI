import Database from 'better-sqlite3';
import path from 'path';
import { DatabaseSchema, User, VendorAnalysis, GeneratedEmail } from '../types';

const DB_PATH = path.join(process.cwd(), 'db.sqlite');

// Initialize database instance and tables
let dbInstance: Database.Database;

try {
  dbInstance = new Database(DB_PATH);
  
  // Create tables if they do not exist
  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      total_analyses INTEGER DEFAULT 0,
      reports_generated INTEGER DEFAULT 0,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      date TEXT,
      uploaded_vendors TEXT, -- JSON array
      comparison_table TEXT, -- JSON array
      ranking TEXT,          -- JSON array
      best_vendor TEXT,      -- JSON object
      rejections TEXT,       -- JSON array
      improvement_suggestions TEXT -- JSON array
    );

    CREATE TABLE IF NOT EXISTS emails (
      id TEXT PRIMARY KEY,
      analysis_id TEXT,
      vendor_name TEXT,
      type TEXT,
      subject TEXT,
      body TEXT,
      status TEXT,
      recipient_email TEXT,
      sent_at TEXT
    );
  `);
} catch (error) {
  console.error('Failed to initialize SQLite database:', error);
}

// Map SQLite rows to typed JS object
export function getDb(): DatabaseSchema {
  try {
    const usersRows = dbInstance.prepare('SELECT * FROM users').all();
    const analysesRows = dbInstance.prepare('SELECT * FROM analyses').all();
    const emailsRows = dbInstance.prepare('SELECT * FROM emails').all();

    const users: User[] = usersRows.map((r: any) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      password: r.password,
      totalAnalyses: r.total_analyses,
      reportsGenerated: r.reports_generated,
      createdAt: r.created_at
    }));

    const analyses: VendorAnalysis[] = analysesRows.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      date: r.date,
      uploadedVendors: JSON.parse(r.uploaded_vendors || '[]'),
      comparisonTable: JSON.parse(r.comparison_table || '[]'),
      ranking: JSON.parse(r.ranking || '[]'),
      bestVendor: JSON.parse(r.best_vendor || '{}'),
      rejections: JSON.parse(r.rejections || '[]'),
      improvementSuggestions: JSON.parse(r.improvement_suggestions || '[]')
    }));

    const emails: GeneratedEmail[] = emailsRows.map((r: any) => ({
      id: r.id,
      analysisId: r.analysis_id,
      vendorName: r.vendor_name,
      type: r.type as 'selected' | 'rejected',
      subject: r.subject,
      body: r.body,
      status: r.status as 'draft' | 'sent',
      recipientEmail: r.recipient_email,
      sentAt: r.sent_at || undefined
    }));

    return { users, analyses, emails };
  } catch (error) {
    console.error('Error reading from SQLite database:', error);
    return { users: [], analyses: [], emails: [] };
  }
}

export function saveDb(db: DatabaseSchema): void {
  try {
    // Run inside a transaction for robust atomic commits
    const saveTransaction = dbInstance.transaction(() => {
      // 1. Sync users
      const insertUser = dbInstance.prepare(`
        INSERT OR REPLACE INTO users (id, name, email, password, total_analyses, reports_generated, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const userIds = db.users.map(u => u.id);
      if (userIds.length > 0) {
        const placeholders = userIds.map(() => '?').join(',');
        dbInstance.prepare(`DELETE FROM users WHERE id NOT IN (${placeholders})`).run(...userIds);
      } else {
        dbInstance.prepare('DELETE FROM users').run();
      }

      for (const u of db.users) {
        insertUser.run(u.id, u.name, u.email, u.password || '', u.totalAnalyses || 0, u.reportsGenerated || 0, u.createdAt || '');
      }

      // 2. Sync analyses
      const insertAnalysis = dbInstance.prepare(`
        INSERT OR REPLACE INTO analyses (id, user_id, date, uploaded_vendors, comparison_table, ranking, best_vendor, rejections, improvement_suggestions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const analysisIds = db.analyses.map(a => a.id);
      if (analysisIds.length > 0) {
        const placeholders = analysisIds.map(() => '?').join(',');
        dbInstance.prepare(`DELETE FROM analyses WHERE id NOT IN (${placeholders})`).run(...analysisIds);
      } else {
        dbInstance.prepare('DELETE FROM analyses').run();
      }

      for (const a of db.analyses) {
        insertAnalysis.run(
          a.id,
          a.userId,
          a.date,
          JSON.stringify(a.uploadedVendors),
          JSON.stringify(a.comparisonTable),
          JSON.stringify(a.ranking),
          JSON.stringify(a.bestVendor),
          JSON.stringify(a.rejections),
          JSON.stringify(a.improvementSuggestions)
        );
      }

      // 3. Sync emails
      const insertEmail = dbInstance.prepare(`
        INSERT OR REPLACE INTO emails (id, analysis_id, vendor_name, type, subject, body, status, recipient_email, sent_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const emailIds = db.emails.map(e => e.id);
      if (emailIds.length > 0) {
        const placeholders = emailIds.map(() => '?').join(',');
        dbInstance.prepare(`DELETE FROM emails WHERE id NOT IN (${placeholders})`).run(...emailIds);
      } else {
        dbInstance.prepare('DELETE FROM emails').run();
      }

      for (const e of db.emails) {
        insertEmail.run(
          e.id,
          e.analysisId,
          e.vendorName,
          e.type,
          e.subject,
          e.body,
          e.status,
          e.recipientEmail,
          e.sentAt || ''
        );
      }
    });

    saveTransaction();
  } catch (error) {
    console.error('Error saving to SQLite database:', error);
  }
}

// Seed helper to populate a demo analysis if db is empty
export function seedIfEmpty(): void {
  const db = getDb();
  if (db.analyses.length === 0) {
    console.log('Seeding demo analysis data to SQLite...');
    
    // Create a demo analysis
    const demoAnalysis: VendorAnalysis = {
      id: 'demo-analysis-1',
      userId: 'demo-user-id',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      uploadedVendors: ['Apex Solutions.pdf', 'Vertex Global.pdf', 'Nova Tech.pdf'],
      comparisonTable: [
        {
          vendor: 'Apex Solutions',
          price: '$45,000',
          quality: 18,
          delivery: '30 Days',
          support: 9,
          experience: 8,
          compliance: 9,
          risk: 4,
          innovation: 4,
          scalability: 4,
          totalScore: 91,
          ranking: 1
        },
        {
          vendor: 'Vertex Global',
          price: '$52,000',
          quality: 19,
          delivery: '15 Days',
          support: 8,
          experience: 9,
          compliance: 8,
          risk: 3,
          innovation: 5,
          scalability: 5,
          totalScore: 88,
          ranking: 2
        },
        {
          vendor: 'Nova Tech',
          price: '$38,000',
          quality: 14,
          delivery: '45 Days',
          support: 6,
          experience: 7,
          compliance: 7,
          risk: 2,
          innovation: 3,
          scalability: 3,
          totalScore: 71,
          ranking: 3
        }
      ],
      ranking: ['Apex Solutions', 'Vertex Global', 'Nova Tech'],
      bestVendor: {
        name: 'Apex Solutions',
        score: 91,
        recommendation: 'Apex Solutions offers the most balanced and value-driven proposal. They achieved the highest scores in price-to-quality ratio, excellent technical customer support setup, and highly compliant standard certifications.',
        reasons: [
          'Most competitive price ($45,000) among high-tier vendors while preserving a 90% quality score.',
          'Comprehensive 24/7 technical customer support SLA included in the baseline proposal.',
          'Highly rated warranty terms (3 Years) which minimizes long-term maintenance overhead.',
          'Solid compliance ratings with ISO 27001 certification.'
        ],
        advantages: [
          'Excellent cost-to-performance ratio.',
          'Strong security certification profiles (ISO 27001).',
          '3-year local support and maintenance warranty.'
        ],
        businessBenefits: [
          'Saves 15% procurement budget compared to Vertex Global with comparable system quality.',
          'Reduces operational downtime risks via 24/7 dedicated support SLAs.',
          'Guarantees regulatory compliance through robust certified protocols.'
        ],
        possibleRisks: [
          'Delivery timeline is 30 days, which is slower than Vertex Global\'s 15-day turn-around.',
          'Requires a 40% upfront deposit as per standard payment terms.'
        ],
        finalConclusion: 'Apex Solutions is highly recommended for contract award. Their proposal fits the organization\'s budget constraints perfectly while exceeding operational support thresholds.'
      },
      rejections: [
        {
          name: 'Vertex Global',
          reason: 'Vertex Global has outstanding technical delivery speed (15 Days) and high quality, but their quoted price of $52,000 exceeds our specified budget threshold by 15%.'
        },
        {
          name: 'Nova Tech',
          reason: 'Nova Tech submitted a very low price ($38,000) but failed to meet core compliance metrics, did not provide certified security documentation, and has critical deficiencies in customer support response speed.'
        }
      ],
      improvementSuggestions: [
        {
          name: 'Apex Solutions',
          suggestions: [
            'Negotiate delivery schedule down to 21-25 days to align closer to critical project milestones.',
            'Inquire if upfront payment deposit can be restructured to a milestone-based schedule (e.g., 20/40/40).'
          ]
        },
        {
          name: 'Vertex Global',
          suggestions: [
            'Propose a volume-based discount or a multi-year service commitment to bring baseline pricing down towards the $48,000 range.'
          ]
        },
        {
          name: 'Nova Tech',
          suggestions: [
            'Undergo security audits to achieve ISO/IEC 27001 compliance.',
            'Strengthen customer support operations by introducing standard SLA tracking and escalation matrices.'
          ]
        }
      ]
    };

    db.analyses.push(demoAnalysis);

    // Create default emails
    const demoEmails: GeneratedEmail[] = [
      {
        id: 'demo-email-selected',
        analysisId: 'demo-analysis-1',
        vendorName: 'Apex Solutions',
        type: 'selected',
        subject: 'Congratulations! Vendor Selection Result - Apex Solutions',
        body: `Dear Apex Solutions Team,\n\nWe are pleased to inform you that after careful evaluation of your proposal, your company has been selected as our preferred vendor for this project.\n\nThank you for your excellent proposal, which demonstrated superior quality-to-price metrics and a solid compliance profile. Our procurement team will contact you shortly to discuss contract formulation and milestone details.\n\nRegards,\nProcurement Team`,
        status: 'draft',
        recipientEmail: 'sales@apexsolutions.com'
      },
      {
        id: 'demo-email-rejected-vertex',
        analysisId: 'demo-analysis-1',
        vendorName: 'Vertex Global',
        type: 'rejected',
        subject: 'Vendor Proposal Evaluation Result - Vertex Global',
        body: `Dear Vertex Global Team,\n\nThank you for submitting your proposal for our vendor procurement evaluation.\n\nAfter detailed evaluation of multiple vendors, we regret to inform you that another vendor has been selected based on project budgetary and support requirements. Your technical expertise was highly rated, and we will keep your profile in our preferred vendor database for future opportunities.\n\nWe appreciate your participation.\n\nRegards,\nProcurement Team`,
        status: 'draft',
        recipientEmail: 'info@vertexglobal.com'
      }
    ];

    db.emails.push(...demoEmails);
    saveDb(db);
  }
}
