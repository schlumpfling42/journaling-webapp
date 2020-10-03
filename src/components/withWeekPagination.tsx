import React, { useEffect, useState } from 'react';
import { store } from "../firebase";
import * as date from "../utils/date"
import "./WeekPagination.css";

export const withWeekPagination = (Component: any) => {
  return function withWeekPaginationComponent({...props }) {
    const [currentWeek, setCurrentWeek] = useState(date.getWeek(new Date(Date.now()), []));
    const [authUser] = useState(props.authUser);
    const [weekIndex, setWeekIndex] = useState(0);
    const [weeks, setWeeks] = useState([currentWeek]);
    const [startDate, setStartDate]  = useState<Date>(new Date());

    useEffect(() => {
      let mounted = true;
      if(authUser) {
        store.getSettings(props.authUser.uid).then(doc => {
          if(mounted) {
            const now = new Date(Date.now());
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setMilliseconds(0);
            if(doc != null && doc.data()) {
              const data: any = doc.data();
              const startDateFromSettings = data.startDate;
              if(!startDateFromSettings) {
                data.startDate = date.dateAsISOString(now);
                setStartDate(data.startDate);
                store.updateSettings(doc.id, data);
              } else {
                setStartDate(date.getISOStringAsLocalDate(startDateFromSettings));
              }
            } else {
              const data: any = {
                startDate: date.dateAsISOString(now),
                userId: props.authUser.uid,
              }
              store.updateSettings(props.authUser.uid, data);
              setStartDate(now);
            }
          }
        });
      }
      return () => {
        mounted = false;
      }
    }, [authUser]);

    useEffect(() => {
      const newWeeks = date.getWeeksSince(startDate);
      newWeeks.reverse();
      for(const aWeek of newWeeks) {
        if(aWeek.firstDayOfTheWeek.getTime() === currentWeek.firstDayOfTheWeek.getTime()) {
          setWeekIndex(newWeeks.indexOf(aWeek));
          setWeeks(newWeeks);
        }
      }
    }, [startDate]);

    const nextWeek = () => {
      const nextWeekIndex = weekIndex + 1;
      setWeekIndex(nextWeekIndex);
      setCurrentWeek(weeks[nextWeekIndex])
    } 

    const previousWeek = () => {
      const nextWeekIndex = weekIndex - 1;
      setWeekIndex(nextWeekIndex);
      setCurrentWeek(weeks[nextWeekIndex])
    } 

    return (
      <div className="weekPaginationContent">
        <Component week={currentWeek} {...props}/>
        <div id="footer">
          <div className="weekPagination">
            <button className="pagePrevious navigation" onClick={previousWeek} disabled={weekIndex === 0}>&lt;</button>
            <div className="pageName">{currentWeek.toString()}</div>
            <button className="pageNext navigation" onClick={nextWeek} disabled={weeks.length <= weekIndex+1}>&gt;</button>
          </div>
        </div>
      </div>
    );
  }
}
