from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Employee, Department
from .serializers import EmployeeSerializer, DepartmentSerializer


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related('department').all()
    serializer_class = EmployeeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'status']
    search_fields = ['first_name', 'last_name', 'email']
    ordering_fields = ['hire_date', 'last_name']
