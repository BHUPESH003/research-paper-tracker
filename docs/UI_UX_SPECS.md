# UI / UX Specification

## Research Paper Reading Tracker

---

## 1. Design Principles

* Clarity over cleverness
* Data-first, not decorative
* Predictable layouts
* No hidden states
* Consistent interaction patterns across pages

**Design System**

* ShadCN UI (or equivalent Material-style system)
* Light theme only
* Neutral palette with one accent color

---

## 2. Global Layout

### 2.1 App Shell

* Top navigation bar
* Three primary routes:

  * Add Paper
  * Library
  * Analytics

Navigation is always visible and non-collapsible on desktop.

---

### 2.2 Global States

#### Loading

* Skeleton loaders for tables
* Spinner placeholders for charts
* Loading handled independently per component

#### Errors

* Inline form errors
* Toast notification for API-level failures

---

## 3. Screen Specifications

---

## 3.1 Add Paper Screen

### Purpose

Allow user to add a new research paper to their library.

### Layout

* Centered card
* Single-column form
* Clear labels and helper text

### Fields (in order)

1. **Paper Title**

   * Text input
   * Required
   * Placeholder: “e.g. Attention Is All You Need”

2. **First Author Name**

   * Text input
   * Required

3. **Research Domain**

   * Dropdown (single select)
   * Required
   * Values from enum

4. **Reading Stage**

   * Dropdown (single select)
   * Required
   * Default: Abstract Read

5. **Citation Count**

   * Number input
   * Required
   * Minimum: 0

6. **Impact Score**

   * Dropdown
   * Required

7. **Date Added**

   * Not editable
   * Displayed as read-only text (system-generated)

### Actions

* Primary button: **Add Paper**
* Disabled while submitting

### Success State

* Toast: “Paper added successfully”
* Redirect to Library view

---

## 3.2 Paper Library Screen

### Purpose

View, filter, and manage papers.

---

### Layout

* Filter panel at top
* Table below
* Pagination at bottom

---

### Filters

All filters are **AND-based**.

#### Filter Groups

1. **Reading Stage**

   * Multi-select checkboxes

2. **Research Domain**

   * Multi-select checkboxes

3. **Impact Score**

   * Multi-select checkboxes

4. **Date Added**

   * Single-select radio:

     * This Week
     * This Month
     * Last 3 Months
     * All Time

#### Filter Behavior

* Applied instantly on change
* Clear All button resets filters
* Filters persist during session

---

### Table Columns

| Column          | Description    |
| --------------- | -------------- |
| Paper Title     | Text           |
| First Author    | Text           |
| Research Domain | Badge          |
| Reading Stage   | Badge          |
| Impact Score    | Badge          |
| Citation Count  | Number         |
| Date Added      | Date           |
| Actions         | Edit / Archive |

---

### Actions

#### Edit

* Opens inline modal
* Editable:

  * Research Domain
  * Reading Stage
  * Citation Count

#### Archive

* Confirmation dialog
* Archived paper disappears from table

---

### Empty States

* No papers:

  > “No papers added yet. Start by adding your first paper.”

* No results after filters:

  > “No papers match the selected filters.”

---

## 3.3 Analytics Screen

### Purpose

Visualize reading progress and patterns.

---

### Layout

1. Summary cards (top)
2. Charts grid (below)

---

### Summary Cards

1. **Total Papers**
2. **Fully Read Papers**
3. **Completion Rate**

   ```
   Fully Read / Total Active Papers
   ```

---

### Charts

#### 1. Funnel Chart

* X-axis: Reading Stages
* Y-axis: Paper count
* Ordered by reading progression

---

#### 2. Scatter Plot

* X-axis: Citation Count
* Color grouping: Impact Score
* One dot per paper

---

#### 3. Stacked Bar Chart

* X-axis: Research Domain
* Stack segments: Reading Stages
* Y-axis: Count of papers

---

### Filter Interaction

* Uses same filters as Library
* Charts and summary cards update together
* No partial updates

---

### Empty Analytics State

> “Add research papers to see analytics.”

---

## 4. Responsiveness

* Desktop-first
* Tablet:

  * Charts stacked vertically
* Mobile:

  * Horizontal scroll for tables
  * Charts scale, not truncate

---

## 5. Accessibility

* All form controls labeled
* Keyboard navigable
* Color contrast compliant
* Icons always paired with text
