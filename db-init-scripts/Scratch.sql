SELECT * FROM  postgres.public.posts;
SELECT * FROM posts WHERE parent_id IS NULL;

INSERT INTO postgres.public.posts (title, CONTENT, parent_id) VALUES ('FIRST POST', 'This is the first posts content', null) RETURNING id;

INSERT INTO postgres.public.posts (title, CONTENT, parent_id) VALUES ('SECOND POST', 'This is the second posts content', 1) RETURNING id;

-- ALTER TABLE posts ADD COLUMN depth INTEGER NOT NULL DEFAULT 0;

SELECT * FROM posts;