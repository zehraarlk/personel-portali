from django.contrib import admin
from .models import Employee, Department


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name']


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'email', 'department', 'status', 'hire_date']
    list_filter = ['status', 'department']
    search_fields = ['first_name', 'last_name', 'email']
