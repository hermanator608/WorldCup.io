// I'm using Bootstrap here for convenience, but I wouldn't recommend actually doing this for a real
// site. It's heavy and will slow down your site - either only use a subset of Bootstrap, or just
// write your own CSS.
// tslint:disable-next-line:no-submodule-imports no-import-side-effect
import 'bootstrap/dist/css/bootstrap.min.css';

import { connect, play } from './networking';
import { startRendering, stopRendering } from './render';
import { startCapturingInput, stopCapturingInput } from './input';
import { downloadAssets } from './assets';
import { initState } from './state';
import { setLeaderboardHidden } from './leaderboard';
// tslint:disable-next-line:no-import-side-effect
import './css/main.css';
import { OnGameOverFn } from './common';

// tslint:disable-next-line:no-non-null-assertion
const playMenu = document.getElementById('play-menu')!;
// tslint:disable-next-line:no-non-null-assertion
const playButton = document.getElementById('play-button')!;
const usernameInput: HTMLInputElement = document.getElementById('username-input') as HTMLInputElement;

const onGameOver: OnGameOverFn = () => {
  stopCapturingInput();
  stopRendering();
  playMenu.classList.remove('hidden');
  setLeaderboardHidden(true);
};

Promise.all([connect(onGameOver), downloadAssets()])
  .then(() => {
    playMenu.classList.remove('hidden');
    usernameInput.focus();
    playButton.onclick = () => {
      // Play!
      play(usernameInput.value);
      playMenu.classList.add('hidden');
      initState();
      startCapturingInput();
      startRendering();
      setLeaderboardHidden(false);
    };
  })
  .catch(console.error);
