const express = require('express');
const router = express.Router();
const newsCtrl = require("../controllers/newsController");

router.post('/createNews', newsCtrl.createNews)
router.get('/getLatestNews', newsCtrl.getLatestNews)
router.get('/getUnreadNewsCount/:tgId', newsCtrl.getUnreadNewsCount)

// export the router module so that server.js file can use it
module.exports = router;