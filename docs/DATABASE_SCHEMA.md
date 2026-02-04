# 🗄️ Velox Data Dictionary
**Database File:** `velox_core.db` (SQLite)

This document tracks the purpose and structure of every table in the Velox Central Nervous System.

---

## 1. 🏗️ Field Operations
**Table Name:** `field_logs`
* **Description:** The source of truth for all physical work reported from the site. This captures the "Actuals" vs the "Planned".
* **Updated By:** Mobile App (Foreman), AI Voice Agent.
* **Columns:**
    * `id` (PK): Unique Report ID.
    * `work_package_id`: Link to the Master Schedule (e.g., KSB1...).
    * `status`: 'YES' (Done) or 'NO' (Blocked).
    * `quantity_value`: Numeric amount installed (e.g., 50.5).
    * `quantity_unit`: Unit of measure (e.g., 'Meters').
    * `comments`: Qualitative data / Issue descriptions.
    * `language`: Source language (PL, PT, NO, NE).
    * `media_evidence`: Path to PDF or Audio proof.
    * `timestamp`: Exact time of report.

---

## 2. 💰 Commercial & Budget (Coming Soon)
**Table Name:** `budget_master`
* **Description:** Holds the approved cost codes and unit rates.
* **Usage:** We join `field_logs.quantity` * `budget_master.unit_rate` to get Real-Time Cost.
* **Columns:** `cost_code`, `description`, `unit_rate`, `currency`, `total_allocated`.

---

## 3. 📅 Master Schedule (Coming Soon)
**Table Name:** `schedule_tasks`
* **Description:** The plan exported from Oracle Primavera / MS Project.
* **Usage:** We compare `field_logs.timestamp` vs `schedule_tasks.planned_finish` to detect delays automatically.
* **Columns:** `task_id`, `task_name`, `planned_start`, `planned_finish`, `percent_complete`.

---

## 4. 📦 Warehouse & Inventory (Coming Soon)
**Table Name:** `inventory_stock`
* **Description:** Live tracking of material on site.
* **Usage:** When `field_logs` reports 50m installed, we deduct 50m from `inventory_stock`.
* **Columns:** `sku_id`, `material_name`, `current_stock`, `reorder_level`.