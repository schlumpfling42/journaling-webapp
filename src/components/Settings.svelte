<script lang="ts">
import { slide } from 'svelte/transition';
import { quintOut } from 'svelte/easing';
import { Button, Col, Container, FormGroup, Input, Label, Row} from "sveltestrap";
import { accessToken, loggedInUser, settings, updateSettings } from '../utils/store';
import { router } from '@spaceavocado/svelte-router';
import { dateAsISOString } from "../utils/date";
import PinModal from './PinModal.svelte';
import { each } from 'svelte/internal';

let user;

let groups = [];

loggedInUser.subscribe(aUser => {
  if(aUser != null) {
    user = aUser.user;
    accessToken.subscribe(async access_token => {
        const response = await fetch("https://graph.facebook.com/" + user.providerData[0].uid + "/groups?access_token=" + access_token);
        let responseData = await response.json();
        groups = responseData.data; 
    });
  }
});



function navigateTo(name) {
  $router.push({name});
}

function reload() {
  pin = $settings?.pin;
  startDate = $settings?.startDate?.substring(0,10);
  groupId = $settings?.groupId;
}

function save() {
  let newSettings = {
    startDate: startDate ? dateAsISOString(new Date(startDate)) : dateAsISOString(new Date()),
    pin: pin == "" ? null : pin,
    groupId,
    userId: user.uid
  };
  updateSettings(user.uid, newSettings).then(()=>
    settings.update(value => {
      value.startDate = startDate ? dateAsISOString(new Date(startDate)) : dateAsISOString(new Date());
      value.pin = pin == "" ? null : pin;
      value.groupId = groupId == "" ? null : groupId;
      return value;
    }));
}

let startDate;
let pin;
let verifyPin;
let groupId;

let accessVerified = false;

let settingsHavePin = false;
function load() {
  accessVerified = true;
  settings.subscribe( settings => {
    if(settings) {
      startDate = settings?.startDate?.substring(0,10);
      pin = settings.pin;
      if(!pin && pin != "") {
        settingsHavePin = true;
      }
      groupId = settings?.groupId;
    }
  });
}

$: pinChanged = (pin == "" ? null : pin) != $settings?.pin;
$: changed = pinChanged || (startDate != $settings?.startDate?.substring(0,10)) || (groupId == "" ? null : groupId) != $settings?.groupId;

</script>
<div class="page main" transition:slide="{{duration: 300, easing: quintOut}}">
  <div class="header">
    <button class="back image60" on:click={()=> navigateTo("Home")}><img src="/images/back.png" alt="Back" /><span class="tooltip-text">Back</span></button>
    <img class="header" src="/images/setting.png" alt="Wins"/>
    <h3>Settings</h3>
  </div>
  <div class="content">
    {#if accessVerified}
    <Container>
      <Row>
        <Col sm=3 md={{ size: 3, offset: 3 }}>
          <FormGroup>
            <Label class="alignStart" for="startDate">Start date</Label>
            <Input
              type="date"
              name="startDate"
              bind:value={startDate}
              placeholder="Start date"
               />
          </FormGroup>
        </Col>
        <Col sm=3>
          <Row>
            <Col>
              <FormGroup>
                <Label class="alignStart" for="pin">PIN</Label>
              <Input
              type="password"
                name="pin"
                bind:value={pin}
                placeholder="Enter PIN"
                />
              </FormGroup>
            </Col>
          </Row>
          {#if pinChanged}
          <Row>
            <Col>
              <FormGroup>
                <Label class="alignStart" for="verifyPin">Verify PIN</Label>
                <Input
                  type="password"
                  name="verifyPin"
                  bind:value={verifyPin}
                  placeholder="Enter PIN again"
                  />
              </FormGroup>
            </Col>
          </Row>
          <Row>
            {#if pin != verifyPin}
            <Col>
              <div class="error">PIN and Verify PIN doen't match</div>
            </Col>  
            {/if}
          </Row>
            {/if}
        </Col>
      </Row>
      <Row>
        <Col sm=6 md={{ size: 6, offset: 3 }}>
          <FormGroup>
            <Label class="alignStart" for="verifyPin">Facebook Group</Label>
            <select id="type" type="text" class="form-control" bind:value={groupId} placeholder="Group">
              <option value=""></option>
              {#each groups as group}
              <option value={group.id}>{group.name}</option>
              {/each}
            </select>
          </FormGroup>
        </Col>
      </Row>
      <Row class="align-right" align-h="end">
        <Col class="form-actions alignEnd">
          <div class="formActions">
            <Button color="secondary"on:click={reload} disabled={!changed}>Reset</Button>
            <Button color="primary" on:click={save} disabled={!changed || (pinChanged && pin != verifyPin)}>Save</Button>
          </div>
        </Col>
      </Row>
    </Container>
    {/if}
  </div>
  <PinModal unlockCallback ={load} />
</div>
<style>
.page {
  height: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-items: stretch;
}
div.header {
  display: inline-flex;
  align-items: center;
  align-self: center;
}

div.content {
  height: 100%;
  overflow: hidden;
}

div.formActions {
  margin-top: 10px;
  justify-content: center;
  display: flex;
  gap: 5px;
}

div.shortened div button {
  display: none;
}

@media (min-width: 800px) {
  img.header {
    height: 100px;
    width: 100px;
    outline: none;
    background-color: transparent;
    border: none;
  }

  button.back {
    position: absolute;
    top: 25px;
    left: 40px;
  }
}
@media (max-width: 800px) {
  img.header {
    height: 60px;
    width: 60px;
    outline: none;
    background-color: transparent;
    border: none;
  }

  button.back {
    position: absolute;
    top: 15px;
    left: 20px;
  }
}

:global(.blur) {
  backdrop-filter: blur(5px);
  opacity: 1 !important;
  background-color: rgb(82,82,82,0.5) !important;
}

img {
  width: 100%;
}
</style>