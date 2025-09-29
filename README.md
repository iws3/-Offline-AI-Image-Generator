# 🎨 Offline AI Image Generator

![WhatsApp Image 2025-09-29 at 6 18 38 AM](https://github.com/user-attachments/assets/d43648d9-48f6-4be1-a77c-8740944d6ea7)


A beautiful, fast, and **completely offline** AI image generation studio powered by Stable Diffusion. Generate stunning images from text descriptions without internet connection or API costs.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-green.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)

## ✨ Features

- 🚀 **100% Offline** - Works without internet after initial setup
- ⚡ **GPU Accelerated** - CUDA optimization for fast generation (8-15s on GPU)(Still working on it)
- 🎨 **Beautiful UI** - Modern, non-AI-looking interface built with Next.js 15
- 📸 **Gallery Management** - Save, view, and download all your creations
- 🎛️ **Advanced Controls** - Fine-tune steps, guidance, negative prompts
- 💾 **Local Storage** - All images stored on your machine
- 🔒 **Privacy First** - Nothing leaves your computer

## 🖼️ Screenshots

```
[Your generation interface here]
```

## 🏗️ Tech Stack

### Backend
- **FastAPI** - High-performance Python API framework
- **Stable Diffusion v1.5** - State-of-the-art diffusion model from Runway ML
- **PyTorch** - Deep learning framework with CUDA support
- **Diffusers** - Hugging Face's diffusion models library

### Frontend
- **Next.js 15** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Icons** - Beautiful, consistent icons
- **React Hooks** - Modern state management

## 📋 Prerequisites

- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **NVIDIA GPU** (optional but recommended for speed)
  - CUDA Toolkit 11.8+ for GPU acceleration
  - 6GB+ VRAM recommended

## 🚀 Quick Start

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/offline-image-generator.git
cd offline-image-generator
```

### 2️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend
python main.py
```

**Expected output:**
```
🚀 CUDA available! Using GPU: NVIDIA GeForce RTX 3060
   GPU Memory: 12.00 GB
INFO: Loading diffusion model...
INFO: ✅ Model loaded successfully on cuda
INFO: Uvicorn running on http://0.0.0.0:8000
```

### 3️⃣ Frontend Setup

Open a **new terminal**:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

**Frontend will be available at:** `http://localhost:3000`

### 4️⃣ Generate Your First Image!

1. Open `http://localhost:3000` in your browser
2. Enter a prompt like: *"A serene mountain landscape at sunset with golden light"*
3. Click **Generate Image**
4. Wait 15-60 seconds (depending on your hardware)
5. Enjoy your creation! 🎨

## 📁 Project Structure

```
offline-image-generator/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   ├── uploads/               # Temporary uploads (auto-created)
│   └── outputs/               # Generated images (auto-created)
│
└── frontend/
    ├── app/
    │   ├── layout.js          # Next.js layout
    │   ├── page.js            # Main application component
    │   └── globals.css        # Global styles
    ├── package.json           # Node dependencies
    └── next.config.js         # Next.js configuration
```

## 🎛️ API Endpoints

### `GET /`
Health check endpoint
```json
{
  "message": "Image Generation API",
  "status": "running",
  "model_loaded": true,
  "device": "cuda"
}
```

### `POST /generate`
Generate image from text prompt

**Request:**
```json
{
  "prompt": "a beautiful sunset",
  "negative_prompt": "blurry, low quality",
  "num_inference_steps": 30,
  "guidance_scale": 7.5,
  "width": 512,
  "height": 512
}
```

**Response:**
```json
{
  "success": true,
  "image_url": "/outputs/abc123.png",
  "filename": "abc123.png",
  "generation_time": "12.34s"
}
```

### `GET /gallery`
Get list of all generated images

### `DELETE /delete/{filename}`
Delete a specific image

## ⚙️ Configuration

### Backend Settings

Edit `main.py` to customize:

```python
# Model settings
model_path = "runwayml/stable-diffusion-v1-5"

# Server settings
host = "0.0.0.0"
port = 8000

# Device (auto-detected)
device = "cuda" if torch.cuda.is_available() else "cpu"
```

### Frontend Settings

Edit `app/page.js` to customize:

```javascript
// API URL
const API_URL = 'http://localhost:8000';

// Default settings
const [settings, setSettings] = useState({
  steps: 30,
  guidance: 7.5,
  width: 512,
  height: 512
});
```

## 🚄 Performance Optimization

### Install xformers (2x Speed Boost!)

```bash
pip install xformers
```

### Check Your Setup

```bash
python -c "import torch; print('CUDA:', torch.cuda.is_available()); print('Device:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU')"
```

### Expected Generation Times

| Hardware | Settings | Time |
|----------|----------|------|
| RTX 3060 (with xformers) | 20 steps, 512x512 | ~8s |
| RTX 3060 (basic) | 30 steps, 512x512 | ~30s |
| CPU (i7) | 20 steps, 512x512 | ~90s |
| CPU (i7) | 30 steps, 512x512 | ~150s |

### Tips for Faster Generation

1. **Use GPU** - 10x faster than CPU
2. **Install xformers** - 2x speed boost
3. **Lower steps** - 20-25 steps is usually sufficient
4. **Keep size at 512x512** - Larger images are exponentially slower
5. **Close other GPU applications** - Free up VRAM

## 🐛 Troubleshooting

### Backend won't start

**Error:** `Model not found`
```bash
# Solution: The model will download automatically on first run (~4GB)
# Make sure you have internet for initial setup
```

**Error:** `CUDA out of memory`
```bash
# Solution: Lower image size or close other GPU applications
# Or force CPU mode in main.py:
device = "cpu"
```

**Error:** `Model file not found in cache`
```bash
# Solution: Clear corrupted cache and re-download
rmdir /s "C:\Users\YOUR_USERNAME\.cache\huggingface"
# Then restart backend
```

### Frontend issues

**Error:** `Failed to fetch`
```bash
# Solution: Make sure backend is running on port 8000
# Check: http://localhost:8000 in browser
```

**Status shows "Offline"**
```bash
# Solution: Start the backend first, then frontend
cd backend
python main.py
```

### Slow generation on GPU

**Check GPU usage:**
```bash
nvidia-smi -l 1
```

**Reinstall PyTorch with CUDA:**
```bash
pip uninstall torch torchvision
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

## 💡 Usage Tips

### Writing Good Prompts

**Good prompts are:**
- Descriptive and specific
- Include style, lighting, mood
- Mention desired quality

**Examples:**
```
✅ "A photorealistic portrait of an elderly woman, soft lighting, detailed wrinkles, warm colors"
✅ "Futuristic city with neon lights, cyberpunk style, rainy night, 4k, highly detailed"
✅ "Oil painting of a cat on a windowsill, impressionist style, sunset lighting"

❌ "cat"
❌ "image"
❌ "make something cool"
```

### Using Negative Prompts

Add things you want to **avoid**:
```
blurry, low quality, distorted, ugly, bad anatomy, watermark, text
```

### Advanced Settings

- **Steps (10-50):** Higher = more detail but slower (30 is sweet spot)
- **Guidance (1-20):** Higher = follows prompt more strictly (7-8 recommended)
- **Size:** Start with 512x512, increase only if needed

## 📦 Dependencies

### Backend (`requirements.txt`)
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
torch>=2.0.0
diffusers>=0.21.0
transformers>=4.30.0
accelerate>=0.20.0
Pillow>=10.0.0
pydantic>=2.0.0
```

### Frontend (`package.json`)
```json
{
  "dependencies": {
    "next": "15.0.0",
    "react": "^18.2.0",
    "lucide-react": "^0.263.1"
  }
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Runway ML** - For the Stable Diffusion v1.5 model
- **Hugging Face** - For the Diffusers library
- **Stability AI** - For pioneering diffusion models
- **FastAPI** - For the amazing web framework
- **Vercel** - For Next.js

## 📞 Support

Having issues? 

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing [Issues](https://github.com/yourusername/offline-image-generator/issues)
3. Open a new issue with:
   - Your OS and Python version
   - Backend terminal output
   - Browser console errors (F12)

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

---

**Made with ❤️ by [Your Name]**

*Generate AI images anywhere, anytime, offline.*
