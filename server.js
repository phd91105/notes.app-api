const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const noteRoutes = require('./routes/note-routes');
app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const userService = require("./user_service");

app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userService.addUser(email, password);
    res.status(201).json(user);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.post("/api/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userService.authenticate(email, password);
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

app.use('/api', noteRoutes.routes);

const port = process.env.PORT;
app.listen(port, () => console.log(`Server started at port ${port}`));
