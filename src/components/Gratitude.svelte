<script lang="ts">
import { Button, CardDeck, CardHeader, CardText, ListGroup, Modal, ModalBody, ModalFooter, ModalHeader} from "sveltestrap";
import { loggedInUser, settings } from '../utils/store';
import { router } from '@spaceavocado/svelte-router';
import { getWeek, getWeeksSince, getISOStringAsLocalDate, dayOfTheWeek, dateAsISOString, dateToDisplayString } from "../utils/date";
import { weekEntity, updateWeekEntity } from "../utils/store";

let user;

loggedInUser.subscribe(aUser => {
  if(aUser != null) {
    user = aUser.user;
  }
});

function navigateTo(name) {
  $router.push({name});
}

let currentWeek = getWeek(new Date(Date.now()), []);
const weekdays = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
].reverse();

let gratitudeWeeks = [];
let gratitudeRecordsByWeek = [];

let currentGratitudeRecord;

$: allWeeks = $settings ? getWeeksSince(getISOStringAsLocalDate($settings.startDate)).reverse() : null;

$: if(allWeeks) update();
function update() {
  if(allWeeks) {
    gratitudeRecordsByWeek = [];
    gratitudeWeeks = allWeeks;
    for(let weekIndex in gratitudeWeeks) {
      if(currentWeek.firstDayOfTheWeekString == gratitudeWeeks[weekIndex].firstDayOfTheWeekString) {
        currentGratitudeRecord = { 
          id: currentWeek.lastDayOfTheWeek.getTime(),
          week: currentWeek.firstDayOfTheWeekString
        }
        gratitudeRecordsByWeek[weekIndex] = currentGratitudeRecord;
      }
      weekEntity("gratitude", gratitudeWeeks[weekIndex].firstDayOfTheWeekString, user.uid)
        .then(document => {
          const data = document?.data();
          if(data) {
            gratitudeRecordsByWeek[weekIndex] = data;
            if(currentWeek.firstDayOfTheWeekString == data.week) {
              currentGratitudeRecord = data;
            }
          }
          gratitudeRecordsByWeek = gratitudeRecordsByWeek;
        });
    }
  }
}

function gratitudeByDay(gratitude) {
  let gratitudeByDay = [[], [], [], [], [], [], []];
  if(gratitude.entities) {
    for(let index in gratitude.entities) {
      let entry = gratitude.entities[index];
      let dayIndex = getISOStringAsLocalDate(entry.date).getDay();
      let entries =gratitudeByDay[dayIndex];
      if(!entries) {
        entries = [entry];
        gratitudeByDay[dayIndex] = entries;
      } else {
        entries.push(entry);
      }
    }
  }
  return gratitudeByDay.reverse();
}

update();

let selectedElement;
function select(event) {
  selectedElement?.firstChild.classList.add("shortened");
  selectedElement?.classList.remove("selectedElement");
  if(selectedElement !== event.currentTarget) {
    selectedElement = event.currentTarget;
    selectedElement?.firstChild.classList.remove("shortened");
    selectedElement?.classList.add("selectedElement");
  } else {
    selectedElement = null;
  }
}

function deSelect() {
  selectedElement?.firstChild.classList.add("shortened");
  selectedElement?.classList.remove("selectedElement");
  selectedElement = null;
}

let selectedEntry;
let selectedGratitudeRecord;
let editedValue = "I am grateful for ";

function edit(event, entry, gratitudeRecord) {
  event.stopPropagation();
  selectedEntry = entry;
  selectedGratitudeRecord = gratitudeRecord;
  editedValue = selectedEntry.value;
}

function remove(event, entry, gratitudeRecord) {
  event.stopPropagation();
  gratitudeRecord.entities.splice(gratitudeRecord.entities.indexOf(entry), 1);
  updateWeekEntity("gratitude", gratitudeRecord.week, gratitudeRecord, user.uid); 
  deSelect();
  selectedElement = null;
  selectedGratitudeRecord = null;
  gratitudeRecordsByWeek = gratitudeRecordsByWeek;
}

function add() {
  selectedGratitudeRecord = currentGratitudeRecord;
  selectedEntry = { value: "", date: dateAsISOString(new Date())};
  deSelect();
}

function save(updatedValue) {
  selectedEntry.value = updatedValue;
  if(!selectedGratitudeRecord.entities) {
    selectedGratitudeRecord.entities = [];
  }
  if(!selectedGratitudeRecord.entities.includes(selectedEntry)) {
    selectedGratitudeRecord.entities.unshift(selectedEntry);
  }
  updateWeekEntity("gratitude", selectedGratitudeRecord.week, selectedGratitudeRecord, user.uid); 
  selectedEntry = null;
  selectedGratitudeRecord = null;
  gratitudeRecordsByWeek = gratitudeRecordsByWeek;
  editedValue = "I am grateful for ";
}

</script>
<div class="page main">
  <div class="header">
    <button class="back image60" on:click={()=> navigateTo("Home")}><img src="/images/back.png" alt="Back" /><span class="tooltip-text">Back</span></button>
    <img class="header" src="/images/gratitude.png" alt="Gratitude"/>
    <h3>Gratitude</h3>
    <button class="add image60" on:click={() => add()}><img src="/images/add.png" alt="Add" /><span class="tooltip-text">Add</span></button>
  </div>
  <div class="content">
    <CardDeck>
    {#each gratitudeWeeks as week, weekIndex}
      {#if gratitudeRecordsByWeek[weekIndex]}
        {#each gratitudeByDay(gratitudeRecordsByWeek[weekIndex]) as gratitudes, gratitudeIndex}
          {#if gratitudes && gratitudes.length > 0}
          <div class="card">
            <CardHeader class="dayHeader">
              {weekdays[gratitudeIndex]} {dateToDisplayString(dayOfTheWeek(week, 6-gratitudeIndex))}
            </CardHeader>
            <CardText>
              <ListGroup>
              {#each gratitudes as gratitude}
                <li class="list-group-item" on:click={select}>
                  <div class="selectedElement alignLeft shortened">
                    <div class="selectedElementActions">
                      <button class="image40" on:click={(event)=> remove(event, gratitude, gratitudeRecordsByWeek[weekIndex])}><img src="/images/delete.png" alt="Delete" /><span class="tooltip-text">Delete</span></button>
                      <button class="image40" on:click={(event)=> edit(event, gratitude, gratitudeRecordsByWeek[weekIndex])}><img src="/images/edit.png" alt="Edit" /><span class="tooltip-text">Edit</span></button>
                    </div>{gratitude.value}
                  </div>
                </li>
              {/each}
              </ListGroup>
            </CardText>
          </div>
          {/if}
        {/each}
      {/if}
      {/each} 
    </CardDeck>
  </div>
  <Modal transitionOptions isOpen={selectedEntry} size="lg">
    <ModalHeader>
      Gratitude
    </ModalHeader>
    <ModalBody>
      <div class="input">
        <textarea bind:value={editedValue} class="entryInput form-control" autofocus/>
      </div>
    </ModalBody>
    <ModalFooter>
      <Button color="secondary" on:click={() => selectedEntry = null}>Cancel</Button>
      <Button color="primary" on:click={() => save(editedValue)}>Save</Button>
    </ModalFooter>
  </Modal>
</div>
<style>

:global(.modal-title) {
  width: 100%;
}
.page {
  height: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-items: stretch;
}
:global(.weekHeader) {
  padding-top: 5px !important;
  padding-bottom: 0px !important;
}
:global(.dayHeader) {
  padding-top: 5px !important;
  padding-bottom: 5px !important;
  font-weight: bold !important;
  width: 100%;
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

div.card {
  margin-top: 15px !important;
}
div.card:first-of-type {
  margin-top: 0px !important;
}

div.alignLeft {
  text-align: left;
}

:global(li.selectedElement) {
  outline: 2px solid blue;
  outline-offset: -2px;
}

li.list-group-item {
  cursor: pointer !important;
}

div.selectedElement {
  white-space:pre-wrap;
}

div.shortened {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

div.selectedElementActions {
  float: right;
  justify-content: flex-end;
  display: flex;
  margin-top: -8px;
  margin-bottom: -12px;
  margin-right: -10px;
}
div.shortened div button {
  display: none;
}

div.shortened div.selectedElementActions {
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
  button.add {
    position: absolute;
    top: 25px;
    right: 40px;
  }
  div.input {
    display: flex;
    height: 500px;
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

  div.input {
    display: flex;
    height: 250px;
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
}

img {
  width: 100%;
}
</style>