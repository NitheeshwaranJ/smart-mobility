from fastapi import APIRouter
from ..schemas import AIChatIn, AIChatOut
from ..core.ai import chat as ai_chat

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/chat", response_model=AIChatOut)
async def chat(data: AIChatIn):
    reply = await ai_chat([m.model_dump() for m in data.messages])
    return AIChatOut(reply=reply)
