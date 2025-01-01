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
  Chip,
  Checkbox,
  CardHeader,
} from "@nextui-org/react";
import { useCallback, useEffect } from "react";
import { DateTimeDuration, parseDateTime } from "@internationalized/date";
import { v4 as uuidv4 } from "uuid";

import { useTodos } from "./hooks/useTodos";
import { useCurrentTodo } from "./hooks/useCurrentTodo";
import { timeblocks } from "./hooks/useTodos";
// must be json serializable
export interface Todo {
  id: string;
  done: boolean;
  text: string;
  start?: string;
  end?: string;
  timeblock?: string;
  tags: string[];
  backburner: boolean;
  dependencies: string[];
  repeat?: {
    unit: "hours" | "days" | "weeks" | "months" | "years";
    ammount: number;
  };
  sorted: boolean;
}

export interface Section {
  name: string;
  todos: Todo[];
}

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

  // ugly hack to prevent closing the Modals when clicking on DatePickers
  useEffect(() => {
    const handleBackdropClick = (e: MouseEvent) => {
      if (e.target instanceof HTMLElement) {
        if (e.target.classList.contains("pp-backdrop")) {
          const closeButton = document.querySelector(
            ".pp-close",
          ) as HTMLElement;

          if (closeButton) {
            closeButton.click();
          }
        }
      }
    };

    document.addEventListener("click", handleBackdropClick);

    return () => document.removeEventListener("click", handleBackdropClick);
  }, [onOpenChange]);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
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
    [setTodos],
  );

  const addTodo = useCallback(() => {
    setTodos((prevTodos) => {
      const newTodo: Todo = {
        id: uuidv4(),
        done: false,
        text: "",
        tags: [],
        backburner: false,
        dependencies: [],
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
        <div className="flex-grow" />
        <Button
          onPress={() => {
            const data = JSON.stringify(todos, null, 2);
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");

            a.href = url;
            a.download = "todos.json";
            a.click();
          }}
        >
          Export
        </Button>
      </div>
      {sections.map((section) => (
        <div key={section.name}>
          <h2>{section.name}</h2>
          {section.todos.map((todo) => (
            <Card
              key={todo.id}
              className={
                todo.end && parseDateTime(todo.end) < currentTime
                  ? "bg-red-100 dark:bg-red-900"
                  : ""
              }
            >
              {todo.end && parseDateTime(todo.end) < currentTime ? (
                <CardHeader className="pb-0">Overdue</CardHeader>
              ) : null}
              <CardBody>
                <div className="flex gap-2 items-center">
                  {todo.repeat != undefined ? (
                    <Button
                      onPress={() => {
                        let delta: any = {};

                        if (todo.repeat === undefined) {
                          return;
                        }
                        delta[todo.repeat.unit] = todo.repeat.ammount;

                        if (todo.start) {
                          updateTodo(
                            todo.id,
                            "start",
                            parseDateTime(todo.start)
                              .add(delta as DateTimeDuration)
                              .toString(),
                          );
                        }
                        if (todo.end) {
                          updateTodo(
                            todo.id,
                            "end",
                            parseDateTime(todo.end)
                              .add(delta as DateTimeDuration)
                              .toString(),
                          );
                        }
                      }}
                    >
                      Repeat
                    </Button>
                  ) : (
                    <Checkbox
                      isSelected={todo.done}
                      onValueChange={(selected) => {
                        if (!todo.repeat) {
                          updateTodo(todo.id, "done", selected);

                          return;
                        }
                      }}
                    />
                  )}

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
      <Modal
        classNames={{ wrapper: "pp-backdrop", closeButton: "pp-close" }}
        isDismissable={false}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          <ModalHeader>Edit Tags</ModalHeader>
          {currentTodo ? (
            <ModalBody>
              <Input
                label="Text"
                value={currentTodo.text}
                onValueChange={(t) => updateTodo(currentTodo.id, "text", t)}
              />
              <div className="flex gap-2 items-center">
                <DatePicker
                  granularity="minute"
                  label="Start Date"
                  value={
                    currentTodo.start
                      ? parseDateTime(currentTodo.start)
                      : undefined
                  }
                  onChange={(date) => {
                    updateTodo(currentTodo.id, "start", date?.toString());
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
                  minValue={
                    currentTodo.start
                      ? parseDateTime(currentTodo.start)
                      : undefined
                  }
                  value={
                    currentTodo.end ? parseDateTime(currentTodo.end) : undefined
                  }
                  onChange={(date) => {
                    updateTodo(currentTodo.id, "end", date?.toString());
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
                {(timeblocks) => (
                  <SelectItem key={timeblocks.text}>
                    {timeblocks.text}
                  </SelectItem>
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
              <Checkbox
                isSelected={currentTodo.backburner}
                onValueChange={(selected) =>
                  updateTodo(currentTodo.id, "backburner", selected)
                }
              >
                Backburner
              </Checkbox>
              <Checkbox
                isSelected={currentTodo.sorted}
                onValueChange={(selected) =>
                  updateTodo(currentTodo.id, "sorted", selected)
                }
              >
                Sorted
              </Checkbox>
              <Autocomplete
                defaultItems={todos.filter(
                  (todo) => todo.id !== currentTodo.id && todo.done === false,
                  //todo: filter out todos that are blocked (use filtered todos?)
                )}
                label="Dependencies"
                onSelectionChange={(selected) => {
                  if (selected === null) return;
                  if (typeof selected === "number") return;
                  let newDependencies = new Set(...currentTodo.dependencies);

                  newDependencies.add(selected);
                  updateTodo(
                    currentTodo.id,
                    "dependencies",
                    Array.from(newDependencies),
                  );
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
                        let newDependencies = new Set(
                          ...currentTodo.dependencies,
                        );

                        newDependencies.delete(todo.id);
                        updateTodo(
                          currentTodo.id,
                          "dependencies",
                          Array.from(newDependencies),
                        );
                      }}
                    >
                      {todo.text}
                    </Chip>
                  );
                })}
              </div>
              <Checkbox
                isSelected={currentTodo.repeat !== undefined}
                onValueChange={(selected) => {
                  updateTodo(
                    currentTodo.id,
                    "repeat",
                    selected ? { unit: "days", ammount: 1 } : undefined,
                  );
                }}
              >
                Repeat
              </Checkbox>
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
                    { text: "hours" },
                    { text: "days" },
                    { text: "weeks" },
                    { text: "months" },
                    { text: "years" },
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
