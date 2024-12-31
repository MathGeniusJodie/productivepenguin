"use client";

import {
  Autocomplete,
  AutocompleteItem,
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
  DatePicker,
  DateValue,
  Chip,
  Checkbox,
  CardHeader,
} from "@nextui-org/react";
import { useCallback } from "react";

import { useTodos } from "./hooks/useTodos";
import { useCurrentTodo } from "./hooks/useCurrentTodo";

export interface Todo {
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

export interface Section {
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
  { text: "Low Effort" },
];

export default function Home() {
  //todo: fast clear date input and

  const { setTodos, setFilters, sections, todos, filters, currentTime } =
    useTodos();

  const { currentTodo, isOpen, handleOpen, onOpenChange } =
    useCurrentTodo(todos);

  const updateTodo = useCallback(
    (id: string, field: keyof Todo, value: any) => {
      setTodos((prevTodos) => {
        const updatedTodos = prevTodos.map((todo) =>
          todo.id === id ? { ...todo, [field]: value } : todo,
        );

        return updatedTodos;
      });
    },
    [setTodos],
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
  }, [setTodos]);

  return (
    <div className="flex gap-2 items-stretch flex-col">
      <div className="flex gap-2 items-center">
        <Button onPress={addTodo}>Add Todo</Button>
        <Select
          className="w-48"
          items={tags}
          label="Applicable Tags"
          selectedKeys={Array.from(filters)}
          selectionMode="multiple"
          onSelectionChange={(selected) => {
            if (selected === null) {
              setFilters(new Set());

              return;
            }
            setFilters(new Set(Array.from(selected).map((key) => String(key))));
          }}
        >
          {(tag) => <SelectItem key={tag.text}>{tag.text}</SelectItem>}
        </Select>
      </div>
      {sections.map((section) => (
        <div key={section.name}>
          <h2>{section.name}</h2>
          {section.todos.map((todo) => (
            <Card
              key={todo.id}
              className={
                todo.end && todo.end < currentTime
                  ? "bg-red-100 dark:bg-red-900"
                  : ""
              }
            >
              {todo.end && todo.end < currentTime ? (
                <CardHeader className="pb-0">Overdue</CardHeader>
              ) : null}
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
              <div className="flex gap-2 items-center">
                <DatePicker
                  granularity="minute"
                  label="Start Date"
                  value={currentTodo.start}
                  onChange={(date) => {
                    updateTodo(currentTodo.id, "start", date);
                  }}
                />
                <Button
                  onPress={() => {
                    updateTodo(currentTodo.id, "start", undefined);
                  }}
                >
                  Clear
                </Button>
              </div>
              <div className="flex gap-2 items-center">
                <DatePicker
                  granularity="minute"
                  label="End Date"
                  minValue={currentTodo.start}
                  value={currentTodo.end}
                  onChange={(date) => {
                    updateTodo(currentTodo.id, "end", date);
                  }}
                />
                <Button
                  onPress={() => {
                    updateTodo(currentTodo.id, "end", undefined);
                  }}
                >
                  Clear
                </Button>
              </div>
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
                  (todo) => todo.id !== currentTodo.id && todo.done === false,
                  //todo: filter out todos that are blocked (use filtered todos?)
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
