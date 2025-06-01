# backend/test_approval.py
from fastapi.testclient import TestClient
from main import app, get_db, Base, engine
from sqlalchemy.orm import Session
from main import PullRequestModel, PoemModel
import uuid
from datetime import datetime

client = TestClient(app)

# Setup fresh test DB
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

def override_get_db():
    db = Session(bind=engine)
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

def test_create_poem_and_pull_request_workflow():
    """Test the complete workflow: create poem -> create PR -> approve/reject"""
    db: Session = next(override_get_db())
    
    # Test data
    author_id = "author123"
    contributor_id = "contributor456"
    
    # 1. Create a poem
    poem_data = {
        "title": "Test Poem",
        "content": "Original poem content\nWith multiple lines",
        "form": "free verse",
        "tone": "melancholic",
        "author_id": author_id,
        "author_name": "Test Author",
        "is_public": True
    }
    
    response = client.post("/api/poems", json=poem_data)
    assert response.status_code == 200
    poem_id = response.json()["id"]
    
    # 2. Create a pull request from another user
    pr_data = {
        "poem_id": poem_id,
        "proposed_content": "Updated poem content\nWith better lines\nAnd more emotion",
        "proposed_title": "Enhanced Test Poem",
        "author_id": contributor_id,
        "author_name": "Test Contributor",
        "message": "I think this version flows better and has more emotional depth."
    }
    
    response = client.post("/api/pull-requests", json=pr_data)
    assert response.status_code == 200
    pr_id = response.json()["id"]
    
    # 3. Verify PR was created correctly
    response = client.get(f"/api/pull-requests/{pr_id}")
    assert response.status_code == 200
    pr = response.json()
    assert pr["status"] == "pending"
    assert pr["poem_id"] == poem_id
    assert pr["author_id"] == contributor_id
    assert pr["proposed_content"] == pr_data["proposed_content"]
    assert pr["message"] == pr_data["message"]
    
    # 4. Test approval by poem author
    review_data = {"review_message": "Great improvements! Thank you for the contribution."}
    response = client.post(f"/api/pull-requests/{pr_id}/approve?reviewer_id={author_id}", json=review_data)
    assert response.status_code == 200
    
    # 5. Verify poem was updated
    response = client.get(f"/api/poems/{poem_id}")
    assert response.status_code == 200
    updated_poem = response.json()
    assert updated_poem["content"] == pr_data["proposed_content"]
    assert updated_poem["title"] == pr_data["proposed_title"]
    
    # 6. Verify PR status was updated
    response = client.get(f"/api/pull-requests/{pr_id}")
    assert response.status_code == 200
    updated_pr = response.json()
    assert updated_pr["status"] == "approved"
    assert updated_pr["review_message"] == review_data["review_message"]
    assert updated_pr["reviewed_at"] is not None

def test_reject_pull_request():
    """Test rejecting a pull request"""
    db: Session = next(override_get_db())
    
    # Create test data directly in DB
    poem_id = str(uuid.uuid4())
    pr_id = str(uuid.uuid4())
    author_id = "author789"
    contributor_id = "contributor012"
    
    poem = PoemModel(
        id=poem_id,
        title="Test Poem for Rejection",
        content="Original content",
        author_id=author_id,
        author_name="Test Author",
        is_public=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(poem)
    
    pr = PullRequestModel(
        id=pr_id,
        poem_id=poem_id,
        original_content="Original content",
        proposed_content="Proposed changes",
        author_id=contributor_id,
        author_name="Test Contributor",
        status="pending",
        message="Please consider these changes",
        created_at=datetime.utcnow()
    )
    db.add(pr)
    db.commit()
    
    # Reject the PR
    review_data = {"review_message": "Thanks for the suggestion, but I prefer the original version."}
    response = client.post(f"/api/pull-requests/{pr_id}/reject?reviewer_id={author_id}", json=review_data)
    assert response.status_code == 200
    
    # Verify PR was rejected
    response = client.get(f"/api/pull-requests/{pr_id}")
    assert response.status_code == 200
    rejected_pr = response.json()
    assert rejected_pr["status"] == "rejected"
    assert rejected_pr["review_message"] == review_data["review_message"]
    
    # Verify poem content unchanged
    response = client.get(f"/api/poems/{poem_id}")
    assert response.status_code == 200
    poem = response.json()
    assert poem["content"] == "Original content"

def test_cannot_create_pr_for_own_poem():
    """Test that users cannot create PRs for their own poems"""
    db: Session = next(override_get_db())
    
    author_id = "sameuser123"
    
    # Create a poem
    poem_data = {
        "title": "My Own Poem",
        "content": "This is my poem",
        "author_id": author_id,
        "author_name": "Same User",
        "is_public": True
    }
    
    response = client.post("/api/poems", json=poem_data)
    assert response.status_code == 200
    poem_id = response.json()["id"]
    
    # Try to create PR for own poem
    pr_data = {
        "poem_id": poem_id,
        "proposed_content": "Updated content",
        "author_id": author_id,  # Same as poem author
        "author_name": "Same User"
    }
    
    response = client.post("/api/pull-requests", json=pr_data)
    assert response.status_code == 400
    assert "cannot create a pull request for your own poem" in response.json()["detail"]

def test_cannot_approve_others_poems():
    """Test that only poem authors can approve/reject PRs"""
    db: Session = next(override_get_db())
    
    # Create test data
    poem_id = str(uuid.uuid4())
    pr_id = str(uuid.uuid4())
    author_id = "realauthor"
    contributor_id = "contributor"
    random_user_id = "randomuser"
    
    poem = PoemModel(
        id=poem_id,
        title="Protected Poem",
        content="Original content",
        author_id=author_id,
        author_name="Real Author",
        is_public=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(poem)
    
    pr = PullRequestModel(
        id=pr_id,
        poem_id=poem_id,
        original_content="Original content",
        proposed_content="Unauthorized changes",
        author_id=contributor_id,
        author_name="Contributor",
        status="pending",
        created_at=datetime.utcnow()
    )
    db.add(pr)
    db.commit()
    
    # Try to approve with wrong user
    review_data = {"review_message": "I'm approving this"}
    response = client.post(f"/api/pull-requests/{pr_id}/approve?reviewer_id={random_user_id}", json=review_data)
    assert response.status_code == 403
    assert "Only the poem author can approve" in response.json()["detail"]
    
    # Try to reject with wrong user
    response = client.post(f"/api/pull-requests/{pr_id}/reject?reviewer_id={random_user_id}", json=review_data)
    assert response.status_code == 403
    assert "Only the poem author can reject" in response.json()["detail"]

def test_get_pull_requests_filtering():
    """Test filtering pull requests by various criteria"""
    db: Session = next(override_get_db())
    
    # Create test data
    author1_id = "author1"
    author2_id = "author2"
    contributor1_id = "contributor1"
    contributor2_id = "contributor2"
    
    # Create poems
    poem1_id = str(uuid.uuid4())
    poem2_id = str(uuid.uuid4())
    
    poem1 = PoemModel(
        id=poem1_id,
        title="Poem 1",
        content="Content 1",
        author_id=author1_id,
        author_name="Author 1",
        is_public=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    poem2 = PoemModel(
        id=poem2_id,
        title="Poem 2", 
        content="Content 2",
        author_id=author2_id,
        author_name="Author 2",
        is_public=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add_all([poem1, poem2])
    
    # Create pull requests
    pr1 = PullRequestModel(
        id=str(uuid.uuid4()),
        poem_id=poem1_id,
        original_content="Content 1",
        proposed_content="Updated Content 1",
        author_id=contributor1_id,
        author_name="Contributor 1",
        status="pending",
        created_at=datetime.utcnow()
    )
    
    pr2 = PullRequestModel(
        id=str(uuid.uuid4()),
        poem_id=poem2_id,
        original_content="Content 2",
        proposed_content="Updated Content 2",
        author_id=contributor2_id,
        author_name="Contributor 2",
        status="approved",
        created_at=datetime.utcnow()
    )
    
    pr3 = PullRequestModel(
        id=str(uuid.uuid4()),
        poem_id=poem1_id,
        original_content="Content 1",
        proposed_content="Another Update",
        author_id=contributor2_id,
        author_name="Contributor 2",
        status="rejected",
        created_at=datetime.utcnow()
    )
    
    db.add_all([pr1, pr2, pr3])
    db.commit()
    
    # Test: Get all PRs
    response = client.get("/api/pull-requests")
    assert response.status_code == 200
    all_prs = response.json()
    assert len(all_prs) == 3
    
    # Test: Filter by status
    response = client.get("/api/pull-requests?status=pending")
    assert response.status_code == 200
    pending_prs = response.json()
    assert len(pending_prs) == 1
    assert pending_prs[0]["status"] == "pending"
    
    # Test: Filter by poem author (PRs for author1's poems)
    response = client.get(f"/api/pull-requests?poem_author_id={author1_id}")
    assert response.status_code == 200
    author1_prs = response.json()
    assert len(author1_prs) == 2  # pr1 and pr3
    
    # Test: Filter by PR author (PRs created by contributor2)
    response = client.get(f"/api/pull-requests?pr_author_id={contributor2_id}")
    assert response.status_code == 200
    contributor2_prs = response.json()
    assert len(contributor2_prs) == 2  # pr2 and pr3
    
    # Test: Get PRs for specific poem
    response = client.get(f"/api/pull-requests/poem/{poem1_id}")
    assert response.status_code == 200
    poem1_prs = response.json()
    assert len(poem1_prs) == 2  # pr1 and pr3

def test_user_stats():
    """Test user statistics endpoint"""
    db: Session = next(override_get_db())
    
    user_id = "statsuser"
    other_user_id = "otheruser"
    
    # Create poems for user
    poem1 = PoemModel(
        id=str(uuid.uuid4()),
        title="Public Poem",
        content="Public content",
        author_id=user_id,
        author_name="Stats User",
        is_public=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    poem2 = PoemModel(
        id=str(uuid.uuid4()),
        title="Private Poem",
        content="Private content",
        author_id=user_id,
        author_name="Stats User",
        is_public=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    other_poem = PoemModel(
        id=str(uuid.uuid4()),
        title="Other User Poem",
        content="Other content",
        author_id=other_user_id,
        author_name="Other User",
        is_public=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    db.add_all([poem1, poem2, other_poem])
    
    # Create PRs received by user
    pr_received = PullRequestModel(
        id=str(uuid.uuid4()),
        poem_id=poem1.id,
        original_content="Public content",
        proposed_content="Updated content",
        author_id=other_user_id,
        author_name="Other User",
        status="pending",
        created_at=datetime.utcnow()
    )
    
    # Create PR created by user
    pr_created = PullRequestModel(
        id=str(uuid.uuid4()),
        poem_id=other_poem.id,
        original_content="Other content",
        proposed_content="My suggested changes",
        author_id=user_id,
        author_name="Stats User",
        status="approved",
        created_at=datetime.utcnow()
    )
    
    db.add_all([pr_received, pr_created])
    db.commit()
    
    # Get stats
    response = client.get(f"/api/stats/poems/{user_id}")
    assert response.status_code == 200
    stats = response.json()
    
    assert stats["total_poems"] == 2
    assert stats["public_poems"] == 1
    assert stats["pull_requests_received"] == 1
    assert stats["pending_reviews"] == 1
    assert stats["pull_requests_created"] == 1

def test_duplicate_pending_pr_prevention():
    """Test that users can't create multiple pending PRs for the same poem"""
    db: Session = next(override_get_db())
    
    author_id = "author"
    contributor_id = "contributor"
    
    # Create poem
    poem = PoemModel(
        id=str(uuid.uuid4()),
        title="Test Poem",
        content="Original content",
        author_id=author_id,
        author_name="Author",
        is_public=True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(poem)
    db.commit()
    
    # Create first PR
    pr_data = {
        "poem_id": poem.id,
        "proposed_content": "First proposed change",
        "author_id": contributor_id,
        "author_name": "Contributor"
    }
    
    response = client.post("/api/pull-requests", json=pr_data)
    assert response.status_code == 200
    
    # Try to create second PR from same user
    pr_data2 = {
        "poem_id": poem.id,
        "proposed_content": "Second proposed change",
        "author_id": contributor_id,
        "author_name": "Contributor"
    }
    
    response = client.post("/api/pull-requests", json=pr_data2)
    assert response.status_code == 400
    assert "already have a pending pull request" in response.json()["detail"]

def test_private_poem_pr_prevention():
    """Test that PRs cannot be created for private poems"""
    db: Session = next(override_get_db())
    
    author_id = "author"
    contributor_id = "contributor"
    
    # Create private poem
    poem = PoemModel(
        id=str(uuid.uuid4()),
        title="Private Poem",
        content="Private content",
        author_id=author_id,
        author_name="Author",
        is_public=False,  # Private poem
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(poem)
    db.commit()
    
    # Try to create PR for private poem
    pr_data = {
        "poem_id": poem.id,
        "proposed_content": "Proposed change",
        "author_id": contributor_id,
        "author_name": "Contributor"
    }
    
    response = client.post("/api/pull-requests", json=pr_data)
    assert response.status_code == 403
    assert "Cannot create pull request for private poem" in response.json()["detail"]

if __name__ == "__main__":
    print("Running tests...")
    
    try:
        test_create_poem_and_pull_request_workflow()
        print("✅ Full workflow test passed")
    except Exception as e:
        print(f"❌ Full workflow test failed: {e}")
    
    try:
        test_reject_pull_request()
        print("✅ Reject PR test passed")
    except Exception as e:
        print(f"❌ Reject PR test failed: {e}")
    
    try:
        test_cannot_create_pr_for_own_poem()
        print("✅ Own poem PR prevention test passed")
    except Exception as e:
        print(f"❌ Own poem PR prevention test failed: {e}")
    
    try:
        test_cannot_approve_others_poems()
        print("✅ Authorization test passed")
    except Exception as e:
        print(f"❌ Authorization test failed: {e}")
    
    try:
        test_get_pull_requests_filtering()
        print("✅ PR filtering test passed")
    except Exception as e:
        print(f"❌ PR filtering test failed: {e}")
    
    try:
        test_user_stats()
        print("✅ User stats test passed")
    except Exception as e:
        print(f"❌ User stats test failed: {e}")
    
    try:
        test_duplicate_pending_pr_prevention()
        print("✅ Duplicate PR prevention test passed")
    except Exception as e:
        print(f"❌ Duplicate PR prevention test failed: {e}")
    
    try:
        test_private_poem_pr_prevention()
        print("✅ Private poem PR prevention test passed")
    except Exception as e:
        print(f"❌ Private poem PR prevention test failed: {e}")
    
    print("\n🎉 All tests completed!")
    print("\nYour GitHub-like pull request system for poems is ready for testing!")