const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  if (!username) {
    return response.status(400).json({ error: 'Username not found in header' });
  }

  const user = users.find(u => u.username === username);
  if (!user) {
    return response.status(404).json({ error: 'User not found' });
  }

  request.user = user;

  return next();
}


app.post('/users', (request, response) => {
  const { name, username } = request.body;

  if (users.find(u => u.username === username)) {
    return response.status(400).json({ error: 'This username is already used' });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user)

  return response.status(201).json(user)
});

app.use(checksExistsUserAccount);

app.get('/todos', (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body
  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    created_at: new Date(),
    done: false,
  }
  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body

  user.todos = user.todos.map(todo => todo.id === id ? { ...todo, title, deadline: new Date(deadline) } : { ...todo });

  const updatedTodo = user.todos.find(todo => todo.id === id);

  if (!updatedTodo) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  return response.status(200).json(updatedTodo);
});

app.patch('/todos/:id/done', (request, response) => {
  const { user } = request;
  const { id } = request.params;

  user.todos = user.todos.map(todo => todo.id === id ? { ...todo, done: true } : { ...todo });

  const updatedTodo = user.todos.find(todo => todo.id === id);

  if (!updatedTodo) {
    return response.status(404).json({ error: 'Todo not found' });
  }

  return response.status(200).json(updatedTodo);
});

app.delete('/todos/:id', (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const index = user.todos.findIndex(todo => todo.id === id);

  if (index < 0) {
    return response.status(404).json({ error: 'Todo not found' });
  }
  user.todos.splice(index, 1);

  return response.status(204).send();
});

module.exports = app;