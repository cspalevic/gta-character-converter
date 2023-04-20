from typing import Any, Dict
from src.shared.s3 import get_image
from src.shared.replicate import create_prediction, get_prediction
from src.shared.supabase import get_open_conversions, update_conversion


def check_conversion_status(
    event: Dict[str, Any], context: Dict[str, Any]
) -> Dict[str, Any]:
    open_conversions = get_open_conversions()
    for conversion in open_conversions["data"]:
        replicate_id = conversion["replicate_id"]
        prediction = get_prediction(replicate_id)

        status = prediction.status
        message = prediction.error
        url = (
            prediction.output[0]
            if len(prediction.output) > 0 and prediction.output[0] is not None
            else None
        )

        if status == "succeeded" and url is None:
            status = "failed"
            message = "No output found"

        if status == "canceled" or status == "failed":
            # update conversion
            update_conversion(replicate_id, {"status": status, "message": message})

        if status == "succeeded":
            # update conversion
            update_conversion(replicate_id, {"status": "completed", "url": url})

    return {"statusCode": 200}


def create_conversion(event: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    # Get the image
    reference_id = event.get("reference_id")
    image = get_image(reference_id)

    # Create the Replicate prediction
    prediction = create_prediction(image)

    response = {"statusCode": 200, "body": prediction}
    return response
