# Bit Trade Net Web App

A responsive front‑end simulation of a trading platform workflow.  
This project demonstrates a **login → dashboard → withdrawal notice** flow using HTML, CSS, and JavaScript only.  
It is **educational/demo only** — no backend, no real transactions, no sensitive data handling.

---

## 🚀 Features
- **Login Page (index.html)**
  - Email + password form
  - JavaScript validation with demo credentials:
    - Email: `Berginjoshua1@gmail.com`
    - Password: `Thatguy@12`
  - Stores session flag in `localStorage`
  - Redirects to dashboard on success

- **Dashboard (dashboard.html)**
  - Displays user info: `Joshua James Bergin`
  - Shows portfolio stats:
    - Total Portfolio: `$111,009.79`
    - Available Balance: `$47,986.00`
    - Today’s Profit/Loss: `+$1,973.74`
  - Buttons:
    - **Process Withdrawal** → `paytowithdraw.html`
    - **Review Investment Rules Notice** → `paytowithdraw.html`
  - **Logout** clears session and returns to login

- **Withdrawal Notice (paytowithdraw.html)**
  - Requires login session (redirects to login if not set)
  - Displays withdrawal authorization notice:
    - Account: `Joshua James Bergin`
    - Balance: `$47,986.00`
    - Clearance Fee: `$5,960.00`
  - Buttons:
    - **Pay Clearance Fee (Simulation)**
    - **Back to Dashboard**

- **Responsive Styling (styles.css)**
  - Dark theme with green accents
  - Mobile‑friendly layout
  - Clean typography and styled buttons

---

## 📂 Project Structure
