from pydantic import BaseModel
from typing import List, Optional

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class DailyCount(BaseModel):
    date_filed: str
    form_type: str
    filing_count: int

class Filing(BaseModel):
    id: str
    ticker: str
    companyName: str
    formType: str
    timestamp: str
    filingUrl: str
