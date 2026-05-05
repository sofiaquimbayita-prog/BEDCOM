# TODO: Agregar campo Descripcion a Modulos de Proveedores

Estado: ✅ Plan aprobado por usuario

## Pasos del Plan (Implementar secuencialmente):

### 1. **Backend - Model** ✅
   - [✅] Editar project2/app/models.py: Agregar `descripcion` field a class proveedor

### 2. **Backend - Form** ✅
   - [✅] Editar project2/app/forms.py: Agregar descripcion a ProveedorForm + validación clean_descripcion()


### 3. **Backend - Views** ✅
   - [✅] Editar project2/app/views/proveedores/views.py: Incluir 'descripcion' en JsonResponse de create/update/data


### 4. **Templates - Modals** ✅
   - [✅] Editar modal_agregar.html: Agregar textarea inputDescripcion
   - [✅] Editar modal_editar.html: Agregar textarea editDescripcion
   - [✅] Editar modal_ver.html: Agregar display viewDescripcion



### 5. **Frontend - JavaScript** ✅
   - [✅] Editar proveedores.js: 
     - validarDescripcionProveedor()
     - Handlers en validarProveedor() & validarProveedorEditar()
     - Input event listeners
     - Poblar en editarProveedor() & verProveedor()
     - Append to formData in submits


### 6. **Database Migration** ✅
   - [✅] `cd project2 && python manage.py makemigrations app --name add_descripcion_proveedor`
   - [✅] `python manage.py migrate`


### 7. **Testing** ✅
   - [ ] Abrir /vistas/proveedores/
   - [ ] Test agregar: input + validation + submit
   - [ ] Test editar: load + edit + submit
   - [ ] Test ver: display descripcion
   - [ ] Test caracteres especiales rechazados, límite 255

### 8. **Finalizar** ✅
   - [ ] attempt_completion con demo command si aplica

**Próximo paso actual: 1. Editar models.py**

