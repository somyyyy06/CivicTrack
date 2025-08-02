const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { v4: uuidv4 } = require("uuid");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory data
const users = [
  {
    id: "1",
    name: "admin",
    email: "admin@civictrack.com",
    password: "admin123",
    role: "admin",
  },
  {
    id: "2",
    name: "user",
    email: "user@civictrack.com",
    password: "user123",
    role: "user",
  },
];

const issues = [
  // Example issue
  {
    id: uuidv4(),
    title: "Sample Issue",
    description: "This is a sample issue.",
    category: "roads",
    status: "open",
    location: {
      latitude: 28.6139,
      longitude: 77.209,
      address: "Connaught Place, Delhi",
    },
    reporter: { id: "2", name: "user", isAnonymous: false },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images: [],
    priority: "medium",
    upvotes: 0,
    downvotes: 0,
    isFlagged: false,
    statusLog: [{ status: "open", timestamp: new Date().toISOString() }],
  },
];

// Health check
app.get("/", (req, res) => {
  res.json({ message: "CivicTrack backend is running!" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Auth endpoints
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

app.post("/api/auth/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (users.find((u) => u.email === email)) {
    return res.status(409).json({ error: "Email already exists" });
  }
  const newUser = { id: uuidv4(), name, email, password, role: "user" };
  users.push(newUser);
  res.status(201).json({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  });
});

// Issues endpoints
app.get("/api/issues", (req, res) => {
  res.json(issues);
});

app.post("/api/issues", (req, res) => {
  const issue = {
    ...req.body,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    upvotes: 0,
    downvotes: 0,
    isFlagged: false,
    statusLog: [
      {
        status: req.body.status || "open",
        timestamp: new Date().toISOString(),
      },
    ],
  };
  issues.unshift(issue);
  res.status(201).json(issue);
});

app.get("/api/issues/:id", (req, res) => {
  const issue = issues.find((i) => i.id === req.params.id);
  if (!issue) return res.status(404).json({ error: "Issue not found" });
  res.json(issue);
});

app.put("/api/issues/:id", (req, res) => {
  const idx = issues.findIndex((i) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Issue not found" });
  issues[idx] = {
    ...issues[idx],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  res.json(issues[idx]);
});

app.delete("/api/issues/:id", (req, res) => {
  const idx = issues.findIndex((i) => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Issue not found" });
  const deleted = issues.splice(idx, 1);
  res.json(deleted[0]);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
