const express = require('express');
const router = express.Router();
const taskCtrl = require("../controllers/taskController");

router.get('/getTask/:taskId', taskCtrl.getTaskById)
router.post('/createTask', taskCtrl.createTask)
router.get('/getAllTasks', taskCtrl.getAllTasks)
router.get('/getAllTasksForUser/:tgId', taskCtrl.getAllTasksForUser)
router.put('/editTask/:taskId', taskCtrl.editTask)
router.delete('/deleteTask/:taskId', taskCtrl.deleteTask)
router.post('/updatePerformedTask', taskCtrl.updatePerformedTask)
router.post('/resetTask', taskCtrl.resetTask)
router.post('/verifyTask', taskCtrl.verifyTask)

// export the router module so that server.js file can use it
module.exports = router;