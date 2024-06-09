from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.models.student import WaitingRoomData, Student
from app.models.quiz_session import QuizSession
from app.database.core import SessionLocal
from sqlalchemy import select
import uuid
from sqlalchemy import select, func
import random
router = APIRouter(
    prefix="/multiplayer",
    tags=["multiplayer"],
)

# Store WebSocket connections mapped to player UUIDs
player_connections = {}

# WebSocket connection for real-time communication
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    message = await websocket.receive_json()
    player_uuid = message.get("playerId")

    # Add the player to the waiting room
    with SessionLocal() as db:
        student = db.query(Student).filter(Student.uuid == player_uuid).first()
        if student:
            waiting_room_data = WaitingRoomData(student_uuid=player_uuid)
            student.waiting_room_data.append(waiting_room_data)
            # Store the WebSocket connection for this player
            print("uuid:",player_uuid)
            player_connections[player_uuid] = websocket
            print("data:",player_connections)
            db.commit()


    try:
        while True:
             # Check if there are two available players in the waiting room
            with SessionLocal() as db:
                players = db.execute(select(WaitingRoomData).filter_by(connected=True, matched=False))
                players = players.scalars().all()
                if len(players) >= 2:
                    # Match the two players and create a new game session
                    player1 = players[0]
                    player2 = players[1]
                    player1.matched = True
                    player2.matched = True
                    player1.opponent_uuid = player2.student_uuid
                    player2.opponent_uuid = player1.student_uuid
                    # Get the names of the paired students
                    student1 = db.query(Student).filter(Student.uuid == player1.student_uuid).first()
                    student2 = db.query(Student).filter(Student.uuid == player2.student_uuid).first()


                    # Concatenate first name and last name
                    student1_name = f"{student1.first_name} {student1.last_name}"
                    student2_name = f"{student2.first_name} {student2.last_name}"
                    stundet1_avatar = f"{student1.avatar_url}"
                    student2_avatar = f"{student2.avatar_url}"

                    game_session = QuizSession(
                        uuid=str(uuid.uuid4()),
                        player1_uuid=str(player1.student_uuid),
                        player2_uuid=str(player2.student_uuid),
                    )
                    db.add(game_session)
                    db.commit()
                    # Retrieve the WebSocket connections for the matched players
                    websocket1 = player_connections[str(player1.student_uuid)]
                    websocket2 = player_connections[str(player2.student_uuid)]
                    random_num = random.randrange(0,10)

                    # Send start_game event to player 1
                    await websocket1.send_json({
                        "event": "start_game",
                        "game_session_uuid": str(game_session.uuid),
                        "opponent_name": student2_name,
                        "opponent_image":student2_avatar,
                        'random_number': 1
                    })

                    # Send start_game event to player 2
                    await websocket2.send_json({
                        "event": "start_game",
                        "game_session_uuid": str(game_session.uuid),
                        "opponent_name": student1_name,
                        "opponent_image":stundet1_avatar,
                        'random_number': 1
                    })

                data = await websocket.receive_json()
                if data.get("action") == "disconnect_quiz":
                    student = db.query(Student).filter(Student.uuid == player_uuid).first()
                    if student and student.waiting_room_data:
                        db.delete(student.waiting_room_data[0])
                        db.commit()
                    # Remove the player from the quiz session
                    quiz_session = db.query(QuizSession).filter(
                        (QuizSession.player1_uuid == player_uuid) |
                        (QuizSession.player2_uuid == player_uuid)
                    ).first()
                    if quiz_session:
                        db.delete(quiz_session)
                        db.commit()
                        await websocket.send_json({"event": "quiz_disconnected"})

                        # Remove the player's WebSocket connection
                        del player_connections[player_uuid]

                    # Close the WebSocket connection
                    await websocket.close()
                    break
                elif data.get("action") == "pause_audio":
                # Get the opponent's WebSocket connection
                    opponent_uuid = None
                    with SessionLocal() as db:
                        waiting_room_data = db.query(WaitingRoomData).filter_by(student_uuid=player_uuid).first()
                        if waiting_room_data:
                            opponent_uuid = waiting_room_data.opponent_uuid

                    if opponent_uuid and opponent_uuid in player_connections:
                        opponent_websocket = player_connections[str(opponent_uuid)]
                        await opponent_websocket.send_json({"action": "pause_audio"})

                elif data.get("action") == "resume_audio":
                # Get the opponent's WebSocket connection
                    opponent_uuid = None
                    with SessionLocal() as db:
                        waiting_room_data = db.query(WaitingRoomData).filter_by(student_uuid=player_uuid).first()
                        if waiting_room_data:
                            opponent_uuid = waiting_room_data.opponent_uuid

                    if opponent_uuid and opponent_uuid in player_connections:
                        opponent_websocket = player_connections[opponent_uuid]
                        await opponent_websocket.send_json({"action": "resume_audio"})

        # Wait for the next WebSocket message
        await websocket.receive_text()

    except WebSocketDisconnect:
        # Remove the player from the waiting room
        with SessionLocal() as db:
            student = db.query(Student).filter(Student.uuid == player_uuid).first()
            if student and student.waiting_room_data:
                db.delete(student.waiting_room_data[0])
                db.commit()

                # Remove the player's WebSocket connection
                del player_connections[player_uuid]
        await websocket.close()