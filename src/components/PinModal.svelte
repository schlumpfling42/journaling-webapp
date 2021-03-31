<script lang="ts">
import { Button, Modal, ModalBody, ModalFooter, ModalHeader} from "sveltestrap";
import { router } from '@spaceavocado/svelte-router';
import { settings } from '../utils/store';

export let unlockCallback;

let pin;

let pinEntered;
let verificationPin;

settings.subscribe( settings => {
  update(settings);
});


function update(settings) {
  if(settings) {
    pinEntered = false;
    pin = settings.pin;
    if(!pin || pin == "") {
      pinEntered = true;
      unlockCallback();
    }
  }
}

function verifyPIN() {
  if(verificationPin == pin) {
    pinEntered = true;
    verificationPin = null;
    unlockCallback();
  }
}

function navigateTo(name) {
  $router.push({name});
}

update($settings);

</script>
<Modal toggle={() => ""} backdropClassName="blur" transitionOptions isOpen={pinEntered == false} size="lg">
  <ModalHeader>
    <div class="header">
      <button class="back image60" on:click={()=> navigateTo("Home")}><img src="/images/back.png" alt="Back" /><span class="tooltip-text">Back</span></button>
      <h3>Enter PIN to unlock</h3>
    </div>
  </ModalHeader>
  <ModalBody>
    <div class="container">
      <div class="row">
        <div class="col-sm-3">
          <div class="form-group">
            <input type="password" class="form-control" bind:value={verificationPin} placeholder="Enter PIN" autofocus></div>
          </div>
        </div>
      </div>
  </ModalBody>
  <ModalFooter>
    <Button color="secondary" disabled={verificationPin == null || verificationPin == ""} on:click={() => verificationPin = null}>Reset</Button>
    <Button color="primary" disabled={verificationPin == null || verificationPin == ""} on:click={verifyPIN}>Unlock</Button>
  </ModalFooter>
</Modal>
<style>

:global(.blur) {
  backdrop-filter: blur(5px);
  opacity: 1 !important;
  background-color: rgb(82,82,82,0.5) !important;
}
div.header {
  display: inline-flex;
  align-items: center;
  align-self: center;
  width: 100%
}
div.header h3 {
  margin-bottom: 0px;
  align-self: center;
  width: 100%;
}

img {
  width: 100%;
}

</style>