from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from fastapi.encoders import jsonable_encoder
import asyncpg

router = APIRouter()

# Models
class Post(BaseModel):
    id: Optional[int] = None
    title: Optional[str] = None
    content: str
    depth: Optional[int] = None
    parent_id: Optional[int] = None
    created: Optional[datetime] = None
    last_updated: Optional[datetime] = None

class CommentTree(BaseModel):
    post: Post
    comments: List["CommentTree"]

# Dependency: Database connection
async def get_db(request: Request):
    conn = await request.app.state.db.acquire()
    try:
        yield conn
    finally:
        await request.app.state.db.release(conn)

# Helper function to construct the comment tree
def construct_comment_tree(posts, parent_id=None):
    tree = []
    for post in posts:
        if post['parent_id'] == parent_id:
            comments = construct_comment_tree(posts, post['id'])
            tree.append({
                "post": post,
                "comments": comments
            })
    return tree

# Routes
@router.post("/posts/", response_model=Post)
async def create_post(post: Post, conn=Depends(get_db)):
    parent_depth = 0
    if post.parent_id:
        parent_post = await conn.fetchrow("SELECT depth FROM posts WHERE id = $1", post.parent_id)
        if parent_post:
            parent_depth = parent_post['depth']
    post_depth = parent_depth + 1

    post_id = await conn.fetchval(
        "INSERT INTO posts (title, content, parent_id, depth, created, last_updated) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id",
        post.title, post.content, post.parent_id, post_depth
    )
    post.id = post_id
    post.depth = post_depth
    post.created = await conn.fetchval("SELECT created FROM posts WHERE id = $1", post_id)
    post.last_updated = await conn.fetchval("SELECT last_updated FROM posts WHERE id = $1", post_id)
    return jsonable_encoder(post)

@router.get("/posts", response_model=List[Post])
async def get_posts(conn=Depends(get_db)):
    posts = []
    posts = await conn.fetch(
        "SELECT * FROM posts WHERE parent_id IS NULL"
        )
    posts = [dict(post) for post in posts]
    print(posts)
    return posts

@router.get("/posts/{post_id}", response_model=CommentTree)
async def get_post_with_comments(post_id: int, conn=Depends(get_db), max_depth: int = 5):
    post = await conn.fetchrow("SELECT * FROM posts WHERE id = $1", post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comments = await conn.fetch("""
        WITH RECURSIVE comment_tree AS (
            SELECT p.* FROM posts p WHERE parent_id = $1
            UNION ALL
            SELECT p.* FROM posts p
            INNER JOIN comment_tree ct ON p.parent_id = ct.id
            WHERE ct.depth < $2
        )
        SELECT * FROM comment_tree
    """, post_id, max_depth)
    
    comments = [dict(comment) for comment in comments]
    comment_tree = construct_comment_tree(comments, post_id)
    
    return jsonable_encoder({
        "post": dict(post),  # Convert Record to dict
        "comments": comment_tree
    })

@router.put("/posts/{post_id}", response_model=Post)
async def update_post(post_id: int, post: Post, conn=Depends(get_db)):
    existing_post = await conn.fetchrow("SELECT * FROM posts WHERE id = $1", post_id)
    if not existing_post:
        raise HTTPException(status_code=404, detail="Post not found")

    await conn.execute(
        "UPDATE posts SET content = $1, last_updated = NOW() WHERE id = $2",
        post.content, post_id
    )

    updated_post = await conn.fetchrow("SELECT * FROM posts WHERE id = $1", post_id)
    return jsonable_encoder(dict(updated_post))

@router.post("/posts/calculate-depths")
async def calculate_depths(conn=Depends(get_db)):
    await conn.execute("CALL calculate_post_depths()")
    return {"message": "Post depths recalculated successfully"}
