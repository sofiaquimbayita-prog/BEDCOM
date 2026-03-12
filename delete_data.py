#!/usr/bin/env python3
"""
Script to delete all data from entrada and productos tables
Usage: cd project2 && python ../delete_data.py
"""

import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from app.models import producto, entrada

print("Deleting all producto records first (handles FK dependencies)...")
productos_deleted, _ = producto.objects.all().delete()
print(f"Deleted {productos_deleted.get('app.producto', 0)} producto records")

print("Deleting all entrada records...")
entradas_deleted, _ = entrada.objects.all().delete()
print(f"Deleted {entradas_deleted.get('app.entrada', 0)} entrada records")

print("Data deletion complete. Tables productos and entrada are now empty.")
