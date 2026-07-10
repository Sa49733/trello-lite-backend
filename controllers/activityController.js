const Activity = require("../models/Activity");

// Create Activity
const createActivity = async (action, projectId, userId) => {
try {
await Activity.create({
action,
project: projectId,
user: userId,
});
} catch (error) {
console.log("Activity Error:", error.message);
}
};

// Get Project Activities
const getProjectActivities = async (req, res) => {
try {
const activities = await Activity.find({
project: req.params.projectId,
})
.populate("user", "name email")
.sort({ createdAt: -1 });


res.status(200).json(activities);


} catch (error) {
console.log(error);


res.status(500).json({
  message: error.message,
});


}
};

module.exports = {
createActivity,
getProjectActivities,
};
