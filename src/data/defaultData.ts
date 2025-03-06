export interface Todo {
  id: number;
  text: string;
  completed: boolean;
  listId: number;
}

export interface List {
  id: number;
  name: string;
}

export const defaultTodos: Todo[] = [
  {
    id: 1,
    text: "Buy groceries for the week",
    completed: false,
    listId: 1,
  },
  {
    id: 2,
    text: "Schedule dentist appointment",
    completed: true,
    listId: 1,
  },
  {
    id: 3,
    text: "Fix the kitchen sink",
    completed: false,
    listId: 1,
  },
  {
    id: 4,
    text: "Call mom",
    completed: true,
    listId: 1,
  },
  {
    id: 5,
    text: "Submit quarterly report",
    completed: false,
    listId: 1,
  },
  {
    id: 6,
    text: "Pay electricity bill",
    completed: true,
    listId: 1,
  },
  {
    id: 7,
    text: "Book flight tickets",
    completed: false,
    listId: 2,
  },
  {
    id: 8,
    text: "Prepare presentation",
    completed: true,
    listId: 2,
  },
  {
    id: 9,
    text: "Review project proposal",
    completed: false,
    listId: 2,
  },
];

export const defaultLists: List[] = [
  { id: 1, name: "List 1" },
  { id: 2, name: "List 2" },
  { id: 3, name: "List 3" },
  { id: 4, name: "List 4" },
];
