import { useMemo, useState } from "react";

import { Section, Todo } from "../page";

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filters, setFilters] = useState<Set<string>>(new Set());
  const sections: Section[] = useMemo(() => {
    // todo: rewrite spaghetti
    // todo: add sorting
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

      // todo: filter out todos outside of timeblock into blocked
      // todo: sort by how close end date is
      // todo: filter out todos that aren't past the start time into blocked

      if (
        Array.from(todo.dependencies).some(
          (id) => !todos.find((todo) => todo.id === id)?.done,
        )
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

    return [
      { name: "Unsorted", todos: unsorted },
      { name: "Main", todos: main },
      { name: "Backburner", todos: backburner },
      { name: "Blocked", todos: blocked },
      { name: "Done", todos: done },
    ];
  }, [todos, filters]);

  return useMemo(
    () => ({
      sections,
      filters,
      todos,
      setFilters,
      setTodos,
    }),
    [sections, filters, todos],
  );
};
