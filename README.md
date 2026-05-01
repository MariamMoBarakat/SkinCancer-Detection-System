# 🔬 Mole Detection Backend API

Backend API لمشروع كشف الشامات باستخدام Layered Architecture.

---

## 🚀 طريقة التشغيل

### 1. تثبيت الـ Dependencies
```bash
npm install
```

### 2. إعداد ملف الـ Environment
```bash
cp .env.example .env
```
افتح ملف `.env` وعدّل:
- `DB_SERVER` → اسم سيرفر الـ SQL Server
- `DB_DATABASE` → اسم قاعدة البيانات
- `DB_USER` + `DB_PASSWORD` → بيانات الاتصال
- `JWT_SECRET` → مفتاح سري قوي
- `AI_MODEL_URL` → URL الـ Python API بتاع الـ AI

### 3. تشغيل السيرفر
```bash
# Development (مع auto-reload)
npm run dev

# Production
npm start
```

---

## 📁 هيكل المشروع

```
src/
├── server.js              # نقطة الدخول الرئيسية
├── config/
│   └── database.js        # إعداد SQL Server
├── middleware/
│   ├── auth.js            # JWT Authentication
│   └── upload.js          # Multer Image Upload
├── services/
│   ├── authService.js     # منطق التسجيل والدخول
│   ├── aiService.js       # التواصل مع AI Model
│   └── diagnosisService.js # حفظ النتائج في DB
├── controllers/
│   ├── authController.js  # Controllers الـ Auth
│   └── diagnosisController.js
└── routes/
    ├── authRoutes.js      # /api/auth/*
    └── diagnosisRoutes.js # /api/diagnosis/*
```

---

## 📡 API Endpoints

### Auth

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | تسجيل مستخدم جديد | ❌ |
| POST | `/api/auth/login` | تسجيل الدخول | ❌ |
| GET | `/api/auth/profile` | بيانات المستخدم | ✅ |

### Diagnosis

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/diagnosis/analyze` | رفع صورة وتحليلها | ✅ |
| GET | `/api/diagnosis/history` | سجل التحليلات | ✅ |
| GET | `/api/diagnosis/:id` | تفاصيل تشخيص | ✅ |
| GET | `/api/diagnosis/image/:filename` | عرض الصورة | ✅ |

---

## 📝 أمثلة على الـ Requests

### Register
```json
POST /api/auth/register
{
  "fullName": "Ahmed Mohamed",
  "email": "ahmed@example.com",
  "password": "password123"
}
```

### Login
```json
POST /api/auth/login
{
  "email": "ahmed@example.com",
  "password": "password123"
}
```

### Upload & Analyze
```
POST /api/diagnosis/analyze
Headers: Authorization: Bearer <token>
Body: form-data → image: <file>
```

---

## 🤖 ربط الـ AI Model

الـ Backend بيبعت الصورة لـ Python API وبيستنى الرد.

**المطلوب من الـ Python API ترجع:**
```json
{
  "mole_type": "Melanoma",
  "confidence": 0.95,
  "risk_level": "High"
}
```

**أبسط Python Flask API للاختبار:**
```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    image = request.files['image']
    # هنا بتحط الكود بتاعك
    return jsonify({
        "mole_type": "Benign",
        "confidence": 0.87,
        "risk_level": "Low"
    })

if __name__ == '__main__':
    app.run(port=5000)
```

---

## 🔐 Security Features

- ✅ Password Hashing (bcrypt, 12 rounds)
- ✅ JWT Authentication
- ✅ File type validation (JPEG/PNG/WebP only)
- ✅ File size limit (5MB)
- ✅ Input validation (express-validator)
- ✅ Image access control (المستخدم يشوف صوره بس)
- ✅ SQL Injection protection (parameterized queries)
