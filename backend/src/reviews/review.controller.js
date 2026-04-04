const Review = require("./review.model");

exports.create = async (req, res) => {
  try {
    // SECURITY FIX: Force user ID from the verified token
    const reviewData = {
      ...req.body,
      user: req.user._id,
    };

    const created = new Review(reviewData);
    await created.save();

    // Safely populate only the reviewer's name after saving
    const populatedReview = await created.populate({
      path: "user",
      select: "name",
    });

    res.status(201).json(populatedReview);
  } catch (error) {
    console.error("Create Review Error:", error);
    return res
      .status(500)
      .json({ message: "Error posting review, please try again later" });
  }
};

exports.getByProductId = async (req, res) => {
  try {
    const { id } = req.params;
    let skip = 0;
    let limit = 0;

    if (req.query.page && req.query.limit) {
      const pageSize = parseInt(req.query.limit);
      const page = parseInt(req.query.page);
      skip = pageSize * (page - 1);
      limit = pageSize;
    }

    const totalDocs = await Review.countDocuments({ product: id }).exec();

    // SECURITY FIX: Only expose the 'name' of the user who left the review
    const result = await Review.find({ product: id })
      .skip(skip)
      .limit(limit)
      .populate("user", "name")
      .sort({ createdAt: -1 }) // Show newest reviews first
      .exec();

    res.set("X-Total-Count", totalDocs);
    res.status(200).json(result);
  } catch (error) {
    console.error("Get Reviews Error:", error);
    res
      .status(500)
      .json({
        message:
          "Error getting reviews for this product, please try again later",
      });
  }
};

exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;

    // SECURITY FIX: Ensure the user trying to update the review actually wrote it
    const updated = await Review.findOneAndUpdate(
      { _id: id, user: req.user._id },
      req.body,
      { new: true },
    ).populate("user", "name");

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Review not found or unauthorized" });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update Review Error:", error);
    res
      .status(500)
      .json({ message: "Error updating review, please try again later" });
  }
};

exports.deleteById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // SECURITY FIX: Allow deletion IF it's the user's own review, OR if the user is an Admin
    const isOwner = review.user.toString() === req.user._id;
    const isAdmin = req.user.isAdmin === true || req.user.isSuperAdmin === true;

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Forbidden. You cannot delete this review." });
    }

    await Review.findByIdAndDelete(id);
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete Review Error:", error);
    res
      .status(500)
      .json({ message: "Error deleting review, please try again later" });
  }
};
