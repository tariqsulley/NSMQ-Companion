import logging

import graypy

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger()


def init_logger(app_name, host, port):
    logger.addHandler(
        graypy.GELFUDPHandler(host, port, localname=app_name, extra_fields=True)
    )


def get_logger():
    return logger