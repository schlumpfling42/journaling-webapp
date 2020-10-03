import React, { ElementType, useEffect, useState } from 'react';
import { dateAsISOString } from 'src/utils/date';
import { store } from "../../firebase";
import { Entity } from '../../types/Entity';
import { ListEntity } from '../../types/ListEntity';
import "./EntityList.css";

export const EntityListComponent = (props: any) => {

  const Component: ElementType<any> = props.component;

  const [added, setAdded] = useState(false);
  const [listEntity, setListEntity] = useState<ListEntity>();
  const [selectedEntity, setSelectedEntity] = useState<any>();

  const [authUser] = useState(props.authUser);


  useEffect(() => {
    let mounted: boolean = true;
    if(authUser) {
      store.getEntity(props.type, authUser.uid).then(doc => {
        if(mounted) {
          if(doc != null && doc.data()) {
            setListEntity(Object.assign(new ListEntity(), doc.data()));

          } else {
            const newEntity = new ListEntity();
            newEntity.id = Date.now();
            newEntity.entities = [];
            newEntity.userId = authUser.uid;
            setListEntity(newEntity);
          }
        }
      })
    }
    return () => {
      mounted = false;
    }
  }, [authUser]);

  const selectCallback = (entity: Entity) => {
    setSelectedEntity(entity)
    setAdded(false);
  }

  const cancelCallback = () => {
    if(selectedEntity && added===true) {
      listEntity?.entities.splice(listEntity?.entities.indexOf(selectedEntity), 1);
    }
    setSelectedEntity(null)
  }


  const addEntity = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const anEntity = new Entity();
    anEntity.id = Date.now();
    anEntity.date = dateAsISOString(new Date());
    setAdded(true);
    listEntity?.entities.push(anEntity);
    selectCallback(anEntity);
  }

  const saveCallback = (anEntity : any) => {
    if(props.type && listEntity) {
      let update = false;
      for(const compareEntity of listEntity.entities) {
        if(compareEntity.id === anEntity.id) {
          Object.keys(anEntity).forEach((key) => {
            if(anEntity[key]) {
              compareEntity[key] = anEntity[key];
              update = true;
            }
          });
        }
      }
      if(!update) {
        listEntity.entities.push(anEntity);
        setAdded(false);
      }
      const newDocument = {...listEntity};
      store.updateEntity(props.type, newDocument, authUser.uid);
      setListEntity(newDocument);
    }
  }

  const deleteCallback = (anEntity : Entity) => {
    if(listEntity) {
      for(const compareEntity of listEntity.entities) {
        if(compareEntity.id === anEntity.id) {
          listEntity.entities.splice(listEntity.entities.indexOf(compareEntity), 1);
        }
      }
      const newDocument = {...listEntity};
      store.updateEntity(props.type, newDocument, authUser.uid);
      setListEntity(newDocument);
    }
  }

  return (
    authUser ?
      <div className="page">
        <div className="list-header">
          {
            props.title ?
            <h3 className="list-title">{props.title}</h3>
            : 
            null
          }
          <div className="add-button">
            <button className="add-value" onClick={addEntity}>
              <i className="material-icons md-dark value-button">add</i>
            </button>
          </div>
        </div>
        <div>
          {
            listEntity?.entities ?
            listEntity?.entities.map((element: Entity) => {
              return (<Component isSelected={selectedEntity && element && element.id === selectedEntity.id} selected={props.selected} key={element.id} entity={element} selectCallback={selectCallback} cancelCallback={cancelCallback} saveCallback={saveCallback} deleteCallback={deleteCallback} />);
              })
            : null
          }
        </div>
      </div>
    : <div className="cssload-container">
        <div className="cssload-speeding-wheel"/>
      </div>

  )

}