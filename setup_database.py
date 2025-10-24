#!/usr/bin/env python3
"""
Database setup script for Diligence app
Run this script to initialize the database with the complete schema
"""

import psycopg2
import os
from pathlib import Path

def setup_database():
    # Database connection string - update this with your actual credentials
    conn_string = "postgresql://postgres:founderdb2025$@db.yhemeqmzqprdasvchttj.supabase.co:5432/postgres"
    
    # Read the SQL schema file
    sql_file = Path(__file__).parent / "database" / "complete_schema.sql"
    
    if not sql_file.exists():
        print("❌ SQL schema file not found!")
        return False
    
    try:
        # Connect to database
        print("🔌 Connecting to database...")
        conn = psycopg2.connect(conn_string)
        cursor = conn.cursor()
        
        # Read and execute SQL file
        print("📖 Reading SQL schema file...")
        with open(sql_file, 'r') as f:
            sql_content = f.read()
        
        print("🚀 Executing database setup...")
        cursor.execute(sql_content)
        conn.commit()
        
        print("✅ Database setup completed successfully!")
        print("\n📋 What was created:")
        print("   • users table (for authentication)")
        print("   • tasks table (with user relationships)")
        print("   • user_sessions table (for JWT management)")
        print("   • schedules table (for future use)")
        print("   • All necessary indexes and triggers")
        print("   • Sample data for testing")
        
        # Verify tables were created
        cursor.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('users', 'tasks', 'user_sessions', 'schedules')
            ORDER BY table_name
        """)
        
        tables = cursor.fetchall()
        print(f"\n📊 Created tables: {', '.join([table[0] for table in tables])}")
        
        cursor.close()
        conn.close()
        
        return True
        
    except psycopg2.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🗄️  Diligence Database Setup")
    print("=" * 40)
    

    
    success = setup_database()
    
    if success:
        print("\n🎉 Setup complete! You can now:")
        print("   1. Start your backend server: cd backend && uvicorn main:app --reload")
        print("   2. Start your frontend: cd frontend && npm start")
        print("   3. Test the authentication flow")
    else:
        print("\n💥 Setup failed. Please check the error messages above.")
