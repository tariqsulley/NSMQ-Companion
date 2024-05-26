from dependency_injector import containers, providers
from app.core.settings import settings



class Container(containers.DeclarativeContainer):
    wiring_config = containers.WiringConfiguration(
        modules=[
            "app.api.v1.endpoints.authentication",
        ]
    )

  