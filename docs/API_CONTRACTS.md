# API CONTRACTS (UPDATED – FINAL)

**Global Response Format (MANDATORY)**
Every API response, success or error, follows this structure:

```json
{
  "code": "STRING_CODE",
  "data": {},
  "message": "Human readable message"
}
```

* `code`: machine-readable identifier
* `data`: payload (null if error)
* `message`: human-readable summary

---

## 1. Authentication (Global)

**Header (Required on all routes)**

```
X-API-KEY: <user-api-key>
```

---

## 2. Paper APIs

---

### 2.1 Create Paper

**POST** `/papers`

#### Request Body

```json
{
  "title": "Attention Is All You Need",
  "firstAuthor": "Ashish Vaswani",
  "researchDomain": "Computer Science",
  "readingStage": "Abstract Read",
  "citationCount": 10000,
  "impactScore": "High Impact"
}
```

#### Success Response – 201

```json
{
  "code": "PAPER_CREATED",
  "data": {
    "id": "uuid"
  },
  "message": "Paper created successfully"
}
```

#### Error – Duplicate (409)

```json
{
  "code": "DUPLICATE_PAPER",
  "data": null,
  "message": "A paper with the same title and author already exists"
}
```

---

### 2.2 Update Paper

**PATCH** `/papers/:id`

#### Request Body (partial)

```json
{
  "researchDomain": "Mathematics",
  "readingStage": "Fully Read",
  "citationCount": 12000
}
```

#### Success Response – 200

```json
{
  "code": "PAPER_UPDATED",
  "data": null,
  "message": "Paper updated successfully"
}
```

---

### 2.3 Archive Paper

**PATCH** `/papers/:id/archive`

#### Success Response – 200

```json
{
  "code": "PAPER_ARCHIVED",
  "data": null,
  "message": "Paper archived successfully"
}
```

---

### 2.4 Get Papers

**GET** `/papers`

#### Query Parameters

```
readingStages=Fully Read,Notes Completed
domains=Computer Science,Physics
impactScores=High Impact
dateRange=THIS_MONTH
page=1
pageSize=10
```

#### Success Response – 200

```json
{
  "code": "PAPERS_FETCHED",
  "data": {
    "items": [
      {
        "id": "uuid",
        "title": "Paper title",
        "firstAuthor": "Author",
        "researchDomain": "Computer Science",
        "readingStage": "Fully Read",
        "citationCount": 200,
        "impactScore": "High Impact",
        "dateAdded": "2025-01-01"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 42
    }
  },
  "message": "Papers fetched successfully"
}
```

---

## 3. Analytics API

---

### 3.1 Get Analytics

**GET** `/analytics`

#### Success Response – 200

```json
{
  "code": "ANALYTICS_FETCHED",
  "data": {
    "funnel": [
      { "stage": "Abstract Read", "count": 5 },
      { "stage": "Fully Read", "count": 3 }
    ],
    "scatter": [
      {
        "citationCount": 300,
        "impactScore": "Medium Impact"
      }
    ],
    "stackedBar": [
      {
        "domain": "Computer Science",
        "stages": {
          "Abstract Read": 2,
          "Fully Read": 1
        }
      }
    ],
    "summary": {
      "totalPapers": 10,
      "fullyRead": 4,
      "completionRate": 0.4,
      "avgCitationsByDomain": {
        "Computer Science": 120,
        "Physics": 80
      }
    }
  },
  "message": "Analytics fetched successfully"
}
```

---

## 4. Error Codes (Standardized)

| HTTP | code             | message                 |
| ---- | ---------------- | ----------------------- |
| 400  | VALIDATION_ERROR | Invalid request payload |
| 401  | INVALID_API_KEY  | API key is invalid      |
| 404  | NOT_FOUND        | Resource not found      |
| 409  | DUPLICATE_PAPER  | Paper already exists    |
| 429  | RATE_LIMITED     | Too many requests       |
| 500  | INTERNAL_ERROR   | Unexpected server error |
