<script lang="ts">
import { slide } from 'svelte/transition';
import {flip} from "svelte/animate";
import { quintOut } from 'svelte/easing';
import { Button, Card, CardDeck, CardHeader, CardText, Col, Container, ListGroup, Modal, ModalBody, ModalFooter, ModalHeader, Row} from "sveltestrap";
import { loggedInUser, settings, updateEntity } from '../utils/store';
import { router } from '@spaceavocado/svelte-router';
import { getWeek, getWeeksSince, getISOStringAsLocalDate, dayOfTheWeek, dateAsISOString, dateToDisplayString } from "../utils/date";
import { entity, updateWeekEntity } from "../utils/store";
import {dndzone} from "svelte-dnd-action";

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
        let counter = new Date().getTime();
        contacts.forEach(contact => {
          counter++;
          if(!contact.id) {
            contact.id = counter;
          }
          if(contact.contactNumbers) {
            contact.contactNumbers.forEach(number => {
              if(!number.id) {
                number.id = counter;
                counter++;
              }
            });
          }
        });
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
let selectedContact;
let value;
let label;
let number;
let type;
let password;

let selectedContactElement;
let selectedNumberElement;

let isChangeContact = true;
let isChangeNumber = false;

function select(event) {
  event.stopPropagation();
  selectedContactElement?.classList.remove("selectedContactElement");
  selectedNumberElement?.classList.remove("selectedNumberElement");
  if(selectedContactElement !== event.currentTarget) {
    selectedContactElement = event.currentTarget;
    selectedContactElement?.classList.add("selectedContactElement");
  } else {
    selectedContactElement = null;
    selectedNumberElement = null;
  }
}

function selectNumber(event) {
  if(
    selectedContactElement 
    && event.currentTarget.parentElement?.parentElement 
    && event.currentTarget.parentElement?.parentElement === selectedContactElement
  ) {
    event.stopPropagation();
    selectedNumberElement?.classList.remove("selectedNumberElement");
    if(selectedNumberElement !== event.currentTarget) {
      selectedNumberElement = event.currentTarget;
      selectedNumberElement?.classList.add("selectedNumberElement");
    } else {
      selectedNumberElement = null;
    }
  }
}

function deSelect() {
  selectedContactElement?.classList.remove("selectedContactElement");
  selectedNumberElement?.classList.remove("selectedNumberElement");
  selectedContactElement = null;
  selectedNumberElement = null;
}


function deSelectNumber() {
  selectedNumberElement?.classList.remove("selectedNumberElement");
  selectedNumberElement = null;
}

function edit(event, entry) {
  isChangeContact = true;
  isChangeNumber = false;
  event.stopPropagation();
  selectedEntry = entry;
  value = selectedEntry.value;
  number = selectedEntry.number;
  type= selectedEntry.type;
  password = selectedEntry.password;
}

function editNumber(event, entry, contactnumber) {
  isChangeContact = false;
  isChangeNumber = true;
  event.stopPropagation();
  selectedEntry = entry;
  selectedContact = contactnumber;
  label = selectedContact.label;
  number = selectedContact.number;
  type= selectedContact.type;
  password = selectedContact.password;
}

function remove(event, entry) {
  event.stopPropagation();
  contactRecord.entities.splice(contactRecord.entities.indexOf(entry), 1);
  updateEntity("contacts", contactRecord, user.uid); 
  contacts = contactRecord.entities;
  selectedEntry = null;
  selectedContact = null;
}

function removeNumber(event, entry, contactNumber) {
  event.stopPropagation();
  entry.contactNumbers.splice(entry.contactNumbers.indexOf(contactNumber), 1);
  updateEntity("contacts", contactRecord, user.uid); 
  contacts = contactRecord.entities;
  selectedEntry = null;
  selectedContact = null;
}

function add() {
  isChangeContact = true;
  isChangeNumber = true;
  selectedEntry = { id: new Date().getTime(), value: "", date: dateAsISOString(new Date()), contactNumbers: []};
  selectedContact = { id: new Date().getTime() };
  deSelect();
}


function addNumber(event, entry) {
  event.stopPropagation();
  isChangeContact = false;
  isChangeNumber = true;
  selectedEntry = entry;
  if(!selectedEntry.contactNumbers) {
    selectedEntry.contactNumbers = [];
  }
  if(selectedEntry.value) {
    let contact : any = {
      id: new Date().getTime()
    };
    contact.number = selectedEntry.number;
    contact.type= selectedEntry.type;
    if(selectedEntry.password) {
      contact.password = selectedEntry.password;
    }
    delete selectedEntry.number;
    delete selectedEntry.type;
    delete selectedEntry.password; 
  }
  selectedContact = {
    id: new Date().getTime()
  };
  deSelectNumber();
}

function save() {
  if(isChangeContact) {
    selectedEntry.value = value;
    if(!contactRecord.entities.includes(selectedEntry)) {
      contactRecord.entities.push(selectedEntry);
    }
  }
  if(isChangeNumber) {

    if(label && label.length > 0) {
      selectedContact.label = label;
    } else {
      delete selectedContact.label;
    }
    selectedContact.number = number;
    selectedContact.type= type;
    if(password && password.length > 0) {
      selectedContact.password = password;
    } else {
      delete selectedContact.password;
    }
    if(!selectedEntry.contactNumbers.includes(selectedContact)) {
      selectedEntry.contactNumbers.push(selectedContact);
    }
  }
  updateEntity("contacts", contactRecord, user.uid); 
  contacts = contactRecord.entities;
  isChangeContact = false;
  isChangeNumber = false;
  selectedEntry = null;
  selectedContact = null;
  value = null;
  label = null;
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

function validatePhoneNumber(e, element) {
  if(e) {
    var charval : any = String.fromCharCode(e.keyCode);
    if(isNaN(charval)){
        return false;
    }
  }
  return true;
}

function handleContactsDndConsider(e) {
  contacts = e.detail.items;
}
function handleContactsDndFinalize(e) {
  contacts = e.detail.items;
  contactRecord.entities = contacts;
  updateEntity("contacts", contactRecord, user.uid); 
  contacts = contactRecord.entities;
} 

function handleNumbersDndConsider(e, contact) {
  contact.contactNumbers = e.detail.items;
  contacts = contacts;
}
function handleNumbersDndFinalize(e, contact) {
  contact.contactNumbers = e.detail.items;
  updateEntity("contacts", contactRecord, user.uid); 
  contacts = contacts;
} 

const flipDurationMs = 300;

$: saveEnabled = (!isChangeContact || (value && value.length > 0)) && (!isChangeNumber || (type && type.length > 0) && (number && number.length > 0));

</script>
<div class="page main" transition:slide="{{delay: 350, duration: 300, easing: quintOut}}">
  <div class="header">
    <button class="back image60" on:click={()=> navigateTo("Home")}><img src="/images/back.png" alt="Back" /><span class="tooltip-text">Back</span></button>
    <img class="header" src="/images/contacts.png" alt="Contacts"/>
    <h3>Contacts</h3>
    <button class="add image60" on:click={() => add()}><img src="/images/add.png" alt="Add" /><span class="tooltip-text">Add</span></button>
  </div>
  <div class="content">
    {#if contactRecord}
    <input hidden bind:this={passwordElement}/>
    <div use:dndzone={{items: contacts, flipDurationMs, dropFromOthersDisabled: true}} on:consider="{handleContactsDndConsider}" on:finalize="{handleContactsDndFinalize}" class="card-deck">
      {#each contacts as contact(contact.id)}
      <div class="card contactCard" on:click={select}>
        <div class="contact card-header alignLeft">
          {contact.value}
          <div class="selectedContactElementActions">
            <button class="image40" on:click={(event)=> remove(event, contact)}><img src="/images/delete.png" alt="Delete" /><span class="tooltip-text">Delete</span></button>
            <button class="image40" on:click={(event)=> edit(event, contact)}><img src="/images/edit.png" alt="Edit" /><span class="tooltip-text">Edit</span></button>
            <button class="image40" on:click={(event)=> addNumber(event, contact)}><img src="/images/add.png" alt="Add" /><span class="tooltip-text">Add<br/>number</span></button>
          </div>
        </div>
        {#if contact.contactNumbers}
          <div class="card-text" use:dndzone={{items: contact.contactNumbers, flipDurationMs, dropFromOthersDisabled: true}} on:consider="{(event) => handleNumbersDndConsider(event, contact)}" on:finalize="{(event) => handleNumbersDndFinalize(event, contact)}">
            { #each contact.contactNumbers as contactNumber(contactNumber.id)}
              <div class="contactNumber" on:click={selectNumber}>
                <div class="numberText">
                  {#if contactNumber.type === "phone"}
                  Phone number: {contactNumber.label ?contactNumber.label + " " : "" }<a href="tel:{contactNumber.number}" target="#">{contactNumber.number}</a>
                  {:else if contactNumber.type === "email"}
                  E-Mail: {contactNumber.label ?contactNumber.label + " " : "" } <a href="mailto:{contactNumber.number}" target="#">{contactNumber.number}</a>
                  {:else if contactNumber.type === "web"}
                  Website: {contactNumber.label ?contactNumber.label + " " : "" }<a href="{contactNumber.number}" target="#">{contactNumber.number}</a>
                  {:else if contactNumber.type === "zoom"}
                  Zoom: <a href="{"https://zoom.us/j/"+contactNumber.number}" target="#" on:click={() => copyPassword(contactNumber.password)}>{contactNumber.label ? contactNumber.label : contactNumber.number}</a>
                  {:else}
                  <div>{contact.number}</div>
                  {/if}
                </div>
                <div class="selectedNumberActions">
                  <button class="image40" on:click={(event)=> removeNumber(event, contact, contactNumber)}><img src="/images/delete.png" alt="Delete" /><span class="tooltip-text">Delete</span></button>
                  <button class="image40" on:click={(event)=> editNumber(event, contact, contactNumber)}><img src="/images/edit.png" alt="Edit" /><span class="tooltip-text">Edit</span></button>
                </div>
              </div>
            {/each}
          </div>
        {:else}
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
        {/if}
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
        {#if isChangeContact}
        <Row>
          <Col sm=12>
              <div class="form-group">
                <label class="alignLeft" for="value">Name</label>
                <input id="value" type="text" class="form-control {(!value || value.length === 0) ? "is-invalid" : ""}" bind:value={value} placeholder="Contact name" autofocus/>
              </div>
          </Col>
      </Row>
      {/if}
      {#if isChangeNumber}
      <Row>
        <Col sm=12>
            <div class="form-group">
              <label class="alignLeft" for="label">Label</label>
              <input id="label" type="text" class="form-control" bind:value={label} placeholder="Label"/>
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
              {#if type === "phone"}
              <input id="number" type="tel" class="form-control {validatePhoneNumber(number, this) ? "is-invalid" : ""}" bind:value={number} placeholder="Number"/>
              {:else}
              <input id="number" type="text" class="form-control" bind:value={number} placeholder="Number"/>
              {/if}
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
  outline: 1px solid lightgray;
}

div.content:focus {
  outline: 1px solid lightgray;
}

div.card-deck {
outline: none;
}

div.card-deck:focus {
  outline: none;
}

label.alignLeft {
  text-align: left;
  width: 100%;
  font-size: large;
}

div.contactCard:focus {
  outline: none;
}

:global(div.selectedContactElement), :global(div.selectedContactElement)  {
  outline: 2px solid blue !important;
  outline-offset: -2px;
}

:global(div.selectedNumberElement), :global(div.selectedNumberElement:focus) {
  outline: 2px solid rgb(150, 150, 200) !important;
  outline-offset: -2px;
}

div.selectedContactElementActions {
  position: absolute;
  justify-content: flex-end;
  display: none;
  top: 5px;
  right: 10px;
}

:global(.selectedContactElement) div.selectedContactElementActions {
  display: flex;
  text-align: left;
}

div.contact {
  text-align: left;
}

div.card-text {
  min-height: 1.75em;
  text-align: left;
  outline: none !important;
}

div.selectedNumberActions {
  display: none;
}

:global(.selectedNumberElement) div.selectedNumberActions {
  display: flex;
}

div.card {
  cursor: pointer !important;
  height: max-content;
}

div.contactNumber {
  display: flex;
  height: 2.5em;
  padding-left: 10px;
  cursor: pointer !important;
}
div.contactNumber:focus {
  outline: none;
}

div.numberText {
  align-self: center;
  width: 100%;
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
  div.form-group {
    display: flex;
  }
  label.alignLeft {
    width: 150px;
  }
}

@media (min-width: 1600px) {
  div.card-deck {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: max-content;
    grid-gap: 10px;
    height: 100%;
    width: 100%;
  }
}

@media (min-width: 1200px) and (max-width: 1600px) {
  div.card-deck {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: max-content;
    grid-gap: 10px;
    height: 100%;
    width: 100%;
  }
}
@media (min-width: 800px) and (max-width: 1200px) {
  div.card-deck {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: max-content;
    grid-gap: 10px;
    height: 100%;
    width: 100%;
  }
}
@media (max-width: 800px) {
  div.card-deck {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    grid-auto-rows: max-content;
    grid-gap: 10px;
    height: 100%;
    width: 100%;
  }
}

div.card-text {
  margin: 10px;
}

img {
  width: 100%;
}
</style>