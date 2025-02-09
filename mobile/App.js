import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8000';

const App = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/posts/1`).then((response) => {
      setPosts(response.data);
    });
  }, []);

  const renderCommentTree = (tree) => (
    <View key={tree.post.id} style={{ marginLeft: tree.post.parent_id ? 20 : 0 }}>
      <Text style={styles.title}>{tree.post.title}</Text>
      <Text>{tree.post.content}</Text>
      {tree.comments.map(renderCommentTree)}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reddit-Style Comment Tree</Text>
      {posts.comments ? renderCommentTree(posts) : <Text>Loading...</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 24, marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold' },
});

export default App;