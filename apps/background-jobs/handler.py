from typing import Any, Dict
import json
from shared import common

def check_conversion_status(event: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    common_function_response = common.shared_function()
    response = {
        "statusCode": 200,
        "body": json.dumps({"message": "Lambda 1", "shared": common_function_response})
    }
    return response

def create_conversion(event: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    common_function_response = common.shared_function()
    response = {
        "statusCode": 200,
        "body": json.dumps({"message": "Lambda 2", "shared": common_function_response})
    }
    return response