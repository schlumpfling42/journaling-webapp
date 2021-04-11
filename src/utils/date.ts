export const timeZoneOffset = new Date().getTimezoneOffset()*60*1000;

const oneDayMilliseconds = 24 * 60 * 60 * 1000; 

export class Week {
    public firstDayOfTheWeek: Date;
    public firstDayOfTheWeekString: string;
    public lastDayOfTheWeek: Date;
    public lastDayOfTheWeekString: string;
    constructor(aFirstDayOfTheWeek: Date, aLastDayOfTheWeek: Date) {
        this.firstDayOfTheWeek = aFirstDayOfTheWeek;
        this.lastDayOfTheWeek = aLastDayOfTheWeek;
        this.firstDayOfTheWeekString = dateAsISOString(this.firstDayOfTheWeek);
        this.lastDayOfTheWeekString = dateAsISOString(this.lastDayOfTheWeek);
      }
      public toString() {
        const firstDayOfTheWeekShortString = new Intl.DateTimeFormat('en', { month: '2-digit', day: '2-digit' }).format(this.firstDayOfTheWeek);
        const lastDayOfTheWeekShortString = new Intl.DateTimeFormat('en', { month: '2-digit', day: '2-digit' }).format(this.lastDayOfTheWeek);
        return firstDayOfTheWeekShortString + " - " + lastDayOfTheWeekShortString;
    }
        
}

export function dateAsISOString(date: Date) {
  return getUTCDayAsLocalDate(date).toISOString();
}

export function dateTimeAsISOString(date: Date) {
  return getUTCDateTimeAsLocalDateTime(date).toISOString();
}

export function getUTCDayAsLocalDate(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export function getUTCDateTimeAsLocalDateTime(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
}

export function getISOStringAsLocalDate(date: string) {
  return new Date(new Date(date).getTime()+timeZoneOffset);
}

export function getISOStringToDisplayString(date: string) {
  return new Intl.DateTimeFormat('en', { month: '2-digit', day: '2-digit' }).format(getISOStringAsLocalDate(date));
}

export function dateToDisplayString(date: Date) {
  return new Intl.DateTimeFormat('en', { month: '2-digit', day: '2-digit' }).format(date);
}

export function formatYYYYMMDD(dateString: string) {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

function getLocalDate(date: Date) {
  const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return newDate;
}

function getFirstDayOfWeekAsLocalDate(date: Date) {
  const day = date.getDay();
  const firstDayOfTheWeek = new Date(date.getFullYear(), date.getMonth(), date.getDate()-day);
  return firstDayOfTheWeek;
}
function getLastDayOfWeekAsLocalDate(date: Date) {
  const day = date.getDay();
  const lastDayOfTheWeek = new Date(date.getFullYear(), date.getMonth(), date.getDate()+(6-day));
  return lastDayOfTheWeek;
}

function getWeekSince(aWeekNumber: number, date: Date) {
  const datePlusWeeks = new Date(date.getTime() + (aWeekNumber*7*24*60*60*1000));
  const firstDayOfTheWeek = getFirstDayOfWeekAsLocalDate(datePlusWeeks);
  const lastDayOfTheWeek = getLastDayOfWeekAsLocalDate(datePlusWeeks);
  const aWeek: Week = new Week(firstDayOfTheWeek, lastDayOfTheWeek);
  return aWeek;
}

export function getWeek(date: Date, weeks: Week[]) {
  const firstDayOfTheWeek = getFirstDayOfWeekAsLocalDate(date);
  for(const index in weeks) {
    if(weeks[index]. firstDayOfTheWeek.getTime() === firstDayOfTheWeek.getTime()) {
      return weeks[index];
    }
  }
  const lastDayOfTheWeek = getLastDayOfWeekAsLocalDate(date);
  return new Week(firstDayOfTheWeek, lastDayOfTheWeek);
}

export function dayOfTheWeek(selectedWeek: Week, day: number) {
  const datePlusDays = new Date(selectedWeek.firstDayOfTheWeek.getTime() + (day*24*60*60*1000));
  return datePlusDays;
}

export function dayOfTheWeekAsISOString(selectedWeek: Week, day: number) {
  const datePlusDays = new Date(selectedWeek.firstDayOfTheWeek.getTime() + (day*24*60*60*1000));
  return dateAsISOString(datePlusDays);
}

function _getWeeksSince(date: Date, weeks: Week[]) {
  const aWeek = getWeekSince(weeks.length, date);
  weeks.push(aWeek);
  if(getLocalDate(new Date()).getTime() > aWeek.lastDayOfTheWeek.getTime()) {
    _getWeeksSince(date, weeks);
  }
  return weeks;
}

export function getWeeksSince(date: Date) {
    return _getWeeksSince(date, []);
}

export function getDateStringShort(date: Date) {
  return new Intl.DateTimeFormat('en', { month: '2-digit', day: '2-digit' }).format(date);
}

export function getLastDatesAsISOStrings(interval: string, numberOfDays: number) {
  const array = [];
  for(let i = 0; i < numberOfDays; i++) {
    let day = new Date(Date.now());
    if("daily" === interval) { 
      array.push(dateAsISOString(new Date(day.setDate(day.getDate() - i))));
    } else if("weekly" === interval) {
      day = getFirstDayOfWeekAsLocalDate(day);
      array.push(dateAsISOString(new Date(day.setDate(day.getDate() - (i * 7)))));
    } else if("monthly" === interval) {
      day.setDate(1);
      array.push(dateAsISOString( new Date(day.setMonth(day.getMonth() - i))));
    }
  }
  return array;
}

export function getDaysSince(date: any, interval: string) {
  const now = new Date(Date.now());
  now.setHours(0);
  now.setMinutes(0);
  now.setSeconds(0);
  now.setMilliseconds(0);
  const startDate = new Date(date);
  startDate.setHours(0);
  startDate.setMinutes(0);
  startDate.setSeconds(0);
  startDate.setMilliseconds(0);
  const diffDays = Math.round(Math.abs((now.getTime() - startDate.getTime()) / oneDayMilliseconds));
  let currentDate = startDate;
  const array:any[] = [];
  for(let i = 0; i <= diffDays; i++) {
    if("daily" === interval) { 
      const currentISOString = dateAsISOString(currentDate);
      array.push(currentISOString);
    } else if("weekly" === interval) {
      const day = getFirstDayOfWeekAsLocalDate(currentDate);
      const dayISOString = dateAsISOString(day);
      if(!array.includes(dayISOString)) {
        array.push(dayISOString);
      }
    } else if("monthly" === interval) {
      const day = new Date(currentDate);
      day.setDate(1);
      const dayISOString = dateAsISOString(day);
      if(!array.includes(dayISOString)) {
        array.push(dayISOString);
      }
    }
    currentDate = new Date(new Date(currentDate).setDate(currentDate.getDate() + 1));
  }
  return array;
}