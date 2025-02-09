import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Button, CircularProgress } from '@mui/material';
import CommentTree from './CommentTree';
import ReplyForm from './ReplyForm';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
  const [posts, setPosts] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  console.log('API_URL:', process.env.REACT_APP_API_URL);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    axios.get(`${API_URL}/posts/1`).then((response) => {
      try {
        if (response.headers['content-type'].includes('application/json')) {
          setPosts(response.data);
        } else {
          console.error('Response is not JSON:', response.data);
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });
  };

  const handleReply = (postId) => {
    setReplyingTo(postId);
  };

  const handleReplyChange = (event) => {
    setReplyContent(event.target.value);
  };

  const handleReplySubmit = () => {
    if (replyContent.trim() === '') return;

    axios.post(`${API_URL}/posts/`, {
      id: 0,  // Placeholder, will be set by the backend
      title: 'Reply',
      content: replyContent,
      depth: 0,  // Placeholder, will be set by the backend
      parent_id: replyingTo
    })
    .then((response) => {
      console.log('Reply submitted:', response.data);
      setReplyingTo(null);
      setReplyContent('');
      fetchPosts();  // Refresh the comments
    })
    .catch((error) => {
      console.error('Error submitting reply:', error);
    });
  };

  const handleReplyCancel = () => {
    setReplyingTo(null);
    setReplyContent('');
  };

  const handleEdit = (postId, content) => {
    axios.put(`${API_URL}/posts/${postId}/`, {
      content: content
    })
    .then((response) => {
      console.log('Post edited:', response.data);
      fetchPosts();  // Refresh the comments
    })
    .catch((error) => {
      console.error('Error editing post:', error);
    });
  };

  return (
    <Container className="App">
      <Typography variant="h1">Posts:</Typography>
      {posts.comments ? (
        <CommentTree
          tree={posts}
          replyingTo={replyingTo}
          replyContent={replyContent}
          handleReply={handleReply}
          handleReplyChange={handleReplyChange}
          handleReplySubmit={handleReplySubmit}
          handleReplyCancel={handleReplyCancel}
          handleEdit={handleEdit}
        />
      ) : (
        <CircularProgress />
      )}
    </Container>
  );
}

export default App;