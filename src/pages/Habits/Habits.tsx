import React from 'react';
import { EntityHabitComponent } from 'src/components/list/EntityHabitComponent';
import { WeekEntityList } from '../../components/list';
import { withAuthenticationConsumer } from '../../firebase/withAuthenticationConsumer';

export const  HabitsComponent = withAuthenticationConsumer((props: any) => {
  return (
    <div>
      <WeekEntityList className="page-week" component={EntityHabitComponent} typeName="Habit" title="Habits to develop" isCheckList={true} type={"habits"} {...props} />
    </div>
  );
  
});
