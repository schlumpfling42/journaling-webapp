import React, { useLayoutEffect, useRef, useState } from 'react';
import { ContactEntity } from '../../types/ContactEntity';
import "./ContactEntity.css";

export const  EntityComponent = (props: any) => {
  const saveCallback = props.saveCallback;
  const deleteCallback = props.deleteCallback;
  const selectCallback = props.selectCallback;
  const cancelCallback = props.cancelCallback;
  const [entity, setEntity] = useState<ContactEntity>(props.entity);
  const oldEntity: ContactEntity = {...props.entity};

  const inputRef = useRef<HTMLInputElement>(null);

  const editValue = () => {
    selectCallback(entity);
  }
  
  const cancelEdit = () => {
    entity.value = oldEntity.value;
    setEntity({...entity});
    cancelCallback();
  }

  const saveValue = () => {
    saveCallback(entity);
    selectCallback(null);
  }

  const deleteValue = () => {
    deleteCallback(entity);
  }

  const valueChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(entity && entity.value !== event.target.value) {
      entity.value = event.target.value;
      setEntity({...entity});
    }
  }
  
  const numberChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(entity && entity.number !== event.target.value) {
      entity.number = event.target.value;
      setEntity({...entity});
    }
  }

  useLayoutEffect(() => {
    inputRef?.current?.focus();
    if(entity.value) {
      inputRef?.current?.setSelectionRange(entity.value.length, entity.value.length); 
    }
  }, []);

  if(props.isSelected) {
    return (
      <div key={entity.id + "_div"} className="value">
        <div className="list-contact-value-edit">
          <input ref={inputRef} key={entity.id + "_value"} className="entityText" value={entity.value ? entity.value : ""} onChange={valueChanged}/>
          <div className="list-contact-number-edit">
            <div className="entity-number-text">Tel:</div>
            <input type="tel" key={entity.id + "_number_value"} className="entityText" value={entity.number ? entity.number : ""} onChange={numberChanged} pattern="^-?[0-9]\d*\.?\d*$"/>
          </div>
        </div>
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
      <div key={entity.id + "_div"} className="list-value-line">
        <div className="list-contact-value">
          <div key={entity.id + "_contact_value"} className="entity-contact-text"><div>{entity.value ? entity.value : ""}</div>
          { entity.number ? <a href={"tel:" + entity.number}>{entity.number}</a> : null }
          </div>
        </div>
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
