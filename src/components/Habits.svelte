<script lang="ts">
import { slide } from 'svelte/transition';
import { Button, Col, Container, Modal, ModalBody, ModalFooter, ModalHeader, Row} from "sveltestrap";
import { loggedInUser, settings, updateEntity } from '../utils/store';
import { router } from '@spaceavocado/svelte-router';
import { dateTimeAsISOString, dayOfTheWeekAsISOString, getWeek } from "../utils/date";
import { entity } from "../utils/store";

let user;

loggedInUser.subscribe(aUser => {
  if(aUser != null) {
    user = aUser.user;
  }
});

function navigateTo(name) {
  $router.push({name});
}

let habitRecord;
let habitEntities = [];
const weekdays = [
  "SU", "MO", "TU", "WE", "TH", "FR", "SA"
];
let currentWeek = getWeek(new Date(Date.now()), []);

function update() {
  entity("habits", user.uid)
    .then(document => {
      habitRecord = document?.data();
      if(!habitRecord) {
        habitRecord = {
          id: new Date().getTime(),
          entities: []
        }
      }
      habitEntities = habitRecord.entities;
      habitEntities.forEach(entity => {
        if(!entity.checkValues) {
          entity.checkValues = {};
        }
      });
    });
}

update();

let value;
let description;

let selectedElement;
let selectedEntity;

function select(event) {
  event.stopPropagation();
  selectedElement?.classList.remove("selectedHabitElement");
  if(selectedElement !== event.currentTarget) {
    selectedElement = event.currentTarget;
    selectedElement?.classList.add("selectedHabitElement");
  } else {
    selectedElement = null;
  }
}

function deSelect() {
  selectedElement?.classList.remove("selectedHabitElement");
  selectedElement = null;
}

function edit(event, entity) {
  event.stopPropagation();
  selectedEntity = entity;
  value = entity.value;
  description = entity.description;
}

function check(event, entity, dayIndex) {
  deSelect();
  event.stopPropagation();
  if(!entity.checkValues) {
    entity.checkValues = {};
  }
  entity.checkValues[dayOfTheWeekAsISOString(currentWeek, dayIndex)] = !entity.checkValues[dayOfTheWeekAsISOString(currentWeek, dayIndex)];
  updateEntity("habits", habitRecord, user.uid); 
  habitEntities = habitRecord.entities;
}

function remove(event, entity) {
  event.stopPropagation();
  habitRecord.entities.splice(habitRecord.entities.indexOf(entity), 1);
  updateEntity("habits", habitRecord, user.uid); 
  habitEntities = habitRecord.entities;
  selectedEntity = null;
  deSelect();
}

function add() {
  selectedEntity = { 
    value: "", 
    checkedValues: [], 
    date: dateTimeAsISOString(new Date())
  };
  deSelect();
}


function save() {
  selectedEntity.value = value;
  if(!habitRecord.entities.includes(selectedEntity)) {
    habitRecord.entities.push(selectedEntity);
  }
  updateEntity("habits", habitRecord, user.uid); 
  habitEntities = habitRecord.entities;
  selectedEntity = null;
  value = null;
  description = null;
}


$: saveEnabled = value && value.length > 0;

</script>
<div class="page main">
  <div class="header">
    <button class="back image60"  on:click={()=> navigateTo("Home")}><img src="/images/back.png" alt="Back" /><span class="tooltip-text">Back</span></button>
    <img class="header" src="/images/habit.png" alt="Habits"/>
    <h3>Habits</h3>
    <button class="add image60" on:click={() => add()}><img src="/images/add.png" alt="Add" /><span class="tooltip-text">Add</span></button>
  </div>
  <div class="content">
    {#if habitRecord}
    <div class="card-deck">
      {#each habitEntities as entity}
      <div class="card habitCard" on:click={select} transition:slide>
        <div class="habit card-header alignLeft">
            {entity.value}
          <div class="selectedHabitElementActions">
            <button class="image40" on:click={(event)=> remove(event, entity)}><img src="/images/delete.png" alt="Delete" /><span class="tooltip-text">Delete</span></button>
            <button class="image40" on:click={(event)=> edit(event, entity)}><img src="/images/edit.png" alt="Edit" /><span class="tooltip-text">Edit</span></button>
          </div>
        </div>
        <div class="card-text">
          {#each weekdays as weekday, dayIndex }
          <div class="checkbox" on:click={(event) => check(event, entity, dayIndex)}>
            <div>{weekday}</div>
            {#if entity.checkValues[dayOfTheWeekAsISOString(currentWeek, dayIndex)] == true}
            <img class="checkbox" src="/images/check.png" alt="Finish" />
            {/if}
          </div>
          {/each}
        </div>
      </div>
      {/each}
    </div>
    {/if} 
  </div>
  <Modal transitionOptions isOpen={selectedEntity} size="lg">
    <ModalHeader>
      Habit
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
}

label.alignLeft {
  text-align: left;
  width: 100%;
  font-size: large;
}

:global(div.selectedHabitElement) {
  outline: 2px solid blue;
  outline-offset: -2px;
}

:global(div.selectedNumberElement) {
  outline: 2px solid rgb(150, 150, 200);
  outline-offset: -2px;
}

div.selectedHabitElementActions {
  position: absolute;
  justify-content: flex-end;
  display: none;
  top: 5px;
  right: 10px;
}

:global(.selectedHabitElement) div.selectedHabitElementActions {
  display: flex;
  text-align: left;
}

div.habit {
  text-align: left;
}

div.card-text {
  white-space:pre-wrap;
  min-height: 1.75em;
  text-align: left;
  display: flex;
}

div.separateLine {
  flex-direction: column;
}

div.card {
  cursor: pointer;
}

img.checkbox {
  position:absolute;
  left: 2px;
  bottom: 2px;
}

div.checkbox {
  position:relative;
  height: 30px;
  width: 30px;
  border-radius: 50%;
  border: solid 1px blue;
  margin:auto;
  display: flex;
  align-items:center;
  justify-content:center;
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

@media (min-width: 1600px) {
  div.habitCard {
    min-width: calc(25% - 7.5px);
    max-width: calc(25% - 7.5px);
    margin-top: 15px !important;
    margin-right: 5px !important;
    margin-left: 5px !important;
  }
  div.habitCard:first-of-type,  div.habitCard:nth-of-type(2),  div.habitCard:nth-of-type(3),  div.habitCard:nth-of-type(4) {
    margin-top: 0px !important;
  }
  div.habitCard:nth-of-type(4n+1){
    margin-right: 5px !important;
    margin-left: 0px !important;
  }
  div.habitCard:nth-of-type(4n+4){
    margin-right: 0px !important;
    margin-left: 5px !important;
  }
}

@media (min-width: 1200px) and (max-width: 1600px) {
  div.habitCard {
    min-width: calc(33.33% - 6.75px);
    max-width: calc(33.33% - 6.75px);
    margin-top: 15px !important;
    margin-right: 5px !important;
    margin-left: 5px !important;
  }
  div.habitCard:first-of-type,  div.habitCard:nth-of-type(2),  div.habitCard:nth-of-type(3) {
    margin-top: 0px !important;
  }
  div.habitCard:nth-of-type(3n+1){
    margin-right: 5px !important;
    margin-left: 0px !important;
  }
  div.habitCard:nth-of-type(3n+3){
    margin-right: 0px !important;
    margin-left: 5px !important;
  }
}
@media (min-width: 800px) and (max-width: 1200px) {
  div.habitCard {
    min-width: calc(50% - 5px);
    max-width: calc(50% - 5px);
    margin-top: 15px !important;
    margin-right: 5px !important;
    margin-left: 5px !important;
  }
  div.habitCard:first-of-type,  div.habitCard:nth-of-type(2) {
    margin-top: 0px !important;
  }
  div.habitCard:nth-of-type(2n+1){
    margin-right: 5px !important;
    margin-left: 0px !important;
  }
  div.habitCard:nth-of-type(2n+2){
    margin-right: 0px !important;
    margin-left: 5px !important;
  }
}
@media (max-width: 800px) {
  div.habitCard {
    min-width: 100%;
    max-width: 100%;
    margin-top: 15px !important;
  }
  div.habitCard:first-of-type {
    margin-top: 0px !important;
  }
}

div.card-text {
  margin: 10px;
}

img {
  height: 30px;
  width: 30px;
}
</style>