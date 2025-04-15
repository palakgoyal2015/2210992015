const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const TEST_SERVER_BASE_URL = 'http://20.244.56.144/evaluation-service/';

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

async function fetchFromTestServer(endpoint) {
  try {
    const response = await axios.get(`${TEST_SERVER_BASE_URL}${endpoint}`, {
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching from test server: ${error.message}`);
    throw error;
  }
}

app.get('/users', async (req, res) => {
  try {
    const usersData = await fetchFromTestServer('/users');
    res.json(usersData);
  } catch (error) {
    console.error(`Error in /users endpoint: ${error.message}`);
    res.status(500).json({ error: "Failed to retrieve users data" });
  }
});

app.get('/users/:userId/posts', async (req, res) => {
  try {
    const userId = req.params.userId;
    const userPostsData = await fetchFromTestServer(`/users/${userId}/posts`);
    res.json(userPostsData);
  } catch (error) {
    console.error(`Error in /users/${req.params.userId}/posts endpoint: ${error.message}`);
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(500).json({ error: "Failed to retrieve user posts" });
  }
});

app.get('/posts', async (req, res) => {
  try {
    const type = req.query.type || 'latest';
    if (type !== 'latest' && type !== 'popular') {
      return res.status(400).json({ error: "Invalid type parameter. Accepted values: 'latest', 'popular'" });
    }
    const postsData = await fetchFromTestServer(`/posts?type=${type}`);
    res.json(postsData);
  } catch (error) {
    console.error(`Error in /posts endpoint: ${error.message}`);
    res.status(500).json({ error: "Failed to retrieve posts" });
  }
});

app.get('/posts/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    const postData = await fetchFromTestServer(`/posts/${postId}`);
    res.json(postData);
  } catch (error) {
    console.error(`Error in /posts/${req.params.postId} endpoint: ${error.message}`);
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(500).json({ error: "Failed to retrieve post" });
  }
});

app.get('/posts/:postId/comments', async (req, res) => {
  try {
    const postId = req.params.postId;
    const commentsData = await fetchFromTestServer(`/posts/${postId}/comments`);
    res.json(commentsData);
  } catch (error) {
    console.error(`Error in /posts/${req.params.postId}/comments endpoint: ${error.message}`);
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ error: "Post not found or no comments available" });
    }
    res.status(500).json({ error: "Failed to retrieve comments" });
  }
});

app.use((err, req, res, next) => {
  console.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ error: "Internal server error" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Resource not found" });
});

app.listen(PORT, () => {
  console.log(`Social Media Analytics Microservice running on port ${PORT}`);
  console.log(`Connected to test server at ${TEST_SERVER_BASE_URL}`);
});
