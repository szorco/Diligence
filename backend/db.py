import psycopg2
from psycopg2.extras import RealDictCursor

# Connect to Supabase PostgreSQL
conn_string = "postgresql://postgres:YOUR_PASSWORD@db.yhemeqmzqprdasvchttj.supabase.co:5432/postgres"

def get_schedules():
    conn = psycopg2.connect(conn_string)
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT * FROM schedules;")
        result = cur.fetchall()
    conn.close()
    return result

