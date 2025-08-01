from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a superuser for testing admin access'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, help='Email address for the superuser')
        parser.add_argument('--clerk-id', type=str, help='Clerk ID for the superuser')

    def handle(self, *args, **options):
        email = options.get('email') or 'admin@test.com'
        clerk_id = options.get('clerk_id') or 'test_clerk_id'
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f'User with email {email} already exists')
            )
            return
        
        # Create superuser
        user = User.objects.create_superuser(
            email=email,
            clerk_id=clerk_id,
            password='admin123',  # Temporary password
            first_name='Admin',
            last_name='User'
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created superuser: {email}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Clerk ID: {clerk_id}')
        )
        self.stdout.write(
            self.style.SUCCESS('Password: admin123 (temporary)')
        )
        self.stdout.write(
            self.style.WARNING('Note: This user will need to set up WebAuthn to access admin')
        )
