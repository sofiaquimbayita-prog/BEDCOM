from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0002_garantia_fecha_solicitud'),
    ]

    operations = [
        migrations.AlterField(
            model_name='despacho',
            name='costo_envio',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
    ]
