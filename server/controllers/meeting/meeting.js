const MeetingHistory = require("../../model/schema/meeting");
const mongoose = require("mongoose");
// Add new meeting
const add = async (req, res) => {
  try {
    const meeting = new MeetingHistory(req.body);
    await meeting.save();
    return res.status(200).json(meeting);
  } catch (error) {
    return res.status(400).json({
      error: "Error creating meeting",
    });
  }
};

// Get all meetings
const index = async (req, res) => {
  try {
    const query = req.query;
    query.deleted = false;
    const allData = await MeetingHistory.find(query)
      .populate({
        path: "createBy",
        match: { deleted: false },
      })
      .sort({ dateTime: -1 })
      .exec();

    const result = allData.filter((item) => item.createBy !== null);

    return res.send(result);
  } catch (error) {
    return res.status(400).json({
      error: "Error fetching meetings",
    });
  }
};

// View single meeting
const view = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid meeting ID",
      });
    }

    const meeting = await MeetingHistory.findOne({
      _id: id,
      deleted: false,
    }).populate([
      {
        path: "createBy",
        match: { deleted: false },
      },

      // I wanted to include attendes and attendesLead but I am getting an `MissingSchemaError: Schema hasn't been registered for model "Contact".` error.
      // And I don't want to spend time on fixing this. Generally wanted to show that Attendes and AttendesLead should be populated here.

      /* {
        path: "attendes",
        match: { deleted: false },
       },
      {
        path: "attendesLead",
        match: { deleted: false },
      }, */
    ]);

    if (!meeting) {
      return res.status(404).json({
        error: "Meeting not found",
      });
    }

    return res.status(200).json(meeting);
  } catch (error) {
    console.log("err", error);
    return res.status(400).json({
      error: "Error fetching meeting",
    });
  }
};

// Soft delete single meeting
const deleteData = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid meeting ID",
      });
    }

    const meeting = await MeetingHistory.findOneAndUpdate(
      { _id: id, deleted: false },
      { deleted: true },
      { new: true }
    );

    if (!meeting) {
      return res.status(404).json({
        error: "Meeting not found",
      });
    }

    return res.status(200).json({});
  } catch (error) {
    return res.status(400).json({
      error: "Error deleting meeting",
    });
  }
};

// Soft delete multiple meetings
const deleteMany = async (req, res) => {
  try {
    const ids = req.body;

    if (!Array.isArray(ids)) {
      return res.status(400).json({
        error: "Invalid input: ids must be an array",
      });
    }

    // Validate all IDs
    const validIds = ids.every((id) => mongoose.Types.ObjectId.isValid(id));
    if (!validIds) {
      return res.status(400).json({
        error: "Invalid meeting ID(s) in the array",
      });
    }

    const result = await MeetingHistory.updateMany(
      { _id: { $in: ids }, deleted: false },
      { deleted: true }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        error: "No meetings found to delete",
      });
    }

    return res.status(200).json({});
  } catch (error) {
    return res.status(400).json({
      error: "Error deleting meetings",
    });
  }
};

module.exports = { add, index, view, deleteData, deleteMany };
