const express = require("express");
const router = express.Router();
const rooms = require("./index");
router.get("/getRoomsDetails", (req, res) => {
  res.send(JSON.stringify());
});
module.exports = router;
