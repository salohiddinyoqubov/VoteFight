# VoteFight Backend

Social voting platform backend built with Django REST Framework following Django Styleguide architecture.

## 🏗️ Architecture

This project follows the Django Styleguide architecture with:

- **Service Layer**: Business logic in services, not views or models
- **Selectors**: Data fetching logic separated from business logic  
- **Base Models**: Common fields and methods in base model
- **Factory Pattern**: Test data generation with factory_boy

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Poetry
- PostgreSQL (for production)
- Redis (for caching and Celery)

### Installation

1. **Install dependencies:**
   ```bash
   poetry install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run migrations:**
   ```bash
   poetry run python manage.py migrate
   ```

4. **Create superuser:**
   ```bash
   poetry run python manage.py createsuperuser
   ```

5. **Run development server:**
   ```bash
   poetry run python manage.py runserver
   ```

## 📁 Project Structure

```
backend/
├── vote_fight/           # Django project
│   ├── settings/         # Environment-specific settings
│   ├── urls.py
│   └── wsgi.py
├── users/                # User management
│   ├── models/
│   ├── services/
│   ├── selectors/
│   ├── serializers/
│   └── views/
├── battles/              # Battle system
│   ├── models/
│   ├── services/
│   ├── selectors/
│   ├── serializers/
│   └── views/
├── media/                # File handling
│   ├── models/
│   ├── services/
│   └── views/
├── tasks/                # Celery tasks
├── utils/                # Shared utilities
└── tests/                # Test files
```

## 🔧 Configuration

### Environment Variables

```bash
# Django
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
DJANGO_ENVIRONMENT=development

# Database
DJANGO_DATABASE_NAME=votefight
DJANGO_DATABASE_USER=postgres
DJANGO_DATABASE_PASSWORD=password
DJANGO_DATABASE_HOST=localhost
DJANGO_DATABASE_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# AWS S3 (Production)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket
AWS_S3_REGION_NAME=us-east-1
```

## 🧪 Testing

```bash
# Run tests
poetry run python manage.py test

# Run with coverage
poetry run pytest --cov=.

# Run specific test
poetry run python manage.py test battles.tests.test_services
```

## 📊 API Documentation

Once the server is running, visit:
- API Documentation: http://localhost:8000/api/schema/swagger-ui/
- ReDoc: http://localhost:8000/api/schema/redoc/

## 🔄 Background Tasks

The project uses Celery for background tasks:

```bash
# Start Celery worker
poetry run celery -A vote_fight worker -l info

# Start Celery beat (scheduler)
poetry run celery -A vote_fight beat -l info
```

## 🚀 Deployment

### Production Settings

Set environment variable:
```bash
DJANGO_ENVIRONMENT=production
```

### Docker Deployment

```bash
# Build image
docker build -t votefight-backend .

# Run container
docker run -p 8000:8000 votefight-backend
```

## 📝 Development Guidelines

### Code Style

- Follow PEP 8
- Use Black for formatting: `poetry run black .`
- Use isort for imports: `poetry run isort .`
- Use flake8 for linting: `poetry run flake8 .`

### Service Layer Pattern

```python
# ✅ Good - Business logic in services
def battle_create(*, user: User, title: str) -> Battle:
    # Implementation
    pass

# ❌ Bad - Business logic in views
class BattleCreateView(APIView):
    def post(self, request):
        # Business logic here
        pass
```

### Selector Pattern

```python
# ✅ Good - Data fetching in selectors
def battle_list(*, user: User = None) -> QuerySet:
    return Battle.objects.filter(is_active=True)

# ❌ Bad - Complex queries in views
class BattleListView(APIView):
    def get(self, request):
        battles = Battle.objects.filter(is_active=True)  # Complex logic
```

## 🔒 Security Features

- **Vote Fraud Prevention**: IP tracking, fingerprinting, rate limiting
- **File Security**: Encrypted storage, time-limited access URLs
- **Authentication**: JWT tokens, session management
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Comprehensive data validation

## 📈 Performance Features

- **Redis Caching**: Battle data, trending scores
- **Database Optimization**: select_related, prefetch_related
- **Background Tasks**: Celery for heavy operations
- **CDN Integration**: Static file delivery
- **Query Optimization**: Efficient database queries

## 🌍 Multilingual Support

- **Languages**: Uzbek (main), Russian, English
- **SEO URLs**: Language-specific URL patterns
- **i18n**: Django internationalization
- **Localization**: Timezone and locale support

## 📞 Support

For questions or issues:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

Built with ❤️ for the VoteFight community
