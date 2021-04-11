<script lang="ts">
import createRouter from '@spaceavocado/svelte-router';
import RouterView from '@spaceavocado/svelte-router/component/view';
import Contacts from './components/Contacts.svelte';
import Habits from './components/Habits.svelte';
import IntegrityList from './components/IntegrityList.svelte';
import Journal from './components/Journal.svelte';
import Main from "./components/Main.svelte";
import Settings from './components/Settings.svelte';
import StartPage from './components/StartPage.svelte';
import Wins from './components/Wins.svelte';
	// Create the routes
	createRouter({
		routes: [
			{ 
				// This is the main/default/root route
				path: '/',
				name: 'Root',
				component: Main,
				children:[
					{ 
						// This is the main/default/root route
						path: '/',
						name: 'Home',
						component: StartPage,
					},
					{
						path: '/wins',
						name: 'Wins',
						component: Wins,
					},
					{
						path: '/journal',
						name: 'Journal',
						component: Journal,
						props: {
							name: "Journal",
							key: "journal",
							image: "/images/journal.png"
						}
					},
					{
						path: '/anger',
						name: 'Anger',
						component: Journal,
						props: {
							name: "Anger",
							key: "anger",
							image: "/images/anger.png"
						}
					},
					{
						path: '/integrity',
						name: 'Integrity',
						component: IntegrityList
					},
					{
						path: '/habits',
						name: 'Habits',
						component: Habits
					},
					{
						path: '/contacts',
						name: 'Contacts',
						component: Contacts
					},
					{
						path: '/settings',
						name: 'Settings',
						component: Settings,
					}
				]
			},
		]
	});

</script>
<main>
	<!--Component to interpret the route base on the route configuration and display the correct element -->
	<RouterView/>
</main>

<style>
	main {
		height: 100vh;
		text-align: center;
		margin: 0 auto;
	}
</style>