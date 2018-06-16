const router = require('express').Router();
const controller = require('../controllers/apiController');

router.post('/exercise/new-user', controller.addUser);

router.post('/exercise/add', controller.addExercise);

router.get('/exercise/log', controller.log);

router.get('/exercise/users', controller.getAllUsers);

module.exports = router;
