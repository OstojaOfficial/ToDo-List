import express, { Express } from 'express';
import * as dotenv from 'dotenv';
import * as path from 'path';
import mongoose from 'mongoose';
import * as fs from 'fs'; 
import Task from './models/task';
import swaggerDocs from './utils/swagger';

dotenv.config();

const app: Express = express();

interface ENV {
  port: number | undefined;
  mongo_url: string | undefined;
  mongo_db: string | undefined;
  public_url: string | undefined;
}

interface config {
  port: number;
  mongo_url: string;
  mongo_db: string;
  public_url: string;
}

const getConfig = (): ENV => {
  return {
    port: process.env.SERVER_PORT ? Number(process.env.SERVER_PORT ) : undefined,
    mongo_url: process.env.MONGO_URL,
    mongo_db: process.env.MONGO_DB,
    public_url: process.env.PUBLIC_URL
  }
}

const config = getConfig();

const data = `{
  "public_url": "${config.public_url}"
}`;

fs.writeFile('dist/public/js/appconfig.json', data, (err) => {
  if (err) {
    throw err
  }
});

mongoose.set('strictQuery', false);
mongoose.connect(`${config.mongo_url as string}/${config.mongo_db as string}`);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log("Connected successfully");
  app.listen(config.port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${config.port}`);
    swaggerDocs(app, config.port);
  });
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/jquery', express.static(path.join(__dirname, '../node_modules/jquery/dist/')));
app.use('/bootstrap', express.static(path.join(__dirname, '../node_modules/bootstrap/dist/')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

/**
 * @openapi
 * /api/add:
 *  post:
 *    description: Adds new task.
 *    parameters:
 *      - name: title
 *        in: query
 *        description: Title of the task.
 *        required: true
 *      - name: token
 *        in: query
 *        description: User's secret token.
 *        required: true
 *      - name: expire
 *        in: query
 *        description: Date and time when does the task expire presented in UNIX timestamp in seconds.
 *        required: true
 *    tags:
 *      - Tasks
 *    produces:
 *      - application/json
 *    response:
 *      200:
 *        description: Sends back added data.
 */
app.post('/api/add', (req, res) => {
  const data = new Task ({
    _id: new mongoose.Types.ObjectId(),
    title: req.query.title as string,
    token: req.query.token as string,
    expire: parseInt(req.query.expire as string)
});

  return data
    .save()
    .then((data) => res.status(201).json({ data }))
    .catch((error) => res.status(500).json({ error }));
});

/**
 * @openapi
 * /api/upadate/{taskid}:
 *  patch:
 *    description: Updates existing task.
 *    parameters:
 *      - name: taskid
 *        in: path
 *        description: ID of the task.
 *        required: true
 *    tags:
 *      - Tasks
 *    produces:
 *      - application/json
 *    response:
 *      200:
 *        description: Retrieves updated data.
 */
app.patch('/api/update/:id', (req, res) => {
  const id: string = req.params.id;

  return Task.findById(id)
    .then((task) => {
      if (task) {
        const data = {
          title: req.query.title as string,
          expire: parseInt(req.query.expire as string)
        }
        task.set(data);
        return task
          .save()
          .then((task) => res.status(201).json({ task }))
          .catch((error) => res.status(500).json({ error }));
      } else {
        return res.status(404).json({ message: 'task not found' });
      }
    })
    .catch((error) => res.status(500).json({ error }));
});

/**
 * @openapi
 * /api/delete/{taskid}:
 *  delete:
 *    description: Deletes existing task.
 *    parameters:
 *      - name: taskid
 *        in: path
 *        description: ID of the task.
 *        required: true
 *    tags:
 *      - Tasks
 *    produces:
 *      - application/json
 *    response:
 *      200:
 *        description: OK
 */
app.delete('/api/delete/:id', (req, res) => {
  const id = req.params.id;

  return Task.findByIdAndDelete(id)
    .then((task) => (task ? res.status(201).json({ task, message: 'Deleted' }) : res.status(404).json({ message: 'task not found' })))
    .catch((error) => res.status(500).json({ error }));
});

/**
 * @openapi
 * /api/get/{taskid}:
 *  get:
 *    description: Retreives data of the specific task in JSON format.
 *    parameters:
 *      - name: taskid
 *        in: path
 *        description: ID of the task.
 *        required: true
 *    tags:
 *      - Tasks
 *    produces:
 *      - application/json
 *    response:
 *      200:
 *        description: Retreives data of the specific task in JSON format.
 */
app.get('/api/get/:id', (req, res) => {
  const id: string = req.params.id;

  return Task.findById(id)
    .then((task) => (task ? res.status(200).json({ task }) : res.status(404).json({ message: 'task not found' })))
    .catch((error) => res.status(500).json({ error }));
});

/**
 * @openapi
 * /api/get/list:
 *  get:
 *    description: Retreives all tasks of the user.
 *    parameters:
 *      - name: token
 *        in: query
 *        description: User's secret token.
 *        required: true
 *    tags:
 *      - Tasks
 *    produces:
 *      - application/json
 *    response:
 *      200:
 *        description: OK
 */
app.get('/api/list', (req, res) => {
  const token: string = req.query.token as string;

  return Task.find({ token: token })
    .then((tasks) => res.status(200).json({ tasks }))
    .catch((error) => res.status(500).json({ error }));
});

/**
 * @openapi
 * /api/health:
 *  get:
 *    description: Responds if the app is up and running.
 *    tags:
 *      - Health check
 *    produces:
 *      - application/json
 *    response:
 *      200:
 *        description: OK.
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({ "status": "OK" });
});