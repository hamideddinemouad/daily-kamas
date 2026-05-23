# Kamas Revenu Tracker — Workbook Documentation

## Purpose

This workbook is used to record how much kamas each server produces every day.

It has two main responsibilities:

1. Record daily revenu entries by server.
2. Automatically summarize total revenu per server.

---

## Workbook Files

Current workbook file:

```text
kamas_revenu_tracker_fixed.xlsx
```

Companion documentation file:

```text
kamas_revenu_tracker_documentation.md
```

🟨 Important detail: Future edits to the Excel workbook must also update this Markdown file so the workbook behavior stays documented.

---

## Sheet 1 — Daily Entries

Sheet name:

```text
Daily Entries
```

### Columns

| Column | Name | Purpose | Expected value |
|---|---|---|---|
| A | server | The server that produced the kamas | One of the allowed server names |
| B | date | The date of the entry | Auto-filled when `server` or `revenu` is entered |
| C | revenu | The amount of kamas produced | Float / numeric value |

### Allowed server values

The `server` column should only allow these values:

```text
draco
imagiro
orukam
tylezia
hellmina
talkasha
```

### Date behavior

The `date` column should automatically show a date when either:

✅ `server` is filled  
✅ `revenu` is filled

The date should stay blank only when both `server` and `revenu` are empty.

Expected logic:

```excel
=IF(OR(A2<>"",C2<>""),TODAY(),"")
```

Where:

- `A2` is the server cell.
- `C2` is the revenu cell.
- `TODAY()` returns the current date.

🟨 Important detail: With the current formula-based behavior, the date is dynamic. This means it can update when Excel recalculates on another day.

🟥 Common mistake: Do not document this as a permanent timestamp unless the workbook is changed to use VBA, Office Scripts, or manual paste-as-value behavior.

---

## Sheet 2 — Summary

Sheet name:

```text
Summary
```

### Purpose

This sheet shows the total revenu per server.

### Expected summary rows

| Server |
|---|
| draco |
| imagiro |
| orukam |
| tylezia |
| hellmina |
| talkasha |

### Expected formula behavior

The summary should calculate each server total from the `Daily Entries` sheet.

Expected logic:

```excel
=SUMIF('Daily Entries'!A:A,A2,'Daily Entries'!C:C)
```

Where:

- `'Daily Entries'!A:A` is the server column.
- `A2` is the server name in the summary table.
- `'Daily Entries'!C:C` is the revenu column.

The sheet may also include:

✅ Grand total  
✅ Chart showing total revenu by server

---

## Data Entry Rules

When adding a daily entry:

1. Choose the server from the dropdown.
2. Enter the revenu as a number.
3. The date should appear automatically if either the server or revenu is entered.
4. The summary sheet should update automatically.

Example:

| server | date | revenu |
|---|---|---:|
| draco | auto-filled | 123.5 |
| imagiro | auto-filled | 80 |

---

## Future Edit Protocol

Any future change to the Excel workbook must also update this Markdown file.

When editing the workbook, update at least one of these sections:

✅ Workbook Files  
✅ Sheet 1 — Daily Entries  
✅ Sheet 2 — Summary  
✅ Data Entry Rules  
✅ Modification Log

### Required update rule

Every workbook modification must be logged in the **Modification Log** section below.

Each log entry should include:

```text
Date:
Changed file:
Change summary:
Behavior affected:
Reason:
```

---

## Modification Log

### 2026-05-23 — Initial workbook creation

```text
Date: 2026-05-23
Changed file: kamas_revenu_tracker.xlsx
Change summary: Created the first workbook with Daily Entries and Summary sheets.
Behavior affected: Added server dropdown, revenu input, date auto-fill, total revenu per server, grand total, and chart.
Reason: The workbook was needed to track daily kamas production per server.
```

### 2026-05-23 — Date trigger behavior fixed

```text
Date: 2026-05-23
Changed file: kamas_revenu_tracker_fixed.xlsx
Change summary: Updated the date trigger so the date appears when either server or revenu is entered.
Behavior affected: The date column is no longer triggered only by revenu. It now reacts to both server and revenu.
Reason: A daily entry can start by selecting a server first or entering revenu first, so both fields should trigger the date.
```

### 2026-05-23 — Companion documentation added

```text
Date: 2026-05-23
Changed file: kamas_revenu_tracker_documentation.md
Change summary: Added this Markdown documentation file as the base reference for future workbook edits.
Behavior affected: Future edits must update both the Excel workbook and this documentation file.
Reason: The workbook needs a stable documentation base so future modification behavior is tracked clearly.
```

---

## Notes For Future Improvements

Possible future improvements:

- Add a permanent timestamp instead of dynamic `TODAY()` behavior.
- Add a monthly summary tab.
- Add a weekly summary tab.
- Add average revenu per server.
- Add best server by total revenu.
- Add entry validation to prevent negative revenu values.
- Add a dashboard sheet.

🟦 Concept: If the date must never change after entry, the workbook needs a timestamp mechanism instead of a normal formula.
