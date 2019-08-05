import App from './App.svelte';
const app = new App({
	target: document.getElementById('app'),
	props: {
		name: 'blue'
	}
});
export default app;
