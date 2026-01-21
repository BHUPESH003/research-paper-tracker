# Business Requirements Document (BRD)

## Research Paper Reading Tracker

---

## 1. Purpose & Objective

The purpose of this application is to provide **individual researchers and academics** with a web-based tool to:

* Track research papers they are reading
* Monitor progress across defined reading stages
* Analyze reading patterns using structured analytics and visualizations

The application is designed as a **single-user-per-dataset system**, where each user’s data is fully isolated and accessible only via a secure access mechanism, without mandatory authentication.

---

## 2. Scope

### In Scope

* Adding and managing research papers
* Viewing a personal paper library with filters
* Viewing analytics derived from stored paper data
* User-specific data isolation using a secure access key
* Persistent storage using a database
* Web-based UI

### Out of Scope

* Social features (sharing, collaboration)
* Full authentication systems (email/password, OAuth)
* Paper content storage (PDFs, notes text)
* Notifications or reminders
* External paper metadata fetching (e.g., Google Scholar, arXiv)

---

## 3. User Definition & Identity Model

### 3.1 User Identification

* A **User** is identified by a **system-generated secure API key**
* The API key:

  * Is generated on the user’s first visit
  * Is permanent (no expiration)
  * Can be exported and imported by the user
  * Cannot be regenerated
* No personal information (email, name, password) is required

### 3.2 Multi-Device Access

* Users can access their data on multiple devices by importing the same API key
* Unlimited concurrent devices are allowed

### 3.3 Data Ownership

* All data is strictly scoped to the API key
* Loss of the API key results in permanent loss of access to the data

---

## 4. Functional Requirements

### 4.1 Research Paper Management

Users must be able to add research papers with the following fields:

| Field Name        | Type   | Rules               |
| ----------------- | ------ | ------------------- |
| Paper Title       | Text   | Required, immutable |
| First Author Name | Text   | Required, immutable |
| Research Domain   | Enum   | Required            |
| Reading Stage     | Enum   | Required, editable  |
| Citation Count    | Number | Required, editable  |
| Impact Score      | Enum   | Required            |
| Date Added        | Date   | System-generated    |

#### Research Domain (Enum)

* Computer Science
* Biology
* Physics
* Chemistry
* Mathematics
* Social Sciences

#### Reading Stage (Enum)

* Abstract Read
* Introduction Done
* Methodology Done
* Results Analyzed
* Fully Read
* Notes Completed

#### Impact Score (Enum)

* High Impact
* Medium Impact
* Low Impact
* Unknown

---

### 4.2 Editing Rules

* Editable fields:

  * Research Domain
  * Reading Stage
  * Citation Count
* Non-editable fields:

  * Paper Title
  * First Author Name
  * Date Added

Reading stages may move **forward or backward** without restriction.

---

### 4.3 Duplicate Handling

* Duplicate papers are **not allowed**
* A paper is considered duplicate if:

  ```
  Paper Title + First Author Name + User API Key
  ```

  already exists

---

### 4.4 Archiving Papers

* Papers cannot be hard-deleted
* Users can **archive** papers
* Archived papers:

  * Are hidden from the library by default
  * Are excluded from analytics

---

## 5. Paper Library

### 5.1 Library View

* Papers are displayed in a tabular format
* Default view shows all active (non-archived) papers
* Pagination is applied when necessary

### 5.2 Filters

Users can apply **multiple filters simultaneously**.

#### Filter Types

* Reading Stage (multi-select)
* Research Domain (multi-select)
* Impact Score (multi-select)
* Date Added:

  * This Week
  * This Month
  * Last 3 Months
  * All Time

#### Filter Logic

* Filters are **AND-based**
* A paper must satisfy **all selected filters** to be included

If no filters are selected, all active papers are shown.

---

## 6. Analytics & Insights

Analytics are computed **only from persisted data** and are user-specific.

### 6.1 Funnel Chart

* Shows number of papers at each Reading Stage
* One stage per paper
* Archived papers excluded

---

### 6.2 Scatter Plot

* X-axis: Citation Count
* Data points grouped by Impact Score (color-coded)
* Each paper represented as a single point

---

### 6.3 Stacked Bar Chart

* X-axis: Research Domain
* Stacks: Reading Stages
* Y-axis: Number of papers

---

### 6.4 Summary Metrics

* Papers by Reading Stage
* Average Citation Count per Research Domain

  * Includes zero-citation papers
* Completion Rate (LOCKED):

  ```
  Completion Rate = Fully Read / Total Active Papers
  ```

---

### 6.5 Filters & Analytics

* Analytics are global by default
* Applied filters affect:

  * All charts
  * All summary metrics
* Charts update in real time when filters change

---

## 7. Non-Functional Requirements

### 7.1 Performance

* Analytics endpoints must be idempotent
* Rate limiting applied per API key

### 7.2 Security

* API keys are stored hashed in the database
* All API requests require a valid API key
* Unauthorized requests return clear error messages

### 7.3 Reliability

* All data must be persisted in a database
* No in-memory-only data storage

---

## 8. UX & UI Requirements

### Empty States

* Library empty: “No papers added yet”
* Analytics empty: “Add papers to see analytics”
* Filtered empty: “No papers match the selected filters”

### Loading States

* Tables and charts have independent loading states
* No full-page blocking loaders

### Responsiveness

* Charts stack vertically on smaller screens
* Horizontal scrolling enabled where required
* No loss of information on mobile devices

---

## 9. AI Usage & Governance

* AI tools may be used for:

  * Code scaffolding
  * UI generation
  * Query generation
* All AI-generated code must be:

  * Manually reviewed
  * Refactored if required
  * Tested before submission
* AI usage is documented in `AI_USAGE.md`

---

## 10. Success Criteria

The project is considered successful if:

* All requirements are implemented without deviation
* Data is user-isolated and persistent
* Analytics accurately reflect stored data
* Codebase is clean, modular, and reviewable
* The application can be run locally and via a deployed link

