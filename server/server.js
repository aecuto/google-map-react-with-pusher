const express = require('express');
const bodyParser = require('body-parser');
const Pusher = require('pusher');
const cors = require('cors');

// create a express application
const app = express();

// initialize pusher
const pusher = new Pusher({
  appId: '1090885',
  key: 'ea2a97224057952fe0c7',
  secret: '21e5640898a014d4d9d4',
  cluster: 'ap1',
  encrypted: true
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// to Allow CORS
app.use(cors({ origin: true }));

app.post('/pusher/auth', (req, res) => {
  let socketId = req.body.socket_id;
  let channel = req.body.channel_name;

  random_string = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, 5);
  let presenceData = {
    user_id: random_string,
    user_info: {
      username: '#' + random_string
    }
  };
  let auth = pusher.authenticate(socketId, channel, presenceData);
  res.send(auth);
});

app.post('/update-location', (req, res) => {
  // trigger a new post event via pusher
  pusher.trigger('presence-channel', 'location-update', {
    username: req.body.username,
    location: req.body.location
  });
  res.json({ status: 200 });
});

let port = 3128;
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
