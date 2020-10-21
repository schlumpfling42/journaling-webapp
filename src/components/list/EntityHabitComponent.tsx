import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { dateAsISOString, Week } from 'src/utils/date';
import { HabitEntity } from '../../types/HabitEntity';
import "./EntityHabit.css";

const weekdays = [
  "SU", "MO", "TU", "WE", "TH", "FR", "SA"
];

export const  EntityHabitComponent = (props: any) => {  
  const saveCallback = props.saveCallback;
  const deleteCallback = props.deleteCallback;
  const selectCallback = props.selectCallback;
  const cancelCallback = props.cancelCallback;
  const [startWeek] = useState<Week>(props.week);
  const [week, setWeek] = useState<Week>(props.week);
  const [entity] = useState<HabitEntity>(props.entity);
  const [workEntity, setWorkEntity] = useState<HabitEntity>({...props.entity});
  const [weekDateValues, setWeekDateValues] = useState<any>(workEntity.checkedValues ? workEntity.checkedValues : {}); 
  const [weekDates, setWeekDates] = useState<string[]>(); 
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [isSelected, setSelected] = useState<boolean>(props.isSelected);

  useEffect(() => {
    setWeek(props.week);
  });

  useEffect(() => {
    const tempWeekDates: string[] = [];
    for(let i=0; i< 7; i++) {
      const dateOfWeekday = new Date(week.firstDayOfTheWeek);
      dateOfWeekday.setDate(dateOfWeekday.getDate() + i);
      const dateOfWeekdayString: string = dateAsISOString(dateOfWeekday);
      tempWeekDates.push(dateOfWeekdayString);
      if(startWeek.firstDayOfTheWeekString === week.firstDayOfTheWeekString && (!weekDateValues[dateOfWeekdayString] || weekDateValues[dateOfWeekdayString] === null)) {
        if(dateOfWeekday.getTime() < Date.now()) {
          weekDateValues[dateOfWeekdayString] = false;
        } else {
          weekDateValues[dateOfWeekdayString] = null;
        }
      }
      setWeekDates(tempWeekDates);
    }
  }, [entity, week]);

  if(isSelected !== props.isSelected) {
    setSelected(props.isSelected);
  }

  const editValue = () => {
    selectCallback(entity);
  }
  
  const cancelEdit = () => {
    setWorkEntity({...entity});
    cancelCallback();
  }
  
  const saveValue = () => {
    entity.value = workEntity.value;
    saveCallback(entity);
    selectCallback(null);
  }

  const deleteValue = () => {
    deleteCallback(entity);
  }

  const valueChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(workEntity && workEntity.value !== event.target.value) {
      workEntity.value = event.target.value;
      const newWorkEntity: HabitEntity = {...workEntity};
      setWorkEntity(newWorkEntity);
      
    }
  }
  
  const checked = (aDate: string) => {
    weekDateValues[aDate] = !weekDateValues[aDate];
    const newWorkEntity: HabitEntity = {...workEntity};
    newWorkEntity.checkedValues={...weekDateValues};
    setWorkEntity(newWorkEntity);
    setWeekDateValues(newWorkEntity.checkedValues);
    saveCallback(newWorkEntity);
  }

  const typedChanged = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if(workEntity && workEntity.type !== event.target.value) {
      workEntity.type = event.target.value;
      setWorkEntity({...workEntity});
    }
  }

  useLayoutEffect(() => {
    inputRef?.current?.focus();
    if(workEntity.value) {
      inputRef?.current?.setSelectionRange(workEntity.value.length, workEntity.value.length); 
      if(inputRef && inputRef.current && inputRef.current.parentElement) {
        inputRef.current.parentElement.scrollIntoView({ block: "end",  behavior: "smooth" });
      }
    }
  }, [isSelected]);

  if(isSelected) {
    return (
      <div key={workEntity.id + "_div"} className="line">
        <div className="flex value-line">
          <input type="text" ref={inputRef} key={workEntity.id + "_value"} className="line-element" value={workEntity.value ? workEntity.value : ""} onChange={valueChanged}/>
          <select className="line-element" value={workEntity.type ? workEntity.type : "daily"} onChange={typedChanged} name="priority">
            <option value="daily">Daily</option>
          </select>
        </div>
        <div key={workEntity.id + "_actions"} className="actions">
          <button key={workEntity.id + "_save_button"} className="save-value" onClick={saveValue} disabled={workEntity.value === "" || workEntity.value === undefined}>
            <i key={workEntity.id + "_save_img"} className="material-icons md-dark value-button">save</i>
          </button>
          <button key={workEntity.id + "_cancel_button"} className="cancel-value" onClick={cancelEdit}>
            <i key={workEntity.id + "_cancel_img"} className="material-icons md-dark value-button">clear</i>
          </button>
        </div>
      </div>
    )
  } else {
    return (
      <div key={workEntity.id + "_div"} className="line">
        <div className="line-element flex">
          <div key={workEntity.id + "_value"} className="line-element flexGrow1">{workEntity.value}</div>
          <div className="flexColumnRight" >
            <div className="line-element flexNoGap">
            {
              weekDates?.map((aDate:string, index) => {
                return(
                    <input 
                      key={"habit_cb" + aDate} id={"habit_cb" + aDate} type="checkbox" className="line-element weekday" 
                      checked={weekDateValues[aDate]} 
                      name={weekdays[index]} 
                      onChange={() => checked(aDate)}
                      disabled={startWeek?.firstDayOfTheWeekString !== week?.firstDayOfTheWeekString || weekDateValues[aDate]===null}/>
                  );
              })
            }
            </div>
          </div>
        </div>
        <div key={workEntity.id + "_actions"} className="actions">
          <button key={workEntity.id + "_edit_button"} className="edit-value" onClick={editValue} disabled={props.selected}>
            <i key={workEntity.id + "_save_img"} className="material-icons md-dark value-button">create</i>
          </button>
          <button key={workEntity.id + "_delete_button"} className="delete-value" onClick={deleteValue} disabled={props.selected}>
            <i key={workEntity.id + "_save_img"} className="material-icons md-dark value-button">delete</i>
          </button>
        </div>
      </div>
    )
  }
}
