const User = require('../models/user');
const Exercise = require('../models/exercise');

const addUser = (req, res, next) => {
  const { username } = req.body;
  const newUser = new User({ username });
  return newUser.save()
    .then(user => {
      const { username, _id } = user;
      res.json({ username, _id });
    })
    .catch(err => {
      if (err.code === 11000) { // duplicate
        return next({
          status: 400,
          message: "Username already taken"
        });
      } else {
        return next(err);
      }
    });
}

const addExercise = (req, res, next) => {
  return User.findById(req.body.userId, (err, user) => {
    if (err) {
      return next(err);
    } else if (!user) {
      return next({
        status: 400,
        message: "User Id not found"
      });
    } else {
      const newExercise = new Exercise(req.body);
      newExercise.username = user.username;
      newExercise.date = newExercise.date || Date.now();
      return newExercise.save()
        .then(exercise => {
          exercise = exercise.toObject();
          exercise.date = exercise.date.toDateString();
          res.json(exercise);
        })
        .catch(err => next(err));
    }
  });
}

const getAllUsers = (req, res, next) => {
  User.find((err, users) => {
    if (err) return next(err);
    res.json(users);
  });
}

const log = (req, res, next) => {
  const { userId, from, to, limit } = req.query;
  
  if (!userId) {
    return next({
      status: 400,
      message: "No userId"
    });
  }

  User.findById(userId, (err, user) => {
    if (err) return next(err);

    if (!user) {
      return next({
        status: 400,
        message: "User Id not found"
      });
    }

    const query = { userId }
    query.date = {
      "$gt": from ? (new Date(from)).getTime() : 0,
      "$lt": to ? (new Date(to)).getTime() : Date.now()
    }

    Exercise
      .find(query, { __v: 0, _id: 0 })
      .sort('-date')
      .limit(parseInt(limit))
      .exec((err, exercises) => {
        if(err) return next(err);
        res.json(exercises);
      });
  });
}

module.exports = { addUser, addExercise, getAllUsers, log }

