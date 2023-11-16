from datetime import datetime
from uuid import uuid4
from fastapi import HTTPException, status, UploadFile, Request
from sqlmodel import Session, select
from src.db.activities import Activity
from src.db.blocks import Block, BlockTypeEnum
from src.db.courses import Course
from src.services.blocks.utils.upload_files import upload_file_and_return_file_object

from src.services.users.users import PublicUser


async def create_video_block(
    request: Request, video_file: UploadFile, activity_id: str, db_session: Session
):
    statement = select(Activity).where(Activity.id == activity_id)
    activity = db_session.exec(statement).first()

    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found"
        )

    block_type = "videoBlock"

    # get org_id from activity
    org_id = activity.org_id

    # get course
    statement = select(Course).where(Course.id == activity.course_id)
    course = db_session.exec(statement).first()

    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Course not found"
        )

    # get block id
    block_uuid = str(f"block_{uuid4()}")

    block_data = await upload_file_and_return_file_object(
        request,
        video_file,
        activity_id,
        block_uuid,
        ["mp4", "webm", "ogg"],
        block_type,
        str(org_id),
        str(course.id),
    )

    # create block
    block = Block(
        activity_id=activity.id is not None,
        block_type=BlockTypeEnum.BLOCK_VIDEO,
        content=block_data.dict(),
        org_id=org_id,
        course_id=course.id is not None,
        block_uuid=block_uuid,
        creation_date=str(datetime.now()),
        update_date=str(datetime.now()),
    )

    # insert block
    db_session.add(block)
    db_session.commit()
    db_session.refresh(block)

    return block


async def get_video_block(
    request: Request, block_uuid: str, current_user: PublicUser, db_session: Session
):
    statement = select(Block).where(Block.block_uuid == block_uuid)
    block = db_session.exec(statement).first()

    if not block:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Video file does not exist"
        )
    
    return block
