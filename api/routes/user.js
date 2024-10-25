const express = require('express');
const router = express.Router();
const userCtrl = require("../controllers/usersController");

router.get('/:tgId', userCtrl.userByID);
router.put('/updateFarmingStartTime/:tgId', userCtrl.updateFarmingStartTime)
router.put('/updateCoinBalance/:tgId', userCtrl.updateCoinBalance)
router.put('/handleClaim/:tgId', userCtrl.handleClaim)
router.put('/updateFarmingStep/:tgId', userCtrl.updateFarmingStep)
router.put('/addInvitedUser/:tgId', userCtrl.addInvite)
router.put('/readNews/:tgId', userCtrl.readNews)
router.get('/getRemainingTime/:tgId', userCtrl.getRemainingTime)
router.get('/getWaitingTime/:tgId', userCtrl.getWaitingTime)
router.put('/updateDailyStartTime/:tgId', userCtrl.updateDailyStartTime)
router.put('/updateReadNewsIds/:tgId', userCtrl.updateReadNewsIds)
router.put('/updateCompletedTask/:tgId', userCtrl.updateCompletedTask)
router.get('/getUnCompltedTaskCount/:tgId', userCtrl.getUnCompltedTaskCount)

// export the router module so that server.js file can use it
module.exports = router;