from django.conf import settings
from django.db import models
from django.dispatch import receiver


def _get_service_choices():
    return [(p, p) for p in settings.CHAT_SERVICES.keys()]


class ChatRoom(models.Model):
    """Represents a space for users to communicate about a topic (i.e. puzzle).

    A single ChatRoom object can include multiple channels for different media
    like text and audio. For example, a single ChatRoom instance named "Foo" for
    discussing a puzzle "Foo" might manage both a text and audio channel for
    that topic.

    The backing chat service must be implemented with the
    `chat.service.ChatService` interface. Concrete implementations of
    `ChatService` must be registered in Django settings under a dict named
    `CHAT_SERVICES`, mapping string names to ChatService classes. A
    `Chat_DEFAULT_SERVICE` string setting must also be specified. For example, a
    DiscordChatService implementation of ChatService can be registered like
    this:

        CHAT_DEFAULT_SERVICE = "DISCORD"
        CHAT_SERVICES = {
            "DISCORD": discord_lib.DiscordChatService,
        }

    The example above will let users select "DISCORD" for the ChatRoom.services
    field and will set ChatRooms to use "DISCORD" when left unspecified.
    ChatRoom's channel manipulation methods will automatically use the
    DiscordChatService implementation for objects set to "DISCORD" service.

    Django models and views should interface with this ChatRoom model directly,
    not the underlying ChatService interface.
    """

    service = models.CharField(max_length=32, choices=_get_service_choices())
    name = models.CharField(max_length=255)

    text_channel_id = models.CharField(max_length=255, null=True, blank=True)
    audio_channel_id = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                name="unique_room_name_per_service", fields=["service", "name"]
            ),
        ]

    def __str__(self):
        return self.name

    def get_service(self):
        return settings.CHAT_SERVICES[self.service].get_instance()

    def create_channels(self):
        service = self.get_service()
        self.text_channel_id = service.create_text_channel(self.name)
        self.audio_channel_id = service.create_audio_channel(self.name)
        self.save(update_fields=["text_channel_id", "audio_channel_id"])

    def delete_channels(self):
        service = self.get_service()
        update_fields = []
        if self.text_channel_id:
            service.delete_text_channel(self.text_channel_id)
            self.text_channel_id = None
            update_fields.append("text_channel_id")
        if self.audio_channel_id:
            service.delete_audio_channel(self.audio_channel_id)
            self.audio_channel_id = None
            update_fields.append("audio_channel_id")
        if update_fields:
            self.save(update_fields=update_fields)


@receiver(models.signals.pre_delete, sender=ChatRoom)
def delete_chat_room_channels(sender, instance, using, **kwargs):
    instance.delete_channels()
