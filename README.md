Project Overview
This is a full-stack authentication and role-based dashboard application. The backend is powered by Django + Django REST Framework + JWT, and the frontend is built with React. Users can register and log in, and are redirected to different dashboards based on their role (Admin or User).

Project Structure
-------------------------------------------
📁 my_task/          # Django + DRF backend
📁 frontend_mytask/         # React frontend
________________________________________
 Backend Setup
 Requirements
•	Python 3.8+
•	pip
•	Django
•	Django REST framework
•	djangorestframework-simplejwt
•	corsheaders
Install Dependencies
pip install django djangorestframework djangorestframework-simplejwt corsheaders
 Key Configuration
My_task/settings.py
Register apps:
INSTALLED_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'my_task',
]
•	Middleware:
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]
•	CORS config:
CORS_ALLOW_ALL_ORIGINS = True  # For dev only
•	JWT Authentication:
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    )
}
________________________________________
🧩 App: my_task/
models.py
-------------------
from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    ROLE_CHOICES = (('admin', 'Admin'), ('user', 'User'))
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.user.username} - {self.role}"
serializers.py
--------------------
class RegisterSerializer(serializers.ModelSerializer):
    role = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        role = validated_data.pop('role')
        user = User.objects.create_user(**validated_data)
        Profile.objects.create(user=user, role=role)
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email']
views.py
--------------
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'User registered successfully'})
        return Response(serializer.errors, status=400)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = Profile.objects.get(user=request.user)
        return Response({
            'username': request.user.username,
            'email': request.user.email,
            'role': profile.role
        })
urls.py (inside testapp/)
----------------------------------
from django.urls import path
from .views import RegisterView, ProfileView
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
]
My_task/urls.py
-----------------------------
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
]
________________________________________
Optional: Signals
Automatically create a Profile when a User is created:
signals.py
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
Import this in apps.py.
________________________________________
Frontend Setup
•	React
•	axios
•	react-router-dom
 Install Dependencies
npm install axios react-router-dom
________________________________________
Routing: App.js
----------------------------
<Router>
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/admin-dashboard" element={role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
    <Route path="/user-dashboard" element={role === 'user' ? <UserDashboard /> : <Navigate to="/login" />} />
    <Route path="*" element={<Navigate to="/login" />} />
  </Routes>
</Router>
________________________________________
 Login: LoginPage.js
----------------------------------------
const handleLogin = async (e) => {
  e.preventDefault();
  const username = e.target.username.value;
  const password = e.target.password.value;

  const res = await axios.post('http://localhost:8000/api/login/', { username, password });
  localStorage.setItem('access', res.data.access);

  const profileRes = await axios.get('http://localhost:8000/api/profile/', {
    headers: { Authorization: `Bearer ${res.data.access}` }
  });

  localStorage.setItem('role', profileRes.data.role);
  navigate(profileRes.data.role === 'admin' ? '/admin-dashboard' : '/user-dashboard');
};
________________________________________
 Register: RegisterPage.js
--------------------------------------------
<form onSubmit={handleSubmit}>
  <h2>Register</h2>
  <input name="username" onChange={handleChange} placeholder="Username" />
  <input name="email" onChange={handleChange} placeholder="Email" />
  <input name="password" type="password" onChange={handleChange} placeholder="Password" />
  <select name="role" onChange={handleChange}>
    <option value="user">User</option>
    <option value="admin">Admin</option>
  </select>
  <button type="submit">Register</button>
</form>
________________________________________
AdminDashboard.js & UserDashboard.js
Simple welcome components. Customize for real features.
________________________________________
 How to Run
my_task:
cd my_task
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
Frontend:
cd frontend_mytask
npm start
________________________________________
 Features
•	 JWT Authentication
•	 Role-based access control
•	 Register / Login / Profile
•	React Routing
•	 Protected dashboards

