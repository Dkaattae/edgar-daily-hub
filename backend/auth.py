from supabase import create_client
import os

supabase = create_client(os.environ["DATABASE_URL"], os.environ["SUPABASE_ANON_KEY"])

def sign_up(email: str, password: str, username: str):
    # 1. Create auth user in Supabase Auth
    res = supabase.auth.sign_up({"email": email, "password": password})
    user = res.user

    # 2. Insert profile row in public.users linked to auth_id
    supabase.table("users").insert({
        "username": username,
        "auth_id": str(user.id)
    }).execute()

    return user

def sign_in(email: str, password: str):
    res = supabase.auth.sign_in_with_password({"email": email, "password": password})
    # res.session.access_token is the JWT — store this client-side
    return res.session

def sign_out(jwt: str):
    supabase.auth.sign_out()

def get_current_user(jwt: str):
    # Verify the token and return the user
    res = supabase.auth.get_user(jwt)
    return res.user