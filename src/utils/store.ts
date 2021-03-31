
import { readable, writable } from 'svelte/store';
import { auth, store } from "../firebase/firebase";
import { dateAsISOString } from "./date";
import type { WeekEntity } from '../types/WeekEntity';
import type { ListEntity } from '../types/ListEntity';

export const settings = writable(null);
export const loggedInUser = readable(null, (set) => {
	auth.onAuthStateChanged(user => {
        // Making it and object to distinguish between not initialized yet
        // and not logged in
        set({user: user});
        if(user) {
            store.collection("settings").doc(user.uid).get()
            .then(settingsDoc => {
                if(settingsDoc.exists) {
                    settings.set(settingsDoc.data());
                } else {
                    let newSettings = { 
                        startDate: dateAsISOString(new Date()),
                        userId: user.uid
                    };
                    updateSettings(user.uid, newSettings);
                    settings.set(newSettings);
                }
            });
        }
    });
});


export const updateSettings = (userId: string, data: any) => 
    store.collection("settings").doc(userId).set(data);

export const weekEntity = (type: string, week: string, userId: string) => store.collection(type).doc(week + "_" + userId).get();

export const updateWeekEntity = (type: string, week: string, weekEntity: WeekEntity, userId: string) => {
    weekEntity.userId = userId;
    const data: any = Object.assign({}, weekEntity);
    data.entities = weekEntity.entities.map(anEntity => Object.assign({}, anEntity))
    store.collection(type).doc(week + "_" + userId).set(data);
}

export const entity = (type: string, userId: string) => store.collection(type).doc(userId).get();

export const updateEntity = (type: string, entity: ListEntity, userId: string) => {
    entity.userId = userId;
    const data: any = Object.assign({}, entity);
    data.entities = entity.entities.map(anEntity => Object.assign({}, anEntity))
    store.collection(type).doc(userId).set(data);
}

export const onSnapshot = (collection, week, userId, callback) => store.collection(collection).doc(week + "_" + userId).onSnapshot(callback);