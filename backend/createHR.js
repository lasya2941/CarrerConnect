const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function createHR() {
try {
const { MONGO_URI, HR_EMAIL, HR_PASSWORD } = process.env;

if (!MONGO_URI || !HR_EMAIL || !HR_PASSWORD) {
  throw new Error(
    "MONGO_URI, HR_EMAIL, HR_PASSWORD must be set in .env"
  );
}

await mongoose.connect(MONGO_URI);

const email = HR_EMAIL.trim().toLowerCase();
const hashedPassword = await bcrypt.hash(HR_PASSWORD, 10);

const existingUser = await User.findOne({ email });

if (existingUser) {
  existingUser.role = "hr";
  existingUser.password = hashedPassword;

  await existingUser.save();

  console.log("Existing account updated to HR successfully.");
} else {
  await User.create({
    name: "HR Manager",
    email,
    password: hashedPassword,
    role: "hr",
  });
}


} catch (error) {
console.error("HR account setup failed:", error.message);
} finally {
if (mongoose.connection.readyState !== 0) {
await mongoose.disconnect();
}
}
}

createHR();
