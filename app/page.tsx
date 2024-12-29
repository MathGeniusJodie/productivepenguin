"use client";

import {
  Autocomplete,
  AutocompleteItem,
  Checkbox,
  Input,
  Select,
  SelectItem,
  Card,
  CardBody,
  Switch,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  DateInput,
  DateValue,
  Chip,
} from "@nextui-org/react";
import { useCallback, useMemo, useState } from "react";

interface Todo {
  id: string;
  done: boolean;
  text: string;
  start?: DateValue;
  end?: DateValue;
  timeblock?: string;
  tags: string[];
  backburner: boolean;
  dependencies: Set<string>;
  repeat?: {
    unit: "Hour" | "Day" | "Week" | "Month" | "Year";
    ammount: number;
  };
  sorted: boolean;
}

interface Section {
  name: string;
  todos: Todo[];
}

const timeblocks = [
  { text: "Opening Hours" },
  { text: "Daytime" },
  { text: "Weekend" },
  { text: "Weekdays" },
];

const tags: { text: string }[] = [
  { text: "Home" },
  { text: "Work" },
  { text: "Groceries" },
  { text: "App" },
  { text: "Mentally Difficult" },
];

export default function Home() {
  //todo: fast clear date input and

  const [todos, setTodos] = useState<Todo[]>([]);

  const sections: Section[] = useMemo(() => {
    // todo: rewrite spaghetti
    // todo: add sorting
    let unsorted: Todo[] = [];
    let done: Todo[] = [];
    let main: Todo[] = [];
    let backburner: Todo[] = [];
    let blocked: Todo[] = [];

    todos.forEach((todo) => {
      if (todo.done) {
        done.push(todo);

        return;
      }
      if (!todo.sorted) {
        unsorted.push(todo);

        return;
      }

      // todo: filter out todos outside of timeblock into blocked
      // todo: make tags filter functional
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
  }, [todos]);

  const updateTodo = useCallback(
    (id: string, field: keyof Todo, value: any) => {
      setTodos((prevTodos) => {
        const updatedTodos = prevTodos.map((todo) =>
          todo.id === id ? { ...todo, [field]: value } : todo,
        );

        return updatedTodos;
      });
    },
    [],
  );

  const addTodo = useCallback(() => {
    setTodos((prevTodos) => {
      const newTodo: Todo = {
        id: String(prevTodos.length + 1),
        done: false,
        text: "",
        tags: [],
        backburner: false,
        dependencies: new Set(),
        sorted: false,
      };
      const updatedTodos = [newTodo, ...prevTodos];

      return updatedTodos;
    });
  }, []);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [currentID, setCurrentID] = useState<string | null>(null);

  const handleOpen = useCallback(
    (id: string) => () => {
      setCurrentID(id);
      onOpen();
    },
    [],
  );

  const currentTodo = useMemo(
    () => todos.find((todo) => todo.id === currentID),
    [currentID, todos],
  );

  return (
    <div className="flex gap-2 items-stretch flex-col">
      <div className="flex gap-2 items-center">
        <Button onPress={addTodo}>Add Todo</Button>
        <Select className="w-48" items={tags} label="Applicable Tags">
          {(tag) => <SelectItem key={tag.text}>{tag.text}</SelectItem>}
        </Select>
      </div>
      {sections.map((section) => (
        <div key={section.name}>
          <h2>{section.name}</h2>
          {section.todos.map((todo) => (
            <Card key={todo.id}>
              <CardBody>
                <div className="flex gap-2 items-center">
                  <Checkbox
                    isSelected={todo.done}
                    onValueChange={(selected) =>
                      updateTodo(todo.id, "done", selected)
                    }
                  />
                  <Input
                    value={todo.text}
                    onValueChange={(t) => updateTodo(todo.id, "text", t)}
                  />
                  <Button onPress={handleOpen(todo.id)}>Edit Tags</Button>
                  <Switch
                    isSelected={todo.sorted}
                    onValueChange={(selected) =>
                      updateTodo(todo.id, "sorted", selected)
                    }
                  >
                    Sort
                  </Switch>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ))}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>Edit Tags</ModalHeader>
          {currentTodo ? (
            <ModalBody>
              <Input
                value={currentTodo.text}
                onValueChange={(t) => updateTodo(currentTodo.id, "text", t)}
              />
              <DateInput
                granularity="minute"
                label="Start Date"
                value={currentTodo.start}
                onChange={(date) => {
                  updateTodo(currentTodo.id, "start", date);
                }}
              />
              <DateInput
                granularity="minute"
                label="End Date"
                value={currentTodo.end}
                onChange={(date) => {
                  updateTodo(currentTodo.id, "end", date);
                }}
              />
              <Select
                items={timeblocks}
                label="Time Block"
                selectedKeys={
                  currentTodo.timeblock ? [currentTodo.timeblock] : []
                }
                onSelectionChange={(selected) => {
                  const first = Array.from(selected)[0];

                  updateTodo(currentTodo.id, "timeblock", first);
                }}
              >
                {(timeblock) => (
                  <SelectItem key={timeblock.text}>{timeblock.text}</SelectItem>
                )}
              </Select>
              <Select
                items={tags}
                label="Tags"
                selectedKeys={currentTodo.tags}
                selectionMode="multiple"
                onSelectionChange={(selected) => {
                  updateTodo(currentTodo.id, "tags", Array.from(selected));
                }}
              >
                {(tag) => <SelectItem key={tag.text}>{tag.text}</SelectItem>}
              </Select>
              <Switch
                isSelected={currentTodo.backburner}
                onValueChange={(selected) =>
                  updateTodo(currentTodo.id, "backburner", selected)
                }
              >
                Backburner
              </Switch>
              <Switch
                isSelected={currentTodo.sorted}
                onValueChange={(selected) =>
                  updateTodo(currentTodo.id, "sorted", selected)
                }
              >
                Sorted
              </Switch>
              <Autocomplete
                defaultItems={todos.filter(
                  (todo) => todo.id !== currentTodo.id,
                )}
                label="Dependencies"
                onSelectionChange={(selected) => {
                  if (selected === null) return;
                  if (typeof selected === "number") return;
                  let newDependencies = new Set(currentTodo.dependencies);

                  newDependencies.add(selected);
                  updateTodo(currentTodo.id, "dependencies", newDependencies);
                }}
              >
                {(todo) => (
                  <AutocompleteItem key={todo.id}>{todo.text}</AutocompleteItem>
                )}
              </Autocomplete>
              <div>
                {Array.from(currentTodo.dependencies).map((id) => {
                  const todo = todos.find((todo) => todo.id === id);

                  if (!todo) return null;

                  return (
                    <Chip
                      key={todo.id}
                      onClose={() => {
                        let newDependencies = new Set(currentTodo.dependencies);

                        newDependencies.delete(todo.id);
                        updateTodo(
                          currentTodo.id,
                          "dependencies",
                          newDependencies,
                        );
                      }}
                    >
                      {todo.text}
                    </Chip>
                  );
                })}
              </div>
              <Switch
                isSelected={currentTodo.repeat !== undefined}
                onValueChange={(selected) => {
                  updateTodo(
                    currentTodo.id,
                    "repeat",
                    selected ? { unit: "Day", ammount: 1 } : undefined,
                  );
                }}
              >
                Repeat
              </Switch>
              {currentTodo.repeat && (
                <Input
                  type="number"
                  value={String(currentTodo.repeat.ammount)}
                  onValueChange={(t) => {
                    updateTodo(currentTodo.id, "repeat", {
                      unit: currentTodo.repeat!.unit,
                      ammount: Number(t),
                    });
                  }}
                />
              )}
              {currentTodo.repeat && (
                <Select
                  items={[
                    { text: "Hour" },
                    { text: "Day" },
                    { text: "Week" },
                    { text: "Month" },
                    { text: "Year" },
                  ]}
                  label="Repeat Unit"
                  selectedKeys={[currentTodo.repeat?.unit]}
                  onSelectionChange={(selected) => {
                    updateTodo(currentTodo.id, "repeat", {
                      unit: Array.from(selected)[0] as any,
                      ammount: currentTodo.repeat!.ammount,
                    });
                  }}
                >
                  {(unit) => (
                    <SelectItem key={unit.text}>{unit.text}</SelectItem>
                  )}
                </Select>
              )}
            </ModalBody>
          ) : (
            <ModalBody>
              <p>
                I have no idea how you managed to open this modal without
                selecting a particular todo, but congratulations on your
                accomplishment!
              </p>
            </ModalBody>
          )}
          <ModalFooter>
            <Button onPress={onOpenChange}>Ok</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
