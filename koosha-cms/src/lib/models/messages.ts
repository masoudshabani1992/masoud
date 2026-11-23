import { db, initDb } from "../db";
import { genId } from "../utils";

initDb();

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

function mapRow(row: any): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    subject: row.subject,
    message: row.message,
    isRead: !!row.is_read,
    createdAt: row.created_at,
  };
}

export function listMessages(): ContactMessage[] {
  return (db.prepare("SELECT * FROM contact_messages ORDER BY created_at DESC").all() as any[]).map(mapRow);
}

export function createMessage(input: { name: string; phone?: string; email?: string; subject?: string; message: string }) {
  const id = genId();
  db.prepare(
    `INSERT INTO contact_messages (id, name, phone, email, subject, message) VALUES (@id, @name, @phone, @email, @subject, @message)`
  ).run({
    id,
    name: input.name,
    phone: input.phone || "",
    email: input.email || "",
    subject: input.subject || "",
    message: input.message,
  });
  return id;
}

export function markRead(id: string) {
  db.prepare("UPDATE contact_messages SET is_read = 1 WHERE id = ?").run(id);
}

export function deleteMessage(id: string) {
  db.prepare("DELETE FROM contact_messages WHERE id = ?").run(id);
}

export function unreadCount(): number {
  const row = db.prepare("SELECT COUNT(*) as c FROM contact_messages WHERE is_read = 0").get() as { c: number };
  return row.c;
}
