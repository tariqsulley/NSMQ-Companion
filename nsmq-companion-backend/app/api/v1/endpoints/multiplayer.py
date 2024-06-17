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

player_connections = {}

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    message = await websocket.receive_json()
    player_uuid = message.get("playerId")

    with SessionLocal() as db:
        student = db.query(Student).filter(Student.uuid == player_uuid).first()
        if student:
            waiting_room_data = WaitingRoomData(student_uuid=player_uuid)
            student.waiting_room_data.append(waiting_room_data)
            print("uuid:",player_uuid)
            player_connections[player_uuid] = websocket
            print("data:",player_connections)
            db.commit()


    try:
        while True:
            with SessionLocal() as db:
                players = db.execute(select(WaitingRoomData).filter_by(connected=True, matched=False))
                players = players.scalars().all()
                if len(players) >= 2:
                    player1 = players[0]
                    player2 = players[1]
                    player1.matched = True
                    player2.matched = True
                    player1.opponent_uuid = player2.student_uuid
                    player2.opponent_uuid = player1.student_uuid
                    student1 = db.query(Student).filter(Student.uuid == player1.student_uuid).first()
                    student2 = db.query(Student).filter(Student.uuid == player2.student_uuid).first()


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
                    websocket1 = player_connections[str(player1.student_uuid)]
                    websocket2 = player_connections[str(player2.student_uuid)]
                    random_num = random.randrange(0,10)

                    await websocket1.send_json({
                        "event": "start_game",
                        "game_session_uuid": str(game_session.uuid),
                        "opponent_name": student2_name,
                        "opponent_image":student2_avatar,
                        'random_number': 1
                    })

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
                    quiz_session = db.query(QuizSession).filter(
                        (QuizSession.player1_uuid == player_uuid) |
                        (QuizSession.player2_uuid == player_uuid)
                    ).first()
                    if quiz_session:
                        db.delete(quiz_session)
                        db.commit()
                        await websocket.send_json({"event": "quiz_disconnected"})

                        del player_connections[player_uuid]

                    await websocket.close()
                    break
                elif data.get("action") == "pause_audio":
                    opponent_uuid = None
                    with SessionLocal() as db:
                        waiting_room_data = db.query(WaitingRoomData).filter_by(student_uuid=player_uuid).first()
                        if waiting_room_data:
                            opponent_uuid = waiting_room_data.opponent_uuid

                    if opponent_uuid and opponent_uuid in player_connections:
                        opponent_websocket = player_connections[str(opponent_uuid)]
                        await opponent_websocket.send_json({"action": "pause_audio"})

                elif data.get("action") == "resume_audio":
                    opponent_uuid = None
                    with SessionLocal() as db:
                        waiting_room_data = db.query(WaitingRoomData).filter_by(student_uuid=player_uuid).first()
                        if waiting_room_data:
                            opponent_uuid = waiting_room_data.opponent_uuid

                    if opponent_uuid and opponent_uuid in player_connections:
                        opponent_websocket = player_connections[opponent_uuid]
                        await opponent_websocket.send_json({"action": "resume_audio"})

        await websocket.receive_text()

    except WebSocketDisconnect:
        with SessionLocal() as db:
            student = db.query(Student).filter(Student.uuid == player_uuid).first()
            if student and student.waiting_room_data:
                db.delete(student.waiting_room_data[0])
                db.commit()

                del player_connections[player_uuid]
        await websocket.close()