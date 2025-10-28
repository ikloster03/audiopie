# UI Changes - shadcn/ui + Tailwind CSS

## Обзор изменений

Полностью переработан UI приложения AudioPie с использованием современных технологий:

### Установленные зависимости

- **@tailwindcss/vite** - Tailwind CSS v4 для Vite
- **shadcn/ui** - коллекция переиспользуемых React компонентов (установлены через CLI)
- **Radix UI** - примитивы для доступных UI компонентов
- **lucide-react** - иконки
- **class-variance-authority, clsx, tailwind-merge** - утилиты для работы с классами

### Установка компонентов shadcn/ui

Все компоненты установлены через официальный CLI:

```bash
npx shadcn@latest add button input textarea label card badge dialog tabs progress scroll-area
```

### Структура компонентов

```
src/
├── components/
│   ├── ui/              # shadcn/ui компоненты
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── label.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   ├── progress.tsx
│   │   └── scroll-area.tsx
│   ├── TrackList.tsx    # Переработан
│   ├── ChapterList.tsx  # Переработан
│   ├── MetadataForm.tsx # Переработан
│   ├── ProgressModal.tsx # Переработан
│   └── SettingsDialog.tsx # Переработан
├── lib/
│   └── utils.ts         # Утилиты для работы с классами (cn)
└── styles/
    └── globals.css      # Tailwind + CSS variables

```

### Основные изменения

#### 1. App.tsx
- Новый современный header с градиентным логотипом
- Grid layout для адаптивного отображения
- Использование Card компонентов для панелей
- Интеграция Tabs из shadcn/ui
- Иконки из lucide-react

#### 2. TrackList.tsx
- Карточки для каждого трека
- Hover эффекты и transitions
- Badge для отображения длительности
- ScrollArea для прокрутки
- Иконка drag handle для сортировки

#### 3. ChapterList.tsx
- Нумерованные карточки глав
- Button для генерации/регенерации глав
- Badge для временных меток
- ScrollArea для прокрутки

#### 4. MetadataForm.tsx
- Структурированная форма с Label компонентами
- Card для секции обложки
- Улучшенный preview обложки с hover эффектами
- ScrollArea для прокрутки длинной формы
- Loading состояния

#### 5. ProgressModal.tsx
- Dialog компонент из shadcn/ui
- Анимированный Progress bar
- Loader иконка с анимацией вращения
- Современный дизайн модального окна

#### 6. SettingsDialog.tsx
- Dialog с заголовком и описанием
- Структурированная форма настроек
- ScrollArea для длинного содержимого
- Подсказки для каждого поля

### Цветовая схема

Используется кастомная цветовая палитра на основе оранжевого акцента:

```css
--primary: 14 100% 60%;        /* #ff6b35 - оранжевый акцент */
--accent: 14 100% 60%;         /* совпадает с primary */
--destructive: 0 84.2% 60.2%;  /* красный для удаления */
```

### Адаптивность

- Mobile-first подход
- Grid layout адаптируется на разных размерах экрана
- Все компоненты responsive
- Touch-friendly элементы управления

### Доступность

- Все интерактивные элементы имеют focus states
- Screen reader поддержка через aria-labels
- Keyboard navigation
- Высокий контраст текста

### Производительность

- CSS modules через Tailwind (минимальный размер бандла)
- Отсутствие runtime CSS-in-JS
- Оптимизированные transitions и animations
- Lazy loading не требуется (компоненты легковесные)

## Как использовать

Все компоненты shadcn/ui находятся в `src/components/ui/`. Они полностью кастомизируемы через props и Tailwind классы.

Пример:

```tsx
import { Button } from './components/ui/button';

<Button variant="outline" size="sm">
  Click me
</Button>
```

### Доступные варианты

**Button variants:**
- default (primary)
- destructive
- outline
- secondary
- ghost
- link

**Button sizes:**
- default
- sm
- lg
- icon

## Команды

```bash
# Запуск в режиме разработки
npm run dev

# Сборка
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Будущие улучшения

- [ ] Добавить темную тему (уже подготовлена в globals.css)
- [ ] Добавить анимации между переходами
- [ ] Добавить toast уведомления для ошибок/успеха
- [ ] Добавить Tooltip для подсказок
- [ ] Оптимизировать для очень больших списков треков (virtual scrolling)

