const express = require("express");
const meeting = require("./meeting");
const auth = require("../../middelwares/auth");

const router = express.Router();

// in real life I'd also add validator middleware for POST requests to make sure that the request body is valid

router.post("/add", auth, meeting.add);
router.get("/", auth, meeting.index);
router.get("/view/:id", auth, meeting.view);
router.delete("/delete/:id", auth, meeting.deleteData);
router.post("/deleteMany", auth, meeting.deleteMany);

module.exports = router;
