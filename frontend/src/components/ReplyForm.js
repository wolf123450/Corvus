import React, { useRef, useEffect } from 'react';
import { TextField, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { Cancel as CancelIcon } from '@mui/icons-material';

const ReplyForm = ({ replyContent, handleReplyChange, handleReplySubmit, handleReplyCancel }) => {
  const replyFieldRef = useRef(null);

  useEffect(() => {
    if (replyFieldRef.current) {
      replyFieldRef.current.focus();
    }
  }, []);

  return (
    <div>
      <TextField
        label="Reply"
        multiline
        rows={4}
        variant="outlined"
        fullWidth
        value={replyContent}
        onChange={handleReplyChange}
        style={{ marginTop: 10 }}
        inputRef={replyFieldRef}
        error={replyContent.trim() === ''}
        helperText={replyContent.trim() === '' ? 'Comment cannot be empty' : ''}
      />
      <Button
        onClick={handleReplySubmit}
        endIcon={<SendIcon />}
        style={{ marginTop: 10 }}
        disabled={replyContent.trim() === ''}
      >
        Submit
      </Button>
      <Button onClick={handleReplyCancel} endIcon={<CancelIcon />} style={{ marginTop: 10, marginLeft: 10 }}>Cancel</Button>
    </div>
  );
};

export default ReplyForm;
