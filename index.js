const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const app = express();
require("dotenv").config();

const connectDb = require("./db");
const Admin = require("./schema/adminSchema");
const User = require("./schema/userSchema");
const Course = require("./schema/courseSchema");
const { isValidObjectId } = require("mongoose");
//create jwt funtion
function generateAccessToken(email) {
  return jwt.sign(email, process.env.TOKEN_SECRET);
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({
      status: 0,
      message: "Unauthorized",
    });
  const token = authHeader.split(" ")[1];
  if (token == null) {
    return res.status(401).json({
      status: 0,
      message: "Unauthorized",
    });
  }
  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        status: 0,
        message: "Forbidden",
      });
    }
    req.user = user;
    next();
  });
}

//connect to db
connectDb();

//5 type of middleware
/**
 * 1)Application level middleware that has applied on Overall application
 * 2)Route level middleware --> where we can use it for protected routes ex to access admin route first verify
 * 3)Built in middleware -->eg express.json
 * 4)Error handling middleware
 * 5)Third part middleware eg cors app.use(cors())
 */

// const adminAuthnetication = (req, res, next) => {
//   const { email, password } = req.headers;

//   const admin = ADMIN.find(
//     (isAdmin) => isAdmin.email === email && isAdmin.password === password
//   );

//   if (admin) {
//     // Authentication successful, continue on to the next middleware
//     return next();
//   } else {
//     // Authentication failed, send a response and end the request-response cycle
//     return res.status(403).json({
//       status: 0,
//       message: "Admin Authentication Failed",
//     });
//   }
// };
// const userAuthentication = (req, res, next) => {
//   const { email, password } = req.headers;
//   const user = USER.find(
//     (isUser) => isUser.email == email && isUser.password == password
//   );
//   if (user) {
//     req.user = user;
//     return next();
//   } else {
//     return res.status(403).json({
//       status: 0,
//       message: "User Authentication failed",
//     });
//   }
// };

//register middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

const PORT = 8000;

//In memory data
// const ADMIN = [];
// const USER = [];
// const COURSES = [];

// console.log(ADMIN, "admin");
// console.log(USER, "user");
// console.log(COURSES, "course");

app.get("/", (req, res) => {
  res.status(200).send({ message: "Welcome to the course app" });
});

// app.post("/admin/login", adminAuthnetication, (req, res) => {
//     const { email, password } = req.headers;
//     const token=generateAccessToken(email,password)
//   res.status(200).json({
//     status: 1,
//     message: "Admin Login SuccessFully",
//     token
//   });
// });
app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  console.log(admin, "admin");

  if (!admin || admin.password !== password) {
    return res.status(403).json({
      status: 0,
      message: "Admin Authentication failed",
    });
  }

  console.log(admin, "admin");
  if (admin) {
    const token = generateAccessToken(email);
    res.status(200).json({
      status: 1,
      message: "Admin Login SuccessFully",
      token,
    });
  } else {
    res.status(403).json({
      status: 0,
      message: "Admin Authentication failed",
    });
  }
});

// app.post("/user/login", userAuthentication, (req, res) => {
//   const { email, password } = req.headers;
//   const token = generateAccessToken(email, password);
//   res.status(200).json({
//     status: 1,
//     message: "User Login SuccessFully",
//     token,
//   });
// });
app.post("/user/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  //compare password
  if (password !== user.password) {
    return res.status(403).json({
      status: 0,
      message: "User Authentication failed",
    });
  }

  if (user) {
    const token = generateAccessToken(email);
    res.status(200).json({
      status: 1,
      message: "User Login SuccessFully",
      token,
    });
  } else {
    res.status(403).json({
      status: 0,
      message: "User Authentication failed",
    });
  }
});
app.post("/admin/register", async (req, res) => {
  const { userName, email, password } = req.body;
  if (!userName || !email || !password) {
    return res.status(411).json({
      status: 1,
      message: "Please Enter all the fields",
    });
  }
  const existingAdmin = await Admin.findOne({ email });
  console.log(existingAdmin, "existingAdmin");
  if (existingAdmin) {
    res.status(200).json({
      status: 0,
      message: "Admin Email already exits",
    });
  }
  const newAdmin = {
    id: Math.floor(Math.random() * 900000) + 100000,
    userName,
    email,
    password,
  };
  await Admin.create(newAdmin);
  const token = generateAccessToken(email);
  res.status(200).json({
    status: 1,
    message: "Admin Signup Successfully",
    token,
  });
});

app.post("/user/register", async (req, res) => {
  const { userName, email, password } = req.body;
  if (!userName || !email || !password) {
    return res.status(411).json({
      status: "1",
      message: "Please enter all the fields",
    });
  }
  const existingUser = await User.findOne({ email });
  console.log(existingUser, "existingUser");
  if (existingUser) {
    return res.status(200).json({
      status: 0,
      message: "User Email already exits",
    });
  }
  const newUser = {
    id: Math.floor(Math.random() * 900000) + 100000,
    userName,
    email,
    password,
    purchasedCourse: [],
  };
  await User.create(newUser);
  const token = generateAccessToken(email);
  res.status(200).json({
    status: 1,
    message: "User Signup Successfully",
    token,
  });
});
// app.post("/admin/courses", adminAuthnetication, (req, res) => {
//   const course = req.body;
//   if (course) {
//     course.id = Date.now();

//     COURSES.push(course);
//     res.status(201).json({
//       status: 1,
//       message: "Courses Added Successfully",
//       courseId: course.id,
//     });
//   } else {
//     res.status(400).json({
//       status: 0,
//       message: "Please Enter all the fields",
//     });
//   }
// });
app.post("/admin/courses", authenticateToken, async (req, res) => {
  const userEmail = req.user;
  console.log(userEmail, "userEmail");

  //only admin can add courses
  const admin = await Admin.findOne({ email: userEmail });
  console.log(admin, "admin");
  if (!admin || admin.email !== userEmail) {
    return res.status(403).json({
      status: 0,
      message: "Forbidden",
    });
  }

  const course = req.body;
  if (course) {
    course.id = Date.now();

    await Course.create(course);
    res.status(201).json({
      status: 1,
      message: "Courses Added Successfully",
      courseId: course.id,
    });
  } else {
    res.status(400).json({
      status: 0,
      message: "Please Enter all the fields",
    });
  }
});
app.post("/admin/courses/:courseId", authenticateToken, async (req, res) => {
  const userEmail = req.user;
  console.log(userEmail, "userEmail");
  const admin = await Admin.findOne({ email: userEmail });
  if (!admin) {
    return res.status(403).json({
      status: 0,
      message: "Forbidden",
    });
  }
  const courseId = Number(req.params.courseId);
  const course = await Course.findById(courseId);

  if (course) {
    Object.assign(course, req.body);
    res.status(200).json({
      status: 1,
      message: "Course updated successfully",
    });
  } else {
    res.status(404).json({
      status: 1,
      message: "Course updated successfully",
    });
  }
});

app.get("/admin/courses", authenticateToken, async (req, res) => {
  const userEmail = req.user;
  console.log(userEmail, "userEmail");

  const admin = await Admin.findOne({ email: userEmail });
  //or you can craete a separate middleware for admin authentication and use it here
  if (!admin) {
    return res.status(403).json({
      status: 0,
      message: "Forbidden",
    });
  }

  res.status(200).json({
    status: 1,
    message: "Course fetched successfully",
    data: await Course.find(),
  });
});

app.get("/users/courses", authenticateToken, async (req, res) => {
  //User-->purchaseCourse
  let user = await User.findOne({ email: req.user });
  if (!user) {
    return res.status(403).json({
      status: 0,
      message: "Forbidden",
    });
  }
  console.log(user, "user");
  let purchaseCourse = user.purchasedCourse;
  console.log(purchaseCourse, "purchaseCourse");

  res.status(200).json({
    status: 1,
    message: "Course fetched successfully",
    data: purchaseCourse,
  });
});

app.post("/users/courses/:courseId", authenticateToken, async (req, res) => {
  const courseId = req.params.courseId; // courseId should be a string, not a number

  const user = await User.findOne({ email: req.user });

  if (!user) {
    return res.status(404).json({
      status: 0,
      message: "User not found",
    });
  }

  // Convert courseId to ObjectId
  const ObjectId = require("mongoose").Types.ObjectId;
  const courseObjectId = new ObjectId(courseId);

  // Check if the user has already purchased the course
  if (user.purchasedCourse.includes(courseObjectId)) {
    return res.status(200).json({
      status: 1,
      message: "Course already purchased",
    });
  }

  // Add the course ObjectId to the purchasedCourse array
  user.purchasedCourse.push(courseObjectId);
  await user.save();

  res.status(200).json({
    status: 1,
    message: "Course purchased successfully",
    courseId: courseId,
  });
});

app.get(
  "/users/courses/purchasedCourse",
  authenticateToken,
  async (req, res) => {
    try {
      const user = await User.findOne({ email: req.user });

      if (!user) {
        return res.status(404).json({
          status: 0,
          message: "User not found",
        });
      }

      const purchasedCourse = await Course.find({
        _id: {
          $in: user.purchasedCourse,
        },
      });

      console.log(purchasedCourse, "purchasedCourse");

      if (purchasedCourse.length > 0) {
        res.status(200).json({
          status: 1,
          message: "Purchased courses fetched successfully",
          data: purchasedCourse,
        });
      } else {
        res.status(404).json({
          status: 0,
          message: "No purchased courses found",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 0,
        message: "Internal Server Error",
      });
    }
  }
);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
