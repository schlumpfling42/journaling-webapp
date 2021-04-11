<script lang="ts">
import { slide } from 'svelte/transition';
import { loggedInUser, onSnapshot, onWeekSnapshot } from '../utils/store';
import { router } from '@spaceavocado/svelte-router';
import { getISOStringAsLocalDate, getWeek } from '../utils/date';

let user;
let currentWeek = getWeek(new Date(Date.now()), []);

let wins = 0;
let journalEntries = 0;
let angerJournalEntries = 0;
let integrityChecks = 0;
let habits = 0;

loggedInUser.subscribe(aUser => {
  if(aUser != null) {
    user = aUser.user;
    
    onWeekSnapshot("wins", currentWeek.firstDayOfTheWeekString, user.uid, (recordDocument) => {
      if(recordDocument.exists) {
        wins = recordDocument.data().entities.length
      }
    });
    
    onWeekSnapshot("journal", currentWeek.firstDayOfTheWeekString, user.uid, (recordDocument) => {
      if(recordDocument.exists) {
        journalEntries = recordDocument.data().entities.length
      }
    });
    onWeekSnapshot("anger", currentWeek.firstDayOfTheWeekString, user.uid, (recordDocument) => {
      if(recordDocument.exists) {
        angerJournalEntries = recordDocument.data().entities.length
      }
    });

    onSnapshot("integrityChecklist", user.uid, (recordDocument) =>  {
      let integrityRecord = recordDocument?.data();
      if(integrityRecord && integrityRecord.finishedEntities) {
        integrityChecks = integrityRecord.finishedEntities.filter(anEntity => getISOStringAsLocalDate(anEntity.finishedDate).getTime() > currentWeek.firstDayOfTheWeek.getTime()).length;
      }
    });
    onSnapshot("habits", user.uid, (recordDocument) =>  {
      let habitsRecord = recordDocument?.data();
      if(habitsRecord && habitsRecord.entities) {
        habits = habitsRecord.entities.filter(anEntity => anEntity.checkValues && Object.keys(anEntity.checkValues).length > 0).length;
      }
    });
  }
});

function navigateTo(name) {
  $router.push({name});
}

</script>
<div class="main" transition:slide="{{duration: 300}}">
  <h3>How is it going<br/>{user?.displayName}?</h3>
  <button class="zero clock" on:click={()=> navigateTo("Wins")}><img src="/images/win.png" alt="Wins"/><span class="tooltip-text">Wins</span></button> 
  <button class="ten clock" on:click={()=> navigateTo("Journal")}><img src="/images/journal.png" alt="Journal"/><span class="tooltip-text">Journal</span></button>
  <button class="eight clock" on:click={()=> navigateTo("Anger")}><img src="/images/anger.png" alt="Anger"/><span class="tooltip-text">Anger</span></button> 
  <button class="six clock" on:click={()=> navigateTo("Integrity")}><img src="/images/integritylist.png" alt="Integrity List"/><span class="tooltip-text">Integrity List</span></button>
  <button class="four clock" on:click={()=> navigateTo("Habits")}><img src="/images/habit.png" alt="Habits"/><span class="tooltip-text">Habits</span></button>
  <button class="two clock" on:click={()=> navigateTo("Contacts")}><img src="/images/contacts.png" alt="Contacts"/><span class="tooltip-text">Contacts</span></button>
  <div class="centerInCircle">
    <h3>This week</h3>
    <h4>You have {wins} {wins == 1 ? "Win" : "Wins"}</h4>
    <h4>You journaled {journalEntries + angerJournalEntries} times</h4>
    {#if integrityChecks == 0}
    <h4>You not checked off any integrity items</h4>
    {:else if integrityChecks == 1}
    <h4>You checked off 1 integrity item</h4>
    {:else}
    <h4>You checked off {integrityChecks} integrity items</h4>
    {/if}
    {#if habits == 0}
    <h4>You are not working on habits</h4>
    {:else if habits == 1}
    <h4>You are working on 1 habit</h4>
    {:else}
    <h4>You are working on {habits} habits</h4>
    {/if}
  </div>
  <button class="settings image60" on:click={()=> navigateTo("Settings")}><img src="/images/setting.png" alt="Settings" /><span class="tooltip-text">Settings</span></button>
</div>
<style>
button.clock {
  width: auto;
  height: auto;
  outline: none;
  background-color: transparent;
  border: none;
}
img {
  width: 100%;
}
div.center {
  height: inherit;
  flex-grow: 5;
  display: flex;
  flex-direction: column;
}
@media (min-width: 800px){
  div.main {
    margin: 20px;
  }
  button.settings {
    position: absolute;
    right: 20px;
    top: 20px;
  }
  button.clock img {
    height: 150px;
    width: auto;
  }
  button.zero {
    position: absolute;
    top: calc(20% - 75px);
    left: calc(50% - 75px);
  }
  button.ten {
    position: absolute;
    top: calc(40% - 75px);
    left: calc(30% - 75px);
  }
  button.eight {
    position: absolute;
    top: calc(60% - 75px);
    left: calc(30% - 75px);
  }
  button.six {
    position: absolute;
    top: calc(75% - 75px);
    left: calc(50% - 75px);
  }
  button.four {
    position: absolute;
    top: calc(60% - 75px);
    left: calc(70% - 75px);
  }
  button.two {
    position: absolute;
    top: calc(40% - 75px);
    left: calc(70% - 75px);
  }

  div.centerInCircle {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: absolute;
    top: calc(20% + 85px);
    bottom: calc(25% + 85px);
    left: calc(30% + 85px);
    right: calc(30% + 85px);
  }
}
@media (max-width: 800px){
  h3 {
    margin-right: 20px;
  }
  .centerInCircle h4 {
    font-size: large;
  }
  div.main {
    margin: 10px;
  }
  button.settings {
    position: absolute;
    right: 15px;
    top: 15px;
  }
  button.clock img {
    height: 80px;
    width: auto;
  }

  button.zero {
    position: absolute;
    top: calc(20% - 40px);
    left: calc(50% - 40px);
  }
  button.ten {
    position: absolute;
    top: calc(40% - 40px);
    left: calc(15% - 40px);
  }
  button.eight {
    position: absolute;
    top: calc(60% - 40px);
    left: calc(15% - 40px);
  }
  button.six {
    position: absolute;
    top: calc(85% - 40px);
    left: calc(50% - 40px);
  }
  button.four {
    position: absolute;
    top: calc(60% - 40px);
    left: calc(85% - 40px);
  }
  button.two {
    position: absolute;
    top: calc(40% - 40px);
    left: calc(85% - 40px);
  }

  div.centerInCircle {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    position: absolute;
    top: calc(25% + 50px);
    bottom: calc(20% + 50px);
    left: calc(20% + 15px);
    right: calc(20% + 15px);
  }
}
</style>