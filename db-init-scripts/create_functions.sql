CREATE OR REPLACE FUNCTION calculate_post_depths()
RETURNS VOID AS $$
BEGIN
    WITH RECURSIVE post_depths AS (
        -- Base case: Root posts (depth = 0)
        SELECT id, 0 AS depth
        FROM posts
        WHERE parent_id IS NULL

        UNION ALL

        -- Recursive case: Child posts (depth = parent depth + 1)
        SELECT p.id, pd.depth + 1
        FROM posts p
        INNER JOIN post_depths pd ON p.parent_id = pd.id
    )
    UPDATE posts
    SET depth = post_depths.depth
    FROM post_depths
    WHERE posts.id = post_depths.id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_comment_tree(root_id INTEGER, max_depth INTEGER)
RETURNS TABLE(id INTEGER, title TEXT, content TEXT, parent_id INTEGER, depth INTEGER) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE comment_tree AS (
        SELECT p.id, p.title, p.content, p.parent_id, 0 AS depth
        FROM posts p
        WHERE p.id = root_id

        UNION ALL

        SELECT p.id, p.title, p.content, p.parent_id, ct.depth + 1
        FROM posts p
        INNER JOIN comment_tree ct ON p.parent_id = ct.id
        WHERE ct.depth < max_depth
    )
    SELECT * FROM comment_tree;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT * FROM get_comment_tree(1, 2);
-- CALL calculate_post_depths();