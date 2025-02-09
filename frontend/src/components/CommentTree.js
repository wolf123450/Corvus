import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, Typography, Button, Divider } from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';
import EditIcon from '@mui/icons-material/Edit';
import ReplyForm from './ReplyForm';

const CommentTree = ({ tree, replyingTo, replyContent, handleReply, handleReplyChange, handleReplySubmit, handleReplyCancel, handleEdit }) => {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(tree.post.content);

  const handleEditClick = (postId) => {
    setEditing(true);
  };

  const handleEditSubmit = () => {
    handleEdit(tree.post.id, editContent);
    setEditing(false);
  };

  const handleEditCancel = () => {
    setEditing(false);
    setEditContent(tree.post.content);
  };

  return (
    <Card key={tree.post.id} style={{ marginBottom: 10 }} elevation={10}>
      <CardContent>
        <Typography variant="h6">
          {tree.post.title}
          <Typography variant="caption" style={{ marginLeft: 10, color: 'gray' }}>
            Created: {new Date(tree.post.created).toLocaleString()}
          </Typography>
          {tree.post.created !== tree.post.last_updated && (
            <Typography variant="caption" style={{ marginLeft: 10, color: 'gray' }}>
              Edited: {new Date(tree.post.last_updated).toLocaleString()}
            </Typography>
          )}
        </Typography>
        <Divider style={{ margin: '10px 0' }} />
        {editing ? (
          <ReplyForm
            replyContent={editContent}
            handleReplyChange={(e) => setEditContent(e.target.value)}
            handleReplySubmit={handleEditSubmit}
            handleReplyCancel={handleEditCancel}
          />
        ) : (
          <Typography variant="body2">{tree.post.content}</Typography>
        )}
        <Button onClick={() => handleEditClick(tree.post.id)} endIcon={<EditIcon />}>Edit</Button>
        <Button onClick={() => handleReply(tree.post.id)} endIcon={<ReplyIcon />}>Reply</Button>
        {replyingTo === tree.post.id && !editing && (
          <ReplyForm
            replyContent={replyContent}
            handleReplyChange={handleReplyChange}
            handleReplySubmit={handleReplySubmit}
            handleReplyCancel={handleReplyCancel}
          />
        )}
        {tree.comments.map((comment) => (
          <CommentTree
            key={comment.post.id}
            tree={comment}
            replyingTo={replyingTo}
            replyContent={replyContent}
            handleReply={handleReply}
            handleReplyChange={handleReplyChange}
            handleReplySubmit={handleReplySubmit}
            handleReplyCancel={handleReplyCancel}
            handleEdit={handleEdit}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default CommentTree;