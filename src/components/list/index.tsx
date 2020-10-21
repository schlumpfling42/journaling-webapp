import { withWeekPagination } from "../withWeekPagination";
import { EntityListComponent } from "./EntityListComponent";

export const EntityList = EntityListComponent;

export const WeekEntityList = withWeekPagination(EntityListComponent);
