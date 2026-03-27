-- Enable the pgvector extension to work with embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table to store document contents and their metadata
-- This schema is designed for the Shopaluru Strategic Assistant
CREATE TABLE IF NOT EXISTS langchain_pg_embedding (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    collection_id uuid,
    embedding vector(1536), -- Dimension for text-embedding-3-small
    document text,
    cmetadata jsonb,
    custom_id text
);

-- Create a table for managing collections if not already existing by PGVector extension
CREATE TABLE IF NOT EXISTS langchain_pg_collection (
    name text,
    cmetadata jsonb,
    uuid uuid PRIMARY KEY
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_embedding_vector ON langchain_pg_embedding USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_cmetadata_source ON langchain_pg_embedding ((cmetadata->>'source_type'));
CREATE INDEX IF NOT EXISTS idx_cmetadata_location ON langchain_pg_embedding ((cmetadata->>'location'));
