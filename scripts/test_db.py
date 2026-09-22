import sqlite3
conn = sqlite3.connect('server/factory.db')
cur = conn.cursor()
for table in ['production_orders', 'digital_orders', 'toll_service_orders', 'warehouse_receipts']:
    cur.execute(f"SELECT COUNT(*) FROM {table}")
    print(f"{table}: {cur.fetchone()[0]}")
conn.close()
