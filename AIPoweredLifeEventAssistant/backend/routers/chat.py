import os
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from openai import AsyncOpenAI
import openai

from auth import get_current_user
from models import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["Chat"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    reply: str

RESTRICTED_SYSTEM_PROMPT = """
You are a highly professional AI assistant representing the e-Services portal of North Macedonia (еУслуги).
Your SOLE purpose is to assist citizens with public administrative services, documents, life events (birth, marriage, divorce, employment, etc.), and institutional procedures within North Macedonia.

STRICT RULES YOU MUST FOLLOW:
1. DO NOT answer any questions unrelated to public services, government procedures, or administrative documents in North Macedonia.
2. If the user asks for code, essays, recipes, general knowledge, or anything outside your scope, politely decline and state that you can only help with administrative and public service inquiries.
3. Keep your answers concise, structured, and easy to read. Use bullet points for document lists.
4. Always respond in the Macedonian language, regardless of the language the user asks in (unless they explicitly state they don't speak Macedonian, in which case help them in English but strictly regarding MK public services).
5. When users ask location-specific questions (like "in Kumanovo"), provide accurate local context (e.g., "Општина Куманово", "Подрачна единица Куманово") instead of generic answers.
"""

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    from dotenv import load_dotenv
    load_dotenv(override=True)
    
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "your_openai_api_key_here":
        logger.warning("No valid API key found, using static fallback for chat.")
        return ChatResponse(
            reply="Се извинуваме, AI системот моментално не е достапен. Ве молиме обидете се подоцна."
        )

    # Point the OpenAI client to Gemini's API
    client = AsyncOpenAI(
        api_key=api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )

    # Build conversation context
    messages = [{"role": "system", "content": RESTRICTED_SYSTEM_PROMPT}]
    
    # Add history (last 5 messages to save tokens)
    if request.history:
        for msg in request.history[-5:]:
            messages.append({"role": msg.role, "content": msg.content})
            
    # Add current user message
    messages.append({"role": "user", "content": request.message})

    try:
        response = await client.chat.completions.create(
            model="gemini-2.5-flash", # Google's Gemini Flash model
            messages=messages,
            temperature=0.3, # Low temperature for more factual/restricted answers
            max_tokens=800
        )
        
        reply_text = response.choices[0].message.content
        if not reply_text:
            raise ValueError("Empty response from LLM")
            
        return ChatResponse(reply=reply_text)
        
    except openai.RateLimitError:
        logger.error("AI Rate Limit Exceeded (Quota)")
        return ChatResponse(reply="⚠️ Недостаток на кредити: Вашиот API клуч нема доволно средства (insufficient quota). Ве молиме проверете ја вашата сметка кај провајдерот (OpenAI/Gemini/Groq).")
    except openai.AuthenticationError:
        logger.error("AI Authentication Error")
        return ChatResponse(reply="⚠️ Грешка: Невалиден API клуч.")
    except Exception as e:
        logger.error(f"AI Chat API failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Грешка при комуникација со AI сервисот")
