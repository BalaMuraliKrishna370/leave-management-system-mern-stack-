const router = require("express").Router();
const {analytics}=require("../controllers/leaveController");
const {
  applyLeave,
  myLeaves,
  leaveBalance,
  getAllLeaves,
  updateStatus
} = require("../controllers/leaveController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/apply", protect, applyLeave);
router.get("/myLeaves", protect, myLeaves);
router.get("/balance", protect, leaveBalance);

router.get("/all", protect, adminOnly, getAllLeaves);
router.put("/status/:id", protect, adminOnly, updateStatus);
router.get("/analytics", protect, adminOnly, analytics);

module.exports = router;