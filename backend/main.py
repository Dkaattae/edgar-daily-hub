from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
import jwt

from . import models, database, auth, motherduck

app = FastAPI(title="EDGAR Data Pipeline API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

@app.get("/api")
def read_root():
    return {"message": "Welcome to EDGAR Data Pipeline API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid auth credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid auth credentials")
    
    user = db.query(database.User).filter(database.User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@app.post("/api/auth/login", response_model=models.Token)
def login(request: models.LoginRequest, db: Session = Depends(database.get_db)):
    user = db.query(database.User).filter(database.User.username == request.username).first()
    if not user or not auth.verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/register", response_model=models.Token)
def register(request: models.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(database.User).filter(database.User.username == request.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    new_user = database.User(
        username=request.username,
        password_hash=auth.get_password_hash(request.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = auth.create_access_token(data={"sub": new_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/reports/daily-count", response_model=list[models.DailyCount])
def get_daily_count(user: database.User = Depends(get_current_user)):
    return motherduck.fetch_daily_counts()

@app.get("/api/reports/all-daily-counts", response_model=list[models.DailyCount])
def get_all_daily_counts(user: database.User = Depends(get_current_user)):
    return motherduck.fetch_all_daily_counts()

@app.get("/api/reports/by-ticker", response_model=list[models.Filing])
def get_filings_by_ticker(tickers: str, user: database.User = Depends(get_current_user)):
    ticker_list = [t.strip().upper() for t in tickers.split(",") if t.strip()]
    return motherduck.fetch_filings_by_tickers(ticker_list)

import os
frontend_dist = os.path.join(os.path.dirname(__file__), "frontend/dist")

if os.path.exists(os.path.join(frontend_dist, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    file_path = os.path.join(frontend_dist, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    index_path = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
        
    return {"message": "Frontend build not found. Be sure to compile the React app into frontend/dist."}


