import express from 'express';
import User from '../models/User';

const router = express.Router();

router.get('/profile/:slug', async (req, res) => {
  try {
    const user = await User.findOne({ slug: req.params.slug }).select('name bio avatarUrl company website location createdAt');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
