from typing import Any, Dict
from src.shared.s3 import get_image
from src.shared.replicate import create_prediction, get_prediction

def check_conversion_status(event: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    replicate_id = event.get("replicate_id")
    prediction = get_prediction(replicate_id)
    
    response = {
        "statusCode": 200,
        "body": prediction
    }
    return response

def create_conversion(event: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    # Get the image
    reference_id = event.get("reference_id")
    image = get_image(reference_id)

    # Create the Replicate prediction
    prediction = create_prediction(image)

    response = {
        "statusCode": 200,
        "body": prediction
    }
    return response