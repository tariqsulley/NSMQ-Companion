from structlog import get_logger

from app.core.container import Container
from app.util.enums import EmailPurpose

log = get_logger()

async def send_email(
    email_purpose,
    email_body,
    email,
):
    try:
        echo_parrot = Container().echo_parrot()
        response = await echo_parrot.echo_email(
            recipient_email=email,
            email_purpose=email_purpose,
            email_body=email_body,
        )
        return response

    except Exception as e:
        raise Exception(str(e))


async def send_email_verification(
    recipient_name,
    email,
    message,
    url,
    btn,
    token="",
    email_purpose=EmailPurpose.EMAIL_VERIFICATION,
):
    try:
        response = await send_email(
            email_purpose=email_purpose,
            email_body={
                "recipient_name": recipient_name,
                "message": message,
                "verify_token": token,
                "url": url,
                "btn": btn,
            },
            email=email,
        )
        if response["data"]["status"] == "success":
            log.info(f"Verification email [{email}] sent successfully")
            return

        log.error(f"Failed to send verification email [{email}]")
    except Exception as e:
        log.error(f"Failed to send verification email [{email}]")
        raise Exception(str(e))



async def send_otp_email(
    recipient_name,
    email,
    otp,
):
    try:
        response = await send_email(
            email_purpose=EmailPurpose.EMAIL_OTP,
            email_body={
                "recipient_name": recipient_name,
                "otp": otp,
            },
            email=email,
        )
        if response["data"]["status"] == "success":
            log.info(f"OTP email [{email}] sent successfully")
            return

        log.error(f"Failed to send OTP email [{email}]")
    except Exception as e:
        log.error(f"Failed to send OTP email [{email}]")
        raise Exception(str(e))


