const Comment = require("../models/Comment");

// Create Comment
const createComment = async (req, res) => {
try {
const { comment, task } = req.body;


const newComment = await Comment.create({
  comment,
  task,
  createdBy: req.user.id,
});

res.status(201).json(newComment);


} catch (error) {
console.log(error);


res.status(500).json({
  message: error.message,
});


}
};
const getCommentsByTask = async (req, res) => {
try {
const comments = await Comment.find({
task: req.params.taskId,
}).populate("createdBy", "name email");


res.status(200).json(comments);


} catch (error) {
console.log(error);


res.status(500).json({
  message: error.message,
});


}
};

const updateComment = async (req, res) => {
try {
const { comment } = req.body;


const updatedComment = await Comment.findOneAndUpdate(
  {
    _id: req.params.id,
    createdBy: req.user.id,
  },
  {
    comment,
  },
  {
    new: true,
  }
);

if (!updatedComment) {
  return res.status(404).json({
    message: "Comment not found",
  });
}

res.status(200).json(updatedComment);


} catch (error) {
console.log(error);


res.status(500).json({
  message: error.message,
});


}
};
const deleteComment = async (req, res) => {
try {
const comment = await Comment.findOneAndDelete({
_id: req.params.id,
createdBy: req.user.id,
});


if (!comment) {
  return res.status(404).json({
    message: "Comment not found",
  });
}

res.status(200).json({
  message: "Comment deleted successfully",
});


} catch (error) {
console.log(error);


res.status(500).json({
  message: error.message,
});


}
};



module.exports = {
createComment,
getCommentsByTask,
updateComment,
deleteComment,
};

