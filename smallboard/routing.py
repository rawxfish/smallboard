from django.urls import re_path

from smallboard.asgi import django_asgi_app
from smallboard.consumers import NotificationConsumer

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator



application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,

    }
)
