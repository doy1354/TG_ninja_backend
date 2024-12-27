const user = require('../models/user')
const { FARMING_STEP, FARMING_TIME } = require('../constant/constants');
const axios = require('axios');

const bot_token = process.env.TELEGRAM_BOT_TOKEN;

//get a user user by gamerId
const userByID = async (req, res) => {
  const id = req.params.tgId;

  try {
    // Get all users sorted by coinBalance in descending order
    const usersData = await user.find().sort({ coinBalance: -1 });

    // Find the user by tgId
    const userData = await user.findOne({ tgId: id });

    let response = {
      result: false,
      data: null,
    };

    if (userData) {
      // Calculate the user's rank in the sorted array
      const rank = usersData.findIndex((u) => u.tgId == id) + 1;

      // Calculate remaining time (8 hours after farmingStartTime)
      const endTime =
        new Date(userData.farmingStartTime).getTime() +
        FARMING_TIME.TIME * 60 * 60 * 1000;
      const remainingTime = Math.max(0, endTime - Date.now());

      // Convert remainingTime (in milliseconds) to MM:SS format
      const remainingMinutes = Math.floor(remainingTime / 60000);
      const remainingSeconds = Math.floor((remainingTime % 60000) / 1000);
      const formattedTime = `${remainingMinutes
        .toString()
        .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;

      // Check if the user has already claimed today
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of the day
      const lastClaimDate = new Date(userData.lastClaimDate || 0); // Default to epoch if no claim date

      let streak = userData.checkInStreak || 0; // Default to 0 if not defined
      let reward = 0;

      if (lastClaimDate < today) {
        if ((today - lastClaimDate) / (1000 * 60 * 60 * 24) > 1) {
          streak = 1; // Reset streak if the user missed a day
        } else {
          streak += 1; // Increment streak for consecutive days
        }

        reward = streak <= 10 ? streak * 10 : 100;

        userData.checkInStreak = streak;
        userData.lastClaimDate = new Date();
        userData.coinBalance += reward;
        await userData.save();
        await distributeReferralRewards(id, reward)
      }

      let userAvatar = await getUserProfilePhoto(userData.tgId)
      // Include rank, remaining time, streak, and reward in the response
      response = {
        result: true,
        data: {
          ...userData.toObject(), // Convert user data to plain object
          rank,
          remainingTime: formattedTime,
          streak,
          reward,
          alreadyClaimed: lastClaimDate >= today, // Flag to indicate if the user has already claimed
          userAvatar,
        },
      };
    }

    // Return the response
    return res.json(response);
  } catch (err) {
    return res.status(500).json({
      error: "Could not retrieve user: " + err,
    });
  }
};

//get a remaining time by gamerId
const getRemainingTime = async (req, res) => {
  const tgId = req.params.tgId;
  try {
    const userData = await user.findOne({ tgId });
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    const { farmingStartTime } = userData;

    // Default remaining time in seconds (8 hours)
    const defaultRemainingTime = FARMING_TIME.TIME * 60 * 60;

    // Calculate elapsed time in seconds
    const elapsed = (Date.now() - new Date(farmingStartTime).getTime()) / 1000;

    // Remaining time after considering the boost times
    const remainingTime = Math.max(0, defaultRemainingTime - elapsed);

    return res.status(200).json({ remainingTime });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

const createUser = async (req, res) => {
  const user = new user(req.body)
  try {
    await user.save()
    return res.status(200).json({
      message: "success"
    })
  } catch (err) {
    return res.status(500).json({
      error: err
    })
  }
}

const updateFarmingStartTime = async (req, res) => {
  const id = req.params.tgId;

  try {
    const result = await user.findOneAndUpdate(
      { tgId: id },
      { $set: { farmingStartTime: Date.now(), farmingStep: FARMING_STEP.FARMING } },
      { new: true } // This option returns the modified document
    );

    if (result) {
      // Calculate remaining time (8 hours in milliseconds)
      const endTime = new Date(result.farmingStartTime).getTime() + FARMING_TIME.TIME * 60 * 60 * 1000;
      const remainingTime = Math.max(0, endTime - Date.now()); // Ensure non-negative value

      return res.status(200).json({
        message: "success",
        data: {
          ...result.toObject(), // Convert mongoose document to plain object if needed
          remainingTime, // Add remaining time to the response
        },
      });
    } else {
      return res.status(404).json({
        message: "User not found",
      });
    }
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};


const addInvite = async (req, res) => {
  const inviteeid = req.params.tgId
  const inviterId = req.body.inviteId
  // const coinBonus = 200;

  try {
    let userData = await user.findOne({ tgId: inviterId })

    if (inviterId == inviteeid) {
      return res.status(200).json({
        error: "You have to invite other"
      });
    }

    // if (inviteeUser) {
    //   return res.status(200).json({
    //     error: "User already joined the game"
    //   });
    // }

    if (!userData) {
      return res.status(200).json({
        error: "User not found"
      });
    }

    let isAlreadyInvited = false;

    if (userData.invitedUser.includes(inviteeid)) {
      isAlreadyInvited = true;
    } else {
      isAlreadyInvited = false;
    }

    if (!isAlreadyInvited) {
      userData.inviteNum = userData.inviteNum + 1;
      userData.invitedUser = [...userData.invitedUser, inviteeid];
      // userData.coinBalance = userData.coinBalance + coinBonus

      await userData.save()

      let inviteeUser = await user.findOne({ tgId: inviteeid });
      if (inviteeUser) {
        inviteeUser.inviter = inviterId;
        await inviteeUser.save()
      }

      return res.status(200).json({
        message: "success"
      })
    } else {
      return res.status(200).json({
        error: "Already invited."
      });
    }
  } catch (err) {
    return res.status(500).json({
      error: err
    })
  }
}

const updateCoinBalance = async (req, res) => {
  const id = req.params.tgId
  const amountToAdd = req.body.amountToAdd

  try {
    let result = await user.findOneAndUpdate({ tgId: id }, { $inc: { coinBalance: amountToAdd } }, { new: true })
    return res.status(200).json({
      message: "success",
      updatedDocument: result
    })
  } catch (err) {
    return res.status(500).json({
      error: err
    })
  }
}

const handleClaim = async (req, res) => {
  const id = req.params.tgId;
  const amountToAdd = req.body.amountToAdd;  // Amount to add to the current balance

  try {
    // Retrieve the current user document to get the current balance
    const userDoc = await user.findOne({ tgId: id });

    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate the new balance by adding the current balance and the amount to add
    const newBalance = userDoc.coinBalance + amountToAdd;

    // Update the user's balance and farming step
    const result = await user.findOneAndUpdate(
      { tgId: id },
      { coinBalance: newBalance, farmingStep: FARMING_STEP.WAITING },
      { new: true }
    );

    await distributeReferralRewards(id, amountToAdd)

    return res.status(200).json({
      message: "Balance updated successfully",
      data: result
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error updating balance: " + err.message
    });
  }
};

const updateFarmingStep = async (req, res) => {
  const id = req.params.tgId
  const step = req.body.step

  try {
    let result = await user.findOneAndUpdate({ tgId: id }, { farmingStep: step }, { new: true })
    return res.status(200).json({
      message: "success",
      data: result
    })
  } catch (err) {
    return res.status(500).json({
      error: err
    })
  }
}

const updateDailyStartTime = async (req, res) => {
  const id = req.params.tgId
  const dailyId = req.body.dailyId

  try {
    let userData = await user.findOne({ tgId: id })

    if (!userData) {
      return res.status(500).json({
        error: "User not found"
      });
    }

    // If dailyId is 0, set the date at index 0 to one day ago
    if (dailyId === 0) {
      userData.dailyTasksStartTime[0] = new Date(Date.now() - 24 * 60 * 60 * 1000); // One day ago
    }

    userData.dailyTasksStartTime[dailyId + 1] = Date.now();

    let result = await userData.save()
    return res.status(200).json({
      message: "success",
      data: result
    })
  } catch (err) {
    return res.status(500).json({
      error: err
    })
  }
}

const getBackendDate = async (req, res) => {
  try {
    const now = new Date();
    return res.status(200).json({
      now
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message  // Sending error message instead of entire error object
    });
  }
}

const getUserProfilePhoto = async (userId) => {
  try {
    const profileResponse = await axios.get(
      `https://api.telegram.org/bot${bot_token}/getUserProfilePhotos?user_id=${userId}`
    );

    const profileData = profileResponse.data;
    if (profileData.ok && profileData.result.total_count > 0) {
      const fileId = profileData.result.photos[0][0].file_id;

      const fileResponse = await axios.get(
        `https://api.telegram.org/bot${bot_token}/getFile?file_id=${fileId}`
      );

      const fileData = fileResponse.data;
      if (fileData.ok) {
        const filePath = fileData.result.file_path;
        return `https://api.telegram.org/file/bot${bot_token}/${filePath}`;
      }
    }
  } catch (error) {
    console.error('Error fetching user profile photo:', error.message);
  }
  return '/images/avatar.png'; // Default avatar
};

const getLeaderboard = async (req, res) => {
  try {
    // Fetch all users sorted by coinBalance
    const users = await user.find().sort({ coinBalance: -1 }).limit(23);

    const leaderboard = await Promise.all(
      users.map(async (user, index) => {
        // Fetch user profile picture using the getUserProfilePhoto function
        const profilePhoto = await getUserProfilePhoto(user.tgId);
        return {
          tgID: user.tgId,
          username: user.username,
          profilePhoto,
          rank: index + 1, // Rank is the position in the sorted array (1-based index)
          coinBalance: user.coinBalance,
        };
      })
    );

    return res.status(200).json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

const distributeReferralRewards = async (earnerId, earnedTokens) => {
  try {
    // Fetch the earning user
    const earner = await user.findOne({tgId: earnerId});

    if (!earner) {
      throw new Error("Earning user not found");
    }

    let currentReferrerId = earner.inviter; // Get the immediate referrer
    let rewardLevels = [0.1, 0.05]; // Percentage rewards for level 1 and 2
    let level = 0;

    // Distribute rewards up the referral chain
    while (currentReferrerId && level < rewardLevels.length) {
      const referrer = await user.findOne({tgId: currentReferrerId});
      if (!referrer) break;

      const reward = earnedTokens * rewardLevels[level];
      referrer.referralBonus += reward;
      await referrer.save();

      currentReferrerId = referrer.inviter; // Move to the next referrer
      level++;
    }

    return {
      message: "Rewards distributed successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      error: error.message,
    };
  }
};

const getMyFriends = async (req, res) => {
  const tgId = req.params.tgId

  try {
    // Fetch all my friends sorted by created date
    const friendsData = await user.find({"inviter": parseInt(tgId)}).sort({ created: -1 });
    const friends = await Promise.all(
      friendsData.map(async (user, index) => {
        // Fetch user profile picture using the getUserProfilePhoto function
        const profilePhoto = await getUserProfilePhoto(user.tgId);
        return {
          tgID: user.tgId,
          username: user.username,
          profilePhoto,
          rank: index + 1, // Rank is the position in the sorted array (1-based index)
          coinBalance: user.coinBalance,
        };
      })
    );

    return res.status(200).json({ friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    return res.status(500).json({ error: 'Failed to fetch friends' });
  }
};

const claimReferralBonus = async (req, res) => {
  const id = req.params.tgId;

  try {
    // Retrieve the current user document to get the current balance
    const userDoc = await user.findOne({ tgId: id });

    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate the new balance by adding the current balance and the amount to add
    const newBalance = userDoc.coinBalance + userDoc.referralBonus;

    // Update the user's balance and farming step
    const result = await user.findOneAndUpdate(
      { tgId: id },
      { coinBalance: newBalance, referralBonus: 0 },
      { new: true }
    );    

    return res.status(200).json({
      message: "Claimed successfully",
      data: result
    });
  } catch (err) {
    return res.status(500).json({
      error: "Error updating balance: " + err.message
    });
  }
};

module.exports = {
  userByID,
  getRemainingTime,
  createUser,
  updateFarmingStartTime,
  addInvite,
  updateCoinBalance,
  handleClaim,
  updateFarmingStep,
  updateDailyStartTime,
  getBackendDate,
  getLeaderboard,
  distributeReferralRewards,
  getMyFriends,
  claimReferralBonus
}