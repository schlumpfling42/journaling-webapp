import React, { ElementType, useEffect, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { dateAsISOString } from 'src/utils/date';
import { store } from "../../firebase";
import { Entity } from '../../types/Entity';
import { ListEntity } from '../../types/ListEntity';
import { PopupComponent } from '../popup';
import "./EntityList.css";

export const EntityListComponent = (props: any) => {
  const Component: ElementType<any> = props.component;

  const [added, setAdded] = useState(false);
  const [listEntity, setListEntity] = useState<ListEntity>();
  const [entities, setEntities] = useState<Entity[]>();
  const [selectedEntity, setSelectedEntity] = useState<any>();

  const [authUser] = useState(props.authUser);

  const [popup, setPopup] = useState<any>();


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

  useEffect(() => {
    if(listEntity) {
      setEntities(listEntity.entities);
    }
  }, [listEntity]);

  const selectCallback = (entity: Entity) => {
    setSelectedEntity(entity)
  }

  const cancelCallback = () => {
    if(selectedEntity && added===true) {
      listEntity?.entities.splice(listEntity?.entities.indexOf(selectedEntity), 1);
    }
    setSelectedEntity(null);
    setAdded(false);
  }


  const addEntity = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const anEntity = new Entity();
    anEntity.id = Date.now();
    anEntity.date = dateAsISOString(new Date());
    listEntity?.entities.push(anEntity);
    setEntities(listEntity?.entities);
    selectCallback(anEntity);
    setAdded(true);
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
      }
      const newDocument = {...listEntity};
      store.updateEntity(props.type, newDocument, authUser.uid);
      setListEntity(newDocument);
      setEntities(listEntity.entities);
    }
    setAdded(false);
  }

  const deleteCallback = (anEntity : Entity) => {
    setPopup({
      cancelCallback: () => {
        setPopup({});
      },
      cancelIcon: "clear",
      confirmCallback: () => {
        if(listEntity) {
          for(const compareEntity of listEntity.entities) {
            if(compareEntity.id === anEntity.id) {
              listEntity.entities.splice(listEntity.entities.indexOf(compareEntity), 1);
            }
          }
          const newDocument = {...listEntity};
          store.updateEntity(props.type, newDocument, authUser.uid);
          setListEntity(newDocument);
          setPopup({});
        }
      },
      confirmIcon: "delete",
      message: "Do you want to delete " + anEntity.value + "?",
      title: "Delete " + props.typeName,
      visible: true,
    });
  }

  const dragEnd = () => {
    if(listEntity && entities) {
      listEntity.entities = entities;
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
            <button className="add-value" onClick={addEntity} disabled={selectedEntity}>
              <i className="material-icons md-dark value-button">add</i>
            </button>
          </div>
        </div>
        <div className="page-content">
          {
           entities ?
            selectedEntity ?
                entities.map((element: Entity) => {
                  return(
                      <Component 
                        isSelected={selectedEntity && element && element.id === selectedEntity.id} selected={selectedEntity} key={element.id} entity={element} selectCallback={selectCallback} cancelCallback={cancelCallback} saveCallback={saveCallback} deleteCallback={deleteCallback} 
                      />
                  );
                })
            : 
            <ReactSortable list={entities} setList={setEntities} dragClass="drag-item" onEnd={dragEnd} chosenClass="drag-item" delay={250}>
              {
                entities.map((element: Entity) => {
                  return(
                      <Component 
                        isSelected={selectedEntity && element && element.id === selectedEntity.id} selected={selectedEntity} key={element.id} entity={element} selectCallback={selectCallback} cancelCallback={cancelCallback} saveCallback={saveCallback} deleteCallback={deleteCallback} 
                      />
                  );
                })
              }
            </ReactSortable>
            : null
          }
        </div>
        <PopupComponent {...popup} />
      </div>
    : <div className="cssload-container">
        <div className="cssload-speeding-wheel"/>
      </div>

  )

}