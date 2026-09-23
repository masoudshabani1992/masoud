const { db } = require('./server/db');

// Check current leads
const leads = db.prepare('SELECT id, lead_code, customer_name, product_name, status, estimated_unit_price, marketer_name FROM marketing_leads').all();
console.log('Total Marketing Leads in DB:', leads.length);
console.log('Sample Leads:', leads.slice(0, 5));
