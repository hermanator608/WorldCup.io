import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import socketio, { Socket } from 'socket.io';

import Constants from '../shared/constants';
import webpackConfig from '../../webpack.dev';

import Game from './game';

// Setup an Express server
const app = express();
app.use(express.static('public'));

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  // Setup Webpack for development
  const compiler = webpack(webpackConfig);
  // tslint:disable-next-line:no-any
  app.use(webpackDevMiddleware(compiler as any));
} else {
  // Static serve the dist/ folder in production
  app.use(express.static('dist'));
}

// Listen on port
// tslint:disable-next-line:no-magic-numbers
const port = process.env.PORT || 3000;
const server = app.listen(port);
console.log(`Server listening on port ${port}`);

// Setup socket.io
const io: socketio.Server = socketio(server);

// Listen for socket.io connections
io.on('connection', socket => {
  console.log('Player connected!', socket.id);

  socket.on(Constants.MSG_TYPES.JOIN_GAME, joinGame);
  socket.on(Constants.MSG_TYPES.INPUT, handleInput);
  socket.on('disconnect', onDisconnect);
});

// Setup the Game
const game: Game = new Game();

const joinGame: (socket: Socket, username: string) => void = (socket, username) => {
  game.addPlayer(socket, username);
};

const handleInput: (socket: Socket, dir: number) => void = (socket, dir) => {
  game.handleInput(socket, dir);
};

const onDisconnect: (socket: Socket) => void = socket => {
  game.removePlayer(socket);
};
