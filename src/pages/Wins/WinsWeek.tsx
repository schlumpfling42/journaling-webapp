import React from 'react';
import { EntityComponent } from 'src/components/week/EntityComponent';
import { withAuthenticationConsumer } from 'src/firebase/withAuthenticationConsumer';
import { WeekComponent } from './../../components/week';

export const  WinsWeek = withAuthenticationConsumer((props: any) => {
  return (
      <WeekComponent component={EntityComponent} typeName="Win" type={"wins"} {...props} />
  );
});
