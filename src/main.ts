import App from './App.svelte';

window.screen.lockOrientationUniversal = window.screen.lockOrientation || window.screen.mozLockOrientation || screen.msLockOrientation;

const app = new App({
	target: document.body,
});

export default app;