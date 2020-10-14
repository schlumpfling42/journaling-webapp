import copy from 'copy-to-clipboard';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { ContactEntity } from '../../types/ContactEntity';
import "./ContactEntity.css";

export const  EntityComponent = (props: any) => {
  const saveCallback = props.saveCallback;
  const deleteCallback = props.deleteCallback;
  const selectCallback = props.selectCallback;
  const cancelCallback = props.cancelCallback;
  const [entity] = useState<ContactEntity>(props.entity);
  const [workEntity, setWorkEntity] = useState<ContactEntity>({...props.entity});

  const inputRef = useRef<HTMLInputElement>(null);

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
    saveCallback(workEntity);
    selectCallback(null);
  }

  const deleteValue = () => {
    deleteCallback(entity);
  }

  const valueChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(workEntity && workEntity.value !== event.target.value) {
      workEntity.value = event.target.value;
      setWorkEntity({...workEntity});
    }
  }
  
  const numberChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(workEntity && workEntity.number !== event.target.value) {
      workEntity.number = event.target.value;
      setWorkEntity({...workEntity});
    }
  }

  const passwordChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(workEntity && workEntity.password !== event.target.value) {
      workEntity.password = event.target.value;
      setWorkEntity({...workEntity});
    }
  }

  const typedChanged = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if(workEntity && workEntity.type !== event.target.value) {
      workEntity.type = event.target.value;
      setWorkEntity({...workEntity});
    }
  }

  useLayoutEffect(() => {
    inputRef?.current?.focus();
    if(entity.value) {
      inputRef?.current?.setSelectionRange(workEntity.value.length, workEntity.value.length); 
      if(inputRef && inputRef.current && inputRef.current.parentElement) {
        inputRef.current.parentElement.scrollIntoView({ block: "end",  behavior: "smooth" });
      }
    }
  }, [isSelected]);

  useLayoutEffect(() => {
    if(isSelected) {
      if(inputRef && inputRef.current && inputRef.current.parentElement) {
        inputRef.current.parentElement.scrollIntoView({ block: "end",  behavior: "smooth" });
      }
    }
  }, [workEntity]);

  const selectComponent = () => {
    return(
      <select className="line-element" value={workEntity.type} onChange={typedChanged} name="priority">
        <option value="none"/>
        <option value="phone">Phone</option>
        <option value="zoom">Zoom</option>
        <option value="web">Website</option>
      </select>
    )
  }

  const valueInput = () => {
    if(workEntity.type === "phone") {
      return (
        <div className="flex value-line">
          <input type="text" ref={inputRef} key={workEntity.id + "_value"} className="line-element" value={workEntity.value ? workEntity.value : ""} onChange={valueChanged}/>
          {selectComponent()}
          <input type="tel" key={workEntity.id + "_number_value"} className="line-element" value={workEntity.number ? workEntity.number : ""} onChange={numberChanged} pattern="^-?[0-9]\d*\.?\d*$"/>
        </div>
      );
    } else if(workEntity.type === "zoom") {
      return (
        <div className="flex value-line">
          <input type="text" ref={inputRef} key={workEntity.id + "_value"} className="line-element" value={workEntity.value ? workEntity.value : ""} onChange={valueChanged}/>
          {selectComponent()}
          <div className="flex5">
            <label className="line-element" htmlFor="zoomMeetingId">Meeting ID</label>
            <input id="zoomMeetingId" type="text" key={workEntity.id + "_number"} className="line-element" value={workEntity.number ? workEntity.number : ""} onChange={numberChanged} pattern="^-?[0-9]\d*\.?\d*$"/>
          </div>
          <div className="flex5">
            <label className="line-element"htmlFor="zoomMeetingPwd">Password</label>
            <input id="zoomMeetingPwd" type="text" key={workEntity.id + "_password"} className="line-element" value={workEntity.password ? workEntity.password : ""} onChange={passwordChanged} />
          </div>
        </div>
      );
    } else if(workEntity.type === "web") {
      return (
        <div className="flex value-line">
          <input type="text" ref={inputRef} key={workEntity.id + "_value"} className="line-element" value={workEntity.value ? workEntity.value : ""} onChange={valueChanged}/>
          {selectComponent()}
          <input type="text" key={workEntity.id + "_number_value"} className="line-element" value={workEntity.number ? workEntity.number : ""} onChange={numberChanged}/>
        </div>
      );
    } else {
      return (
        <div className="flex value-line">
          <input type="text" ref={inputRef} key={workEntity.id + "_number_value"} className="line-element" value={workEntity.value ? workEntity.value : ""} onChange={valueChanged} pattern="^-?[0-9]\d*\.?\d*$"/>
          {selectComponent()}
        </div>
      );
    }
  }

  const startZoom = (event: React.MouseEvent<HTMLAnchorElement>) => {
    copy(workEntity.password);
    window.open("https://zoom.us/j/"+workEntity.number , '_blank');
    event.preventDefault();
  }

  const goToWebLink = (event: React.MouseEvent<HTMLAnchorElement>) => {
    let url = workEntity.number;
    if(!workEntity.number.startsWith("http")) {
      url = "http://" + workEntity.number;
    }
    window.open(url, '_blank');
    event.preventDefault();
  }

  const listValue = () => {
    if(workEntity.type === "phone") {
      return (
        <div className="flex value-line">
          <div className="line-element">{workEntity.value ? workEntity.value : ""}</div>
          { workEntity.number ? <a className="line-element" href={"tel:" + workEntity.number}>{workEntity.number}</a> : null }
        </div>
      );
    } else if(workEntity.type === "zoom") {
      return (
        <div key={workEntity.id + "_contact_value"} className="line-element flex">
          {workEntity.value ? <a href={"https://zoom.us/j/"+workEntity.number} target="_blank" onClick={startZoom}>{workEntity.value}</a>  : <div/>}
          { workEntity.number ? 
            <div className="line-element flex">
              <div className="line-element">Meeting ID: {workEntity.number}</div> 
              <div className="line-element">{workEntity.password ? "Password: " + workEntity.password : ""}</div>
            </div>
          : null }
        </div>
      );
    } else if(workEntity.type === "web") {
      return (
        <div key={workEntity.id + "_contact_value"} className="line-element flex">
          {workEntity.value ? <a href={workEntity.number} target="_blank" onClick={goToWebLink}>{workEntity.value}</a>  : <div/>}
        </div>
      );
    }
    return (
      <div key={workEntity.id + "_contact_value"} className="line-element"><div>{workEntity.value ? workEntity.value : ""}</div>
      { workEntity.number ? workEntity.number : null }
      </div>
    );
  }

  if(isSelected) {
    return (
      <div key={workEntity.id + "_div"} className="line">
        {valueInput()}
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
        <div className="line-value">
          {listValue()}
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
