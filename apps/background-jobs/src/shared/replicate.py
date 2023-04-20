import replicate
from io import BytesIO

model = replicate.models.get("cloneofsimo/gta5_lora")
version = model.versions.get(
    "3c2f37b92610fb0d92d6acdb3e7754e467790c7ed76760fcc0b952f9c0ec49cd"
)


def get_prediction(id: str):
    return replicate.predictions.get(id)


def create_prediction(image_data: BytesIO):
    return replicate.predictions.create(
        version=version,
        input={
            "prompt": "a photo of <1> gtav style",
            "image": image_data,
            "width": 1024,
            "height": 768,
        },
    )
