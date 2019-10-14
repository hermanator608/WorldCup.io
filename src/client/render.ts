// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#5-client-rendering
import { debounce } from 'throttle-debounce';

import Constants, { IGameObjectUpdate, IGameUpdate, IPlayerUpdate } from '../shared/constants';

import { getAsset } from './assets';
import { getCurrentState } from './state';

const { PLAYER_RADIUS, PLAYER_MAX_HP, BULLET_RADIUS, MAP_SIZE } = Constants;

// Get the canvas graphics context
const canvas: HTMLCanvasElement = document.getElementById('game-canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d')!;

const setCanvasDimensions = () => {
  // On small screens (e.g. phones), we want to "zoom out" so players can still see at least
  // 800 in-game units of width.
  // tslint:disable-next-line:no-magic-numbers
  const scaleRatio = Math.max(1, 800 / window.innerWidth);
  canvas.width = scaleRatio * window.innerWidth;
  canvas.height = scaleRatio * window.innerHeight;
};

setCanvasDimensions();

// tslint:disable-next-line:no-magic-numbers
window.addEventListener('resize', debounce(40, setCanvasDimensions));

const render: () => void = () => {
  const currentState: IGameUpdate | null = getCurrentState();
  if (!currentState) {
    return;
  }
  const { me, others, bullets } = currentState;

  // Draw background
  renderBackground(me.x, me.y);

  // Draw boundaries
  context.strokeStyle = 'black';
  context.lineWidth = 1;
  context.strokeRect(canvas.width / 2 - me.x, canvas.height / 2 - me.y, MAP_SIZE, MAP_SIZE);

  // Draw all bullets
  bullets.forEach(renderBullet.bind(null, me));

  // Draw all players
  renderPlayer(me, me);
  others.forEach(renderPlayer.bind(null, me));
};

const renderBackground = (x: number, y: number) => {
  const backgroundX = MAP_SIZE / 2 - x + canvas.width / 2;
  const backgroundY = MAP_SIZE / 2 - y + canvas.height / 2;
  const backgroundGradient = context.createRadialGradient(
    backgroundX,
    backgroundY,
    MAP_SIZE / 10,
    backgroundX,
    backgroundY,
    MAP_SIZE / 2,
  );
  backgroundGradient.addColorStop(0, 'black');
  backgroundGradient.addColorStop(1, 'gray');
  context.fillStyle = backgroundGradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
};

// Renders a ship at the given coordinates
const renderPlayer = (me: IPlayerUpdate, player: IPlayerUpdate) => {
  const { x, y, direction } = player;
  const canvasX = canvas.width / 2 + x - me.x;
  const canvasY = canvas.height / 2 + y - me.y;

  // Draw ship
  context.save();
  context.translate(canvasX, canvasY);
  context.rotate(direction);
  context.drawImage(getAsset('ship.svg'), -PLAYER_RADIUS, -PLAYER_RADIUS, PLAYER_RADIUS * 2, PLAYER_RADIUS * 2);
  context.restore();

  // tslint:disable:no-magic-numbers
  // Draw health bar
  context.fillStyle = 'white';
  context.fillRect(canvasX - PLAYER_RADIUS, canvasY + PLAYER_RADIUS + 8, PLAYER_RADIUS * 2, 2);
  context.fillStyle = 'red';
  context.fillRect(
    canvasX - PLAYER_RADIUS + (PLAYER_RADIUS * 2 * player.hp) / PLAYER_MAX_HP,
    canvasY + PLAYER_RADIUS + 8,
    PLAYER_RADIUS * 2 * (1 - player.hp / PLAYER_MAX_HP),
    2,
  );
};

const renderBullet = (me: IPlayerUpdate, bullet: IGameObjectUpdate) => {
  const { x, y } = bullet;
  context.drawImage(
    getAsset('bullet.svg'),
    canvas.width / 2 + x - me.x - BULLET_RADIUS,
    canvas.height / 2 + y - me.y - BULLET_RADIUS,
    BULLET_RADIUS * 2,
    BULLET_RADIUS * 2,
  );
};

const renderMainMenu = () => {
  // tslint:disable:no-magic-numbers binary-expression-operand-order
  const t = Date.now() / 7500;
  const x = MAP_SIZE / 2 + 800 * Math.cos(t);
  const y = MAP_SIZE / 2 + 800 * Math.sin(t);
  renderBackground(x, y);
};

let renderInterval = setInterval(renderMainMenu, 1000 / 60);

// Replaces main menu rendering with game rendering.
export const startRendering = () => {
  clearInterval(renderInterval);
  renderInterval = setInterval(render, 1000 / 60);
};

// Replaces game rendering with main menu rendering.
export const stopRendering = () => {
  clearInterval(renderInterval);
  renderInterval = setInterval(renderMainMenu, 1000 / 60);
};
// tslint:enable
