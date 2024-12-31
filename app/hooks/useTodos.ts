import { useEffect, useMemo, useState } from "react";
import {
  CalendarDateTime,
  DateValue,
  getDayOfWeek,
} from "@internationalized/date";

import { Section, Todo } from "../page";

export const timeblocks = [
  {
    text: "8 to 10",
    start: { hour: 8, minute: 0 },
    end: { hour: 22, minute: 0 },
  },
  {
    text: "9 to 5 Weekdays",
    start: { hour: 9, minute: 0 },
    end: { hour: 17, minute: 0 },
    days: [1, 2, 3, 4, 5],
  },
  { text: "Weekdays", days: [1, 2, 3, 4, 5] },
  { text: "Weekend", days: [0, 6] },
];

const isInTimeblock = (time: CalendarDateTime, timeblockname: string) => {
  const timeblock = timeblocks.find((tb) => tb.text === timeblockname);

  if (!timeblock) {
    return true;
  }
  const { start, end, days } = timeblock;

  return (
    (!days || days.includes(getDayOfWeek(time, "en-US"))) &&
    (!start ||
      time.hour * 60 + time.minute >= start.hour * 60 + start.minute) &&
    (!end || time.hour * 60 + time.minute <= end.hour * 60 + end.minute)
  );
};

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filters, setFilters] = useState<Set<string>>(new Set());
  const [currentTime, setCurrentTime] = useState<DateValue>(
    new CalendarDateTime(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      new Date().getDate(),
      new Date().getHours(),
      new Date().getMinutes(),
    ),
  );

  useEffect(() => {
    const minute = 60000;
    const interval = setInterval(() => {
      setCurrentTime(
        new CalendarDateTime(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          new Date().getDate(),
          new Date().getHours(),
          new Date().getMinutes(),
        ),
      );
    }, minute);

    return () => clearInterval(interval);
  }, []);

  const sections: Section[] = useMemo(() => {
    let unsorted: Todo[] = [];
    let done: Todo[] = [];
    let main: Todo[] = [];
    let backburner: Todo[] = [];
    let blocked: Todo[] = [];

    todos.forEach((todo) => {
      if (filters.size > 0 && !todo.tags.some((tag) => filters.has(tag))) {
        return;
      }

      if (todo.done) {
        done.push(todo);

        return;
      }
      if (!todo.sorted) {
        unsorted.push(todo);

        return;
      }

      if (
        Array.from(todo.dependencies).some(
          (id) => !todos.find((todo) => todo.id === id)?.done,
        ) ||
        (todo.start != undefined && todo.start < currentTime) ||
        // filter out todos outside of timeblock into blockeds
        (todo.timeblock &&
          !isInTimeblock(currentTime as CalendarDateTime, todo.timeblock))
      ) {
        blocked.push(todo);

        return;
      }

      if (todo.backburner) {
        backburner.push(todo);

        return;
      }

      main.push(todo);
    });

    main.sort((a, b) => {
      if (a.end == undefined && b.end == undefined) {
        return 0;
      }
      if (a.end == undefined) {
        return 1;
      }
      if (b.end == undefined) {
        return -1;
      }

      return a.end.compare(b.end);
    });
    // todo sort backburner

    return [
      { name: "Unsorted", todos: unsorted },
      { name: "Main", todos: main },
      { name: "Backburner", todos: backburner },
      { name: "Blocked", todos: blocked },
      { name: "Done", todos: done },
    ];
  }, [todos, filters, currentTime]);

  return useMemo(
    () => ({
      sections,
      filters,
      todos,
      setFilters,
      setTodos,
      currentTime,
    }),
    [sections, filters, todos, currentTime],
  );
};
