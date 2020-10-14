import React from 'react';
import { EntityComponent } from '../../components/list/ContactEntityComponent';
import { EntityListComponent } from '../../components/list/EntityListComponent';
import { withAuthenticationConsumer } from '../../firebase/withAuthenticationConsumer';

export const  ContactsComponent = withAuthenticationConsumer((props: any) => {
  return (
    <div>
      <EntityListComponent component={EntityComponent} typeName="Contact" title="Important contacts" isCheckList={false} type={"contacts"} {...props} />
    </div>
  );
  
});
