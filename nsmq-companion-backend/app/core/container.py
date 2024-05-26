from dependency_injector import containers, providers

from app.client.echo_parrot import EchoParrot
from app.client.mqtt_service import MQTTService
from app.core.database import Database
from app.core.settings import settings



class Container(containers.DeclarativeContainer):
    wiring_config = containers.WiringConfiguration(
        modules=[
            "app.api.v1.endpoints.authentication",
        ]
    )

  