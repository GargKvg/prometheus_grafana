const express = require("express");
const client = require("prom-client");
const responseTime = require("response-time");
const { doSomeHeavyTask } = require("./util.js");

const { createLogger, transports } = require("winston");
const LokiTransport = require("winston-loki");
const options = {
  transports: [
    new LokiTransport({
      host: "http://127.0.0.1:3100",
    }),
  ],
};
const logger = createLogger(options);

const app = express();

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

const reqResTime = new client.Histogram({
  name: "http_express_req_res_time",
  help: "This tells us how much time is taken by req and res",
  labelNames: ["method", "route", "status_code"],
  buckets: [1, 50, 100, 200, 400, 500, 800, 1000, 2000],
});

const totalReqCounter = new client.Counter({
  name: "total_req",
  help: "Tells total req count",
});

app.use(
  responseTime((req, res, time) => {
    totalReqCounter.inc();
    reqResTime
      .labels({
        method: req.method,
        route: req.url,
        status_code: res.statusCode,
      })
      .observe(time);
  })
);

app.get("/", (req, res) => {
  logger.info("req came on / route");
  return res.json({
    message: "Hello from express server",
  });
});

app.get("/metrics", async (req, res) => {
  logger.info("req came on /metrics route");

  res.setHeader("Content-Type", client.register.contentType);
  const metrics = await client.register.metrics();
  res.send(metrics);
});

app.get("/slow", async (req, res) => {
  try {
    logger.info("req came on /slow route");
    const timeTaken = await doSomeHeavyTask();
    return res.json({
      status: "Success",
      message: `Task completed in ${timeTaken}ms`,
    });
  } catch (error) {
    logger.error(error.message);
    return res
      .status(500)
      .json({ status: "Error", error: "Internal Server Error" });
  }
});

app.listen(8000, () => {
  console.log("Example app listening on port 8000!");
});

// # To setup grafana run this on terminal

// # docker run -d -p 3000:3000 --name=grafana grafana/grafana-oss

// # To setup loki run this on terminal

// # docker run -d --name=loki -p 3100:3100 grafana/loki
