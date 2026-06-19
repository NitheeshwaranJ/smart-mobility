"""AI Assistant via any OpenAI-compatible chat endpoint.

If OPENAI_API_KEY is not set, returns a deterministic rule-based fallback so
the demo always works.
"""
from __future__ import annotations
import httpx
from ..config import settings

SYSTEM_PROMPT = """You are MobilityAI, the in-app assistant for a smart car-rental
and carpooling platform. Be concise (max 4 short paragraphs). Help users:
- pick a suitable rental (sedan/SUV/EV) based on trip length, passengers, budget
- explain dynamic pricing in plain English (demand, season, availability)
- suggest carpool opportunities when destinations overlap
- estimate cost / CO2 savings
Never invent vehicles or prices that weren't mentioned by the user."""


def _fallback(user_msg: str) -> str:
    m = user_msg.lower()
    if any(k in m for k in ("cheap", "budget", "low")):
        return ("For lower cost, pick a Hatchback or Sedan, travel mid-week, and avoid "
                "peak-season dates (May–June, December). Carpooling on similar routes can "
                "cut your bill by 30–50%.")
    if "carpool" in m or "share" in m:
        return ("Open the Carpool tab, enter your pickup, destination and travel time. "
                "We'll match you with riders going the same way and show match %, cost and "
                "CO₂ savings.")
    if "price" in m or "pricing" in m or "cost" in m:
        return ("Our AI pricing combines recent demand, local availability, season and the "
                "model's popularity. You'll always see Base price → AI adjustment → Final price.")
    if "ev" in m or "electric" in m or "tesla" in m:
        return ("Electric vehicles are great for city trips with charging access. They're priced "
                "competitively and reduce CO₂ by ~70% vs petrol cars.")
    return ("I can help you pick a vehicle, find a carpool match, or explain pricing. "
            "Tell me your trip — start, destination, dates, and how many passengers.")


async def chat(messages: list[dict]) -> str:
    if not settings.OPENAI_API_KEY:
        last = next((m["content"] for m in reversed(messages) if m["role"] == "user"), "")
        return _fallback(last)

    payload = {
        "model": settings.OPENAI_MODEL,
        "messages": [{"role": "system", "content": SYSTEM_PROMPT}, *messages],
        "temperature": 0.4,
        "max_tokens": 400,
    }
    headers = {"Authorization": f"Bearer {settings.OPENAI_API_KEY}"}
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                f"{settings.OPENAI_BASE_URL}/chat/completions",
                json=payload, headers=headers,
            )
            r.raise_for_status()
            data = r.json()
            return data["choices"][0]["message"]["content"].strip()
    except Exception as e:  # noqa: BLE001
        return _fallback(messages[-1]["content"] if messages else "") + f"\n\n_(AI gateway fallback: {type(e).__name__})_"
