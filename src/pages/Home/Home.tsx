import React, {useLayoutEffect, useRef, useState} from "react";
import { store } from "../../firebase";
import { withAuthenticationConsumer } from "../../firebase/withAuthenticationConsumer";
import { Entity } from "../../types/Entity";
import { WeekEntity } from "../../types/WeekEntity";
import { dateAsISOString, getWeek, Week } from "../../utils/date";
import "./home.css"

const homeComponent = (props:any) => {
  const [type, setType] = useState<string>("wins");
  const [value, setValue] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const cancelEdit = () => {
    setValue("");
  }
  
  const saveValue = () => {
    const week: Week = getWeek(new Date(Date.now()), []);
    store.entities(type, week.firstDayOfTheWeekString, props.authUser.uid).then(doc => {
      let weekEntity: WeekEntity;
      if(doc != null && doc.data()) {
        weekEntity = Object.assign(new WeekEntity(), doc.data());
      } else {
        weekEntity = new WeekEntity();
        weekEntity.week = week.firstDayOfTheWeekString;
        weekEntity.id = Date.now();
        weekEntity.entities = [];
        weekEntity.userId = props.authUser.uid;
      }
      const entity: Entity = new Entity();
      entity.date = dateAsISOString(new Date(Date.now()));
      entity.id = Date.now();
      entity.value = value;
      weekEntity.entities.push(entity);
      store.updateWeekEntity(type, week.firstDayOfTheWeekString, weekEntity, props.authUser.uid)
    });
    setValue("");
  }

  const valueChanged = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if(value !== event.target.value) {
      setValue(event.target.value ? event.target.value : "");
    }
  }
  
  useLayoutEffect(() => {
    textareaRef?.current?.focus();
  });

  const typeChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(type !== event.target.value) {
      setType(event.target.value);
    }
  }

  
  if(!props.authUser) {
    return (
        <div className="cssload-container">
        <div className="cssload-speeding-wheel"/>
      </div>
    )
  } else {
    return (
      <div className="page-noscroll">
        <h2>Home</h2>
        <p>Welcome {props.authUser.displayName}. Nice to see you.</p>
        <p>Quick check-in?</p>
        <div>
          <div className="type" onChange={typeChanged}>
            <input type="radio" id="win" name="type" value="wins" defaultChecked={true}/>
            <label htmlFor="win">Win</label>
            <input type="radio" id="journal" name="type" value="journal"/>
            <label htmlFor="win">Journal</label>
            <input type="radio" id="anger" name="type" value="anger"/>
            <label htmlFor="win">Anger</label>
          </div>
          <div className="line">
            <textarea ref={textareaRef} className="line-element" value={value} onChange={valueChanged} rows={6}/>
            <div className="actions">
              <button className="save-value" onClick={saveValue} disabled={value===""}>
                <i className="material-icons md-dark value-button">save</i>
              </button>
              <button className="cancel-value" onClick={cancelEdit} disabled={value===""}>
                <i className="material-icons md-dark value-button">clear</i>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export const HomeComponent = withAuthenticationConsumer(homeComponent);
