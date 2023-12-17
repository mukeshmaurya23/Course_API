const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();

//5 type of middleware
/**
 * 1)Application level middleware that has applied on Overall application
 * 2)Route level middleware --> where we can use it for protected routes ex to access admin route first verify
 * 3)Built in middleware -->eg express.json
 * 4)Error handling middleware
 * 5)Third part middleware eg cors app.use(cors())
 */

const adminAuthnetication = (req, res, next) => {
  const { email, password } = req.headers;

  const admin = ADMIN.find(
    (isAdmin) => isAdmin.email === email && isAdmin.password === password
  );

  if (admin) {
    // Authentication successful, continue on to the next middleware
    return next();
  } else {
    // Authentication failed, send a response and end the request-response cycle
    return res.status(403).json({
      status: 0,
      message: "Admin Authentication Failed",
    });
  }
};
const userAuthentication = (req, res, next) => {
  const { email, password } = req.headers;
  const user = USER.find(
    (isUser) => isUser.email == email && isUser.password == password
  );
  if (user) {
    req.user = user;
    return next();
  } else {
    return res.status(403).json({
      status: 0,
      message: "User Authentication failed",
    });
  }
};

//register middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

const PORT = 8000;

//In memory data
const ADMIN = [];
const USER = [];
const COURSES = [];

console.log(ADMIN, "admin");
console.log(USER, "user");
console.log(COURSES, "course");

app.get("/", (req, res) => {
  res.status(200).send({ message: "Welcome to the course app" });
});

app.post("/admin/login", adminAuthnetication, (req, res) => {
  res.status(200).json({
    status: 1,
    message: "Admin Login SuccessFully",
  });
});

app.post("/user/login", userAuthentication, (req, res) => {
  res.status(200).json({
    status: 1,
    message: "User Login SuccessFully",
  });
});
app.post("/admin/register", (req, res) => {
  const { userName, email, password } = req.body;
  if (!userName || !email || !password) {
    return res.status(411).json({
      status: 1,
      message: "Please Enter all the fields",
    });
  }
  const existingAdmin = ADMIN.find((isAdmin) => isAdmin.email == email);
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
  ADMIN.push(newAdmin);
  res.status(200).json({
    status: 1,
    message: "Admin Signup Successfully",
  });
});

app.post("/user/register", (req, res) => {
  const { userName, email, password } = req.body;
  if (!userName || !email || !password) {
    return res.status(411).json({
      status: "1",
      message: "Please enter all the fields",
    });
  }
  const existingUser = USER.find((isUser) => isUser.email == email);
  if (existingUser) {
    res.status(200).json({
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
  USER.push(newUser);
  res.status(200).json({
    status: 1,
    message: "User Signup Successfully",
  });
});
app.post("/admin/courses", adminAuthnetication, (req, res) => {
  const course = req.body;
  if (course) {
    course.id = Date.now();

    COURSES.push(course);
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
app.post("/admin/courses/:courseId", adminAuthnetication, (req, res) => {
  const courseId = Number(req.params.courseId);
  const course = COURSES.find((course) => course.id === courseId);
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

app.get("/admin/courses", adminAuthnetication, (req, res) => {
  res.status(200).json({
    status: 1,
    message: "Course fetched successfully",
    data: COURSES,
  });
});

app.get("/users/courses", userAuthentication, (req, res) => {
  res.status(200).json({
    status: 1,
    message: "Course fetched successfully",
    data: COURSES.filter((course) => course.published),
  });
});

app.post("/users/courses/:courseId", userAuthentication, (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const courses = COURSES.find(
    (course) => course.id === courseId && course.published
  );
  if (courses) {
    req.user.purchasedCourse.push(courseId);
    res.status(200).json({
      status: 1,
      message: "Course purchased successfully",
      data: courseId,
    });
  } else {
    res.status(404).json({
      status: 0,
      message: "Course Not found",
    });
  }
});
app.get("/users/courses/purchasedCourse", userAuthentication, (req, res) => {
  const purchasedCourse = COURSES.filter((c) =>
    req.user.purchasedCourse.includes(c.id)
  );
  if (purchasedCourse) {
    res.status(200).json({
      status: 1,
      message: "purchased course fetched successfully",
      data: purchasedCourse,
    });
  } else {
    res.status(404).json({
      status: 0,
      message: "No Purchased course found",
    });
  }
});
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
