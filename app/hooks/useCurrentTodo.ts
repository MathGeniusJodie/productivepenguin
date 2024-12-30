import { useCallback, useMemo, useState } from "react";
import { useDisclosure } from "@nextui-org/react";

import { Todo } from "../page";

export const useCurrentTodo = (todos: Todo[]) => {
  const [currentID, setCurrentID] = useState<string | null>(null);
  const currentTodo = useMemo(
    () => todos.find((todo) => todo.id === currentID),
    [currentID, todos],
  );

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const handleOpen = useCallback(
    (id: string) => () => {
      setCurrentID(id);
      onOpen();
    },
    [onOpen],
  );

  return useMemo(
    () => ({
      currentTodo,
      isOpen,
      handleOpen,
      onOpenChange,
    }),
    [currentTodo, handleOpen, isOpen, onOpenChange],
  );
};
