import React from 'react';
import { PinComponent } from 'src/components/pin';
import { WeekComponent } from '../../components/week';
import { withAuthenticationConsumer } from '../../firebase/withAuthenticationConsumer';
import "./journalWeek.css";

export const JournalWeek = withAuthenticationConsumer((props: any) => {
  return (
    <PinComponent authUser={props.authUser}>
      <WeekComponent typeName="Journal Entry" type={"journal"}  {...props} />
    </PinComponent>
  );
});
