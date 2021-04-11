<script lang="ts">
  import { onDestroy } from 'svelte';
  import RouterView from '@spaceavocado/svelte-router/component/view';
  import { auth, authProvider } from "../firebase/firebase";
  import { loggedInUser } from '../utils/store';


  export let route;
  let loggedIn = false;
	onDestroy(loggedInUser.subscribe(user => {
    if(user != null) {
      if(user.user == null) {
        loggedIn = false;
        auth.signInWithRedirect(authProvider);
      } else if(user.user != null) {
        loggedIn = true;
      }
    }
	}));
</script>
<div class="main">
  {#if loggedIn}
  <RouterView/>
  {/if}
</div>
<style>
  div.main {
    position: absolute;
    top: 0px;
    bottom: 0px;
    left: 0px;
    right: 0px;
  }
</style>