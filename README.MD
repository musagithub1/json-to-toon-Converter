# 🪄 JSON ⇄ TOON Converter

A full-stack open-source app that converts between **JSON** and **TOON** formats.  
Built with **FastAPI (Python)** for the backend and **React + Tailwind (Vite)** for the frontend.  
Supports upload, live preview, and download of both file types.

---

## 🌍 Repository

**GitHub:** [https://github.com/musagithub1/json-to-toon-Converter](https://github.com/musagithub1/json-to-toon-Converter)

---

## 📁 Project Structure

json-to-toon-Converter/
├── backend/
│ ├── json_to_toon.py # Core conversion logic (JSON ⇄ TOON)
│ ├── server.py # FastAPI backend server
│ ├── sample.json # Example JSON for testing
│ └── requirements.txt
└── frontend/
├── src/App.tsx
├── src/main.tsx
├── src/index.css
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── .env

yaml
Copy code

---

## ⚙️ Backend Setup (FastAPI)

### 1️⃣ Create Virtual Environment
```bash
cd ~/Desktop/json-to-toon-Converter/backend
python3 -m venv myenv
source myenv/bin/activate
2️⃣ Install Dependencies
bash
Copy code
pip install --upgrade pip
pip install -r requirements.txt
If you see:

vbnet
Copy code
RuntimeError: Form data requires "python-multipart" to be installed.
Run:

bash
Copy code
pip install python-multipart
3️⃣ Run Backend
bash
Copy code
uvicorn server:app --reload --port 8000
✅ API should now be live at:
👉 http://localhost:8000

⚛️ Frontend Setup (React + Vite + Tailwind)
1️⃣ Install Node Dependencies
bash
Copy code
cd ~/Desktop/json-to-toon-Converter/frontend
npm install
2️⃣ Set API Endpoint
Check .env:

ini
Copy code
VITE_API_BASE=http://localhost:8000
3️⃣ Start Dev Server
bash
Copy code
npm run dev
✅ App available at:
👉 http://localhost:5173

🧪 Example Data for Testing
JSON → TOON
sample_flat.json

json
Copy code
{
  "name": "Titanic Passengers",
  "count": 5,
  "passengers": [
    { "PassengerId": 1, "Name": "Owen Harris", "Sex": "male", "Age": 22 },
    { "PassengerId": 2, "Name": "Florence Briggs", "Sex": "female", "Age": 38 }
  ]
}
Output (TOON):

makefile
Copy code
name: Titanic Passengers
count: 2
passengers[2,]{PassengerId,Name,Sex,Age}:
  1,"Owen Harris",male,22
  2,"Florence Briggs",female,38
TOON → JSON
sample_simple.toon

makefile
Copy code
name: Simple People
count: 3
people[3,]{id,name,age,city}:
  1,"Alice",30,Karachi
  2,"Bob",28,Lahore
  3,"Chand",null,Islamabad
Output (JSON):

json
Copy code
{
  "name": "Simple People",
  "count": 3,
  "people": [
    {"id": 1, "name": "Alice", "age": 30, "city": "Karachi"},
    {"id": 2, "name": "Bob", "age": 28, "city": "Lahore"},
    {"id": 3, "name": "Chand", "age": null, "city": "Islamabad"}
  ]
}
🧩 CLI Usage
bash
Copy code
# JSON → TOON
python json_to_toon.py sample.json --root passengers -o output.toon --indent 2 --length-marker --coerce

# TOON → JSON
python json_to_toon.py output.toon --mode toon2json --pretty -o result.json
🌐 API Usage via cURL
JSON → TOON
bash
Copy code
curl -X POST -F "mode=json2toon" -F "root=passengers" -F "file=@sample.json" http://localhost:8000/api/convert
TOON → JSON
bash
Copy code
curl -X POST -F "mode=toon2json" -F "file=@sample_simple.toon" http://localhost:8000/api/convert
🧱 Optional: Auto-Start Backend (Systemd)
bash
Copy code
sudo nano /etc/systemd/system/json-to-toon.service
Paste:

ini
Copy code
[Unit]
Description=JSON TOON Converter API
After=network.target

[Service]
WorkingDirectory=/home/<youruser>/Desktop/json-to-toon-Converter/backend
Environment="PATH=/home/<youruser>/Desktop/json-to-toon-Converter/backend/myenv/bin"
ExecStart=/home/<youruser>/Desktop/json-to-toon-Converter/backend/myenv/bin/uvicorn server:app --host 0.0.0.0 --port 8000
Restart=always
User=<youruser>

[Install]
WantedBy=multi-user.target
Enable it:

bash
Copy code
sudo systemctl daemon-reload
sudo systemctl enable --now json-to-toon
🚀 Build for Production
Frontend
bash
Copy code
cd frontend
npm run build
npm run preview
Serve the built dist/ folder via Nginx, Netlify, or Vercel.
Proxy /api/convert → http://localhost:8000.

🧠 Troubleshooting
Problem	Fix
Missing index.css	Create frontend/src/index.css with Tailwind directives
python-multipart missing	Run pip install python-multipart
Port already in use	Use --port 8010
CORS error	Already allowed via FastAPI config
Node too old	Install Node 20: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs

🧪 Sample Files
Type	File	Description
JSON	sample_flat.json	Titanic dataset
JSON	sample_nested.json	Nested orders dataset
TOON	sample_simple.toon	People dataset
TOON	sample_types.toon	Mixed datatypes demo

💡 Author
Mussa Khan
Developer & Creator of JSON ⇄ TOON Converter
📧 Email: raja.musa.khan035@gmail.com
🌐 GitHub: @musagithub1

⭐ If you like this project
Please consider giving it a star on GitHub ⭐
👉 https://github.com/musagithub1/json-to-toon-Converter