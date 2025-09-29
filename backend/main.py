from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import torch
from diffusers import StableDiffusionPipeline
from PIL import Image
import io
import os
import uuid
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Image Generation API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create necessary directories
UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# Mount static files
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

# Global model variable
model = None
device = "cuda" if torch.cuda.is_available() else "cpu"

class GenerateRequest(BaseModel):
    prompt: str
    negative_prompt: str = ""
    num_inference_steps: int = 30
    guidance_scale: float = 7.5
    width: int = 512
    height: int = 512

@app.on_event("startup")
async def load_model():
    """Load the diffusion model on startup"""
    global model
    try:
        logger.info("Loading diffusion model...")
        logger.info(f"Using device: {device}")
        
        # Simple method - let diffusers handle the cache automatically
        # This will use your cached version if available
        model = StableDiffusionPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5",
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            safety_checker=None,  # Disable safety checker (fixes incomplete cache)
            requires_safety_checker=False,
            # Remove local_files_only to allow download if cache is broken
        )
        model = model.to(device)
        
        # Optional: Enable optimizations
        if device == "cuda":
            model.enable_attention_slicing()
        
        logger.info(f"✅ Model loaded successfully on {device}")
        
    except Exception as e:
        logger.error(f"❌ Error loading model: {e}")
        logger.error("The model will attempt to download if not cached properly.")
        model = None

@app.get("/")
async def root():
    return {
        "message": "Image Generation API",
        "status": "running",
        "model_loaded": model is not None,
        "device": device
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "device": device
    }

@app.post("/generate")
async def generate_image(request: GenerateRequest):
    """Generate an image from a text prompt"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Please wait or restart the server.")
    
    try:
        logger.info(f"🎨 Generating image for prompt: {request.prompt}")
        
        # Generate image
        with torch.no_grad():
            result = model(
                prompt=request.prompt,
                negative_prompt=request.negative_prompt,
                num_inference_steps=request.num_inference_steps,
                guidance_scale=request.guidance_scale,
                width=request.width,
                height=request.height
            )
        
        image = result.images[0]
        
        # Save image
        filename = f"{uuid.uuid4()}.png"
        filepath = OUTPUT_DIR / filename
        image.save(filepath)
        
        logger.info(f"✅ Image saved: {filename}")
        
        return JSONResponse({
            "success": True,
            "image_url": f"/outputs/{filename}",
            "filename": filename
        })
    
    except Exception as e:
        logger.error(f"❌ Error generating image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/img2img")
async def image_to_image(
    file: UploadFile = File(...),
    prompt: str = Form(...),
    strength: float = Form(0.75),
    guidance_scale: float = Form(7.5),
    num_inference_steps: int = Form(30)
):
    """Transform an existing image based on a prompt"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Read and process input image
        contents = await file.read()
        input_image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Resize if needed
        if input_image.size[0] > 768 or input_image.size[1] > 768:
            input_image.thumbnail((768, 768))
        
        logger.info(f"🎨 Processing img2img with prompt: {prompt}")
        
        # Generate image
        with torch.no_grad():
            result = model(
                prompt=prompt,
                image=input_image,
                strength=strength,
                guidance_scale=guidance_scale,
                num_inference_steps=num_inference_steps
            )
        
        output_image = result.images[0]
        
        # Save image
        filename = f"{uuid.uuid4()}.png"
        filepath = OUTPUT_DIR / filename
        output_image.save(filepath)
        
        logger.info(f"✅ Image saved: {filename}")
        
        return JSONResponse({
            "success": True,
            "image_url": f"/outputs/{filename}",
            "filename": filename
        })
    
    except Exception as e:
        logger.error(f"❌ Error in img2img: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/gallery")
async def get_gallery():
    """Get list of generated images"""
    try:
        images = []
        for filepath in OUTPUT_DIR.glob("*.png"):
            images.append({
                "filename": filepath.name,
                "url": f"/outputs/{filepath.name}",
                "created": filepath.stat().st_mtime
            })
        
        # Sort by creation time, newest first
        images.sort(key=lambda x: x["created"], reverse=True)
        
        return {"images": images}
    
    except Exception as e:
        logger.error(f"❌ Error fetching gallery: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/delete/{filename}")
async def delete_image(filename: str):
    """Delete a generated image"""
    try:
        filepath = OUTPUT_DIR / filename
        if filepath.exists():
            filepath.unlink()
            logger.info(f"🗑️ Deleted: {filename}")
            return {"success": True, "message": "Image deleted"}
        else:
            raise HTTPException(status_code=404, detail="Image not found")
    
    except Exception as e:
        logger.error(f"❌ Error deleting image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)