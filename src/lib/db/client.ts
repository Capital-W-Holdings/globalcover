// Database client - PostgreSQL ready
// In production, replace with actual PostgreSQL connection using pg or Prisma

import type { BenefitCategory } from '@/types';

// Type definitions for database records
export interface DbLead {
  id: string;
  product_id: string;
  product_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  country: string;
  start_date: string;
  message: string | null;
  referral_code: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  created_at: Date;
  updated_at: Date;
}

export interface DbWaitlistEntry {
  id: string;
  email: string;
  first_name: string;
  interests: BenefitCategory[];
  referral_code: string;
  referred_by: string | null;
  position: number;
  verified: boolean;
  verified_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface DbPayment {
  id: string;
  stripe_session_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  email: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  plan_type: 'monthly' | 'annual';
  created_at: Date;
  updated_at: Date;
}

// In-memory stores (replace with actual DB queries in production)
const leadsStore = new Map<string, DbLead>();
const waitlistStore = new Map<string, DbWaitlistEntry>();
const paymentsStore = new Map<string, DbPayment>();

// Helper to generate IDs
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Database client class
class DatabaseClient {
  private connected = false;

  async connect(): Promise<void> {
    // In production: Connect to PostgreSQL
    // const { Pool } = require('pg');
    // this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.connected = true;
    console.log('[DB] Connected to database');
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    console.log('[DB] Disconnected from database');
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Lead operations
  async createLead(data: Omit<DbLead, 'id' | 'created_at' | 'updated_at'>): Promise<DbLead> {
    const lead: DbLead = {
      ...data,
      id: generateId('lead'),
      created_at: new Date(),
      updated_at: new Date(),
    };
    leadsStore.set(lead.id, lead);
    return lead;
  }

  async getLeadById(id: string): Promise<DbLead | null> {
    return leadsStore.get(id) ?? null;
  }

  async getLeadByEmail(email: string): Promise<DbLead | null> {
    let found: DbLead | null = null;
    leadsStore.forEach((lead) => {
      if (lead.email.toLowerCase() === email.toLowerCase()) {
        found = lead;
      }
    });
    return found;
  }

  async getAllLeads(options?: { 
    status?: DbLead['status']; 
    limit?: number; 
    offset?: number;
  }): Promise<{ leads: DbLead[]; total: number }> {
    let leads = Array.from(leadsStore.values());
    
    if (options?.status) {
      leads = leads.filter((l) => l.status === options.status);
    }
    
    const total = leads.length;
    leads.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    
    if (options?.offset) {
      leads = leads.slice(options.offset);
    }
    if (options?.limit) {
      leads = leads.slice(0, options.limit);
    }
    
    return { leads, total };
  }

  async updateLead(id: string, data: Partial<DbLead>): Promise<DbLead | null> {
    const lead = leadsStore.get(id);
    if (!lead) return null;
    
    const updated = { ...lead, ...data, updated_at: new Date() };
    leadsStore.set(id, updated);
    return updated;
  }

  // Waitlist operations
  async createWaitlistEntry(data: Omit<DbWaitlistEntry, 'id' | 'created_at' | 'updated_at'>): Promise<DbWaitlistEntry> {
    const entry: DbWaitlistEntry = {
      ...data,
      id: generateId('wl'),
      created_at: new Date(),
      updated_at: new Date(),
    };
    waitlistStore.set(entry.id, entry);
    return entry;
  }

  async getWaitlistEntryById(id: string): Promise<DbWaitlistEntry | null> {
    return waitlistStore.get(id) ?? null;
  }

  async getWaitlistEntryByEmail(email: string): Promise<DbWaitlistEntry | null> {
    let found: DbWaitlistEntry | null = null;
    waitlistStore.forEach((entry) => {
      if (entry.email.toLowerCase() === email.toLowerCase()) {
        found = entry;
      }
    });
    return found;
  }

  async getWaitlistEntryByReferralCode(code: string): Promise<DbWaitlistEntry | null> {
    let found: DbWaitlistEntry | null = null;
    waitlistStore.forEach((entry) => {
      if (entry.referral_code === code.toUpperCase()) {
        found = entry;
      }
    });
    return found;
  }

  async getAllWaitlistEntries(options?: {
    verified?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ entries: DbWaitlistEntry[]; total: number }> {
    let entries = Array.from(waitlistStore.values());
    
    if (options?.verified !== undefined) {
      entries = entries.filter((e) => e.verified === options.verified);
    }
    
    const total = entries.length;
    entries.sort((a, b) => a.position - b.position);
    
    if (options?.offset) {
      entries = entries.slice(options.offset);
    }
    if (options?.limit) {
      entries = entries.slice(0, options.limit);
    }
    
    return { entries, total };
  }

  async updateWaitlistEntry(id: string, data: Partial<DbWaitlistEntry>): Promise<DbWaitlistEntry | null> {
    const entry = waitlistStore.get(id);
    if (!entry) return null;
    
    const updated = { ...entry, ...data, updated_at: new Date() };
    waitlistStore.set(id, updated);
    return updated;
  }

  async getWaitlistCount(): Promise<number> {
    return waitlistStore.size;
  }

  async getNextWaitlistPosition(): Promise<number> {
    let maxPosition = 2500; // Start from a believable number
    waitlistStore.forEach((entry) => {
      if (entry.position > maxPosition) {
        maxPosition = entry.position;
      }
    });
    return maxPosition + 1;
  }

  // Payment operations
  async createPayment(data: Omit<DbPayment, 'id' | 'created_at' | 'updated_at'>): Promise<DbPayment> {
    const payment: DbPayment = {
      ...data,
      id: generateId('pay'),
      created_at: new Date(),
      updated_at: new Date(),
    };
    paymentsStore.set(payment.id, payment);
    return payment;
  }

  async getPaymentById(id: string): Promise<DbPayment | null> {
    return paymentsStore.get(id) ?? null;
  }

  async getPaymentBySessionId(sessionId: string): Promise<DbPayment | null> {
    let found: DbPayment | null = null;
    paymentsStore.forEach((payment) => {
      if (payment.stripe_session_id === sessionId) {
        found = payment;
      }
    });
    return found;
  }

  async updatePayment(id: string, data: Partial<DbPayment>): Promise<DbPayment | null> {
    const payment = paymentsStore.get(id);
    if (!payment) return null;
    
    const updated = { ...payment, ...data, updated_at: new Date() };
    paymentsStore.set(id, updated);
    return updated;
  }

  async getPaymentsByEmail(email: string): Promise<DbPayment[]> {
    const payments: DbPayment[] = [];
    paymentsStore.forEach((payment) => {
      if (payment.email.toLowerCase() === email.toLowerCase()) {
        payments.push(payment);
      }
    });
    return payments.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  // Stats
  async getStats(): Promise<{
    totalLeads: number;
    newLeads: number;
    convertedLeads: number;
    totalWaitlist: number;
    verifiedWaitlist: number;
    totalPayments: number;
    totalRevenue: number;
  }> {
    const leads = Array.from(leadsStore.values());
    const waitlist = Array.from(waitlistStore.values());
    const payments = Array.from(paymentsStore.values());

    const completedPayments = payments.filter((p) => p.status === 'completed');
    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalLeads: leads.length,
      newLeads: leads.filter((l) => l.status === 'new').length,
      convertedLeads: leads.filter((l) => l.status === 'converted').length,
      totalWaitlist: waitlist.length,
      verifiedWaitlist: waitlist.filter((w) => w.verified).length,
      totalPayments: completedPayments.length,
      totalRevenue,
    };
  }
}

// Export singleton instance
export const db = new DatabaseClient();

// Initialize connection (call in app startup)
export async function initializeDatabase(): Promise<void> {
  await db.connect();
}
