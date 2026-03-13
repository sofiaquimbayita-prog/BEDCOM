from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('app', '0009_alter_bom_producto_alter_bom_unique_together'),
    ]

    operations = [
        migrations.CreateModel(
            name='Notificacion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('titulo', models.CharField(max_length=200)),
                ('mensaje', models.TextField()),
                ('fecha', models.DateTimeField(auto_now_add=True)),
                ('leida', models.BooleanField(default=False)),
                ('tipo', models.CharField(max_length=50)),
                ('relacionado_id', models.PositiveIntegerField(null=True)),
                ('relacionado_tipo', models.CharField(max_length=50, null=True)),
                ('estado', models.BooleanField(default=True)),
                ('usuario', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='app.usuario')),
            ],
        ),
    ]

