import React, { useLayoutEffect, useRef, useState } from 'react';
import { Entity } from '../../types/Entity';
import "./Entity.css";

export const  EntityComponent = (props: any) => {
  const saveCallback = props.saveCallback;
  const deleteCallback = props.deleteCallback;
  const selectCallback = props.selectCallback;
  const cancelCallback = props.cancelCallback;
  const [entity, setEntity] = useState<Entity>(props.entity);
  const oldEntity = {...props.entity};
  const [isSelected, setSelected] = useState<boolean>(props.isSelected);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if(isSelected !== props.isSelected) {
    setSelected(props.isSelected);
  }

  const editValue = () => {
    selectCallback(entity);
  }
  
  const cancelEdit = () => {
    entity.value = oldEntity.value;
    setEntity({...entity});
    cancelCallback();
    selectCallback(null);
  }

  const saveValue = () => {
    saveCallback(entity);
    selectCallback(null);
  }

  const deleteValue = () => {
    deleteCallback(entity);
  }

  const valueChanged = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if(entity && entity.value !== event.target.value) {
      entity.value = event.target.value;
      setEntity({...entity});
    }
  }
  
  useLayoutEffect(() => {
    textareaRef?.current?.focus();
    if(entity.value) {
      textareaRef?.current?.setSelectionRange(entity.value.length, entity.value.length); 
      if(textareaRef && textareaRef.current) {
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }
    }
  }, [isSelected]);

  if(isSelected === true) {
    return (
      <div key={entity.id + "_div"} className="line">
        <textarea ref={textareaRef} key={entity.id + "_value"} className="entityText" value={entity.value ? entity.value : ""} onChange={valueChanged} rows={4}/>
        <div key={entity.id + "_actions"} className="actions">
          <button key={entity.id + "_save_button"} className="save-value" onClick={saveValue}>
            <i key={entity.id + "_save_img"} className="material-icons md-dark value-button">save</i>
          </button>
          <button key={entity.id + "_cancel_button"} className="cancel-value" onClick={cancelEdit}>
            <i key={entity.id + "_cancel_img"} className="material-icons md-dark value-button">clear</i>
          </button>
        </div>
      </div>
    )
  } else {
    return (
      <div key={entity.id + "_div"} className="line">
        <p key={entity.id + "_value"} className="entityText">{entity.value}</p>
        <div key={entity.id + "_actions"} className="actions">
          <button key={entity.id + "_edit_button"} className="edit-value" onClick={editValue} disabled={props.selected}>
            <i key={entity.id + "_save_img"} className="material-icons md-dark value-button">create</i>
          </button>
          <button key={entity.id + "_delete_button"} className="delete-value" onClick={deleteValue} disabled={props.selected}>
            <i key={entity.id + "_save_img"} className="material-icons md-dark value-button">delete</i>
          </button> 
        </div>
      </div>
    )
  }
}
