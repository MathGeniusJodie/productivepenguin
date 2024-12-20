"use client";

import {
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
} from "@nextui-org/react";
import { useState } from "react";

interface Todo {
  id: string;
  done: boolean;
  text: string;
  start: DateValue | null;
  end: DateValue | null;
  timeblock: string | null;
  tags: string[];
  backburner: boolean;
  dependencies: string[];
  repeat: {
    unit: "Hour" | "Day" | "Week" | "Month" | "Year";
    ammount: number;
  } | null;
  sorted: boolean;
}

export default function Home() {
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
  ];

  //todo: fast clear date input and

  const [todos, setTodos] = useState<Todo[]>([]);

  const updateTodo = (id: string, field: keyof Todo, value: any) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, [field]: value } : todo,
      ),
    );
  };

  const addTodo = () => {
    setTodos((prevTodos) => [
      {
        id: String(prevTodos.length + 1),
        done: false,
        text: "",
        start: null,
        end: null,
        timeblock: null,
        tags: [],
        backburner: false,
        dependencies: [],
        repeat: null,
        sorted: false,
      },
      ...prevTodos,
    ]);
  };
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [currentID, setCurrentID] = useState<string | null>(null);

  const handleOpen = (id: string) => () => {
    setCurrentID(id);
    onOpen();
  };

  return (
    <div className="flex gap-2 items-stretch flex-col">
      <div className="flex gap-2 items-center">
        <Button onPress={addTodo}>Add Todo</Button>
        <Select className="w-48" items={tags} label="Applicable Tags">
          {(tag) => <SelectItem key={tag.text}>{tag.text}</SelectItem>}
        </Select>
      </div>
      {todos.map((todo) => (
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
                onChange={(e) => updateTodo(todo.id, "text", e.target.value)}
              />
              <Button onPress={handleOpen(todo.id)}>Edit Tags</Button>
              <Switch>Sort</Switch>
            </div>
          </CardBody>
        </Card>
      ))}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>Edit Tags</ModalHeader>
          {(() => {
            const currentTodo = todos.find((todo) => todo.id === currentID);

            if (!currentTodo)
              return (
                <ModalBody>
                  <p>
                    I have no idea how you managed to open this modal without
                    selecting a particular todo, but congratulations on your
                    accomplishment!
                  </p>
                </ModalBody>
              );

            return (
              <ModalBody>
                <Input
                  value={currentTodo.text}
                  onChange={(e) =>
                    updateTodo(currentTodo.id, "text", e.target.value)
                  }
                />
                <DateInput
                  label="Start Date"
                  value={currentTodo.start}
                  onChange={(date) => {
                    updateTodo(currentTodo.id, "start", date);
                  }}
                />
                <DateInput
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
                    <SelectItem key={timeblock.text}>
                      {timeblock.text}
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
                <Select
                  items={todos
                    .filter((todo) => todo.id !== currentTodo.id)
                    .map((todo) => ({ text: todo.text }))}
                  label="Dependencies"
                  selectedKeys={currentTodo.dependencies}
                  selectionMode="multiple"
                  onSelectionChange={(selected) => {
                    updateTodo(
                      currentTodo.id,
                      "dependencies",
                      Array.from(selected),
                    );
                  }}
                >
                  {(todo) => (
                    <SelectItem key={todo.text}>{todo.text}</SelectItem>
                  )}
                </Select>
                <Switch
                  isSelected={currentTodo.repeat !== null}
                  onValueChange={(selected) => {
                    updateTodo(
                      currentTodo.id,
                      "repeat",
                      selected ? { unit: "Day", ammount: 1 } : null,
                    );
                  }}
                >
                  Repeat
                </Switch>
                {currentTodo.repeat !== null && (
                  <Input
                    type="number"
                    value={String(currentTodo.repeat!.ammount)}
                    onChange={(e) => {
                      updateTodo(currentTodo.id, "repeat", {
                        unit: currentTodo.repeat!.unit,
                        ammount: Number(e.target.value),
                      });
                    }}
                  />
                )}
                {currentTodo.repeat !== null && (
                  <Select
                    items={[
                      { text: "Hour" },
                      { text: "Day" },
                      { text: "Week" },
                      { text: "Month" },
                      { text: "Year" },
                    ]}
                    label="Repeat Unit"
                    selectedKeys={[currentTodo.repeat.unit]}
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
            );
          })()}
          <ModalFooter>
            <Button onPress={onOpenChange}>Ok</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
