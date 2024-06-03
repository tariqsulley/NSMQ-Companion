from fastapi import FastAPI, WebSocket, WebSocketDisconnect,APIRouter,BackgroundTasks,Depends
from fastapi.responses import HTMLResponse

from app.models.waiting_room import WaitingRoom
from app.models.student import Student

from sqlalchemy.orm import Session

from .shared import get_db


router = APIRouter(
    prefix="/multiplayer",
    tags=["multiplayer"],
)

app = FastAPI()

# async def pair_users(sid, db: Session = next(get_db())):
#     waiting_room_entries = db.query(WaitingRoom).order_by(WaitingRoom.joined_at).all()
#     pairs = []

#     for i in range(0, len(waiting_room_entries), 2):
#         if i + 1 < len(waiting_room_entries):
#             user1_uuid = waiting_room_entries[i].student_uuid
#             user1 = db.query(Student).filter(Student.uuid == user1_uuid).first()
#             user1_name = f"{user1.first_name} {user1.last_name}"

#             user2_uuid = waiting_room_entries[i + 1].student_uuid
#             user2 = db.query(Student).filter(Student.uuid == user2_uuid).first()
#             user2_name = f"{user2.first_name} {user2.last_name}"

#             db.query(WaitingRoom).filter(
#                 WaitingRoom.student_uuid.in_([user1_uuid, user2_uuid])
#             ).delete(synchronize_session=False)

#             pairs.append((user1_uuid, user2_uuid))

#     db.commit()

#     for user1_uuid, user2_uuid in pairs:
#         print(f"Paired users: {user1_uuid} and {user2_uuid}")

