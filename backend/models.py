from pydantic import BaseModel
from typing import List, Optional

class LoginRequest(BaseModel):
    username: str  # This will be used as email for Supabase
    password: str

class UserCreate(BaseModel):
    username: str  # This will be used as email for Supabase
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: Optional[str] = None

class DailyCount(BaseModel):
    date_filed: str
    form_type: str
    filing_count: int

class Filing(BaseModel):
    id: str
    ticker: str
    companyName: str
    formType: str
    isAmendment: bool = False
    timestamp: str
    filingUrl: str

