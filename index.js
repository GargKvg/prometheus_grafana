const express = require("express");
const { doSomeHeavyTask } = require("./util.js");
const app = express();

app.get("/", (req, res) => {
  return res.json({
    message: "Hello from express server",
  });
});

app.get("/slow", async (req, res) => {
  try {
    const timeTaken = await doSomeHeavyTask();
    return res.json({
      status: "Success",
      message: `Task completed in ${timeTaken}ms`,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "Error", error: "Internal Server Error" });
  }
});

app.listen(8000, () => {
  console.log("Example app listening on port 8000!");
});
