import requests
from jose import jwt
from jose.exceptions import JWTError

SUPABASE_PROJECT_ID = "qsqoaolnqlbwlkfelkmb"
SUPABASE_JWKS_URL = f"https://{SUPABASE_PROJECT_ID}.supabase.co/auth/v1/keys"

jwks = requests.get(SUPABASE_JWKS_URL).json()

def verify_supabase_token(token):
    try:
        header = jwt.get_unverified_header(token)
        key = next(k for k in jwks['keys'] if k['kid'] == header['kid'])

        payload = jwt.decode(
            token,
            key,
            algorithms=['RS256'],
            audience=None,
            issuer=f"https://{SUPABASE_PROJECT_ID}.supabase.co/auth/v1"
        )
        return payload
    except JWTError as e:
        print("JWT Verification failed:", str(e))
        return None
