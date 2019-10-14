import { updateDirection } from './networking';

const onMouseInput: (e: MouseEvent) => void = e => {
  handleInput(e.clientX, e.clientY);
};

const onTouchInput: (e: TouchEvent) => void = e => {
  const touch = e.touches[0];
  handleInput(touch.clientX, touch.clientY);
};

const handleInput: (x: number, y: number) => void = (x, y) => {
  const dir: number = Math.atan2(x - window.innerWidth / 2, window.innerHeight / 2 - y);
  updateDirection(dir);
};

export const startCapturingInput: () => void = () => {
  window.addEventListener('mousemove', onMouseInput);
  window.addEventListener('click', onMouseInput);
  window.addEventListener('touchstart', onTouchInput);
  window.addEventListener('touchmove', onTouchInput);
};

export const stopCapturingInput: () => void = () => {
  window.removeEventListener('mousemove', onMouseInput);
  window.removeEventListener('click', onMouseInput);
  window.removeEventListener('touchstart', onTouchInput);
  window.removeEventListener('touchmove', onTouchInput);
};
