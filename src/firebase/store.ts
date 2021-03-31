import { ListEntity } from "../types/ListEntity";
import { WeekEntity } from "../types/WeekEntity";
import { store } from "./firebase";

export const getSettings = (userId: string) => store.collection("settings").doc(userId).get();
export const updateSettings = (userId: string, data: any) => 
    store.collection("settings").doc(userId).set(data);

export const entities = (type: string, week: string, userId: string) => store.collection(type).doc(week + "_" + userId).get();

export const updateWeekEntity = (type: string, week: string, weekEntity: WeekEntity, userId: string) => {
    const data: any = Object.assign({}, weekEntity);
    data.entities = weekEntity.entities.map(anEntity => Object.assign({}, anEntity))
    store.collection(type).doc(week + "_" + userId).set(data);
}

export const getEntity = (type: string, userId: string) => store.collection(type).doc(userId).get();

export const updateEntity = (type: string, entity: ListEntity, userId: string) => {
    const data: any = Object.assign({}, entity);
    data.entities = entity.entities.map(anEntity => Object.assign({}, anEntity))
    store.collection(type).doc(userId).set(data);
}
