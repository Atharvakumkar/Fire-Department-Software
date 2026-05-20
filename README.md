# Raksha Bandhu

## Fire Safety & Emergency Response Infrastructure Platform

Raksha Bandhu is a containerized fire safety and emergency response platform developed for **Avishkar: Maharashtra State Inter-University Research Convention**. The platform digitizes communication between citizens and fire department authorities through NOC management, inspection scheduling, emergency alerting, and fire safety awareness systems.

The project was later transformed into a **multi-container Dockerized infrastructure architecture** featuring isolated backend services, container orchestration, health monitoring, startup initialization systems, and optimized lightweight deployment using Docker Compose.

---

# Infrastructure Overview

```text
                    ┌──────────────────────┐
                    │      Browser         │
                    │   Client Requests    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Frontend Service   │
                    │      NGINX           │
                    │  Port: 8080 -> 80    │
                    └──────────┬───────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                                             │
        ▼                                             ▼

┌──────────────────────┐               ┌──────────────────────┐
│   NOC Backend API    │               │ Inspection Backend   │
│      Node.js         │               │      Node.js         │
│      Express.js      │               │      Express.js      │
│    Port: 5000        │               │    Port: 5001        │
└──────────────────────┘               └──────────────────────┘

                Docker Network: raksha-network
```

---

# Infrastructure Features

- Multi-container Docker architecture
- Docker Compose orchestration
- Custom isolated bridge network
- Container health monitoring system
- Resource-constrained containers
- Entrypoint startup initialization scripts
- Alpine Linux optimized lightweight containers
- Non-root secure container execution
- Live container observability using Docker Stats
- Production-style backend service separation

---

# Application Features

- Online Fire NOC application submission and tracking
- Fire safety inspection request management
- Emergency contacts directory
- Fire safety awareness and educational resources
- Real-time SOS emergency alert system
- WhatsApp-based emergency dispatch alerts
- Admin panel for fire department authorities
- GPS-enabled emergency incident tracking

---

# Tech Stack

## Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Tailwind CSS
- Font Awesome
- NGINX

---

## Backend

- Node.js
- Express.js
- REST APIs

---

## DevOps & Infrastructure

- Docker
- Docker Compose
- Alpine Linux
- Container Networking
- Healthchecks
- Linux Shell Scripting
- NGINX Reverse Proxy Concepts

---

## Browser APIs

- Geolocation API
- localStorage API

---

## External Services

- WhatsApp API (wa.me)

---

# Project Structure

```text
Fire-Department-Software/
│
├── backend/                     # NOC backend service
├── inspectionBackend/           # Inspection backend service
│
├── docker/
│   ├── nginx/
│   │   └── frontend.conf
│   │
│   └── scripts/
│       └── startup.sh
│
├── Dockerfile.backend
├── Dockerfile.inspection
├── Dockerfile.frontend
│
├── docker-compose.yml
├── .dockerignore
│
├── index.html
├── adminPage.html
├── contactsPage.html
├── inspectionPage.html
├── nocPage.html
├── safety_tips.html
│
└── README.md
```

---

# Containerized Deployment

## Clone Repository

```bash
git clone https://github.com/Atharvakumkar/Fire-Department-Software.git

cd Fire-Department-Software
```

---

# Run Entire Infrastructure

```bash
docker compose up --build
```

---

# Access Services

| Service | URL |
|---|---|
| Frontend | http://localhost:8080 |
| NOC Backend | http://localhost:5000 |
| Inspection Backend | http://localhost:5001 |

---

# Docker Infrastructure Commands

## View Running Containers

```bash
docker ps
```

---

## View Container Resource Usage

```bash
docker stats
```

---

## Inspect Docker Network

```bash
docker network inspect fire-department-software_raksha-network
```

---

## Stop Infrastructure

```bash
docker compose down
```

---

# Health Monitoring

The platform includes Docker health monitoring for:

- Frontend container validation
- Backend API health validation
- Container runtime verification
- Infrastructure observability

---

# Resource Optimization

All containers use:

- Alpine Linux base images
- Lightweight Node.js runtimes
- Resource-constrained deployment
- Minimal memory footprint (~10–12 MB per service)

---

# SOS Emergency Workflow

1. User presses the SOS button
2. System starts emergency countdown
3. Browser retrieves GPS coordinates
4. Incident payload is generated
5. WhatsApp emergency alert is dispatched
6. Google Maps location is attached
7. Incident logs are stored locally

---

# Authors

- Atharva Kumkar
- Abha Naktode
- Riya Wagh
- Riddhi Totala

---

# License

This project was developed as part of Avishkar: Maharashtra State Inter-University Research Convention.

All rights reserved by the authors.