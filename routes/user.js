const express = require('express');
const router = express.Router();
const userCtrl = require("../controllers/usersController");

router.get('/:tgId', userCtrl.userByID);
router.put('/updateFarmingStartTime/:tgId', userCtrl.updateFarmingStartTime)
router.put('/updateCoinBalance/:tgId', userCtrl.updateCoinBalance)
router.put('/handleClaim/:tgId', userCtrl.handleClaim)
router.put('/addInvitedUser/:tgId', userCtrl.addInvite)
router.get('/getRemainingTime/:tgId', userCtrl.getRemainingTime)
router.get('/leaderboard/getLeaderboard', userCtrl.getLeaderboard)

module.exports = router;