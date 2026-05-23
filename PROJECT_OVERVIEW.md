# Probash Pay Backend — Project Overview 📋

## 🚀 Project Summary
This is the backend implementation for **Probash Pay**, providing APIs, authentication, and structured data handling. 
It uses a modern tech stack centered on **NestJS**, **TypeORM**, and **PostgreSQL**.

## 🛠 Tech Stack
- **Framework:** NestJS (v11+)
- **ORM:** TypeORM
- **Database:** PostgreSQL (`probash_pay_db`)
- **Package Manager:** pnpm
- **Authentication:** JWT (Access + Refresh Token)
- **API Documentation:** Scalar API Documentation (`/docs`) — Enhanced with detailed Bengali descriptions
- **Push Notifications:** Firebase Admin SDK (FCM)

---

## ✅ Completed Phases
| Step | কাজ (Task) | Status |
|---|---|---|
| Step 1 | NestJS Project Create | ✅ Done |
| Step 2 | PostgreSQL Database (`probash_pay_db`) + TypeORM Connect | ✅ Done |
| Step 3 | Auth Module (Register, Login, JWT, Guards) | ✅ Done |
| Step 3.5 | Scalar API Docs (`/docs`) | ✅ Done |
| Step 3.7 | Wallet Module (Auto-creation on Register, Balance Tracking) | ✅ Done |
| Step 4 | Deposit Module (Submit, Admin Review, Wallet Update) | ✅ Done |
| Step 5 | Withdrawal Module (Conversion, Wallet Deduction, Admin Flow) | ✅ Done |
| Step 5.5 | App Settings Module (Currency Rate, Withdrawal Limits) | ✅ Done |
| Step 6 | Exchange Rate Module (History Tracking, % Change, Public API) | ✅ Done |
| Step 7 | Dashboard Module (Admin Stats, User Balance/Transactions Summary) | ✅ Done |
| Step 8 | Profile Module (Update Profile, PIN Change, Admin User Mgmt) | ✅ Done |
| Step 9 | Payment Accounts (Admin Bank/MFS Accounts for Deposits) | ✅ Done |
| Step 9.5 | Notices Module (System Announcements, Notice Board) | ✅ Done |
| Step 10 | Notification Module (Firebase FCM, Manual, Broadcast, Auto-triggers) | ✅ Done |
| Step 11 | Social Links Module (Admin dynamic social links management) | ✅ Done |
| Step 12 | Support Ticket Module (User tickets, Admin reply + Push notification) | ✅ Done |
| Step 13 | API Documentation Enhancement (Scalar/Swagger Decorators) | ✅ Done |

### 📂 Directory Structure
```text
src/
├── admin/
│   ├── admin.entity.ts
│   └── admin-notifications.controller.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts
│   ├── auth.controller.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   └── guards/
│       ├── jwt-auth.guard.ts
│       └── admin.guard.ts
├── dashboard/
│   ├── admin-dashboard.controller.ts
│   ├── dashboard.module.ts
│   └── dashboard.service.ts
├── deposits/
│   ├── deposit.entity.ts
│   ├── deposit.controller.ts
│   ├── deposit.module.ts
│   └── deposit.service.ts
├── exchange-rate/
│   ├── admin-exchange-rate.controller.ts
│   ├── exchange-rate.controller.ts
│   ├── exchange-rate.entity.ts
│   ├── exchange-rate.module.ts
│   └── exchange-rate.service.ts
├── notices/
│   ├── notice.entity.ts
│   ├── notices.controller.ts
│   ├── notices.module.ts
│   └── notices.service.ts
├── notifications/
│   ├── enums/
│   │   └── notification-type.enum.ts
│   ├── notification.entity.ts
│   ├── notifications.controller.ts
│   ├── notifications.module.ts
│   ├── notifications.service.ts
│   └── firebase.service.ts
├── payment-accounts/
│   ├── payment-account.entity.ts
│   ├── payment-accounts.controller.ts
│   ├── payment-accounts.module.ts
│   └── payment-accounts.service.ts
├── profile/
│   ├── profile.controller.ts
│   ├── admin-users.controller.ts
│   ├── profile.module.ts
│   └── profile.service.ts
├── social-links/
│   ├── social-link.entity.ts
│   ├── social-links.controller.ts
│   ├── admin-social-links.controller.ts
│   ├── social-links.module.ts
│   └── social-links.service.ts
├── support-tickets/
│   ├── support-ticket.entity.ts
│   ├── ticket-reply.entity.ts
│   ├── support-tickets.controller.ts
│   ├── admin-support-tickets.controller.ts
│   ├── support-tickets.module.ts
│   ├── support-tickets.service.ts
│   ├── enums/ (Status, SenderType)
│   └── dto/ (CreateTicket, CreateReply)
├── users/
│   └── user.entity.ts
├── wallet/
│   ├── wallet.entity.ts
│   ├── wallet.module.ts
│   └── wallet.service.ts
├── wallet-transactions/
│   ├── wallet-transaction.entity.ts
│   ├── wallet-transaction.controller.ts
│   ├── wallet-transaction.module.ts
│   └── wallet-transaction.service.ts
├── withdrawals/
│   ├── withdrawal.entity.ts
│   ├── withdrawal.controller.ts
│   ├── admin-withdrawal.controller.ts
│   ├── withdrawal.module.ts
│   └── withdrawal.service.ts
├── main.ts         (Scalar API + Swagger Configuration)
├── app.module.ts   (Root Module updated with all sub-modules)
└── ...
```

### 🔌 Working APIs (Key Endpoints)
- **Auth**: `register`, `login`, `admin/login`, `refresh`
- **Wallet**: `balance`, `transactions`
- **Deposits**: `submit`, `admin/approve`, `admin/reject`
- **Withdrawals**: `submit`, `admin/complete`, `admin/reject`
- **Dashboard**: `admin/stats`, `user/summary`
- **Profile**: `update`, `change-pin`, `admin/users/block`
- **Payment Accounts**: `GET /payment-accounts`, `POST/PATCH/DELETE admin/payment-accounts`
- **Notices**: `GET /notices`, `POST/PATCH/DELETE admin/notices`
- **Social Links**: `GET /social-links`, `POST/PATCH/DELETE admin/social-links`
- **Notifications**: `PATCH /fcm-token`, `GET /notifications/my`, `POST admin/notifications/send` (Manual/Broadcast)
- **Support Tickets**: `POST /support-tickets`, `GET /support-tickets/my`, `POST /support-tickets/:id/reply`, `admin/support-tickets/:id/reply`

### ⚙️ Environment Variables (Config)
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=***
DB_NAME=probash_pay_db
JWT_SECRET=probash_pay_super_secret_key_2024
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
PORT=3000
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
```

---

## 🔝 Summary
সবগুলো বেসিক এবং অ্যাডভান্সড মডিউল সফলভাবে সম্পন্ন হয়েছে। প্রজেক্ট এখন সম্পূর্ণ ফাংশনাল এবং প্রোডাকশন রেডি। সাপোর্ট টিকেট এবং ফায়ারবেস নোটিফিকেশন সিস্টেম ইন্টিগ্রেটেড। **এপিআই ডকুমেন্টেশন (Scalar/Swagger)** এখন আরও বিস্তারিত এবং ব্যবহারবান্ধব।

💡 **Project status: Completed (Core Modules & Documentation Finished)**

🚀 **Next Steps:**
- **Testing**: এখন এপিআই টেস্টিং শুরু করা যাবে।
- **Deployment**: প্রোডাকশনে ডিপ্লয় করতে হবে।
