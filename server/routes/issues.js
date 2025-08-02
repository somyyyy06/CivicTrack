const express = require('express');
const Issue = require('../models/Issue');
const User = require('../models/User');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// GET all issues
router.get('/', async (req, res) => {
  try {
    const issues = await Issue.find().populate('reporter.id', 'username');
    res.status(200).json(issues);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// POST a new issue (requires authentication and file upload)
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  const { title, description, category, location, reporter, priority, upvotes, downvotes, isFlagged, statusLog } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const newIssue = new Issue({
      title,
      description,
      category,
      location: JSON.parse(location), // location will be a JSON string from the frontend
      reporter: {
        id: req.user.id,
        name: user.username,
        isAnonymous: reporter.isAnonymous
      },
      images: images,
      priority,
      upvotes,
      downvotes,
      isFlagged,
      statusLog
    });
    await newIssue.save();
    res.status(201).json(newIssue);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// GET a single issue by ID
router.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id).populate('reporter.id', 'username');
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    res.status(200).json(issue);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// PUT to update an issue by ID (requires authentication)
router.put('/:id', auth, async (req, res) => {
  const { title, description, category, status, location, images, priority, upvotes, downvotes, isFlagged, statusLog } = req.body;
  try {
    let issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if the user is the reporter or an admin to allow the update
    if (issue.reporter.id.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized action' });
    }

    issue.set(req.body);
    issue.updatedAt = Date.now();
    await issue.save();
    res.status(200).json(issue);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// DELETE an issue by ID (requires authentication)
router.delete('/:id', auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Check if the user is the reporter or an admin
    if (issue.reporter.id.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized action' });
    }

    await Issue.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Issue removed' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;