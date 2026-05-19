from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_alter_mantenimiento_options_mantenimiento_estado_and_more'),
    ]

    operations = [
        migrations.DeleteModel(
            name='historial_acciones',
        ),
    ]
