# Recycling Center Route Optimizer

An enterprise-grade, full-stack web application designed for recycling organizations to collect recyclable materials from multiple accumulation points and transport them to central recycling facilities using mathematically optimized, fuel-efficient routes.

Built with **React 19 + TypeScript + Tailwind CSS** (Frontend) and **Python + FastAPI + SQLAlchemy + Dijkstra & A* Solvers** (Backend).

---

## 1. Visual Color Architecture (Strict Color Coding)

- **Frontend Application**: **RED THEME**
  - Primary Color: `#DC2626`
  - Secondary Color: `#991B1B`
  - Background Tint: `#FEF2F2`
  - Cards: White (`#FFFFFF`) with subtle borders
  - Buttons: Crimson Red with White Text
  - Active Navigation: Red Accents & Badges
  - Charts: Cohesive Red Monochromatic Palette

- **Backend Source-Code Workspace & Documentation**: **BLUE THEME**
  - Primary Color: `#2563EB`
  - Secondary Color: `#1E40AF`
  - Background: `#EFF6FF`
  - Code Editor: Dark Navy (`#0B132B` / `#0F172A`)
  - Syntax Highlighting: Electric Blue & Cyan (`#38BDF8`, `#60A5FA`, `#93C5FD`)

---

## 2. Core Functional Modules

1. **Executive Admin Dashboard**:
   - Real-time KPIs queried from the database: Total Collection Points, Vehicles, Stored Recyclable Cargo (kg), Total Distance Covered, Distance Saved, Fuel Consumption (L), and Estimated Costs ($).
   - Recharts Visualizations: 7-Day Rolling Collection Trends, Monthly Recycling Volumes, Vehicle Capacity Utilization, Fuel Consumption Comparisons, and Material Distribution Breakdown.

2. **Collection Points Management**:
   - Full CRUD: Add, edit, view, delete accumulation hubs with coordinates, priority, weight, and status.
   - Real-time search by name, address, or contact person.
   - Multi-criteria filtering by material category, status (Pending, Scheduled, Collected, Inactive), and priority.
   - Embedded interactive Leaflet map view with status-colored pins.

3. **Fleet & Driver Management**:
   - Vehicle attributes: License plate, Type (Light Van, Medium Truck, Heavy Compactor, Electric Van), Fuel Type (Diesel, Petrol, Electric, CNG), Fuel Efficiency (km/l), Capacity (kg), Base Location, and Availability.
   - Driver assignment with driver licensing management.
   - Visual capacity utilization bar and pre-route capacity checks.

4. **Recyclable Material Inventory**:
   - Segregated streams: Plastic, Paper, Glass, Metal, E-waste, and Organic Waste.
   - Live economic valuation ($) and environmental carbon offset tracking (kg CO₂ saved).

5. **Route Optimization Engine (The Core Feature)**:
   - **Dijkstra's Algorithm**: Min-heap priority queue solver calculating guaranteed minimal distance paths.
   - **A* Search Algorithm**: Admissible Haversine heuristic solver directed towards the destination facility.
   - **Nearest Neighbor & 2-Opt Local Search**: Multi-stop Traveling Salesperson Problem (TSP) heuristic untangling crossing paths.
   - **Vehicle Capacity Constraints**: Checks total payload against vehicle limits, preventing overloading.
   - **Side-by-Side Comparison**:
     - Route A (Original Input Sequence) vs Route B (Optimized Sequence).
     - Original distance vs Optimized distance.
     - Distance saved & % improvement badge.
     - Fuel consumption and fuel cost savings ($).
     - Turn-by-turn waypoint itinerary with cumulative cargo tracking.
   - **One-Click Dispatch**: Persists active routes to the database, schedules collection points, and marks vehicles on-route.

6. **Interactive Leaflet & OpenStreetMap**:
   - Real geographic coordinates.
   - Markers for facilities (depots) and collection points.
   - Color-coded route polylines: Route A (dashed gray) and Route B (bold red).
   - Popups with point metadata and instant "Select for Route" toggle.

7. **Route Lifecycle Management**:
   - Workflow transitions: Planned &rarr; Assigned &rarr; In Progress &rarr; Paused &rarr; Completed &rarr; Cancelled.
   - Action controls for starting, pausing, resuming, completing, and cancelling routes.
   - Automatic inventory increment and collection log audits upon completion.

8. **Fuel and Cost Calculator**:
   - Live sliders for distance, vehicle mileage, fuel price, and fuel modalities (Diesel, Petrol, Electric, CNG).
   - Computes linear cost per kilometer and CO₂ combustion footprint.
   - Side-by-side ROI calculator demonstrating cost savings from route shortening.

9. **Audits, Reports & CSV Export**:
   - Daily, weekly, monthly collection reports, vehicle performance, and route optimization audits.
   - Live CSV export (`/api/v1/reports/export-csv`) and print-ready stylesheet.

10. **Backend Workspace & Architecture Explorer**:
    - BLUE-themed in-app code editor viewing actual backend Python source files: `dijkstra.py`, `astar.py`, `route_optimizer.py`, `oop_domain.py`, and `models/__init__.py`.
    - Live Algorithm Sandbox tracing vertex relaxation and priority queue steps.
    - OOP Architecture diagram explaining domain encapsulation and polymorphism.

11. **Notifications Center**:
    - Tracks route dispatches, vehicle capacity alerts, and completion events.
    - Mark read/unread and clear notifications.

12. **Authentication & RBAC**:
    - JWT Token authentication with BCrypt password hashing.
    - Roles: Administrator, Manager, and Collection Staff.

---

## 3. Technology Stack

- **Frontend**:
  - React 19 + TypeScript
  - Tailwind CSS v4
  - React Router v7
  - Axios for typed REST communication
  - Lucide React for consistent icons
  - Recharts for analytics and data visualization
  - Leaflet for interactive OpenStreetMap rendering
  - Vitest for unit & logic testing

- **Backend**:
  - Python 3.10+ / 3.13
  - FastAPI
  - Object-Oriented Domain Models (Encapsulation, Polymorphism, Inheritance)
  - Dijkstra, A*, and 2-Opt Heuristics
  - SQLAlchemy 2.0 ORM
  - PyMySQL & SQLite resilience fallback
  - BCrypt & Python-JOSE JWT security
  - Pytest for API & algorithm correctness testing

- **Database**:
  - MySQL 8.0+ DDL (`database/schema.sql`)
  - Auto-initializing SQLite fallback (`recycling.db`) with full sample dataset.

---

## 4. Quick Start & Execution

### Prerequisites
- Node.js v18+ & npm
- Python 3.10+ & pip

### 1. Start the Backend API
```bash
cd backend

# Option A: With existing Python environment
python -m uvicorn app.main:app --reload --port 8000

# Option B: Or create a virtual environment
python -m venv venv
venv\Scripts\activate   # On Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
- The backend will automatically create tables and seed demo facilities, vehicles, collection points, and routes!
- Interactive Swagger API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 5. Sample User Credentials

The database comes pre-seeded with 3 roles:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@recycling.org` | `admin123` |
| **Logistics Manager** | `manager@recycling.org` | `manager123` |
| **Collection Staff (Driver)** | `collector@recycling.org` | `collector123` |

*(Quick-login buttons are also provided directly on the Login page).*

---

## 6. Running Tests

### Backend Algorithm & Integration Tests (Pytest)
```bash
cd backend
python -m pytest tests/test_backend.py -v
```
Verifies:
- Dijkstra shortest path solver
- A* heuristic search solver
- Vehicle capacity validation
- Fuel calculator and savings calculations
- Database CRUD operations

### Frontend Logic Tests (Vitest)
```bash
cd frontend
npm run test
```
Verifies:
- Fuel consumption mathematical formulas
- Savings percentage calculations
- Collection point form validation logic

---

## 7. Database Configuration (MySQL & SQLite)

By default, the application is configured to connect to MySQL:
```
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/recycling_db
```
- To use your local MySQL server, create the database with `database/schema.sql` and update `.env`.
- If MySQL is not running or credentials are not supplied, the backend automatically and seamlessly initializes an embedded SQLite database (`recycling.db`) so the application functions with zero friction out of the box!

