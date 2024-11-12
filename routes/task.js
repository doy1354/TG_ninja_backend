const express = require('express');
const router = express.Router();
const taskCtrl = require("../controllers/taskController");

router.post('/createTask', taskCtrl.createTask)
router.get('/getAllTasks', taskCtrl.getAllTasks)

// export the router module so that server.js file can use it
module.exports = router;