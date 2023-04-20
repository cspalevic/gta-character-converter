import os
from supabase import create_client, Client

url: str = os.environ.get("SUPABASE_PROJECT_URL")
key: str = os.environ.get("SUPABASE_API_KEY")

supabase: Client = create_client(url, key)


def get_open_conversions():
    return supabase.table("conversion").select("*").eq("status", "started").execute()


def update_conversion(replicate_id: str, conversion: any):
    supabase.table("conversion").update(conversion).eq(
        "replicate_id", replicate_id
    ).execute()
