import React from 'react';
import { PinComponent } from 'src/components/pin';
import { EntityComponent } from 'src/components/week/EntityComponent';
import { WeekComponent } from '../../components/week';
import { withAuthenticationConsumer } from '../../firebase/withAuthenticationConsumer';
import "./journalWeek.css";

export const JournalWeek = withAuthenticationConsumer((props: any) => {
  return (
    <PinComponent name="Journal" authUser={props.authUser}>
      <WeekComponent component={EntityComponent} typeName="Journal Entry" type={"journal"}  {...props} />
    </PinComponent>
  );
});
