import React from 'react';
import { PinComponent } from 'src/components/pin';
import { EntityComponent } from 'src/components/week/EntityComponent';
import { WeekComponent } from '../../components/week';
import { withAuthenticationConsumer } from '../../firebase/withAuthenticationConsumer';
import "./angerWeek.css";

export const AngerWeekComponent = withAuthenticationConsumer((props: any) => {
  return (
    <PinComponent name="Anger Journal" authUser={props.authUser}>
      <WeekComponent component={EntityComponent} typeName="Anger Journal Entry" type={"anger"}  {...props} />
    </PinComponent>
  );
});
