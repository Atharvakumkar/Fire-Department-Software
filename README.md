# Raksha Bandhu

A fire safety and emergency response platform developed for Avishkar: Maharashtra State Inter-University Research Convention. The system digitizes interactions between citizens and fire department authorities, covering NOC applications, inspection scheduling, fire safety education, and a real-time SOS emergency alert system.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [SOS System](#sos-system)
- [API Overview](#api-overview)
- [Contributing](#contributing)

---

## Features

- Online Fire NOC application submission and status tracking
- Fire safety inspection request and scheduling
- Emergency contacts directory
- Fire safety awareness and guidelines
- SOS emergency button that captures GPS coordinates and dispatches an alert via WhatsApp
- Admin panel for fire department staff to manage incoming requests

---

## Project Structure

```
Fire-Department-Software/
|
|-- homePage.html           # Main dashboard; entry point of the application
|-- nocPage.html            # NOC application form and tracking interface
|-- inspectionPage.html     # Inspection request and management interface
|-- contactsPage.html       # Emergency contacts directory
|-- safety_tips.html        # Fire safety guidelines and awareness content
|-- adminPage.html          # Admin dashboard for fire department staff
|
|-- backend/                # Express server handling NOC-related API requests
|-- inspectionBackend/      # Express server handling inspection-related API requests
```

---

## Tech Stack

**Frontend**

- HTML5, CSS3, Vanilla JavaScript
- Tailwind CSS (loaded via CDN)
- Font Awesome 6 (loaded via CDN)

**Backend**

- Node.js
- Express.js
- Two separate server instances: one for NOC operations, one for inspection operations

**Browser APIs**

- Geolocation API — retrieves real-time device coordinates during an SOS event
- localStorage — stores incident logs on the client side (last 50 entries)

**External Services**

- WhatsApp API (wa.me) — delivers formatted SOS alert messages to a configured number

---

## Prerequisites

- Node.js v16 or above
- npm
- A modern browser with Geolocation support

---

## Installation

Clone the repository:

```bash
git clone https://github.com/Atharvakumkar/Fire-Department-Software.git
cd Fire-Department-Software
```

Install dependencies and start the NOC backend:

```bash
cd backend
npm install
node index.js
```

In a separate terminal, install dependencies and start the inspection backend:

```bash
cd inspectionBackend
npm install
node index.js
```

Open `homePage.html` in a browser directly, or serve it using a local static server:

```bash
npx serve .
```

---

## Configuration

### SOS WhatsApp Number

The SOS system sends alerts to a hardcoded WhatsApp number. Update the following constant in `homePage.html` before deployment:

```javascript
const WHATSAPP_NUMBER = '91XXXXXXXXXX'; // Replace with country code + number
```

### Backend Endpoints

By default, each backend runs on its own port. Update the fetch URLs in the respective HTML files if you change the default ports in `backend/index.js` or `inspectionBackend/index.js`.

---

## Usage

Navigate to `homePage.html` to access the main dashboard. The sidebar provides links to all modules:

- **Dashboard** — Overview with the SOS button and quick-access cards
- **Inspections** — Submit and track inspection requests
- **NOCs** — Apply for a Fire NOC and monitor application status
- **Tips** — Browse fire safety guidelines
- **Emergency** — Access the emergency contacts directory

---

## SOS System

The SOS flow is as follows:

1. The user presses the SOS button on the dashboard.
2. A 3-second countdown overlay is shown. The user can cancel within this window.
3. After the countdown, the browser requests the device's GPS coordinates via the Geolocation API.
4. A WhatsApp message is constructed containing:
   - A unique incident ID (format: `AG-<base36 timestamp>-<random base36>`)
   - ISO timestamp of the alert
   - Google Maps link with the exact latitude and longitude
5. The browser opens WhatsApp with the pre-filled message targeting the configured number.
6. A confirmation card is displayed in the UI.
7. The incident payload (ID, timestamp, coordinates, accuracy) is stored in localStorage under the key `incidentLogs`.

If geolocation is denied or unavailable, the alert is still sent with a note indicating that location data could not be obtained.

---

## API Overview

The project uses two backend services. Specific route documentation should be found within each backend folder.

**backend/** — Handles NOC application data: form submissions, document references, and status updates.

**inspectionBackend/** — Handles inspection requests: creation, scheduling, and status management.

Both services follow a REST architecture and are consumed by the frontend via `fetch()` calls in the respective HTML pages.

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "describe your change"`
4. Push to your fork: `git push origin feature/your-feature`
5. Open a pull request against the `main` branch.

Please keep pull requests focused on a single change and include a clear description of what was changed and why.

---
 
## Authors
 
- Atharva Kumkar
- Abha Naktode
- Riya Wagh
- Riddhi Totala
---
 
## License
 
This project was developed as part of Avishkar: Maharashtra State Inter-University Research Convention. All rights reserved by the authors. Unauthorized reproduction, distribution, or commercial use of this software without prior written permission from the authors is prohibited.
 
