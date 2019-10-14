// Learn more about this file at:
// https://victorzhou.com/blog/build-an-io-game-part-1/#7-client-state
import { IGameObjectUpdate, IGameUpdate, IPlayerUpdate } from '../shared/constants';

import { updateLeaderboard } from './leaderboard';

// The "current" state will always be RENDER_DELAY ms behind server time.
// This makes gameplay smoother and lag less noticeable.
const RENDER_DELAY = 100;

const gameUpdates: IGameUpdate[] = [];
let gameStart = 0;
let firstServerTimestamp = 0;

export const initState: () => void = () => {
  gameStart = 0;
  firstServerTimestamp = 0;
};

export const processGameUpdate: (update: IGameUpdate) => void = update => {
  if (!firstServerTimestamp) {
    firstServerTimestamp = update.t;
    gameStart = Date.now();
  }
  gameUpdates.push(update);

  updateLeaderboard(update.leaderboard);

  // Keep only one game update before the current server time
  const base = getBaseUpdateIndex();
  if (base > 0) {
    gameUpdates.splice(0, base);
  }
};

const currentServerTime: () => number = () => firstServerTimestamp + (Date.now() - gameStart) - RENDER_DELAY;

// Returns the index of the base update, the first game update before
// current server time, or -1 if N/A.
const getBaseUpdateIndex: () => number = () => {
  const serverTime = currentServerTime();
  for (let i = gameUpdates.length - 1; i >= 0; i--) {
    if (gameUpdates[i].t <= serverTime) {
      return i;
    }
  }

  return -1;
};

// Returns { me, others, bullets }
export const getCurrentState: () => IGameUpdate | null = () => {
  if (!firstServerTimestamp) {
    return null;
  }

  const base: number = getBaseUpdateIndex();
  const serverTime = currentServerTime();

  // If base is the most recent update we have, use its state.
  // Otherwise, interpolate between its state and the state of (base + 1).
  if (base < 0 || base === gameUpdates.length - 1) {
    return gameUpdates[gameUpdates.length - 1];
  } else {
    const baseUpdate = gameUpdates[base];
    const next = gameUpdates[base + 1];
    const ratio = (serverTime - baseUpdate.t) / (next.t - baseUpdate.t);

    return {
      t: next.t,
      me: interpolatePlayerObject({ obj1: baseUpdate.me, obj2: next.me, ratio }),
      others: interpolatePlayerArray({ objs1: baseUpdate.others, objs2: next.others, ratio }),
      bullets: interpolateObjectArray({ objs1: baseUpdate.bullets, objs2: next.bullets, ratio }),
      leaderboard: next.leaderboard
    };
  }
};

interface IIterpolateObject {
  obj1: IGameObjectUpdate;
  obj2?: IGameObjectUpdate;
  ratio: number;
}

const interpolateObject: (info: IIterpolateObject) => IGameObjectUpdate = ({
  obj1,
  obj2,
  ratio
}) => {
  if (!obj2) {
    return obj1;
  }

  return {
    id: obj2.id,
    x: obj1.x + (obj2.x - obj1.x) * ratio,
    y: obj1.y + (obj2.y - obj1.y) * ratio,
    direction: interpolateDirection(obj1.direction, obj2.direction, ratio),
  };
};

interface IIterpolateObjectArray {
  objs1: IGameObjectUpdate[];
  objs2?: IGameObjectUpdate[];
  ratio: number;
}

const interpolateObjectArray: (info: IIterpolateObjectArray) => IGameObjectUpdate[] = ({
  objs1,
  objs2,
  ratio
}) => {
  if (!objs2) {
    return objs1;
  }

  return objs1.map(o => interpolateObject({ obj1: o, obj2: objs2.find(o2 => o.id === o2.id), ratio }));
};

interface IIterpolatePlayerObject {
  obj1: IPlayerUpdate;
  obj2?: IPlayerUpdate;
  ratio: number;
}

const interpolatePlayerObject: (info: IIterpolatePlayerObject) => IPlayerUpdate = ({
  obj1,
  obj2,
  ratio
}) => {
  if (!obj2) {
    return obj1;
  }

  return {
    id: obj2.id,
    x: obj1.x + (obj2.x - obj1.x) * ratio,
    y: obj1.y + (obj2.y - obj1.y) * ratio,
    direction: interpolateDirection(obj1.direction, obj2.direction, ratio),
    hp: obj2.hp
  };
};

interface IInterpolatePlayerArray {
  objs1: IPlayerUpdate[];
  objs2?: IPlayerUpdate[];
  ratio: number;
}

const interpolatePlayerArray: (info: IInterpolatePlayerArray) => IPlayerUpdate[] = ({
  objs1,
  objs2,
  ratio
}) => {
  if (!objs2) {
    return objs1;
  }

  return objs1.map(o => interpolatePlayerObject({ obj1: o, obj2: objs2.find(o2 => o.id === o2.id), ratio }));
};

// Determines the best way to rotate (cw or ccw) when interpolating a direction.
// For example, when rotating from -3 radians to +3 radians, we should really rotate from
// -3 radians to +3 - 2pi radians.
const interpolateDirection: (d1: number, d2: number, ratio: number) => number = (d1, d2, ratio) => {
  const absD = Math.abs(d2 - d1);
  if (absD >= Math.PI) {
    // The angle between the directions is large - we should rotate the other way
    if (d1 > d2) {
      // tslint:disable-next-line:binary-expression-operand-order
      return d1 + (d2 + 2 * Math.PI - d1) * ratio;
    } else {
      // tslint:disable-next-line:binary-expression-operand-order
      return d1 - (d2 - 2 * Math.PI - d1) * ratio;
    }
  } else {
    // Normal interp
    return d1 + (d2 - d1) * ratio;
  }
};
