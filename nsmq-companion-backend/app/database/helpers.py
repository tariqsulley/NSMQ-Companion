from sqlalchemy import String, cast
from sqlalchemy.orm import Session


def get_all_items(db: Session, model):
    return db.query(model).all()


def get_item_by_id(db: Session, model, uuid: str):
    return db.query(model).filter(model.uuid == uuid).first()


def create_item(db: Session, model, item_data):
    db_item = model(**item_data)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update_item(db: Session, uuid: str, model, updated_item_data):
    #  an error occurs if the casting is not done
    db_item = (
        db.query(model).filter(cast(model.uuid, String) == cast(uuid, String)).first()
    )
    if db_item:
        for key, value in updated_item_data.items():
            setattr(db_item, key, value)
        db.commit()
    return db_item


def delete_item(db: Session, model, uuid: str):
    db_item = get_item_by_id(db, model, uuid)
    if db_item:
        db.delete(db_item)
        db.commit()
    return db_item