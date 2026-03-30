from supabase import create_client
import os
import jwt

supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_ANON_KEY"])

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

def get_current_user(access_token: str):
    # Decode the JWT payload to get user information
    # Note: In production, you should verify the JWT signature
    try:
        # Decode without verification (for development)
        payload = jwt.decode(access_token, options={"verify_signature": False})
        
        # Extract user information from payload
        user_id = payload.get('sub')
        email = payload.get('email')
        
        if not user_id:
            return None
            
        # Create a mock user object with the information we need
        class MockUser:
            def __init__(self, id, email):
                self.id = id
                self.email = email
        
        return MockUser(user_id, email)
        
    except Exception as e:
        print(f"Error decoding JWT: {e}")
        return None