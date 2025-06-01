# backend/main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from uuid import uuid4
from datetime import datetime
from sqlalchemy import Column, String, DateTime, create_engine, Text, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from diffusers import StableDiffusionPipeline
import torch
import base64
from io import BytesIO

DATABASE_URL = "sqlite:///./pullrequests.db"

Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, expire_on_commit=False)

app = FastAPI()

# ---------- CORS Middleware ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Database Models ----------
class PoemModel(Base):
    __tablename__ = "poems"
    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False, default="Untitled")
    content = Column(Text)
    form = Column(String)
    tone = Column(String)
    author_id = Column(String, nullable=False)
    author_name = Column(String, default="Anonymous")
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to pull requests
    pull_requests = relationship("PullRequestModel", back_populates="poem")

class PullRequestModel(Base):
    __tablename__ = "pull_requests"
    id = Column(String, primary_key=True, index=True)
    poem_id = Column(String, ForeignKey("poems.id"), index=True)
    original_content = Column(Text)  # Store original content for comparison
    proposed_content = Column(Text)
    proposed_title = Column(String)  # Allow title changes too
    author_id = Column(String, nullable=False)
    author_name = Column(String, default="Anonymous")
    status = Column(String, default="pending")  # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    message = Column(Text)  # Message from PR author
    review_message = Column(Text)  # Message from reviewer
    
    # Relationship to poem
    poem = relationship("PoemModel", back_populates="pull_requests")

# Create tables
Base.metadata.create_all(bind=engine)

# ---------- Pydantic Schemas ----------
class Poem(BaseModel):
    id: str
    title: str
    content: str
    form: Optional[str] = None
    tone: Optional[str] = None
    author_id: str
    author_name: str = "Anonymous"
    is_public: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class PoemCreate(BaseModel):
    title: str
    content: str
    form: Optional[str] = None
    tone: Optional[str] = None
    author_id: str
    author_name: str = "Anonymous"
    is_public: bool = True

class PoemUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    form: Optional[str] = None
    tone: Optional[str] = None
    is_public: Optional[bool] = None

class PoemRequest(BaseModel):
    title: str
    content: str

class PullRequest(BaseModel):
    id: str
    poem_id: str
    original_content: Optional[str] = None
    proposed_content: str
    proposed_title: Optional[str] = None
    author_id: str
    author_name: str
    status: str
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    message: Optional[str] = None
    review_message: Optional[str] = None
    # Include poem details for convenience
    poem_title: Optional[str] = None
    poem_author_name: Optional[str] = None

    class Config:
        orm_mode = True

class PullRequestCreate(BaseModel):
    poem_id: str
    proposed_content: str
    proposed_title: Optional[str] = None
    author_id: str
    author_name: str = "Anonymous"
    message: Optional[str] = None

class PullRequestReview(BaseModel):
    review_message: Optional[str] = None

# ---------- Dependency ----------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------- Load Stable Diffusion ----------
try:
    pipe = StableDiffusionPipeline.from_pretrained(
        "CompVis/stable-diffusion-v1-4",
        torch_dtype=torch.float16,

    ).to("cuda")
except Exception as e:
    print("❌ Failed to load Stable Diffusion pipeline:", e)
    pipe = None

# ---------- Routes ----------


@app.post("/generate-image")
def generate_image(data: PoemRequest):
    if not pipe:
        raise HTTPException(status_code=500, detail="Model not loaded.")
    try:
        cleaned_content = data.content.replace('\n', ' ')
        prompt = f"{data.title}. {cleaned_content}"
        image = pipe(prompt).images[0]

        buffer = BytesIO()
        image.save(buffer, format="PNG")
        base64_image = base64.b64encode(buffer.getvalue()).decode("utf-8")
        return {"image": base64_image}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---------- POEM CRUD OPERATIONS ----------

@app.post("/api/poems", response_model=dict)
def create_poem(poem_data: PoemCreate, db: Session = Depends(get_db)):
    """Create a new poem and publish it to explore if public"""
    poem_id = str(uuid4())
    db_poem = PoemModel(
        id=poem_id,
        title=poem_data.title,
        content=poem_data.content,
        form=poem_data.form,
        tone=poem_data.tone,
        author_id=poem_data.author_id,
        author_name=poem_data.author_name,
        is_public=poem_data.is_public,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(db_poem)
    db.commit()
    db.refresh(db_poem)
    
    return {
        "message": "Poem created and published successfully",
        "id": db_poem.id,
        "is_public": db_poem.is_public
    }

@app.get("/api/poems/explore", response_model=List[Poem])
def get_explore_poems(db: Session = Depends(get_db)):
    """Get all public poems for the explore page"""
    poems = db.query(PoemModel).filter(PoemModel.is_public == True).order_by(PoemModel.created_at.desc()).all()
    return poems

@app.get("/api/poems/user/{user_id}", response_model=List[Poem])
def get_user_poems(user_id: str, db: Session = Depends(get_db)):
    """Get all poems for a specific user (their library)"""
    poems = db.query(PoemModel).filter(PoemModel.author_id == user_id).order_by(PoemModel.created_at.desc()).all()
    return poems

@app.get("/api/poems/{poem_id}", response_model=Poem)
def get_poem(poem_id: str, db: Session = Depends(get_db)):
    poem = db.query(PoemModel).filter(PoemModel.id == poem_id).first()
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    return poem

@app.put("/api/poems/{poem_id}")
def update_poem(poem_id: str, poem_data: PoemUpdate, current_user_id: str, db: Session = Depends(get_db)):
    """Update an existing poem - only by the author"""
    poem = db.query(PoemModel).filter(PoemModel.id == poem_id).first()
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    
    # Check if current user is the author
    if poem.author_id != current_user_id:
        raise HTTPException(status_code=403, detail="You can only edit your own poems")
    
    # Update only provided fields
    if poem_data.title is not None:
        poem.title = poem_data.title
    if poem_data.content is not None:
        poem.content = poem_data.content
    if poem_data.form is not None:
        poem.form = poem_data.form
    if poem_data.tone is not None:
        poem.tone = poem_data.tone
    if poem_data.is_public is not None:
        poem.is_public = poem_data.is_public
    
    poem.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Poem updated successfully"}

@app.delete("/api/poems/{poem_id}")
def delete_poem(poem_id: str, current_user_id: str, db: Session = Depends(get_db)):
    """Delete a poem - only by the author"""
    poem = db.query(PoemModel).filter(PoemModel.id == poem_id).first()
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    
    # Check if current user is the author
    if poem.author_id != current_user_id:
        raise HTTPException(status_code=403, detail="You can only delete your own poems")
    
    # Delete related pull requests first
    db.query(PullRequestModel).filter(PullRequestModel.poem_id == poem_id).delete()
    db.delete(poem)
    db.commit()
    return {"message": "Poem deleted successfully"}

# ---------- PULL REQUEST OPERATIONS ----------

@app.post("/api/pull-requests", response_model=dict)
def create_pull_request(pr_data: PullRequestCreate, db: Session = Depends(get_db)):
    """Create a new pull request for editing someone else's poem"""
    # Validate poem existence
    poem = db.query(PoemModel).filter(PoemModel.id == pr_data.poem_id).first()
    if not poem:
        raise HTTPException(status_code=404, detail="Poem not found")
    
    # Check if poem is public
    if not poem.is_public:
        raise HTTPException(status_code=403, detail="Cannot create pull request for private poem")
    
    # Check if user is trying to edit their own poem
    if poem.author_id == pr_data.author_id:
        raise HTTPException(status_code=400, detail="You cannot create a pull request for your own poem. Edit it directly instead.")
    
    # Check if there's already a pending PR from this user for this poem
    existing_pr = db.query(PullRequestModel).filter(
        PullRequestModel.poem_id == pr_data.poem_id,
        PullRequestModel.author_id == pr_data.author_id,
        PullRequestModel.status == "pending"
    ).first()
    
    if existing_pr:
        raise HTTPException(status_code=400, detail="You already have a pending pull request for this poem")

    # Create the pull request
    new_pr = PullRequestModel(
        id=str(uuid4()),
        poem_id=pr_data.poem_id,
        original_content=poem.content,  # Store original for comparison
        proposed_content=pr_data.proposed_content,
        proposed_title=pr_data.proposed_title or poem.title,
        author_id=pr_data.author_id,
        author_name=pr_data.author_name,
        status="pending",
        message=pr_data.message,
        created_at=datetime.utcnow()
    )
    db.add(new_pr)
    db.commit()
    db.refresh(new_pr)
    
    return {
        "message": "Pull request submitted successfully",
        "id": new_pr.id,
        "poem_title": poem.title,
        "poem_author": poem.author_name
    }

@app.get("/api/pull-requests", response_model=List[PullRequest])
def get_pull_requests(
    status: Optional[str] = None, 
    poem_author_id: Optional[str] = None,
    pr_author_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get pull requests with optional filtering"""
    query = db.query(PullRequestModel).join(PoemModel)
    
    if status:
        query = query.filter(PullRequestModel.status == status)
    
    if poem_author_id:
        # PRs for poems owned by this user (for authors to review)
        query = query.filter(PoemModel.author_id == poem_author_id)
    
    if pr_author_id:
        # PRs created by this user
        query = query.filter(PullRequestModel.author_id == pr_author_id)
    
    prs = query.order_by(PullRequestModel.created_at.desc()).all()
    
    # Add poem details to each PR
    result = []
    for pr in prs:
        pr_dict = {
            "id": pr.id,
            "poem_id": pr.poem_id,
            "original_content": pr.original_content,
            "proposed_content": pr.proposed_content,
            "proposed_title": pr.proposed_title,
            "author_id": pr.author_id,
            "author_name": pr.author_name,
            "status": pr.status,
            "created_at": pr.created_at,
            "reviewed_at": pr.reviewed_at,
            "message": pr.message,
            "review_message": pr.review_message,
            "poem_title": pr.poem.title,
            "poem_author_name": pr.poem.author_name
        }
        result.append(pr_dict)
    
    return result

@app.get("/api/pull-requests/poem/{poem_id}", response_model=List[PullRequest])
def get_poem_pull_requests(poem_id: str, db: Session = Depends(get_db)):
    """Get all pull requests for a specific poem"""
    prs = db.query(PullRequestModel).filter(PullRequestModel.poem_id == poem_id).order_by(PullRequestModel.created_at.desc()).all()
    
    result = []
    for pr in prs:
        pr_dict = {
            "id": pr.id,
            "poem_id": pr.poem_id,
            "original_content": pr.original_content,
            "proposed_content": pr.proposed_content,
            "proposed_title": pr.proposed_title,
            "author_id": pr.author_id,
            "author_name": pr.author_name,
            "status": pr.status,
            "created_at": pr.created_at,
            "reviewed_at": pr.reviewed_at,
            "message": pr.message,
            "review_message": pr.review_message,
            "poem_title": pr.poem.title if pr.poem else None,
            "poem_author_name": pr.poem.author_name if pr.poem else None
        }
        result.append(pr_dict)
    
    return result

@app.get("/api/pull-requests/{pr_id}", response_model=PullRequest)
def get_pull_request(pr_id: str, db: Session = Depends(get_db)):
    """Get a specific pull request with full details"""
    pr = db.query(PullRequestModel).filter(PullRequestModel.id == pr_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Pull request not found")
    
    return {
        "id": pr.id,
        "poem_id": pr.poem_id,
        "original_content": pr.original_content,
        "proposed_content": pr.proposed_content,
        "proposed_title": pr.proposed_title,
        "author_id": pr.author_id,
        "author_name": pr.author_name,
        "status": pr.status,
        "created_at": pr.created_at,
        "reviewed_at": pr.reviewed_at,
        "message": pr.message,
        "review_message": pr.review_message,
        "poem_title": pr.poem.title if pr.poem else None,
        "poem_author_name": pr.poem.author_name if pr.poem else None
    }

@app.post("/api/pull-requests/{pr_id}/approve")
def approve_pull_request(pr_id: str, reviewer_id: str, review_data: PullRequestReview, db: Session = Depends(get_db)):
    """Approve a pull request and merge changes - only by poem author"""
    pr = db.query(PullRequestModel).filter(PullRequestModel.id == pr_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Pull request not found")
    
    if pr.status != "pending":
        raise HTTPException(status_code=400, detail=f"Pull request is already {pr.status}")

    # Get the associated poem
    poem = db.query(PoemModel).filter(PoemModel.id == pr.poem_id).first()
    if not poem:
        raise HTTPException(status_code=404, detail="Associated poem not found")
    
    # Check if reviewer is the poem author
    if poem.author_id != reviewer_id:
        raise HTTPException(status_code=403, detail="Only the poem author can approve pull requests")

    # Update poem with proposed changes
    poem.content = pr.proposed_content
    if pr.proposed_title and pr.proposed_title != poem.title:
        poem.title = pr.proposed_title
    poem.updated_at = datetime.utcnow()
    
    # Update pull request status
    pr.status = "approved"
    pr.reviewed_at = datetime.utcnow()
    pr.review_message = review_data.review_message
    
    db.commit()
    
    return {
        "message": "Pull request approved and changes merged successfully",
        "poem_title": poem.title,
        "updated_at": poem.updated_at
    }

@app.post("/api/pull-requests/{pr_id}/reject")
def reject_pull_request(pr_id: str, reviewer_id: str, review_data: PullRequestReview, db: Session = Depends(get_db)):
    """Reject a pull request - only by poem author"""
    pr = db.query(PullRequestModel).filter(PullRequestModel.id == pr_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Pull request not found")
    
    if pr.status != "pending":
        raise HTTPException(status_code=400, detail=f"Pull request is already {pr.status}")

    # Get the associated poem to check ownership
    poem = db.query(PoemModel).filter(PoemModel.id == pr.poem_id).first()
    if not poem:
        raise HTTPException(status_code=404, detail="Associated poem not found")
    
    # Check if reviewer is the poem author
    if poem.author_id != reviewer_id:
        raise HTTPException(status_code=403, detail="Only the poem author can reject pull requests")

    # Update pull request status
    pr.status = "rejected"
    pr.reviewed_at = datetime.utcnow()
    pr.review_message = review_data.review_message
    
    db.commit()
    
    return {
        "message": "Pull request rejected",
        "review_message": pr.review_message
    }

# ---------- STATISTICS ENDPOINTS ----------

@app.get("/api/stats/poems/{user_id}")
def get_user_poem_stats(user_id: str, db: Session = Depends(get_db)):
    """Get statistics for a user's poems"""
    total_poems = db.query(PoemModel).filter(PoemModel.author_id == user_id).count()
    public_poems = db.query(PoemModel).filter(PoemModel.author_id == user_id, PoemModel.is_public == True).count()
    
    # PRs received for user's poems
    prs_received = db.query(PullRequestModel).join(PoemModel).filter(PoemModel.author_id == user_id).count()
    prs_pending = db.query(PullRequestModel).join(PoemModel).filter(
        PoemModel.author_id == user_id, 
        PullRequestModel.status == "pending"
    ).count()
    
    # PRs created by user
    prs_created = db.query(PullRequestModel).filter(PullRequestModel.author_id == user_id).count()
    
    return {
        "total_poems": total_poems,
        "public_poems": public_poems,
        "pull_requests_received": prs_received,
        "pending_reviews": prs_pending,
        "pull_requests_created": prs_created
    }

# Legacy endpoints for backward compatibility
@app.post("/poems")
def create_poem_legacy(poem: Poem, db: Session = Depends(get_db)):
    existing = db.query(PoemModel).filter(PoemModel.id == poem.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Poem with this ID already exists.")
    db_poem = PoemModel(
        id=poem.id, 
        title=poem.title,
        content=poem.content,
        author_id=poem.author_id,
        author_name=poem.author_name,
        is_public=poem.is_public
    )
    db.add(db_poem)
    db.commit()
    db.refresh(db_poem)
    return {"message": "Poem created successfully"}

@app.get("/poems", response_model=List[Poem])
def get_poems_legacy(db: Session = Depends(get_db)):
    poems = db.query(PoemModel).all()
    return poems

# Legacy PR endpoints
@app.post("/api/pull-request")
def submit_pull_request_legacy(pr: PullRequestCreate, db: Session = Depends(get_db)):
    return create_pull_request(pr, db)

