import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getSettings, updateSettings } from '../../firebase/store';
import { withAuthenticationConsumer } from "../../firebase/withAuthenticationConsumer";
import { formatYYYYMMDD } from '../../utils/date';

import "./settings.css";

const settingsComponent = (props: any) => {

  const [settings, setSettings] = useState<any>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [pinEntered, setPinEntered] = useState<boolean>();
  const [hasPin, setHasPin] = useState<boolean>();
  const [changePin, setChangePin] = useState<boolean>(false);
  const [pin, setPin] = useState<string>();
  const [newPin, setNewPin] = useState<string>("");
  const [newPinConfirm, setNewPinConfirm] = useState<string>("");
  const [pinConfirmMatch, setPinConfirmMatch] = useState<boolean>(false);

  const [authUser] = useState(props.authUser);

  const pinRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
  
    getSettings(authUser.uid).then(doc => {
      if(mounted) {
        const now = new Date(Date.now());
        now.setHours(0);
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);
        if(doc != null && doc.data()) {
          const data: any = doc.data();
          setSettings(data);
          const startDateFromSettings: string = data.startDate;
          if(startDateFromSettings) {
            setStartDate(formatYYYYMMDD(startDateFromSettings));
          }
          const pinFromSettings: string = data.pin;
          if(pinFromSettings) {
            setPin(pinFromSettings);
            setHasPin(true);
            setPinEntered(false);
          } else {
            setHasPin(false);
            setPinEntered(false);
          }
        } else {
          setSettings({userId: props.authUser.uid});
        }
      }
    });
    return () => {
      mounted = false;
    }
  }, [authUser]);

  useEffect(() => {
    if(settings != null) {
      let changes = false;
      const newSettings = {...settings};
      if(startDate && startDate.length > 0 && settings.startDate !== startDate) {
        newSettings.startDate = startDate;
        changes = true;
      }
      if(pin !== undefined && pin !== null && settings.pin !== pin) {
        if(pin.length === 0) {
          delete newSettings.pin;
          changes = true;
          setHasPin(false);
        } else {
          newSettings.pin = pin;
          changes = true;
          setHasPin(true);
        }
      }
      if(changes === true) {
        updateSettings(props.authUser.uid, newSettings);
        setSettings(newSettings);
      }
    }
  }, [startDate, pin]);
  
  const startDateValueChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(startDate !== event.target.value) {
      const newStartDate = event.target.value;
      setStartDate(newStartDate);
    }
  }

  const newPinValueChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(newPin !== event.target.value) {
      const newPinValue = event.target.value;
      setNewPin(newPinValue);
      if(newPinConfirm === newPinValue && newPinValue.length > 0) {
        setPinConfirmMatch(true);
      } else {
        setPinConfirmMatch(false);
      }
    }
  }
  const newPinConfirmValueChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(newPinConfirm !== event.target.value) {
      const newPinConfirmValue = event.target.value;
      setNewPinConfirm(newPinConfirmValue);
      if(newPin === newPinConfirmValue && newPinConfirmValue.length > 0) {
        setPinConfirmMatch(true);
      } else {
        setPinConfirmMatch(false);
      }
    }
  }

  const pinChallengeEntered = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(pin === event.target.value) {
      setPinEntered(true);
    }
  }

  const editPin = () => {
    setChangePin(true);
  }

  const deletePin = () => {
    setPin("");
  }

  const savePinValue = () => {
    setPin(newPin);
    setChangePin(false);
  }

  const cancelPinEdit = () => {
    setChangePin(false);
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
        <p>Enter PIN to access Settings</p>
        <input ref={pinRef} type="password" minLength={4} maxLength={8} size={8}  onChange={pinChallengeEntered}/>
      </div>
    :
      <div className="page">
        <h2>Settings</h2>
        <div className="settings">
          <h3 className="settingName">Start date</h3>
          {
            startDate === "" ? null: <input type="date" id="start-date" className="settingValue" onChange={startDateValueChanged} value={startDate}/>
          }
        </div>
        <div className="settings">
          <h3 className="settingName">PIN</h3>
          {
            changePin === false ?
              <div className="pinValue">
                <input type="password" minLength={4} maxLength={8} size={8} id="pin" className="settingValue"  value={pin} disabled={true}/>
                <div className="actions">
                  <button className="save-value" onClick={editPin}>
                    <i className="material-icons md-dark value-button">create</i>
                  </button>
                  <button className="cancel-value" onClick={deletePin} disabled={hasPin===false}>
                    <i className="material-icons md-dark value-button">delete</i>
                  </button>
                </div>
              </div>
            :
            <div className="pinEdit">
              <div className="pinEditValues">
              <label>New PIN</label>
                <input id="pin" type="password" minLength={4} maxLength={8} size={8} className="settingValue" onChange={newPinValueChanged} value={newPin}/>
                <label>Confirm PIN</label>
                <input id="pinConfirm" type="password" minLength={4} maxLength={8} size={8} className="settingValue" onChange={newPinConfirmValueChanged} value={newPinConfirm}/>
              </div>
              <div className="actions">
                <button className="save-value" onClick={savePinValue} disabled={pinConfirmMatch===false}>
                  <i className="material-icons md-dark value-button">save</i>
                </button>
                <button className="cancel-value" onClick={cancelPinEdit}>
                  <i className="material-icons md-dark value-button">clear</i>
                </button>
              </div>
            </div>
          }
        </div>
      </div>
  );
}

export const SettingsComponent = withAuthenticationConsumer(settingsComponent);
