# Import necessary libraries 
import requests as rq 
import json 
import uuid 

# Set endpoint URL and headers 
url = "https://sandbox.momodeveloper.mtn.com/v1_0/apiuser" 

API_USER = str(uuid.uuid4())
headers = { 
"X-Reference-Id": API_USER, 
"Ocp-Apim-Subscription-Key": "4c91dae7a6f1474387a23a1f3d448eb7", 
"Content-Type": "application/json" 
} 

# Define the body 
body = { 
"providerCallbackHost": "webhook.site" 
} 

# Send POST request to create API user 
resp = rq.post(url, json=body, headers=headers) 


# Set endpoint URL for generating API key 
url = "https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/"+API_USER+"/apikey" 
headers = { 
"Ocp-Apim-Subscription-Key": "4c91dae7a6f1474387a23a1f3d448eb7", 
"Content-Type": "application/json" 
} 

# Send POST request to generate API key 
resp = rq.post(url, headers=headers) 
print(resp.status_code, "\nAPI User is", API_USER) 
json_resp = json.loads(resp.text) 
API_KEY = json_resp.get("apiKey", "") 
print("API Key is", API_KEY)