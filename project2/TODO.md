# TODO: Remove perfil_usuario table from usuarios app

## Approved Plan Steps:
- [x] Step 1: Edit project2/usuarios/models.py - Remove PerfilUsuario model class
- [x] Step 2: Edit project2/usuarios/views.py - Remove unused import
- [x] Step 3: Edit project2/login/forms.py - Remove unused import  
- [x] Step 4: Edit project2/login/views.py - Remove PerfilUsuario.objects.get_or_create() block
- [ ] Step 5: cd project2 &amp;&amp; python manage.py migrate usuarios 0001_initial --fake   (then delete migration file)
- [ ] Step 6: Run makemigrations usuarios
- [ ] Step 7: Run migrate
- [ ] Step 8: Test user registration
- [ ] Step 9: Verify DB table dropped
- [ ] Step 10: Mark complete

