const user = require('../models/user')
const { Task } = require('../models/task')
const extend = require('lodash/extend')

const BOOSTTIMES = [
  2 * 3600 + 38 * 60,
  1 * 3600 + 46 * 60,
  1 * 3600 + 11 * 60,
  47 * 60 + 38,
  31 * 60 + 55,
  21 * 60 + 23,
  14 * 60 + 19,
  9 * 60 + 36,
  6 * 60 + 25
];

//get a user user by gamerId
const userByID = async (req, res) => {
  const id = req.params.tgId;
  try {
    let userData = await user.find({ tgId: id })
    let response = {
      "result": false,
      "data": null
    }
    if (userData.length) {
      response = {
        "result": true,
        "data": userData
      }
    }
    return res.json(response)
  } catch (err) {
    return res.status(500).json({
      error: "Could not retrieve user" + err
    })
  }
}

//get a remaining time by gamerId
const getWaitingTime = async (req, res) => {
  const tgId = req.params.tgId;
  try {
    const userData = await user.findOne({ tgId });
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    const { dailyTasksStartTime } = userData;

    // Default remaining time in seconds (8 hours)
    const defaultRemainingTime = 8 * 60 * 60;

    // Calculate the total boost time from completed items
    let totalBoostTime = 0;
    dailyTasksStartTime.forEach((startTime, index) => {
      if (startTime) {
        const startTimeDate = new Date(startTime).getTime();
        const nextStartTime = index < dailyTasksStartTime.length - 1 ? new Date(dailyTasksStartTime[index + 1]).getTime() : null;
        // Check if the task was completed
        if (Date.now() >= startTimeDate + 5 * 60 * 1000 && nextStartTime != 0) {
          totalBoostTime += BOOSTTIMES[index] || 0;
        }
      }
    });

    // waiting time after considering the boost times
    const waitingTime = defaultRemainingTime - totalBoostTime;

    return res.status(200).json({ waitingTime });
  } catch (err) {

    return res.status(400).json({ error: err.message });
  }
}

//get a remaining time by gamerId
const getRemainingTime = async (req, res) => {
  const tgId = req.params.tgId;
  try {
    const userData = await user.findOne({ tgId });
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    const { dailyTasksStartTime, farmingStartTime } = userData;

    // Default remaining time in seconds (8 hours)
    const defaultRemainingTime = 8 * 60 * 60;

    // Calculate elapsed time in seconds
    const elapsed = (Date.now() - new Date(farmingStartTime).getTime()) / 1000;

    // Calculate the total boost time from completed items
    let totalBoostTime = 0;
    dailyTasksStartTime.forEach((startTime, index) => {
      if (startTime) {
        const startTimeDate = new Date(startTime).getTime();
        const nextStartTime = index < dailyTasksStartTime.length - 1 ? new Date(dailyTasksStartTime[index + 1]).getTime() : null;

        // Check if the task was completed
        if (Date.now() >= startTimeDate + 5 * 60 * 1000 && nextStartTime != 0) {
          totalBoostTime += BOOSTTIMES[index] || 0;
        }
      }
    });

    // Remaining time after considering the boost times
    const remainingTime = Math.max(0, defaultRemainingTime - totalBoostTime - elapsed);

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
      message: "ok!"
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
      { $set: { farmingStartTime: Date.now(), farmingStep: 1 } },
      { new: true } // This option returns the modified document
    );

    if (result) {
      return res.status(200).json({
        message: "ok!",
        updatedDocument: result // Include the updated document in the response for debugging
      });
    } else {
      return res.status(404).json({
        message: "User not found"
      });
    }
  } catch (err) {
    return res.status(500).json({
      error: err
    });
  }
}

const addInvite = async (req, res) => {
  const inviteeid = req.params.tgId
  const inviterId = req.body.inviteId
  const coinBonus = 200;

  try {
    let userData = await user.findOne({ tgId: inviterId })
    // let inviteeUser = await user.findOne({ tgId: inviteeid })

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
      userData.coinBalance = userData.coinBalance + coinBonus

      await userData.save()
      return res.status(200).json({
        message: "ok!"
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

const readNews = async (req, res) => {
  const tgId = req.params.tgId
  const newsId = req.body.newsId

  try {
    let userData = await user.findOne({ tgId: tgId })

    if (!userData) {
      return res.status(500).json({
        error: "User not found"
      });
    }

    let isAlreadyRead = false;
    if (userData.readNews.includes(newsId)) {
      isAlreadyRead = true;
    } else {
      isAlreadyRead = false;
    }

    if (!isAlreadyRead) {
      userData.readNews = [...user.readNews, newsId];
      await userData.save()
      return res.status(200).json({
        message: "ok!"
      })
    } else {
      return res.status(200).json({
        error: "Already read."
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
  const coinBalance = req.body.coinBalance

  try {
    let result = await user.findOneAndUpdate({ tgId: id }, { coinBalance: coinBalance }, { new: true })
    return res.status(200).json({
      message: "ok!",
      updatedDocument: result
    })
  } catch (err) {
    return res.status(500).json({
      error: err
    })
  }
}

const handleClaim = async (req, res) => {
  const id = req.params.tgId
  const coinBalance = req.body.coinBalance

  try {
    let result = await user.findOneAndUpdate({ tgId: id }, { coinBalance: coinBalance, farmingStep: 0 }, { new: true })
    return res.status(200).json({
      message: "ok!",
      updatedDocument: result
    })
  } catch (err) {
    return res.status(500).json({
      error: err
    })
  }
}

const updateFarmingStep = async (req, res) => {
  const id = req.params.tgId
  const step = req.body.step

  try {
    let result = await user.findOneAndUpdate({ tgId: id }, { farmingStep: step }, { new: true })
    return res.status(200).json({
      message: "ok!",
      updatedDocument: result
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
      message: "ok!",
      updatedDocument: result
    })
  } catch (err) {
    return res.status(500).json({
      error: err
    })
  }
}

const getBackendDate = async (req, res) => {
  try {
    const now = Date.now()

    return res.status(200).json({
      now
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message  // Sending error message instead of entire error object
    });
  }
}

const updateReadNewsIds = async (req, res) => {
  const id = req.params.tgId
  const readNewsIds = req.body.readNewsIds

  try {
    await user.findOneAndUpdate({ tgId: id }, { readArticles: readNewsIds })
    return res.status(200).json({
      message: "ok!"
    })
  } catch (err) {
    return res.status(500).json({
      error: err
    })
  }
}

const updateCompletedTask = async (req, res) => {
  const tgId = req.params.tgId;
  const taskId = req.body.taskId;
  const progress = req.body.progress; // This should be either 0 or 1

  try {
    let userData = await user.findOne({ tgId: tgId });

    if (!userData) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    if (progress === -1) {
      // Remove the task from completedTasks if progress is -1
      userData.completedTasks = userData.completedTasks.filter(task => task.taskId.toString() !== taskId);
    } else {
      // Check if task already exists in completedTasks
      let existingTask = userData.completedTasks.find(task => task.taskId.toString() === taskId);

      if (existingTask) {
        existingTask.progress = progress; // Update progress if task exists
      } else {
        // Add new completed task
        userData.completedTasks.push({
          taskId: taskId,
          progress: progress
        });
      }
    }

    let result = await userData.save();
    return res.status(200).json({
      message: "ok!",
      updatedDocument: result
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}

const getUnCompltedTaskCount = async (req, res) => {
  try {
    const { tgId } = req.params;

    // Fetch user data
    const userData = await user.findOne({ tgId });
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch all tasks
    const allTasks = await Task.find({ isActive: true });
    const totalTasks = allTasks.length;

    // Calculate completed tasks
    const completedTasks = userData.completedTasks.filter(task => task.progress === 1).length;

    // Calculate uncompleted tasks
    const uncompletedTasksCount = totalTasks - completedTasks;

    res.json({ uncompletedTasksCount });
  } catch (error) {
    console.error('Error fetching uncompleted tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  userByID,
  getRemainingTime,
  getWaitingTime,
  createUser,
  updateFarmingStartTime,
  addInvite,
  readNews,
  updateCoinBalance,
  handleClaim,
  updateFarmingStep,
  updateDailyStartTime,
  updateReadNewsIds,
  getBackendDate,
  updateCompletedTask,
  getUnCompltedTaskCount,
}