<script lang="ts">
import { slide } from 'svelte/transition';
import { quintOut } from 'svelte/easing';
import { Button, Card, CardDeck, CardHeader, CardText, Col, Container, ListGroup, Modal, ModalBody, ModalFooter, ModalHeader, Row} from "sveltestrap";
import { loggedInUser, settings, updateEntity } from '../utils/store';
import { router } from '@spaceavocado/svelte-router';
import { getWeek, getWeeksSince, getISOStringAsLocalDate, dayOfTheWeek, dateAsISOString, dateToDisplayString } from "../utils/date";
import { entity, updateWeekEntity } from "../utils/store";

let user;

loggedInUser.subscribe(aUser => {
  if(aUser != null) {
    user = aUser.user;
  }
});

function navigateTo(name) {
  $router.push({name});
}


let contacts = [];
let contactRecord;

function update() {
  entity("contacts", user.uid)
    .then(document => {
      contactRecord = document?.data();
      if(contactRecord) {
        contacts = contactRecord.entities;
      } else {
        contactRecord = {
          id: new Date().getTime(),
          entities: []
        }
      }
    });
}

update();

let passwordElement;

let selectedEntry;
let value;
let number;
let type;
let password;

let selectedElement;

function select(event) {
  selectedElement?.classList.remove("selectedContactElement");
  if(selectedElement !== event.currentTarget) {
    selectedElement = event.currentTarget;
    selectedElement?.classList.add("selectedContactElement");
  } else {
    selectedElement = null;
  }
}

function deSelect() {
  selectedElement?.classList.remove("selectedContactElement");
  selectedElement = null;
}

function edit(event, entry) {
  event.stopPropagation();
  selectedEntry = entry;
  value = selectedEntry.value;
  number = selectedEntry.number;
  type= selectedEntry.type;
  password = selectedEntry.password;
}

function remove(event, entry) {
  event.stopPropagation();
  contactRecord.entities.splice(contactRecord.entities.indexOf(entry), 1);
  updateEntity("contacts", contactRecord, user.uid); 
  contacts = contactRecord.entities;
  selectedEntry = null;
}

function add() {
  selectedEntry = { value: "", type: "", number: "", date: dateAsISOString(new Date())};
}

function save() {
  selectedEntry.value = value;
  selectedEntry.type = type;
  selectedEntry.number = number;
  if(password) {
    selectedEntry.password = password;
  } else {
    delete selectedEntry.password;
  }
  if(!contactRecord.entities.includes(selectedEntry)) {
    contactRecord.entities.push(selectedEntry);
  }
  updateEntity("contacts", contactRecord, user.uid); 
  contacts = contactRecord.entities;
  selectedEntry = null;
  value = null;
  number = null;
  type= null;
  password = null;
}

function copyPassword(password) {
  passwordElement.value = password;
  passwordElement.select();
  document.execCommand('copy');
  passwordElement.value = null;
}

$: saveEnabled = (value && value.length > 0) && (type && type.length > 0) && (number && number.length > 0);

</script>
<div class="page main" transition:slide="{{delay: 250, duration: 300, easing: quintOut}}">
  <div class="header">
    <button class="back image60" on:click={()=> navigateTo("Home")}><img src="/images/back.png" alt="Back" /><span class="tooltip-text">Back</span></button>
    <img class="header" src="/images/contact.png" alt="Contacts"/>
    <h3>Contacts</h3>
    <button class="add image60" on:click={() => add()}><img src="/images/add.png" alt="Add" /><span class="tooltip-text">Add</span></button>
  </div>
  <div class="content">
    {#if contactRecord}
    <input hidden bind:this={passwordElement}/>
    <div class="card-deck">
      {#each contacts as contact}
      <div class="card" on:click={select}>
        <div class="contact card-header">
          {contact.value}
          <div class="selectedElementActions">
            <button class="image40" on:click={(event)=> remove(event, contact)}><img src="/images/delete.png" alt="Delete" /><span class="tooltip-text">Delete</span></button>
            <button class="image40" on:click={(event)=> edit(event, contact)}><img src="/images/edit.png" alt="Edit" /><span class="tooltip-text">Edit</span></button>
          </div>
        </div>
        <div class="card-text">
          {#if contact.type === "phone"}
          Phone number: <a href="tel:{contact.number}" target="#">{contact.number}</a>
          {:else if contact.type === "email"}
          E-Mail: <a href="mailto:{contact.number}" target="#">{contact.number}</a>
          {:else if contact.type === "web"}
          Website: <a href="{contact.number}" target="#">{contact.number}</a>
          {:else if contact.type === "zoom"}
          Zoom: <a href="{"https://zoom.us/j/"+contact.number}" target="#" on:click={() => copyPassword(contact.password)}>{contact.number}</a>
          {:else}
          <div>{contact.number}</div>
          {/if}
        </div>
      </div>
      {/each}
    </div>
    {/if} 
  </div>
  <Modal transitionOptions isOpen={selectedEntry} size="lg">
    <ModalHeader>
      Contact
    </ModalHeader>
    <ModalBody>
      <Container>
        <Row>
          <Col sm=12>
              <div class="form-group">
                <label class="alignLeft" for="value">Name</label>
                <input id="value" type="text" class="form-control {(!value || value.length === 0) ? "is-invalid" : ""}" bind:value={value} placeholder="Contact name" autofocus/>
              </div>
          </Col>
      </Row>
      <Row>
        <Col sm=12>
            <div class="form-group">
              <label class="alignLeft" for="type">Type</label>
              <select id="type" type="text" class="form-control {(!type || type.length === 0) ? "is-invalid" : ""}" bind:value={type} placeholder="Type">
                <option value=""></option>
                <option value="email">E-Mail</option>
                <option value="phone">Phone number</option>
                <option value="web">Website</option>
                <option value="zoom">Zoom</option>
              </select>
            </div>
        </Col>
      </Row>
      <Row>
        <Col sm=12>
            <div class="form-group">
              <label class="alignLeft" for="number">Number</label>
              <input id="number" type="text" class="form-control" bind:value={number} placeholder="Number"/>
            </div>
        </Col>
      </Row>
      {#if type === "zoom"}
      <Row>
        <Col sm=12>
            <div class="form-group">
              <label class="alignLeft" for="password">Password</label>
              <input id="password" type="text" class="form-control" bind:value={password} placeholder="Password"/>
            </div>
        </Col>
      </Row>
      {/if}
    </Container>
    </ModalBody>
    <ModalFooter>
      <Button color="secondary" on:click={() => selectedEntry = null}>Cancel</Button>
      <Button color="primary" disabled={!saveEnabled} on:click={() => save()}>Save</Button>
    </ModalFooter>
  </Modal>
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
  overflow-x: hidden;
  overflow-y: auto;
  bottom: 10px;
  border: 1px solid lightgray;
}

label.alignLeft {
  text-align: left;
  width: 100%;
  font-size: large;
}

:global(div.selectedContactElement) {
  outline: 2px solid blue;
  outline-offset: -2px;
}

div.selectedElementActions {
  position: absolute;
  justify-content: flex-end;
  display: none;
  top: 5px;
  right: 10px;
}
div.shortened div button {
  display: none;
}

:global(.selectedContactElement) div.selectedElementActions {
  display: flex;
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
  button.add {
    position: absolute;
    top: 25px;
    right: 40px;
  }
  div.card {
    min-width: 25%;
    flex-grow: 0;
  }
  div.card-deck {
    display: flex;
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
  button.add {
    position: absolute;
    top: 15px;
    right: 20px;
  }
  div.card {
    width: 100%;
  }
  div.card-deck {
    display: block;
  }
  div.form-group {
    display: flex;
  }
  label.alignLeft {
    width: 150px;
  }
}

div.card-text {
  margin: 10px;
}

img {
  width: 100%;
}
</style>