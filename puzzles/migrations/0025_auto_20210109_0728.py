# Generated by Django 3.1.5 on 2021-01-09 07:28

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("puzzles", "0024_auto_20210104_2026"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="puzzletag",
            options={"ordering": ("color", "name")},
        ),
    ]
