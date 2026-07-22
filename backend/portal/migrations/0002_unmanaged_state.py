# Generated manually — existing personel_db tables stay untouched.
from django.db import migrations


class Migration(migrations.Migration):
    """Model state: managed=False (tablolar Postgres'te zaten var)."""

    dependencies = [
        ('portal', '0001_initial'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.DeleteModel(name='AnasayfaLink'),
                migrations.DeleteModel(name='Duyuru'),
                migrations.DeleteModel(name='Haber'),
                migrations.DeleteModel(name='Personel'),
            ],
            database_operations=[],
        ),
    ]
