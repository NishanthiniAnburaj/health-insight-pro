# 🏥 Smart Clinical Decision Support System (CDSS)

Public URL: https://doc-mind-aid-15.lovable.app

A **Smart Clinical Decision Support System (CDSS)** that helps doctors analyze patient data and receive rule-based medical recommendations.  
The system improves decision making by detecting risks, generating alerts, and suggesting possible medical conditions using patient vitals, symptoms, and historical data.

This project demonstrates how **data-driven healthcare tools** can support doctors in identifying potential medical risks early and improving patient care.

---

# 🚀 Features

## 🔐 Doctor Authentication
- Secure login system for doctors.
- Only authorized medical staff can access patient data.

---

## 👤 Patient Registration & Management
Doctors can:
- Add new patients
- View patient records
- Store medical history

Stored information includes:
- Name
- Age
- Gender
- Medical history
- Current medications

---

## 🩺 Clinical Data Entry
Doctors can record patient vitals and symptoms including:

- Temperature
- Blood Pressure
- Heart Rate
- Blood Sugar Level
- Oxygen Level
- Symptoms
- Current Medicines

---

## ⚙️ Clinical Rule Engine
A rule-based engine analyzes patient data and generates risk alerts.

Example rules:

- **Blood Pressure > 140/90 → Hypertension Risk**
- **Blood Sugar > 200 → Diabetes Risk**
- **Temperature > 102 + cough → Possible Infection**

---

## 💊 Drug Interaction Detection
Detects dangerous medication combinations.

Example:
- **Warfarin + Aspirin → Internal bleeding risk warning**

---

## 🚨 Emergency Risk Detection
Identifies critical health conditions based on vitals.

Example:
- **Heart Rate > 120 AND Blood Pressure < 90 → Possible Shock Alert**

---

## 🔍 Symptom-Based Disease Suggestion
Suggests possible medical conditions based on symptoms.

Example:

Symptoms:
- Fever
- Cough
- Fatigue

Possible conditions:
- Viral Infection
- Flu
- Respiratory Infection

---

## 🏥 Department Recommendation
Suggests the correct hospital department.

Examples:

| Symptom | Recommended Department |
|--------|------------------------|
| Chest Pain | Cardiology |
| Severe Headache | Neurology |
| Breathing Difficulty | Pulmonology |

---

## 🧠 Explainable Recommendations
Every prediction includes a **clear explanation** so doctors understand why the system generated the alert.

Example:

Hypertension Risk  
Reason:
- BP = 160/100  
- Age above 50 increases risk

---

## 📊 Patient Risk Score
Generates risk scores for possible conditions such as:

- Heart Disease
- Diabetes
- Infection

---

## 📋 Alert Dashboard
Displays all alerts in one place:

- Risk Alerts
- Drug Interaction Warnings
- Emergency Alerts

---

## 📝 Automatic Case Summary
Automatically generates a report containing:

- Patient details
- Detected risks
- Recommended actions
- Suggested department

---

## 📚 Patient History Analysis
The system analyzes **previous patient visits** along with current symptoms.

Example:

Past Visit:
- Chest Pain

Current Visit:
- Chest Pain
- Shortness of Breath

Output:
- Possible heart disease progression
- Recommend cardiology consultation

---

## 🔒 Security Features
- Role-based access control
- Secure patient data storage
- Audit logs of doctor actions

---

# ⚙️ Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MySQL / PostgreSQL

---

# 🏗️ System Architecture

Doctor Interface  
↓  
Backend API (Node.js + Express)  
↓  
Clinical Rule Engine  
↓  
Patient Database  
↓  
Alerts & Recommendations  

---

# 🔄 Workflow

1. Doctor logs into the system  
2. Doctor selects or registers a patient  
3. Patient history is retrieved  
4. Doctor enters current symptoms and vitals  
5. System compares with previous records  
6. Clinical rule engine analyzes data  
7. Drug interaction check is performed  
8. Emergency risk detection runs  
9. Disease prediction is generated  
10. Department recommendation is provided  
11. Risk score is calculated  
12. Explainable recommendations are shown  
13. Patient report is generated  

---

# 📂 Project Structure
```
cdss-project
│
├── frontend
│ ├── index.html
│ ├── dashboard.html
│ ├── patient-form.html
│ └── styles.css
│
├── backend
│ ├── server.js
│ ├── routes
│ ├── controllers
│ └── ruleEngine.js
│
├── database
│ └── schema.sql
│
└── README.md

```
---

# ▶️ Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/NishanthiniAnburaj/health-insight-pro
```
2️⃣ Install dependencies
```
npm install
```
3️⃣ Start the server
```
node server.js
```
4️⃣ Open the application
```
http://localhost:3000
```
## 📊 Example Use Case

Doctor enters:

Age: 60
BP: 170/110
Sugar: 230
Symptoms: Chest pain, fatigue

System Output:

⚠ Hypertension Risk
⚠ Diabetes Risk
🚨 Possible Heart Disease Risk

Recommended Department: Cardiology

## 🎯 Project Goal

The goal of this system is to demonstrate how clinical decision support tools can assist healthcare professionals in identifying risks earlier and making informed medical decisions.

## 📌 Future Improvements

Machine Learning based disease prediction

Integration with Electronic Health Records (EHR)

Mobile app for doctors

Real-time hospital monitoring dashboard

👩‍💻 Author

Developed as part of a Healthcare Hackathon Project.
