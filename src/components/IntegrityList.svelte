<script lang="ts">
import { slide } from 'svelte/transition';
import { quintOut } from 'svelte/easing';
import { Button, Col, Container, Modal, ModalBody, ModalFooter, ModalHeader, Row} from "sveltestrap";
import { loggedInUser, settings, updateEntity } from '../utils/store';
import { router } from '@spaceavocado/svelte-router';
import { dateTimeAsISOString } from "../utils/date";
import { entity } from "../utils/store";
import { dndzone } from 'svelte-dnd-action';

let user;

loggedInUser.subscribe(aUser => {
  if(aUser != null) {
    user = aUser.user;
  }
});

function navigateTo(name) {
  $router.push({name});
}

let integrityRecord;
let integrityEntities = [];
let finishedIntegrityEntities = [];

function update() {
  entity("integrityChecklist", user.uid)
    .then(document => {
      integrityRecord = document?.data();
      if(!integrityRecord) {
        integrityRecord = {
          id: new Date().getTime(),
          entities: [],
          finishedEntities: [],
        }
      }
      let counter = new Date().getTime();
      if(!integrityRecord.finishedEntities) {
        integrityRecord.finishedEntities = [];
      }
      if(integrityRecord.entities) {
        integrityRecord.entities.forEach(entity => {
          if(entity.finished == true) {
            integrityRecord.finishedEntities.unshift(entity);
          } else {
            counter++;
            if(!entity.id) {
              entity.id = counter;
            }
          }
        });
      }
      integrityRecord.entities = integrityRecord.entities.filter(entity => entity.finished != true);
      integrityEntities = integrityRecord.entities;
      finishedIntegrityEntities = integrityRecord.finishedEntities;
    });
}

update();

let value;
let description;

let selectedElement;
let selectedEntity;

function select(event) {
  selectedElement?.children[1]?.classList.add("shortened");
  selectedElement?.classList.remove("selectedIntegrityElement");
  if(selectedElement !== event.currentTarget) {
    selectedElement = event.currentTarget;
    selectedElement?.children[1]?.classList.remove("shortened");
    selectedElement?.classList.add("selectedIntegrityElement");
  } else {
    selectedElement = null;
  }
}

function deSelect() {
  selectedElement?.classList.remove("selectedIntegrityElement");
  selectedElement = null;
}

function edit(event, entity) {
  event.stopPropagation();
  selectedEntity = entity;
  value = entity.value;
  description = entity.description;
}

function check(event, entity) {
  deSelect();
  event.stopPropagation();
  entity.finished = true;
  entity.finishedDate = dateTimeAsISOString(new Date());

  integrityRecord.entities.splice(integrityRecord.entities.indexOf(entity), 1);
  integrityRecord.finishedEntities.unshift(entity);
  updateEntity("integrityChecklist", integrityRecord, user.uid); 
  integrityEntities = integrityRecord.entities;
  finishedIntegrityEntities = integrityRecord.finishedEntities;
}

function uncheck(event, entity) {
  deSelect();
  event.stopPropagation();
  entity.finished = false;
  delete entity.finishedDate;
  integrityRecord.finishedEntities.splice(integrityRecord.finishedEntities.indexOf(entity), 1);
  integrityRecord.entities.unshift(entity);
  updateEntity("integrityChecklist", integrityRecord, user.uid); 
  integrityEntities = integrityRecord.entities;
  finishedIntegrityEntities = integrityRecord.finishedEntities;
}

function remove(event, entity) {
  event.stopPropagation();
  integrityRecord.entities.splice(integrityRecord.entities.indexOf(entity), 1);
  updateEntity("integrityChecklist", integrityRecord, user.uid); 
  integrityEntities = integrityRecord.entities;
  selectedEntity = null;
  deSelect();
}

function add() {
  selectedEntity = { id: new Date().getTime(), finished: false, value: "", description: "", date: dateTimeAsISOString(new Date())};
  deSelect();
}


function save() {
  selectedEntity.value = value;
  if(description && description.length > 0) {
    selectedEntity.description = description;
  } else {
    delete selectedEntity.description;
  }
  if(!integrityRecord.entities.includes(selectedEntity)) {
    integrityRecord.entities.push(selectedEntity);
  }
  updateEntity("integrityChecklist", integrityRecord, user.uid); 
  integrityEntities = integrityRecord.entities;
  selectedEntity = null;
  value = null;
  description = null;
}


function handleDndConsider(e) {
  integrityEntities = e.detail.items;
}
function handleDndFinalize(e) {
  integrityEntities = e.detail.items;
  // updateEntity("integrityChecklist", integrityRecord, user.uid); 
} 

let flipDurationMs = 300;

$: saveEnabled = value && value.length > 0;

</script>
<div class="page main" transition:slide={{duration: 300, easing: quintOut}}>
  <div class="header">
    <button class="back image60"  on:click={()=> navigateTo("Home")}><img src="/images/back.png" alt="Back" /><span class="tooltip-text">Back</span></button>
    <img class="header" src="/images/integritylist.png" alt="Integrity list"/>
    <h3>Integrity List</h3>
    <button class="add image60" on:click={() => add()}><img src="/images/add.png" alt="Add" /><span class="tooltip-text">Add</span></button>
  </div>
  <div class="content">
    {#if integrityEntities.length > 0}
    <div use:dndzone={{items: integrityEntities, flipDurationMs}} on:consider={handleDndConsider} on:finalize={handleDndFinalize} class="card-deck">
      {#each integrityEntities as entity(entity.id)}
      <div class="card integrityCard" on:click={select}>
        <div class="integrity card-header alignLeft">
          <div>
            <div class="checkElement" on:click={(event) => check(event, entity)}>
              <div class="checkbox">
                {#if entity.finished}
                <img class="checkbox" src="/images/check.png" alt="Finish" />
                {/if}
              </div>
              <div>
                {entity.value}
              </div>
            </div>
          </div>
          <div class="selectedIntegrityElementActions">
            <button class="image40" on:click={(event)=> remove(event, entity)}><img src="/images/delete.png" alt="Delete" /><span class="tooltip-text">Delete</span></button>
            <button class="image40" on:click={(event)=> edit(event, entity)}><img src="/images/edit.png" alt="Edit" /><span class="tooltip-text">Edit</span></button>
          </div>
        </div>
        <div class="card-text shortened">
          {#if entity.description && entity.description.length > 0} 
          {entity.description}
          {:else}
          <div class="placeHolder">No description</div>
          {/if}
        </div>
      </div>
      {/each}
    </div>
    {/if}
    <div class="card-deck">
      {#each finishedIntegrityEntities as entity(entity.id)}
      <div class="card integrityCard" on:click={select}>
        <div class="integrity card-header alignLeft">
          <div>
            <div class="checkElement" on:click={(event) => uncheck(event, entity)}>
              <div class="checkbox">
                {#if entity.finished}
                <img class="checkbox" src="/images/check.png" alt="Finish" />
                {/if}
              </div>
              <div class="finished">
                {entity.value}
              </div>
            </div>
          </div>
        </div>
        <div class="card-text shortened">
          {#if entity.description && entity.description.length > 0} 
          {entity.description}
          {:else}
          <div class="placeHolder">No description</div>
          {/if}
        </div>
      </div>
      {/each}
    </div>
  </div>
  <Modal transitionOptions isOpen={selectedEntity} size="lg">
    <ModalHeader>
      Integrity
    </ModalHeader>
    <ModalBody>
      <Container>
        <Row>
          <Col sm=12>
              <div class="form-group separateLine">
                <label class="alignLeft" for="value">Name</label>
                <input id="value" type="text" class="form-control {(!value || value.length === 0) ? "is-invalid" : ""}" bind:value={value} placeholder="Name" autofocus/>
              </div>
          </Col>
          <Col sm=12>
            <div class="form-group separateLine">
              <label class="alignLeft" for="description">Description</label>
              <textarea id="description" type="text" class="form-control" bind:value={description} placeholder="Description"/>
            </div>
        </Col>
      </Row>
    </Container>
    </ModalBody>
    <ModalFooter>
      <Button color="secondary" on:click={() => selectedEntity = null}>Cancel</Button>
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
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  grid-auto-rows: max-content;
  grid-gap: 10px;
}

label.alignLeft {
  text-align: left;
  width: 100%;
  font-size: large;
}

div.content:focus {
  outline: 1px solid lightgray;
}

div.card-deck {
  outline: none !important;
}

div.card-deck:focus {
  outline: none !important;
}


:global(div.selectedIntegrityElement) {
  outline: 2px solid blue !important;
  outline-offset: -2px;
}

div.selectedIntegrityElementActions {
  position: absolute;
  justify-content: flex-end;
  display: none;
  top: 5px;
  right: 10px;
}

:global(.selectedIntegrityElement) div.selectedIntegrityElementActions {
  display: flex;
  text-align: left;
}

div.integrity {
  text-align: left;
}

div.integrityCard:focus {
  outline: none;
}
div.card-text {
  white-space:pre-wrap;
  min-height: 1.75em;
  text-align: left;
}

div.shortened {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

div.placeHolder {
  color: lightgray;
}

div.separateLine {
  flex-direction: column;
}

div.card {
  cursor: pointer !important;
  height: max-content;
}

img.checkbox {
  margin-bottom: 15px;
    margin-left: 3px;
    margin-top: -5px;
}

div.finished {
  text-decoration:line-through;
}

div.checkElement {
  display: flex;
  gap: 10px;
  width: max-content;
}
div.checkbox {
  height: 25px;
  width: 25px;
  border-radius: 50%;
  border: solid 1px blue;
  display: inline-block;
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
    width: 100%;
  }
}

@media (min-width: 1200px) and (max-width: 1600px) {
  div.card-deck {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: max-content;
    grid-gap: 10px;
    width: 100%;
  }
}
@media (min-width: 800px) and (max-width: 1200px) {
  div.card-deck {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: max-content;
    grid-gap: 10px;
    width: 100%;
  }
}
@media (max-width: 800px) {
  div.card-deck {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    grid-auto-rows: max-content;
    grid-gap: 10px;
    width: 100%;
  }
}

div.card-text {
  margin: 10px;
}
</style>