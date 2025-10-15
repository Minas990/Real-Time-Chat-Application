# 💬 Real-Time Chat Application

A **real-time chat platform** built with **NestJS**, **PostgreSQL**, and **Socket.IO**

---

## 🚀 Overview

This project implements a modern chat backend that supports **real-time communication** between users with a clean, modular architecture.

It includes features like:
- JWT-based authentication
- Real-time messaging via Socket.IO
- File uploads (Cloudinary integration)
- Friend requests and notifications
- Email-based communication (e.g., verification)
- Docker-ready environment for production

  
---

## ⚙️ Environment Variables

You’ll need a `.env` file in the root directory check .env.example

## 🧑‍💻 Running the App Locally
  1.Install dependencies
    npm install
  2.Run PostgreSQL locally (or use Docker, see below).
  3.Start development server
    npm run start:dev
  4.The backend will run on:
    http://localhost:8000

## 🐳 Running with Docker
  1.run make build 
  2.run make up




