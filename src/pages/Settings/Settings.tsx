import React, { useEffect, useState } from 'react';
import { PinComponent } from 'src/components/pin';
import { store } from '../../firebase';

import { getSettings, updateSettings } from '../../firebase/store';
import { withAuthenticationConsumer } from "../../firebase/withAuthenticationConsumer";
import { formatYYYYMMDD, getWeeksSince } from '../../utils/date';

import "./settings.css";

const settingsComponent = (props: any) => {

  const [settings, setSettings] = useState<any>(null);
  const [startDateFromSettings, setStartDateFromSettings] = useState<Date>(new Date());
  const [startDate, setStartDate] = useState<string>("");
  const [hasPin, setHasPin] = useState<boolean>();
  const [changePin, setChangePin] = useState<boolean>(false);
  const [pin, setPin] = useState<string>();
  const [newPin, setNewPin] = useState<string>("");
  const [newPinConfirm, setNewPinConfirm] = useState<string>("");
  const [pinConfirmMatch, setPinConfirmMatch] = useState<boolean>(false);
  const [exportJournal, setExportJournal] = useState<boolean>(false);
  const [exportAnger, setExportAnger] = useState<boolean>(false);
  const [exportWins, setExportWins] = useState<boolean>(false);

  const [authUser] = useState(props.authUser);
  // const [accessToken] = useState(props.fbAccessToken);
  // const [userId] = useState(props.fbUserId);

  // const [groups, setGroups] = useState();

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
          const startDateStringFromSettings: string = data.startDate;
          if(startDateStringFromSettings) {
            setStartDateFromSettings(new Date(startDateStringFromSettings));
            setStartDate(formatYYYYMMDD(startDateStringFromSettings));
          }
          const pinFromSettings: string = data.pin;
          if(pinFromSettings) {
            setPin(pinFromSettings);
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

  // useEffect(() => {
  //   if(userId && accessToken) {
  //     fetch( "https://graph.facebook.com/"+userId+"/groups?access_token="+accessToken)
  //         .then(response => response.json())
  //         .then(result => setGroups(result));
  //   }

  // }, [userId, accessToken]);

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

  const checked = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(event.target.id === "journal") {
      setExportJournal(event.target.checked);
    }
    if(event.target.id === "anger") {
      setExportAnger(event.target.checked);
    }
    if(event.target.id === "wins") {
      setExportWins(event.target.checked);
    }
  }

  const exportData = async () => {
    let exportDataString = "";
    if(authUser) {
      const newWeeks = getWeeksSince(startDateFromSettings);
      if(exportWins && exportWins === true) {
        setExportWins(false);
        exportDataString += "Wins\n";
        for(const aWeek of newWeeks) {
          await store.entities("wins", aWeek.firstDayOfTheWeekString, authUser.uid).then(doc => {
            if(doc != null && doc.data()) {
              const data: any =  doc.data();
              for(const anEntity of data.entities) {
                exportDataString += new Date(anEntity.date).toLocaleDateString() + ": " + anEntity.value + "\n";
              }
            }
          });
        }
      }
      if(exportJournal && exportJournal === true) {
        setExportJournal(false);
        exportDataString += "Journal Entries:\n";
        for(const aWeek of newWeeks) {
          await store.entities("journal", aWeek.firstDayOfTheWeekString, authUser.uid).then(doc => {
            if(doc != null && doc.data()) {
              const data: any =  doc.data();
              for(const anEntity of data.entities) {
                exportDataString += new Date(anEntity.date).toLocaleDateString() + ": " + anEntity.value + "\n";
              }
            }
          });
        }
      }
      if(exportAnger && exportAnger === true) {
        setExportAnger(false);
        exportDataString += "Anger Journal Entries:\n";
        for(const aWeek of newWeeks) {
          await store.entities("anger", aWeek.firstDayOfTheWeekString, authUser.uid).then(doc => {
            if(doc != null && doc.data()) {
              const data: any =  doc.data();
              for(const anEntity of data.entities) {
                exportDataString += new Date(anEntity.date).toLocaleDateString() + ": " + anEntity.value + "\n";
              }
            }
          });
        }
      }

      const element = document.createElement("a");
      const file = new Blob([exportDataString], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "wins-and-journal-export.txt";
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
    }
  }

  return (
    <PinComponent name="Settings" authUser={props.authUser}>
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
                <input type="password" minLength={4} maxLength={8} size={8} id="pin" className="settingValue"  value={pin ? pin : ""} disabled={true}/>
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
                <input id="pin" type="password" minLength={4} maxLength={8} size={8} className="settingValue" onChange={newPinValueChanged} value={newPin ? newPin : ""}/>
                <label>Confirm PIN</label>
                <input id="pinConfirm" type="password" minLength={4} maxLength={8} size={8} className="settingValue" onChange={newPinConfirmValueChanged} value={newPinConfirm ? newPinConfirm : ""}/>
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
        <div className="settings">
          <h3 className="settingName">Export</h3>
          <div>
          <input id="wins" type="checkbox" className="line-element" checked={exportWins} onChange={checked}/><label>Wins</label>
          <input id="journal" type="checkbox" className="line-element" checked={exportJournal} onChange={checked}/><label>Journal</label>
          <input id="anger" type="checkbox" className="line-element" checked={exportAnger} onChange={checked}/><label>Anger</label>
          </div>
          <div className="actions">
            <button className="export-value" onClick={exportData} disabled={!(exportAnger || exportJournal || exportWins)}>
              <i className="material-icons md-dark value-button">download</i>
            </button>
          </div>
        </div>
      </div>
    </PinComponent>
  );
}

export const SettingsComponent = withAuthenticationConsumer(settingsComponent);
