<script lang="ts">
import { slide } from 'svelte/transition';
import { quintOut } from 'svelte/easing';
import { Button, Card, CardColumns, CardDeck, CardGroup, CardHeader, CardText, Col, Container, Input, ListGroup, ListGroupItem, Modal, ModalBody, ModalFooter, ModalHeader, Row} from "sveltestrap";
import { router } from '@spaceavocado/svelte-router';
import { getWeek, getWeeksSince, getISOStringToDisplayString, getISOStringAsLocalDate, dayOfTheWeek, dateAsISOString, getUTCDayAsLocalDate, dateToDisplayString } from "../utils/date";
import { weekEntity, loggedInUser, settings, updateWeekEntity } from "../utils/store";
import PinModal from './PinModal.svelte';

export let name;
export let key;
export let image;

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

let journalRecordsByWeek = [];
let currentJournalRecord;

$: allWeeks = $settings ? getWeeksSince(getISOStringAsLocalDate($settings.startDate)).reverse() : [];

$: if(allWeeks) update();

function update() {
  if(allWeeks) {
    journalRecordsByWeek = [];
    for(const weekIndex in allWeeks) {
      if(currentWeek.firstDayOfTheWeekString == allWeeks[weekIndex].firstDayOfTheWeekString) {
        currentJournalRecord = { 
          id: currentWeek.lastDayOfTheWeek.getTime(),
          week: currentWeek.firstDayOfTheWeekString
        }
        journalRecordsByWeek[weekIndex] = currentJournalRecord;
      }
      weekEntity(key, allWeeks[weekIndex].firstDayOfTheWeekString, user.uid)
        .then(document => {
          const data = document?.data();
          if(data) {
            journalRecordsByWeek[weekIndex] = data;
            if(currentWeek.firstDayOfTheWeekString == data.week) {
              currentJournalRecord = data;
            }
          }
          journalRecordsByWeek = journalRecordsByWeek;
        });
    }
  }
}

function journalByDay(journal) {
  let journalByDay = [[], [], [], [], [], [], []];
  if(journal.entities) {
    for(let index in journal.entities) {
      let entry = journal.entities[index];
      let dayIndex = getISOStringAsLocalDate(entry.date).getDay();
      let entries = journalByDay[dayIndex];
      entries.push(entry);
    }
  }
  return journalByDay.reverse();
}

update();

function getDateString(week, weekIndex, journalIndex) {
  let day = weekdays[journalIndex] + " " + dateToDisplayString(dayOfTheWeek(week, 6- journalIndex));
  return day;
}

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
let selectedJournalRecord;

let editedValue;
function edit(event, entry, journalRecord) {
  event.stopPropagation();
  selectedEntry = entry;
  selectedJournalRecord = journalRecord;
  editedValue = selectedEntry.value;
}

function remove(event, entry, journalRecord) {
  event.stopPropagation();
  journalRecord.entities.splice(journalRecord.entities.indexOf(entry), 1);
  updateWeekEntity(key, journalRecord.week, journalRecord, user.uid); 
  deSelect();
  selectedElement = null;
  journalRecordsByWeek = journalRecordsByWeek;
}

function add() {
  editedValue = null;
  selectedJournalRecord = currentJournalRecord;
  selectedEntry = { value: "", date: dateAsISOString(new Date())};
}

function save(updatedValue) {
  selectedEntry.value = updatedValue;
  if(!selectedJournalRecord.entities) {
    selectedJournalRecord.entities = [];
  }
  if(!selectedJournalRecord.entities.includes(selectedEntry)) {
    selectedJournalRecord.entities.unshift(selectedEntry);
  }
  updateWeekEntity(key, selectedJournalRecord.week, selectedJournalRecord, user.uid); 
  selectedEntry = null;
  selectedJournalRecord = null;
  journalRecordsByWeek = journalRecordsByWeek;
  updatedValue = null;
}

</script>
<div class="page main" transition:slide="{{delay: 250, duration: 300, easing: quintOut}}">
  <div class="header">
    <button class="back image60" on:click={()=> navigateTo("Home")}><img src="/images/back.png" alt="Back" /><span class="tooltip-text">Back</span></button>
    <img class="header" src="{image}" alt="{name}"/>
    <h3>{name}</h3>
    <button class="add image60" on:click={() => add()}><img src="/images/add.png" alt="Add" /><span class="tooltip-text">Add</span></button>
  </div>
  <div class="content">
    {#each allWeeks as week, weekIndex}
    <CardDeck class="roll">
      {#if journalRecordsByWeek[weekIndex] && journalByDay(journalRecordsByWeek[weekIndex])}
        {#each journalByDay(journalRecordsByWeek[weekIndex]) as journalEntries, journalIndex}
          {#if journalEntries}
            {#each journalEntries as journal}
              {#if journal}
              <Card class="mb-12">
                <CardHeader class="dayHeader">
                  {getDateString(week, weekIndex, journalIndex)}
                </CardHeader>
                <CardText>
                  <ListGroup>
                    <li class="list-group-item" on:click={select}>
                      <div class="selectedElement alignLeft shortened">
                        <div class="selectedElementActions">
                          <button class="image40" on:click={(event)=> remove(event, journal, journalRecordsByWeek[weekIndex])}><img src="/images/delete.png" alt="Delete" /><span class="tooltip-text">Delete</span></button>
                          <button class="image40" on:click={(event)=> edit(event, journal, journalRecordsByWeek[weekIndex])}><img src="/images/edit.png" alt="Edit" /><span class="tooltip-text">Edit</span></button>
                        </div>{journal.value}
                      </div>
                    </li>
                  </ListGroup>
                </CardText>
              </Card>
              {/if}
            {/each}
          {/if}
        {/each}
      {/if}
    </CardDeck>
    {/each} 
  </div>
  <Modal transitionOptions isOpen={selectedEntry} size="lg">
    <ModalHeader>
      {name}
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
  <PinModal unlockCallback={update}/>
</div>
<style>
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
  overflow: hidden;
}

.cardContent {
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
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