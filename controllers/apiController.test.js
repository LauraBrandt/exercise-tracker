const User = require('../models/user');
const Exercise = require('../models/exercise');
const controller = require('./apiController');
 
describe('api', function() {
  describe('addUser', () => {
    let spySave;
    beforeEach(function() {
      spySave = jest.spyOn(User.prototype, 'save');
    });
   
    afterEach(function() {
      spySave.mockReset();
      spySave.mockRestore();
    });

    it('returns object with username and id on successful save', async () => {
      const req = {
        body: {
          username: "testuser"
        }
      }
      const res = {
        json: jest.fn()
      }
      const next = jest.fn();

      const expectedValue = {
        username: "testuser",
        _id: "12345"
      }

      spySave.mockResolvedValue(expectedValue);
      
      await controller.addUser(req, res, next);

      expect(res.json).toBeCalled();
      expect(res.json).toBeCalledWith(expectedValue);
    });

    it('calls next with custom error when save fails with duplicate key error', async () => {
      expect.assertions(1);

      const req = {
        body: {
          username: "testuser"
        }
      }
      const res = {
        json: jest.fn()
      }
      const next = jest.fn();

      spySave.mockRejectedValue({ code: 11000 });

      await controller.addUser(req, res, next);

      expect(next).toBeCalledWith({
        status: 400,
        message: "Username already taken"
      });
    });

    it('calls next with returned error when save fails with any other error', async () => {
      expect.assertions(1);

      const req = {
        body: { }
      }
      const res = {
        json: jest.fn()
      }
      const next = jest.fn();

      const expectedValue = { error: 'error' }

      spySave.mockRejectedValue(expectedValue);

      await controller.addUser(req, res, next);

      expect(next).toBeCalledWith(expectedValue);
    });
  });

  describe('addExercise', () => {
    let spyFindById;
    let spySave;
    beforeEach(function() {
      spyFindById = jest.spyOn(User, 'findById');
      spySave = jest.spyOn(Exercise.prototype, 'save');
      Date.now = jest.fn();
    });
   
    afterEach(function() {
      spyFindById.mockReset();
      spyFindById.mockRestore();
      spySave.mockReset();
      spySave.mockRestore();
      Date.now.mockRestore();
    });

    it('returns error if mongoose error finding user', () => {
      const req = { body: {userId: 1} }
      const res = { json: jest.fn() }
      const next = jest.fn();

      const expectedError = { error: 'error' }

      spyFindById.mockImplementation((id, callback) => callback(expectedError, null));
      
      controller.addExercise(req, res, next);

      expect(next).toBeCalledWith(expectedError);
    });

    it('returns custom error if no user found', () => {
      const req = { body: {userId: 1} }
      const res = { json: jest.fn() }
      const next = jest.fn();

      const expectedError = { 
        status: 400,
        message: "User Id not found"
      }

      spyFindById.mockImplementation((id, callback) => callback(null, null));
      
      controller.addExercise(req, res, next);

      expect(next).toBeCalledWith(expectedError);
    });

    it('saves correct exercise and returns the saved exercise with date formatted', async () => {
      expect.assertions(4)
      const req = { 
        body: {
          userId: '1',
          description: 'a',
          duration: 10,
          date: '2018-01-01'
        } 
      }
      const res = { 
        json: jest.fn()
      }
      const next = jest.fn();

      const user = {
        username: 'x',
        _id: 1
      }

      const expectedExercise = new Exercise({
        ...req.body,
        username: user.username,
        date: new Date(req.body.date)
      });
      const { _id, ...expectedExerciseObject } = expectedExercise.toJSON();

      spyFindById.mockImplementation((id, callback) => callback(null, user));
      spySave.mockResolvedValue(expectedExercise);
      
      await controller.addExercise(req, res, next);

      expect(spySave).toBeCalled();

      const saveCall = Exercise.prototype.save.mock.instances[0].toJSON();
      expect(saveCall).toMatchObject(expectedExerciseObject);

      expect(res.json).toBeCalled();
      expect(res.json.mock.calls[0][0]).toMatchObject({
        ...expectedExerciseObject,
        date: expectedExerciseObject.date.toDateString()
      });
    });

    it('assigns current date if no date specified', async () => {
      expect.assertions(1)

      const req = { 
        body: {
          userId: '1',
          description: 'a',
          duration: 10
        } 
      }
      const res = { 
        json: jest.fn()
      }
      const next = jest.fn();

      const user = {
        username: 'x',
        _id: 1
      }

      const expectedExercise = new Exercise({
        ...req.body,
        username: user.username,
        date: Date.now()
      });
      
      spyFindById.mockImplementation((id, callback) => callback(null, user));
      spySave.mockResolvedValue(expectedExercise);

      await controller.addExercise(req, res, next);

      const saveCall = Exercise.prototype.save.mock.instances[0].toJSON();
      expect(saveCall.date).toEqual(expectedExercise.date);
    });

    it('calls next with returned error when exercise save fails', async () => {
      expect.assertions(1);

      const req = { 
        body: {
          userId: '1',
          description: 'a',
          duration: 10,
          date: '2018-01-01'
        } 
      }
      const res = { 
        json: jest.fn()
      }
      const next = jest.fn();

      const user = {
        username: 'x',
        _id: 1
      }

      const expectedError = { error: 'error' }

      spyFindById.mockImplementation((id, callback) => callback(null, user));
      spySave.mockRejectedValue(expectedError);
      
      await controller.addExercise(req, res, next);

      expect(next).toBeCalledWith(expectedError);
    });
  });

  describe('getAllUsers', () => {
    let spyFind;
    beforeEach(function() {
      spyFind = jest.spyOn(User, 'find');
    });
   
    afterEach(function() {
      spyFind.mockReset();
      spyFind.mockRestore();
    });

    it('returns json of all the users on success', () => {
      const req = { }
      const res = { json: jest.fn() }
      const next = jest.fn();

      const users = [
        {username: 'a', _id: 1},
        {username: 'b', _id: 2}
      ]

      spyFind.mockImplementation(callback => callback(null, users));

      controller.getAllUsers(req, res, next);

      expect(res.json).toBeCalled();
      expect(res.json).toBeCalledWith(users);
    });

    it('calls next with returned error on failed find', () => {
      const req = { }
      const res = { json: jest.fn() }
      const next = jest.fn();

      const users = [
        {username: 'a', _id: 1},
        {username: 'b', _id: 2}
      ]

      const err = {
        error: 'error'
      }

      spyFind.mockImplementation(callback => callback(err, users));

      controller.getAllUsers(req, res, next);

      expect(next).toBeCalled();
      expect(next).toBeCalledWith(err);
    });
  });

  describe('log', () => {
    let spyFindById;
    let spyFind;
    let spySort;
    let spyLimit;
    let spyExec;
    beforeEach(function() {
      spyFindById = jest.spyOn(User, 'findById');
      spyFind = jest.spyOn(Exercise, 'find');
      spySort = jest.spyOn(Exercise.Query.prototype, 'sort');
      spyLimit = jest.spyOn(Exercise.Query.prototype, 'limit');
      spyExec = jest.spyOn(Exercise.Query.prototype, 'exec');
      Date.now = jest.fn();
    });
   
    afterEach(function() {
      spyFindById.mockReset();
      spyFindById.mockRestore();
      spyFind.mockReset();
      spyFind.mockRestore();
      spySort.mockReset();
      spySort.mockRestore();
      spyLimit.mockReset();
      spyLimit.mockRestore();
      spyExec.mockReset();
      spyExec.mockRestore();
      Date.now.mockRestore();
    });

    it('returns next with custom error if no user id send', () => {
      const req = { query: { } }
      const res = { }
      const next = jest.fn();

      const expectedError = { 
        status: 400,
        message: "No userId"
      }

      controller.log(req, res, next);

      expect(next).toBeCalledWith(expectedError);
    });

    it('returns next with error if User.findById returns error', () => {
      const req = { query: { userId: '1' } }
      const res = { }
      const next = jest.fn();

      const expectedError = { error: 'error' }

      spyFindById.mockImplementation((id, callback) => callback(expectedError, null));

      controller.log(req, res, next);

      expect(next).toBeCalledWith(expectedError);
    });

    it('returns next with custom error if no user found for given id', () => {
      const req = { query: { userId: '1' } }
      const res = { }
      const next = jest.fn();

      const expectedError = { 
        status: 400,
        message: "User Id not found"
      }

      spyFindById.mockImplementation((id, callback) => callback(null, null));

      controller.log(req, res, next);

      expect(next).toBeCalledWith(expectedError);
    });

    it('uses default from and to dates if none sent', () => {
      const req = { 
        query: { 
          userId: '1' 
        } 
      }
      const res = { }
      const next = jest.fn();

      const user = { 
        username: 'test',
        userId: '1'
      }

      const expectedQuery = {
        userId: user.userId,
        date: {
          "$gt": 0,
          "$lt": Date.now()
        }
      }

      spyFindById.mockImplementation((id, callback) => callback(null, user));

      controller.log(req, res, next);

      expect(spyFind.mock.calls[0][0]).toEqual(expectedQuery);
    });

    it('uses from and to dates from req if sent', () => {
      const req = { 
        query: { 
          userId: '1',
          from: '2018-01-02',
          to: '2018-07-02'
        } 
      }
      const res = { }
      const next = jest.fn();

      const user = { 
        username: 'test',
        userId: '1'
      }

      const expectedQuery = {
        userId: user.userId,
        date: {
          "$gt": new Date(req.query.from).getTime(),
          "$lt": new Date(req.query.to).getTime()
        }
      }

      spyFindById.mockImplementation((id, callback) => callback(null, user));

      controller.log(req, res, next);

      expect(spyFind.mock.calls[0][0]).toEqual(expectedQuery);
    });

    it('uses limit if sent', done => {
      expect.assertions(1);

      const req = { 
        query: { 
          userId: '1',
          limit: 3
        } 
      }
      const res = { json: jest.fn() }
      const next = jest.fn();

      const user = { 
        username: 'test',
        userId: '1'
      }

      spyFindById.mockImplementation((id, callback) => callback(null, user));

      spyExec.mockImplementation(callback => {
        callback(null, {});
        done();
      });

      controller.log(req, res, next);

      expect(spyLimit).toBeCalledWith(3);
    });

    it('calls next with error if Exercise query.exec fails', done => {
      expect.assertions(1);

      const req = { 
        query: { 
          userId: '1'
        } 
      }
      const res = { json: jest.fn() }
      const next = jest.fn();

      const user = { 
        username: 'test',
        userId: '1'
      }

      const expectedError = { error: 'error' }

      spyFindById.mockImplementation((id, callback) => callback(null, user));

      spyExec.mockImplementation(callback => {
        callback(expectedError, null);
        done();
      });

      controller.log(req, res, next);

      expect(next).toBeCalledWith(expectedError);
    });

    it('returns the exercises on success', done => {
      expect.assertions(1);

      const req = { 
        query: { 
          userId: '1'
        } 
      }
      const res = { json: jest.fn() }
      const next = jest.fn();

      const user = { 
        username: 'test',
        userId: '1'
      }

      const exercises = [
        {
          username: 'test',
          userId: '1', 
          description: 'a',
        },
        {
          username: 'test',
          userId: '1', 
          description: 'b',
        }
      ]

      spyFindById.mockImplementation((id, callback) => callback(null, user));

      spyExec.mockImplementation(callback => {
        callback(null, exercises);
        done();
      });

      controller.log(req, res, next);

      expect(res.json).toBeCalledWith(exercises);
    });
  });
});