import React from 'react';
import { EntityCheckComponent } from '../../components/list/EntityCheckComponent';
import { EntityListComponent } from '../../components/list/EntityListComponent';
import { withAuthenticationConsumer } from '../../firebase/withAuthenticationConsumer';

export const  IntegrityChecklistComponent = withAuthenticationConsumer((props: any) => {
  return (
    <div>
      <EntityListComponent component={EntityCheckComponent} title="Things to finish" isCheckList={true} type={"integrityChecklist"} {...props} />
    </div>
  );
  
});
