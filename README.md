# ⚡ EventSphere — Cloud-Native Event Ticket Booking Platform

> **EC7205 Cloud Computing — Assignment 2 | University of Ruhuna, Faculty of Engineering**

A scalable, secure, and highly available event ticket booking system built with microservices architecture, demonstrating core cloud computing principles.

## 👥 Team

| Name | Registration No. |
|---|---|
| Shageethpratheep V. | EG/2021/4809 |
| Arivanan V. | EG/2021/4414 |
| Arivarasan J. | EG/2021/4415 |
| Bravin K. | EG/2021/4447 |

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────────────────────────────────────┐
│  React SPA  │────▶│          Nginx API Gateway                   │
│  (Vite)     │     │  (Rate Limiting + Load Balancing)            │
└─────────────┘     └──────┬────────┬────────┬────────┬────────────┘
                           │        │        │        │
                    ┌──────▼──┐ ┌───▼────┐ ┌─▼──────┐ ┌▼─────────┐
                    │  Auth   │ │ Event  │ │Booking │ │ Payment  │
                    │ Service │ │Service │ │Service │ │ Service  │
                    │ :3001   │ │ :3002  │ │ :3003  │ │ :3004    │
                    └────┬────┘ └───┬────┘ └─┬──┬───┘ └──┬───────┘
                         │         │        │  │         │
                    ┌────▼────┐ ┌──▼─────┐ ┌▼──▼──┐  ┌──▼─────┐
                    │Postgres │ │Postgres│ │Redis  │  │Postgres│
                    │auth_db  │ │event_db│ │Cache  │  │pay_db  │
                    └─────────┘ └────────┘ └──────┘  └────────┘
                                              │
                                        ┌─────▼──────┐
                                        │  RabbitMQ   │
                                        │  (Async)    │
                                        └─────┬──────┘
                                              │
                                     ┌────────▼────────┐
                                     │  Notification   │
                                     │    Service      │
                                     │  (Email)        │
                                     └─────────────────┘
```

### Communication Methods
- **Synchronous**: REST APIs (Frontend ↔ API Gateway ↔ Services)
- **Asynchronous**: RabbitMQ message queues (Booking → Payment → Notification)

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| Frontend | React 18 + Vite |
| API Gateway | Nginx |
| Backend Services | Node.js + Express |
| Database | PostgreSQL 15 (per-service) |
| Cache & Locking | Redis 7 |
| Message Broker | RabbitMQ 3 |
| Authentication | JWT + bcrypt |
| Email | Nodemailer (Ethereal) |
| Containers | Docker + Docker Compose |
| CI/CD | GitHub Actions |

## 🚀 Quick Start

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) (v20+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2+)

### Steps to Run

```bash
# 1. Clone the repository
git clone https://github.com/your-repo/eventsphere.git
cd eventsphere

# 2. Copy environment variables
cp .env.example .env

# 3. Build the frontend
cd frontend && npm install && npm run build && cd ..

# 4. Start all services
docker-compose up --build -d

# 5. Open in browser
open http://localhost
```

### Verify Services
```bash
# Check all containers are running
docker-compose ps

# Check individual health
curl http://localhost/api/auth/health     # Auth Service
curl http://localhost/api/events          # Event Service
curl http://localhost/api/bookings/health # Booking Service

# View RabbitMQ Dashboard
open http://localhost:15672
# Login: eventsphere / rabbitmq_secret
```

### Default Admin Account
- Email: `admin@eventsphere.com`
- Password: `admin123`

## 📁 Project Structure

```
eventsphere/
├── docker-compose.yml          # Full stack orchestration
├── .env.example                # Environment template
├── nginx/nginx.conf            # API Gateway config
├── frontend/                   # React SPA
├── services/
│   ├── auth-service/           # User auth (JWT)
│   ├── event-service/          # Event CRUD
│   ├── booking-service/        # Booking + Redis locking
│   ├── payment-service/        # Payment processing
│   └── notification-service/   # Email notifications
├── .github/workflows/ci.yml   # CI/CD pipeline
└── docs/                      # Documentation
```

## ✨ Key Features

- 🔐 **JWT Authentication** with role-based access
- 🎫 **Interactive Seat Selection** with real-time availability
- 🔒 **Redis Distributed Locking** to prevent double-booking
- 📨 **Async Email Notifications** via RabbitMQ
- 📈 **Horizontal Scaling** with Docker Compose replicas
- ⚡ **Rate Limiting** at API Gateway level
- 🐳 **One-command deployment** with Docker Compose

## 📈 Scaling

```bash
# Scale booking service to 3 replicas
docker-compose up -d --scale booking-service=3

# Scale event service to 2 replicas
docker-compose up -d --scale event-service=2
```

## 🔒 Security

- JWT token authentication
- bcrypt password hashing (12 rounds)
- Nginx rate limiting (10 req/s per IP)
- Helmet.js security headers
- Joi input validation
- CORS whitelist
- Parameterized SQL queries (Sequelize ORM)

## 📝 License

This project was developed as part of the EC7205 Cloud Computing module at the University of Ruhuna.
