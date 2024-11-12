const news = require('../models/news')
const user = require('../models/user')

const createNews = async (req, res) => {
  const newsData = new news(req.body)
  try {
    await newsData.save()
    return res.status(200).json({
      message: "ok!"
    })
  } catch (err) {

    return res.status(500).json({
      error: err
    })
  }
}

const getLatestNews = async (req, res) => {
  try {
    const latestNews = await news.find({ enabled: true }).sort({ createdAt: 1 }).limit(3)
    res.status(200).json({ latestNews })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getUnreadNewsCount = async (req, res) => {
  try {
    const id = req.params.tgId;

    // Find the user
    const userData = await user.findOne({tgId: id }).populate('readArticles');

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the list of read articles IDs
    const readArticleIds = userData.readArticles.map(article => article._id);

    // Count unread articles
    const unreadCount = await news.countDocuments({
      _id: { $nin: readArticleIds },
      enabled: true
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
module.exports = {
  createNews,
  getLatestNews,
  getUnreadNewsCount,
}