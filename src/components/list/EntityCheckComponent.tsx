import React, { useLayoutEffect, useRef, useState } from 'react';
import { Entity } from '../../types/Entity';
import "./EntityCheck.css";

export const  EntityCheckComponent = (props: any) => {
  const saveCallback = props.saveCallback;
  const deleteCallback = props.deleteCallback;
  const selectCallback = props.selectCallback;
  const cancelCallback = props.cancelCallback;
  const [entity] = useState<Entity>(props.entity);
  const [workEntity, setWorkEntity] = useState<Entity>({...props.entity});
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [isSelected, setSelected] = useState<boolean>(props.isSelected);

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

  const valueChanged = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if(workEntity && workEntity.value !== event.target.value) {
      workEntity.value = event.target.value;
      setWorkEntity({...workEntity});
    }
  }

  const checked = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(workEntity && workEntity.finished !== event.target.checked) {
      workEntity.finished = event.target.checked;
      entity.finished = workEntity.finished;
      saveCallback(entity);
    }
  }

  useLayoutEffect(() => {
    textareaRef?.current?.focus();
    if(workEntity.value) {
      textareaRef?.current?.setSelectionRange(workEntity.value.length, workEntity.value.length); 
      if(textareaRef && textareaRef.current && textareaRef.current.parentElement) {
        textareaRef.current.parentElement.scrollIntoView({ block: "end",  behavior: "smooth" });
      }
    }
  }, [isSelected]);

  if(isSelected) {
    return (
      <div key={workEntity.id + "_div"} className="line">
        <textarea ref={textareaRef} key={workEntity.id + "_value"} className="line-element" value={workEntity.value} onChange={valueChanged} rows={4}/>
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
          <input type="checkbox" className="line-element" checked={workEntity.finished ? entity.finished : false} onChange={checked}/>
          <p key={workEntity.id + "_value"} className="line-element">{workEntity.value}</p>
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
