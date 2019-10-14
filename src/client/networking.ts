// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#4-client-networking
import io from 'socket.io-client';
import { throttle } from 'throttle-debounce';
import { Socket } from 'socket.io';

import Constants from '../shared/constants';

import { processGameUpdate } from './state';
import { OnGameOverFn } from './common';

const socket: Socket = io(`ws://${window.location.host}`, { reconnection: false });
const connectedPromise = new Promise<void>(resolve => {
  socket.on('connect', () => {
    console.log('Connected to server!');
    resolve();
  });
});

export const connect: (onGameOver: OnGameOverFn) => void = onGameOver =>
  connectedPromise.then(() => {
    // Register callbacks
    socket.on(Constants.MSG_TYPES.GAME_UPDATE, processGameUpdate);
    socket.on(Constants.MSG_TYPES.GAME_OVER, onGameOver);
    socket.on('disconnect', () => {
      console.log('Disconnected from server.');
      document.getElementById('disconnect-modal')!.classList
        .remove('hidden');
      document.getElementById('reconnect-button')!.onclick = () => {
        window.location.reload();
      };
    });
  });

export const play: (username: string) => void = username => {
  socket.emit(Constants.MSG_TYPES.JOIN_GAME, username);
};

export const updateDirection: (dir: number) => throttle<() => void> = dir =>
  // tslint:disable-next-line:no-magic-numbers
  throttle(20, () => socket.emit(Constants.MSG_TYPES.INPUT, dir));
