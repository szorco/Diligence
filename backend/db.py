import psycopg2
from psycopg2.extras import RealDictCursor
from typing import List, Dict, Any
from datetime import date, time

import os
from dotenv import load_dotenv

load_dotenv()

# Connect to Supabase PostgreSQL
conn_string = os.getenv("DATABASE_URL")
if not conn_string:
    raise ValueError("DATABASE_URL is not set in .env file")

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


# Scheduled task operations
def _format_scheduled_task(row: Dict[str, Any]) -> Dict[str, Any]:
    """Normalize scheduled task rows for API responses"""
    return {
        "id": row["id"],
        "task_id": row["task_id"],
        "scheduled_day": row["scheduled_date"],
        "scheduled_time": row["start_time"].hour if row["start_time"] else None,
        "end_time": row["end_time"].hour if row["end_time"] else None,
        "title": row["title"],
        "description": row.get("description"),
        "duration": row["duration"],
        "category": row["category"],
        "color": row["color"],
        "is_recurring": row["is_recurring"],
        "completed": row["completed"],
    }


def get_scheduled_tasks(user_id: int, start_date: date, end_date: date) -> List[Dict[str, Any]]:
    """Return all scheduled tasks for a user within a date range"""
    conn = psycopg2.connect(conn_string)
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT s.id, s.task_id, s.scheduled_date, s.start_time, s.end_time,
                   t.title, t.description, t.duration, t.category, t.color,
                   t.is_recurring, t.completed
            FROM schedules s
            INNER JOIN tasks t ON s.task_id = t.id
            WHERE s.user_id = %s
              AND s.scheduled_date BETWEEN %s AND %s
            ORDER BY s.scheduled_date ASC, s.start_time ASC
            """,
            (user_id, start_date, end_date)
        )
        rows = cur.fetchall()
    conn.close()
    return [_format_scheduled_task(row) for row in rows]


def create_scheduled_task(schedule_data, user_id: int) -> Dict[str, Any]:
    """Create a scheduled task instance for a user's reusable task block"""
    start_hour = schedule_data.scheduled_time
    end_hour = schedule_data.end_time

    if start_hour < 0 or start_hour > 23 or end_hour < 0 or end_hour > 24:
        raise ValueError("Scheduled times must be within a 24-hour window")
    if end_hour <= start_hour:
        raise ValueError("End time must be after start time")

    start_time_obj = time(hour=start_hour)
    end_time_obj = time(hour=end_hour if end_hour < 24 else 23, minute=59)

    conn = psycopg2.connect(conn_string)
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        # Ensure the task belongs to the user
        cur.execute(
            "SELECT id FROM tasks WHERE id = %s AND user_id = %s",
            (schedule_data.task_id, user_id)
        )
        task_exists = cur.fetchone()
        if not task_exists:
            conn.close()
            raise ValueError("Task not found or not owned by user")

        cur.execute(
            """
            INSERT INTO schedules (user_id, task_id, scheduled_date, start_time, end_time)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
            """,
            (
                user_id,
                schedule_data.task_id,
                schedule_data.scheduled_day,
                start_time_obj,
                end_time_obj
            )
        )
        new_schedule = cur.fetchone()
        conn.commit()

        cur.execute(
            """
            SELECT s.id, s.task_id, s.scheduled_date, s.start_time, s.end_time,
                   t.title, t.description, t.duration, t.category, t.color,
                   t.is_recurring, t.completed
            FROM schedules s
            INNER JOIN tasks t ON s.task_id = t.id
            WHERE s.id = %s
            """,
            (new_schedule["id"],)
        )
        row = cur.fetchone()
    conn.close()
    return _format_scheduled_task(row)


def delete_scheduled_task(schedule_id: int, user_id: int) -> bool:
    """Delete a scheduled task instance"""
    conn = psycopg2.connect(conn_string)
    with conn.cursor() as cur:
        cur.execute(
            "DELETE FROM schedules WHERE id = %s AND user_id = %s",
            (schedule_id, user_id)
        )
        deleted_rows = cur.rowcount
        conn.commit()
    conn.close()
    return deleted_rows > 0

