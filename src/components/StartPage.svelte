<script lang="ts">
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
let gratitude = 0;

loggedInUser.subscribe(aUser => {
  if(aUser != null) {
    user = aUser.user;
    
    onWeekSnapshot("wins", currentWeek.firstDayOfTheWeekString, user.uid, (recordDocument) => {
      if(recordDocument.exists) {
        wins = recordDocument.data().entities.length
      }
    });

    onWeekSnapshot("gratitude", currentWeek.firstDayOfTheWeekString, user.uid, (recordDocument) => {
      if(recordDocument.exists) {
        gratitude = recordDocument.data().entities.length
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
<div class="main">
  <h3>How is it going<br/>{user?.displayName}?</h3>
  <div class="circle-container">
    <button class="clock" on:click={()=> navigateTo("Wins")}><img src="/images/win.png" alt="Wins"/><span class="tooltip-text">Wins</span></button> 
    <button class="clock" on:click={()=> navigateTo("Gratitude")}><img src="/images/gratitude.png" alt="Gratitude"/><span class="tooltip-text">Gratitude</span></button>
    <button class="clock" on:click={()=> navigateTo("Journal")}><img src="/images/journal.png" alt="Journal"/><span class="tooltip-text">Journal</span></button>
    <button class="clock" on:click={()=> navigateTo("Anger")}><img src="/images/anger.png" alt="Anger"/><span class="tooltip-text">Anger</span></button> 
    <button class="clock" on:click={()=> navigateTo("Integrity")}><img src="/images/integritylist.png" alt="Integrity List"/><span class="tooltip-text">Integrity List</span></button>
    <button class="clock" on:click={()=> navigateTo("Habits")}><img src="/images/habit.png" alt="Habits"/><span class="tooltip-text">Habits</span></button>
    <button class="clock" on:click={()=> navigateTo("Contacts")}><img src="/images/contacts.png" alt="Contacts"/><span class="tooltip-text">Contacts</span></button>
  </div>
  <div class="centerInCircle">
    <h3>This week</h3>
    <h4>You have {wins} {wins == 1 ? "Win" : "Wins"}</h4>
    <h4>You have been grateful for {gratitude} {gratitude == 1 ? "thing" : "things"}</h4>
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
<style lang="scss">
@import "node_modules/mathsass/dist/math";
@function subtract($a, $b) {
  @return calc(#{$a} - #{$b});
}
@function add($a, $b) {
  @return calc(#{$a} + #{$b});
}
@mixin on-circle($top, $item-count, $circle-height, $circle-width, $item-size) {
  position: absolute;
  left: 5%;
  right: 5%;
  top: $top;
  bottom: 5%;
  z-index: 10;
  
  > * {
    display: block;
    position: absolute;
    bottom: 50%;
    left: 50%;
    width:  $item-size;
    height: $item-size;
  
    $angle: (360 / $item-count);
    $rot: 0;

    @for $i from 1 through $item-count {
      &:nth-of-type(#{$i}) {
        transform:
          translateX(subtract(sin($rot*1deg)*-$circle-width, $item-size))
          translateY(add(cos($rot*1deg)*-$circle-height, $item-size))
      }

      $rot: $rot + $angle;
    }
  }
}
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

button:hover {
  border-radius: 50%;
  box-shadow: 0 0 25px grey;
}

@media (min-width: 800px) {
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

@media (min-width: 1600px){
  .circle-container {
    @include on-circle($top: 5%, $item-count: 7, $circle-height: 30vh, $circle-width: 20vw, $item-size: 80px); 
    
    button { 
      display: block; 
      
      &:hover,
      &:active {
        filter: grayscale(0);
      }
    }
  }
}
@media (min-width: 1200px) and (max-width: 1600px) {
  .circle-container {
    @include on-circle($top: 5%, $item-count: 7, $circle-height: 30vh, $circle-width: 30vw, $item-size: 80px); 
    
    button { 
      display: block; 
      
      &:hover,
      &:active {
        filter: grayscale(0);
      }
    }
  }
}
@media (min-width: 800px) and (max-width: 1200px) {
  .circle-container {
    @include on-circle($top: 5%, $item-count: 7, $circle-height: 30vh, $circle-width: 35vw, $item-size: 80px); 
    
    button { 
      display: block; 
      
      &:hover,
      &:active {
        filter: grayscale(0);
      }
    }
  }
}
@media (max-width: 800px){
.circle-container {
    @include on-circle($top: 15%, $item-count: 7, $circle-height: 35vh, $circle-width: 40vw, $item-size: 48px); 
    
    button { 
      display: block; 
      
      &:hover,
      &:active {
        filter: grayscale(0);
      }
    }
  }
}
@media (max-width: 800px){

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
  button.eleven {
    position: absolute;
    top: calc(35% - 40px);
    left: calc(15% - 40px);
  }
  button.nine {
    position: absolute;
    top: calc(60% - 40px);
    left: calc(15% - 40px);
  }
  button.seven {
    position: absolute;
    top: calc(80% - 40px);
    left: calc(35% - 40px);
  }
  button.five {
    position: absolute;
    top: calc(80% - 40px);
    left: calc(65% - 40px);
  }
  button.three {
    position: absolute;
    top: calc(60% - 40px);
    left: calc(85% - 40px); 
  }

  button.one {
    position: absolute;
    top: calc(35% - 40px);
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