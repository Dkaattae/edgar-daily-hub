from supabase import create_client
import os
import jwt

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_ANON_KEY = os.environ["SUPABASE_ANON_KEY"]
# Optional: only used as a fast-path for legacy HS256 tokens.
SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET")

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
    """Validate an access token and return the authenticated user.

    Tries local HS256 decode first (fast path for legacy symmetric-secret
    Supabase projects). If that fails — which it does for projects on the newer
    asymmetric (RS256/ES256 via JWKS) signing keys — falls back to asking the
    Supabase Auth API to validate the token.
    """
    if SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(
                access_token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
            )
            user_id = payload.get("sub")
            if user_id:
                return AuthenticatedUser(user_id, payload.get("email"))
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            pass  # fall through to Supabase API validation

    try:
        res = supabase.auth.get_user(access_token)
        user = getattr(res, "user", None)
        if not user or not getattr(user, "id", None):
            return None
        return AuthenticatedUser(str(user.id), getattr(user, "email", None))
    except Exception as e:
        print(f"Supabase token validation failed: {e}")
        return None