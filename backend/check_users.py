import psycopg2
from psycopg2.extras import RealDictCursor

import os
from dotenv import load_dotenv

load_dotenv()

conn_string = os.getenv("DATABASE_URL")

def check_users():
    try:
        conn = psycopg2.connect(conn_string)
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id, email, name FROM users;")
            users = cur.fetchall()
            print(f"Found {len(users)} users:")
            for user in users:
                print(f"ID: {user['id']}, Email: {user['email']}, Name: {user['name']}")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_users()
