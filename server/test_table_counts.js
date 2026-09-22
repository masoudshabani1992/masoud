const { db } = require('./db');

console.log('Production orders count:', db.prepare('SELECT COUNT(*) as c FROM production_orders').get().c);
console.log('Warehouse receipts count:', db.prepare('SELECT COUNT(*) as c FROM warehouse_receipts').get().c);
console.log('Digital orders count:', db.prepare('SELECT COUNT(*) as c FROM digital_orders').get().c);
console.log('Toll service orders count:', db.prepare('SELECT COUNT(*) as c FROM toll_service_orders').get().c);
