import React, { ElementType, useState } from 'react';
import { Entity } from '../../types/Entity';
import { getISOStringAsLocalDate } from '../../utils/date';
import "./EntityList.css";

export const WeekEntityListComponent = (props: any) => {
  const Component: ElementType<any> = props.component;
  
  const [adding, setAdding] = useState(false);
  const date = getISOStringAsLocalDate(props.date);

  const saveCallback = (entity: Entity) => {
    setAdding(false);
    props.saveCallback(entity);
  }

  const selectCallback = (entity: Entity) => {
    props.selectCallback(entity);
  }

  const cancelCallback = () => {
    if(adding && props.selected) {
      props.entities.splice(props.entities.indexOf(props.selected), 1);
      setAdding(false);
    }
  }

  const addEntity = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const anEntity = new Entity();
    anEntity.id = Date.now();
    anEntity.date = props.date;
    setAdding(true);
    props.entities.push(anEntity);
    selectCallback(anEntity);
  }

  return (
    <div key={props.date + "_week"}>
      <div key={props.date + "_week_day"} className="day-header">
        <h3 key={props.date + "_day_name"} className="day-name">{props.weekday}</h3>
        <div key={props.date + "_day_add_button"} className="add-button">
          <button key={props.day + "_add_button"} className="add-value" onClick={addEntity} disabled={props.selected || date.getTime() > Date.now() }>
            <i key={props.date+ "_add_img"} className="material-icons md-dark value-button">add</i>
          </button>
        </div>
      </div>
      <div>
        {
          props.entities ?
          props.entities.map((element: Entity) => {
            return <Component isSelected={props.selected && element && element.id === props.selected.id} selected={props.selected} key={element.id} entity={element} selectCallback={selectCallback} saveCallback={saveCallback} cancelCallback={cancelCallback} deleteCallback={props.deleteCallback} />
          })
          : null
        }
      </div>
    </div>
  )

}