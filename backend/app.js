require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Pusher = require("pusher");

const pusher = new Pusher({
  appId: String(process.env.PUSHER_APP_ID),
  key: String(process.env.PUSHER_APP_KEY),
  secret: String(process.env.PUSHER_APP_SECRET),
  cluster: String(process.env.PUSHER_CLUSTER),
  useTLS: true,
});

const app = express();

// req.rawBody is needed for the pusher.webhook function
app.use(express.json({ verify: (req, res, buf, encoding) => (req.rawBody = buf.toString(encoding)) }));
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.post("/pusher/auth", (req, res) => {
  const socketID = req.body.socket_id;
  const channel = req.body.channel_name;

  // Generate a random user ID - replace this with actual user auth
  const userID = String(Math.floor(Math.random() * 1000 + 1));
  console.log(`> Authorized user ${userID}`);

  const authResponse = pusher.authorizeChannel(socketID, channel, {
    user_id: userID,
    user_info: { name: "User " + userID },
  });

  res.send(authResponse);
});

app.post("/pusher/webhook", (req, res) => {
  const webhook = pusher.webhook(req);

  if (!webhook.isValid()) {
    res.sendStatus(400);
    return;
  }

  console.log(webhook.getEvents());

  res.send("OK");
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Running on port ${port}`));
