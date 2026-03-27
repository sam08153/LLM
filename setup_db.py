import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

load_dotenv()

def setup_database():
    # Connection parameters for Docker-based PostgreSQL
    params = {
        'host': 'localhost',
        'user': 'postgres',
        'password': 'postgres',
        'port': 5432
    }
    dbname = "shopaluru"
    
    try:
        # Connect to default postgres database to create the new one
        conn = psycopg2.connect(**params, dbname="postgres")
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        # Check if database exists
        cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{dbname}'")
        exists = cur.fetchone()
        
        if not exists:
            print(f"Creating database {dbname}...")
            cur.execute(f"CREATE DATABASE {dbname}")
        else:
            print(f"Database {dbname} already exists.")
            
        cur.close()
        conn.close()
        
        # Connect to the new database to run schema
        conn = psycopg2.connect(**params, dbname=dbname)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        # Read and execute schema.sql
        schema_path = os.path.join(os.getcwd(), "schema.sql")
        if os.path.exists(schema_path):
            print(f"Running schema.sql on {dbname}...")
            with open(schema_path, "r") as f:
                schema_sql = f.read()
                cur.execute(schema_sql)
            print("Schema initialized successfully.")
        else:
            print("schema.sql not found.")
            
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Error setting up database: {e}")

if __name__ == "__main__":
    setup_database()
