<script lang="ts">
  import {
    Navbar,
    NavbarBrand,
    Nav,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    NavLink
  } from 'sveltestrap';
  import RouterLink from '@spaceavocado/svelte-router/component/link';
  import {router} from '@spaceavocado/svelte-router';
  import { auth, loggedInUser } from '../util/firebase';

  let user;

  loggedInUser.subscribe(aUser => {
    if(aUser != null) {
      user = aUser.user;
    }
  });

  function navigateTo(routeName) {
    $router.push({name: routeName});
  }

  function signOut() {
    auth.signOut();
  }
</script>

<Navbar color="info" dark expand="xs">
  <NavbarBrand on:click={() => navigateTo("Home")}>Svelte Bootstrap Firebase</NavbarBrand>
  <Nav nav inNavbar class="ml-left">
    <NavLink
      on:click={() => navigateTo("Page1")}
      >Page1</NavLink>
    <NavLink 
      on:click={() => navigateTo("Page2")}
      >Page2</NavLink>
  </Nav>
  <Nav class="ml-auto" navbar>
    <UncontrolledDropdown>
      <DropdownToggle color="info" nav dark caret>{user?.displayName}</DropdownToggle>
      <DropdownMenu right>
        <DropdownItem>Option 1</DropdownItem>
        <DropdownItem divider />
        <DropdownItem on:click={signOut}>Signout</DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>
    </Nav>
</Navbar>

<style>
  :global(.nav > a) {
    color: rgba(255,255,255,.5);
  }
  :global(.nav > a:hover) {
    color: rgba(255,255,255,.75);
  }
</style>