# MStroy Frontend - Тестовое задание

## Описание

Реализация класса TreeStore для управления иерархическими данными с Vue-компонентом для визуализации в виде таблицы с использованием AgGrid Enterprise.

## Технологии

- Vue 3 + TypeScript
- AgGrid Enterprise
- Vite
- Vitest

## Установка и запуск

```bash
npm install
npm run dev
Запуск тестов
```

## Запуск тестов

```bash
npm run test
npm run test:ui
```

## Структура проекта

```text
src/
├── store/
│   └── TreeStore.ts          # Класс для управления иерархическими данными
├── composables/
│   └── useTreeStore.ts       # Композабл для работы с деревом
├── components/
│   └── TreeTable.vue         # Таблица с иерархическими данными
├── App.vue
├── main.ts
└── shims-vue.d.ts
└── public/

tests/
├── TreeStore.test.ts         # Unit-тесты для TreeStore
└── TreeTable.test.ts         # Тесты для компонента
```

## Методы TreeStore

| Метод              | Описание                        |
| ------------------ | ------------------------------- |
| getAll()           | Возвращает все элементы         |
| getItem(id)        | Возвращает элемент по ID        |
| getChildren(id)    | Возвращает прямых потомков      |
| getAllChildren(id) | Возвращает всех потомков        |
| getAllParents(id)  | Возвращает всех потомков        |
| addItem(item)      | Добавляет новый элемент         |
| removeItem(id)     | Удаляет элемент и всех потомков |
| updateItem(item)   | Обновляет элемент               |

## Особенности реализации

- Использование Map для O(1) доступа к элементам
- Кэширование результатов getAllParents
- Оптимизированные алгоритмы обхода дерева
- Полная типизация TypeScript
- Unit-тесты с проверкой производительности

## Тестовые данные

```javascript
const items = [
  { id: 1, parent: null, label: "Айтем 1" },
  { id: "91064cee", parent: 1, label: "Айтем 2" },
  { id: 3, parent: 1, label: "Айтем 3" },
  { id: 4, parent: "91064cee", label: "Айтем 4" },
  { id: 5, parent: "91064cee", label: "Айтем 5" },
  { id: 6, parent: "91064cee", label: "Айтем 6" },
  { id: 7, parent: 4, label: "Айтем 7" },
  { id: 8, parent: 4, label: "Айтем 8" },
];
```

## Требования задания

- Класс TreeStore с методами getAll, getItem, getChildren, getAllChildren, getAllParents, addItem, removeItem, updateItem
- Vue-компонент с таблицей на AgGrid
- Разворачиваемые строки для элементов с потомками
- Колонка "Категория" (Группа/Элемент)
- Колонка "№ п/п"
- TypeScript
- Unit-тесты
