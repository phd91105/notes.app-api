const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const firebase = require("firebase");
const categoryRoutes = require("./routes/category-routes");
const noteRoutes = require("./routes/note-routes");
const scheduleRoutes = require("./routes/schedule-routes");
const userService = require("./models/user_service");
const admin = require("firebase-admin");
const config = require("./models/config");

admin.initializeApp(config.firebaseConfig);
app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
/** **************************************/
app.get("/", (req, res) => {
  res.send(`Server is listening at port ${app.get("port")}`);
});
/** **************************************/
// app.use("/api", scheduleRoutes.routes);
/** **************************************/
app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await userService.addUser(email, password);
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
/** **************************************/
app.post("/api/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await userService.authenticate(email, password);
    res.status(200).json({
      accessToken: user.user.ya,
      refreshToken: user.user.refreshToken,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
/** **************************************/
app.post("/api/resetpass", async (req, res) => {
  const { email } = req.body;
  try {
    await userService.resetPass(email);
    res.status(200).json({
      message: "Reset password link has been sent! Please check your inbox",
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});
/** ************ middleware ***************/
app.use(middleware);
firebase.auth().languageCode = "vi";
async function middleware(req, res, next) {
  if (req.headers.authorization.split(" ")[0].toLowerCase() === "bearer") {
    const idToken = req.headers.authorization.split(" ")[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req["currentUser"] = decodedToken;
      req["userID"] = decodedToken.uid;
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  }
  next();
}
/** **************************************/
app.use("/api", noteRoutes.routes);
app.use("/api", categoryRoutes.routes);
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    app.post("/api/updateprofile", (req, res) => {
      req["currentUser"]
        .updateProfile({
          displayName: req.body.displayName,
          photoURL: req.body.photoURL,
        })
        .then(() => {
          // Update successful.
          res.send({ message: "update profile successful", body: req.body });
        })
        .catch((error) => {
          // An error happened.
          res.send({ error: error.message });
        });
    });
    app.post("/api/verifyemail", (req, res) => {
      req["currentUser"]
        .sendEmailVerification()
        .then(() => {
          // Email sent.
          res.send({ message: "verify email sent, check your inbox" });
        })
        .catch((error) => {
          // An error happened.
          res.send({ error: error.message });
        });
    });
    app.post("/api/changepass", (req, res) => {
      req["currentUser"]
        .updatePassword(req.body.password)
        .then(() => {
          // Update successful.
          res.send({ message: "password changed" });
        })
        .catch((error) => {
          // An error happened.
          res.send({ error: error.message });
        });
    });
  }
});
/** **************************************/
app.set("port", process.env.PORT);
app.listen(app.get("port"), () => {
  console.log("Server listening at port %d ", app.get("port"));
});
