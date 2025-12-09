import psycopg2
from psycopg2.extras import RealDictCursor
from typing import List, Dict, Any

# Connect to Supabase PostgreSQL
conn_string = "postgresql://postgres.yhemeqmzqprdasvchttj:Diligence2025%24%24@aws-1-us-east-2.pooler.supabase.com:6543/postgres"

def get_schedules():
    conn = psycopg2.connect(conn_string)
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT * FROM schedules;")
        result = cur.fetchall()
    conn.close()
    return result

# Task CRUD operations
def get_tasks(user_id: int) -> List[Dict[str, Any]]:
    """Get all tasks for a specific user from the database"""
    conn = psycopg2.connect(conn_string)
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT id, title, description, duration, category, color, is_recurring, completed, created_at
            FROM tasks 
            WHERE user_id = %s
            ORDER BY created_at DESC
        """, (user_id,))
        result = cur.fetchall()
    conn.close()
    return [dict(row) for row in result]

def create_task(task_data: Dict[str, Any], user_id: int) -> Dict[str, Any]:
    """Create a new task in the database for a specific user"""
    conn = psycopg2.connect(conn_string)
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            INSERT INTO tasks (user_id, title, description, duration, category, color, is_recurring, completed)
            VALUES (%(user_id)s, %(title)s, %(description)s, %(duration)s, %(category)s, %(color)s, %(is_recurring)s, %(completed)s)
            RETURNING id, title, description, duration, category, color, is_recurring, completed, created_at
        """, {
            'user_id': user_id,
            'title': task_data.title,
            'description': task_data.description,
            'duration': task_data.duration,
            'category': task_data.category,
            'color': task_data.color,
            'is_recurring': task_data.is_recurring,
            'completed': False
        })
        result = cur.fetchone()
        conn.commit()
    conn.close()
    return dict(result)

def update_task(task_id: int, task_data: Dict[str, Any], user_id: int) -> Dict[str, Any]:
    """Update an existing task in the database for a specific user"""
    conn = psycopg2.connect(conn_string)
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            UPDATE tasks 
            SET title = %(title)s, description = %(description)s, duration = %(duration)s, 
                category = %(category)s, color = %(color)s, is_recurring = %(is_recurring)s, 
                completed = %(completed)s
            WHERE id = %(task_id)s AND user_id = %(user_id)s
            RETURNING id, title, description, duration, category, color, is_recurring, completed, created_at
        """, {
            'task_id': task_id,
            'user_id': user_id,
            'title': task_data.title,
            'description': task_data.description,
            'duration': task_data.duration,
            'category': task_data.category,
            'color': task_data.color,
            'is_recurring': task_data.is_recurring,
            'completed': task_data.completed
        })
        result = cur.fetchone()
        if not result:
            conn.close()
            raise ValueError(f"Task with id {task_id} not found or not owned by user")
        conn.commit()
    conn.close()
    return dict(result)

def delete_task(task_id: int, user_id: int) -> bool:
    """Delete a task from the database for a specific user"""
    conn = psycopg2.connect(conn_string)
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("DELETE FROM tasks WHERE id = %s AND user_id = %s", (task_id, user_id))
        deleted_rows = cur.rowcount
        conn.commit()
    conn.close()
    return deleted_rows > 0

def get_scheduled_tasks(user_id: int, start_date: str, end_date: str):
    conn = psycopg2.connect(conn_string)
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT st.id, st.task_id, st.user_id, st.scheduled_day, st.scheduled_time,
                   st.end_time, t.title, t.color, t.duration
            FROM scheduled_tasks st
            JOIN tasks t ON st.task_id = t.id
            WHERE st.user_id = %s
              AND st.scheduled_day BETWEEN %s AND %s
            ORDER BY st.scheduled_day, st.scheduled_time
        """, (user_id, start_date, end_date))
        result = cur.fetchall()
    conn.close()
    return [dict(row) for row in result]


def create_scheduled_task(user_id: int, task_id: int, scheduled_day: str, scheduled_time: float, end_time: float):
    conn = psycopg2.connect(conn_string)
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            INSERT INTO scheduled_tasks (user_id, task_id, scheduled_day, scheduled_time, end_time)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, user_id, task_id, scheduled_day, scheduled_time, end_time
        """, (
            user_id,
            task_id,
            scheduled_day,
            scheduled_time,
            end_time,
        ))
        result = cur.fetchone()
        conn.commit()
    conn.close()
    return dict(result)


def delete_scheduled_task(schedule_id: int, user_id: int):
    conn = psycopg2.connect(conn_string)
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            DELETE FROM scheduled_tasks
            WHERE id = %s AND user_id = %s
        """, (schedule_id, user_id))
        deleted = cur.rowcount
        conn.commit()
    conn.close()
    return deleted > 0

