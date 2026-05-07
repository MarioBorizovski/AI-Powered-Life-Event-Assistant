import os
import asyncio
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv(override=True)

async def test_call():
    api_key = os.getenv("GEMINI_API_KEY")
    print(f"API Key starting with: {api_key[:10]}..." if api_key else "No key found")
    client = AsyncOpenAI(
        api_key=api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )
    try:
        response = await client.chat.completions.create(
            model="gemini-2.5-flash",
            messages=[{"role": "user", "content": "Test"}],
            max_tokens=10
        )
        print("Success:", response.choices[0].message.content)
    except Exception as e:
        print(f"Error Type: {type(e)}")
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()

asyncio.run(test_call())
