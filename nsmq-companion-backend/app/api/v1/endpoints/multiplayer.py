from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.models.student import WaitingRoom
from app.models.quiz_session import QuizSession
from app.database.core import SessionLocal
from sqlalchemy import select
from sqlalchemy.orm import Session
import uuid

router = APIRouter(
    prefix="/multiplayer",
    tags=["multiplayer"],
)

# WebSocket connection for real-time communication
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    # Add the player to the waiting room
    player_uuid = str(uuid.uuid4())
    with SessionLocal() as db:
        waiting_room_entry = WaitingRoom(
            uuid=player_uuid,
            student_uuid="29fc2bed-78da-46c7-9beb-11aaacbfa860"
        )
        db.add(waiting_room_entry)
        db.commit()

    try:
        # Monitor the waiting room and match players
        while True:
            # Check if there are two available players in the waiting room
            with SessionLocal() as db:
                players = db.execute(select(WaitingRoom).filter_by(connected=True, matched=False))
                players = players.scalars().all()
                if len(players) >= 2:
                    # Match the two players and create a new game session
                    player1 = players[0]
                    player2 = players[1]
                    player1.matched = True
                    player2.matched = True
                    player1.opponent_uuid = player2.uuid
                    player2.opponent_uuid = player1.uuid
                    game_session = QuizSession(
                        uuid=str(uuid.uuid4()),
                        player1_uuid=player1.student_uuid,
                        player2_uuid=player2.student_uuid
                    )
                    db.add(game_session)
                    db.commit()

                    # Notify the clients that the game session has started
                    await websocket.send_json({
                        "event": "start_game",
                        "game_session_uuid": game_session.uuid
                    })

            # Wait for the next WebSocket message
            await websocket.receive_text()

    except WebSocketDisconnect:
        # Remove the player from the waiting room
        with SessionLocal() as db:
            waiting_room_entry = await db.get(WaitingRoom, player_uuid)
            if waiting_room_entry:
                db.delete(waiting_room_entry)
                await db.commit()