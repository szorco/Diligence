import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv

load_dotenv()

conn_string = os.getenv("DATABASE_URL")

def check_tasks():
    try:
        conn = psycopg2.connect(conn_string)
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Get user id for apiuser2@example.com
            cur.execute("SELECT id FROM users WHERE email = 'apiuser2@example.com';")
            user = cur.fetchone()
            if not user:
                print("User apiuser2@example.com not found")
                return

            user_id = user['id']
            print(f"Checking tasks for User ID: {user_id}")

            cur.execute("SELECT * FROM tasks WHERE user_id = %s;", (user_id,))
            tasks = cur.fetchall()
            print(f"Found {len(tasks)} tasks:")
            for task in tasks:
                print(f"ID: {task['id']}, Title: {task['title']}, Duration: {task['duration']}, Category: {task['category']}")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_tasks()
