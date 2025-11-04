# 🎨 JSON to Toon Converter

Convert structured JSON data into visually styled **"Toon" panels** using FastAPI (backend) and React + Tailwind + Shadcn/UI (frontend).  
The app lets users upload JSON files, process them via an API, and preview/download beautiful visual outputs.

---

## 🧑‍💻 Author

**Mussa Khan**  
📦 GitHub: [musagithub1/json-to-toon-Converter](https://github.com/musagithub1/json-to-toon-Converter)

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React (Vite + TypeScript), TailwindCSS, Shadcn/UI |
| **Backend** | FastAPI (Python) |
| **Containerization** | Docker + Docker Compose |
| **Deployment Ready** | Local, Docker Hub, and Production Compose |

---

## 🚀 Features

✅ Upload any JSON file  
✅ Convert to "Toon" (custom data representation)  
✅ Instant visualization via React UI  
✅ REST API powered by FastAPI  
✅ Containerized frontend/backend for easy deployment  
✅ Works on Linux, macOS, or Windows (via Docker)

---

## 📂 Project Structure

```
json-to-toon-Converter/
├── backend/
│   ├── server.py
│   ├── json_to_toon.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .dockerignore
│
├── frontend/
│   ├── src/
│   │   └── App.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tailwind.config.js
│   └── .dockerignore
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── sample.json
├── .gitignore
└── README.md
```

---

## 🧪 Sample JSON

You can test the converter with this file:

```json
{
  "title": "Sample Toon Scene",
  "characters": [
    { "name": "Alice", "role": "hero", "color": "blue" },
    { "name": "Bob", "role": "villain", "color": "red" }
  ],
  "dialogues": [
    { "speaker": "Alice", "text": "I will save the city!" },
    { "speaker": "Bob", "text": "Not if I stop you first!" }
  ]
}
```

Save it as `sample.json` and upload it through the UI.

---

## ⚙️ Local Development (Ubuntu/Linux)

### 🧱 1. Clone Repo

```bash
git clone https://github.com/musagithub1/json-to-toon-Converter.git
cd json-to-toon-Converter
```

### 🐍 2. Backend Setup

```bash
cd backend
python3 -m venv myenv
source myenv/bin/activate
pip install -r requirements.txt
uvicorn server:app --reload
```

Backend will run on → `http://127.0.0.1:8000`

### 🖥️ 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend will run on → `http://localhost:5173`

---

## 🐳 Docker Setup

### 🧩 1. Build and Run (Local)

```bash
docker compose up --build
```

### 🌐 2. Production (Pre-built images from Docker Hub)

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

**Access:**
- Frontend → `http://localhost:8080`
- Backend → `http://localhost:8000/docs`

### 🧯 Stop Containers

```bash
docker compose down
```

or for production:

```bash
docker compose -f docker-compose.prod.yml down
```

---

## 🧰 How to Run on Another System (Friend's Computer)

1. **Install Docker.**
2. **Create a folder with this file inside:** `docker-compose.yml`:

```yaml
services:
  backend:
    image: musagithub1/json-to-toon-converter-backend:latest
    ports:
      - "8000:8000"

  frontend:
    image: musagithub1/json-to-toon-converter-frontend:latest
    ports:
      - "8080:80"
    depends_on:
      - backend
```

3. **Run:**

```bash
docker compose pull
docker compose up -d
```

4. **Visit:**
   - Frontend → `http://localhost:8080`
   - API Docs → `http://localhost:8000/docs`

**Stop anytime:**

```bash
docker compose down
```

---

## 🧾 .gitignore Highlights

```
myenv/
__pycache__/
node_modules/
.env
*.log
*.pyc
*.pyo
.DS_Store
```

---

## 🧠 Tips & Troubleshooting

- **Frontend not connecting?** → Ensure ports 8080 (frontend) & 8000 (backend) are free.
- **Want to update to latest build?**

```bash
docker compose pull && docker compose up -d
```

- **Check running containers:**

```bash
docker ps
```

---

## 📜 License

MIT License © 2025 Mussa Khan

---

## 💬 Support

If you find this useful, consider ⭐ starring the repo:  
👉 https://github.com/musagithub1/json-to-toon-Converter

---

**Would you like me to also generate a GitHub Actions workflow file (`.github/workflows/docker.yml`) so your repo automatically builds and pushes your Docker images (`frontend` + `backend`) on each tag or push?**
