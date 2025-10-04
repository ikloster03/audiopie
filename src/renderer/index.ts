import { initApp } from './ui/app';

document.addEventListener('DOMContentLoaded', () => {
  initApp().catch((error) => {
    console.error('Failed to initialize AudioPie', error);
  });
});
