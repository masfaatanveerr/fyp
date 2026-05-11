"""
Stateless signed-token auth using Django's built-in signing framework.
No extra packages required — uses HMAC-SHA256 with Django's SECRET_KEY.
"""
from django.core import signing
from django.conf import settings

_SALT = "kfueit-student-auth-v1"


def create_token(roll_no: str) -> str:
    return signing.dumps({"roll_no": roll_no}, salt=_SALT)


def verify_token(token: str) -> str | None:
    """Returns roll_no on success, None on invalid/expired token."""
    try:
        data = signing.loads(token, salt=_SALT, max_age=settings.AUTH_TOKEN_MAX_AGE)
        return data.get("roll_no")
    except (signing.SignatureExpired, signing.BadSignature, KeyError):
        return None
