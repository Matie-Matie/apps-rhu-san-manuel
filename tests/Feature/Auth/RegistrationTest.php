<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    // V2: public self-registration is closed (clinic request). Accounts are
    // created by seeding / tinker on localhost.

    public function test_registration_screen_is_gone(): void
    {
        $this->get('/register')->assertNotFound();
    }

    public function test_new_users_cannot_register(): void
    {
        $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'doctor',
        ])->assertNotFound();

        $this->assertGuest();
        $this->assertSame(0, User::count());
    }
}
