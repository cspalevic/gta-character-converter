import replicate
import os
from io import BytesIO

model = replicate.models.get("cloneofsimo/gta5_lora")
version = model.versions.get("3c2f37b92610fb0d92d6acdb3e7754e467790c7ed76760fcc0b952f9c0ec49cd")

def get_prediction(id: str):
    prediction = replicate.predictions.get(id)

    return {
        "id": prediction.id,
        "status": prediction.status,
        "message": prediction.error
    }

def create_prediction(image_data: BytesIO):
    prediction = replicate.predictions.create(
        version=version,
        input={
            "prompt": "a photo of <1> gtav style",
            "image": image_data,
            "width": 1024,
            "height": 768
        }
    )

    return {
        "id": prediction.id,
        "status": prediction.status
    }