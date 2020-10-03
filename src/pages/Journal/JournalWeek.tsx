import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { WeekComponent } from '../../components/week';
import { store } from '../../firebase';
import { withAuthenticationConsumer } from '../../firebase/withAuthenticationConsumer';
// import { Modal } from '../../components/modal';
import "./journalWeek.css";

export const JournalWeek = withAuthenticationConsumer((props: any) => {
  const [pinEntered, setPinEntered] = useState<boolean>();
  const [hasPin, setHasPin] = useState<boolean>();
  const [pin, setPin] = useState<string>();
  const [authUser] = useState(props.authUser);

  const pinRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    if(authUser) {
      store.getSettings(props.authUser.uid).then(doc => {
        if(mounted) {
          if(doc != null && doc.data()) {
            const data: any = doc.data();
            if(data.pin) {
              setHasPin(true);
              setPin(data.pin);
              setPinEntered(false)
            } else {
              setHasPin(false);
              setPinEntered(false)
            }
          }
        }
      });
    }
    return () => {
      mounted = false;
    }
  }, [authUser]);

  const valueChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(pin === event.target.value) {
      setPinEntered(true);
    }
  }

  useLayoutEffect(() => {
    if(hasPin === true && pinEntered === false) {
      pinRef?.current?.focus();
    }
  })


  return (
    hasPin === undefined ?
      <div className="cssload-container">
        <div className="cssload-speeding-wheel"/>
      </div>
    :
      pinEntered === false && hasPin === true ?
        <div className="pin">      
          <p>Enter PIN to access Journal</p>
          <input ref={pinRef} type="password" minLength={4} maxLength={8} size={8}  onChange={valueChanged}/>
        </div>
      :
        <div>      
          <WeekComponent type={"journal"}  {...props} />
        </div>

  );
});
