import { Entity } from "./Entity";

export class WeekEntity {
    public id: number;
    public week: string;
    public userId: string;
    public entities: Entity[];
}