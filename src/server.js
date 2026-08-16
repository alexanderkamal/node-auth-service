const express = require('express')

const dotenv = require('dotenv');
dotenv.config();

const userRoutes = require('./app/user/routes.js');
const app = express()
app.use(express.json());

const correlationIdMiddleware = require('./common/correlation/correlationId.js');
app.use(correlationIdMiddleware);

const errorHandler = require('./common/error/errorHandler.js');

const port = 8000

app.use('/users', userRoutes);

app.use(errorHandler);

app.listen(port, () => {console.log(`Server started on port ${port}`)})