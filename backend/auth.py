from supabase import create_client
import os
import jwt

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_ANON_KEY = os.environ["SUPABASE_ANON_KEY"]
SUPABASE_JWT_SECRET = os.environ["SUPABASE_JWT_SECRET"]

supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

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
    return res.session

def sign_out(jwt: str):
    supabase.auth.sign_out()

class AuthenticatedUser:
    def __init__(self, id, email):
        self.id = id
        self.email = email

def get_current_user(access_token: str):
    try:
        payload = jwt.decode(
            access_token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )

        user_id = payload.get('sub')
        email = payload.get('email')

        if not user_id:
            return None

        return AuthenticatedUser(user_id, email)

    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None