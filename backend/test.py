import os
from dotenv import load_dotenv
from openai import OpenAI

# Load variables from .env file
load_dotenv()
api_key = os.getenv("DEEPSEEK_API_KEY")

# Initialize the client with your API key and base URL
client = OpenAI(api_key=api_key, base_url="https://api.deepseek.com")

response = client.chat.completions.create(
    model="deepseek-chat",  # Use "deepseek-reasoner" for R1 if needed
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello!"}
    ],
    stream=False
)

print(response.choices[0].message.content)
