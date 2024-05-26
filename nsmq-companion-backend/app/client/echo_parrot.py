import httpx

from app.core.logger import get_logger
from app.util.enums import EmailPurpose

log = get_logger()


class EchoParrot:
    def __init__(self, host, port, sender_id, sender_app, sender_email, sender_name):
        self.host = host
        self.port = port
        self.sender_id = sender_id
        self.sender_app = sender_app
        self.sender_email = sender_email
        self.sender_name = sender_name

    # echo sms message via echo parrot to recipient
    async def echo_sms(self, message, recipient):
        url = f"http://{self.host}/api/v1/sms/"
        log.info(f"Sending SMS to {recipient} via Echo Parrot {url}")
        response = httpx.post(
            url,
            json={
                "message": message,
                "recipient": recipient,
                "sender_id": self.sender_id,
                "sender_app": self.sender_app,
            },
            headers={"Content-Type": "application/json"},
        )
        return response.json()

    async def echo_email(
        self, recipient_email, email_purpose: EmailPurpose, email_body
    ):
        url = f"http://{self.host}/api/v1/email/"
        log.info(f"Sending email to {recipient_email} via Echo Parrot {url}")
        data = {
            "recipient_email": recipient_email,
            "sender_email": self.sender_email,
            "sender_name": self.sender_name,
            "email_purpose": email_purpose.value,
            "body": email_body,
            "sender_app": self.sender_app,
        }
        log.info(f"Email data: {data}")
        response = httpx.post(
            url,
            json=data,
            headers={"Content-Type": "application/json"},
        )
        return response.json()