import React from 'react';
import { withAuthenticationConsumer } from 'src/firebase/withAuthenticationConsumer';
import { WeekComponent } from './../../components/week';

export const  WinsWeek = withAuthenticationConsumer((props: any) => {
  return (
      <WeekComponent typeName="Win" type={"wins"} {...props} />
  );
});
