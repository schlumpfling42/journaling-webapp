import React, { useEffect, useState } from "react";
import { withWeekPagination } from "../../components/withWeekPagination";
import { store } from "../../firebase";
import { Entity } from '../../types/Entity';
import { WeekEntity } from '../../types/WeekEntity';
import { dateAsISOString, timeZoneOffset } from '../../utils/date';
import "./Week.css";
import { WeekEntityListComponent } from './WeekEntityListComponent';

const weekdays = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

const  WeekComponent = (props: any) => {
  const [type] = useState<string>(props.type);
  const [weekDays, setWeekDays] = useState<Map<string,string>>();
  const [authUser] = useState(props.authUser);
  const [entities, setEntities] = useState<Map<string,Entity[]>>(new Map());

  const [weekEntity, setWeekEntity] = useState<WeekEntity>();

  const [selected, setSelected] = useState<Entity>();

  useEffect(() => {
    let mounted: boolean = true;
    if(authUser) {
      store.entities(type, props.week.firstDayOfTheWeekString, authUser.uid).then(doc => {
        if(mounted) {
          if(doc != null && doc.data()) {
            setWeekEntity(Object.assign(new WeekEntity(), doc.data()));

          } else {
            const newEntity = new WeekEntity();
            newEntity.week = props.week.firstDayOfTheWeekString;
            newEntity.id = Date.now();
            newEntity.entities = [];
            newEntity.userId = authUser.uid;
            setWeekEntity(newEntity);
          }
          const newWeekDays = new Map();
          for(const aWeekDay of weekdays) {
            const dateOfWeekday = new Date(props.week.firstDayOfTheWeek);
            dateOfWeekday.setDate(dateOfWeekday.getDate() + weekdays.indexOf(aWeekDay));
            newWeekDays.set(aWeekDay, dateAsISOString(dateOfWeekday));
          }
          setWeekDays(newWeekDays);
        }
      })
    }
    return () => {
      mounted = false;
    }
  }, [authUser, props.week]);

  useEffect(() => {
    if(weekEntity) {
      const groupedList = new Map<string, Entity[]>();
      for(const weekday of weekdays) {
        groupedList[weekday] = [];
      }
    
      for(const anEntity of weekEntity.entities) {
        const key = weekdays[new Date(new Date(anEntity.date).getTime() + timeZoneOffset).getDay()];
        if(key) {
          const listGroup = groupedList[key];
          listGroup.push(anEntity);
        }
      }
      setEntities(groupedList);
    }
  }, [weekEntity]);

  const saveCallback = (anEntity : Entity) => {
    if(weekEntity && type) {
      let update = false;
      for(const compareEntity of weekEntity.entities) {
        if(compareEntity.id === anEntity.id) {
          compareEntity.value = anEntity.value;
          update = true;
        }
      }
      if(!update) {
        weekEntity.entities.push(anEntity);
      }
      const newDocument = {...weekEntity};
      store.updateWeekEntity(type, weekEntity.week, newDocument, authUser.uid);
      setWeekEntity(newDocument);
    }
  }

  const deleteCallback = (anEntity : Entity) => {
    if(weekEntity) {
      for(const compareEntity of weekEntity.entities) {
        if(compareEntity.id === anEntity.id) {
          weekEntity.entities.splice(weekEntity.entities.indexOf(compareEntity), 1);
        }
      }
      const newDocument = {...weekEntity};
      store.updateWeekEntity(type, weekEntity.week, newDocument, authUser.uid);
      setWeekEntity(newDocument);
    }
  }

  const selectCallback = (anEntity: Entity) => {
    setSelected(anEntity);
  }

  return (
    weekDays != null ?
      <div className="page">
        {
            weekdays.map((key: string) => 
               <WeekEntityListComponent key={key} entities={entities[key]} date={weekDays.get(key)} weekday={key} selected={selected} selectCallback={selectCallback} saveCallback={saveCallback} deleteCallback={deleteCallback} />
            )
        }
      </div>
    : <div className="cssload-container">
        <div className="cssload-speeding-wheel"/>
      </div>
  );
}

export const Component = withWeekPagination(WeekComponent);
