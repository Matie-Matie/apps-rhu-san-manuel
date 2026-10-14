<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * V2: public self-registration is closed (clinic request). Accounts are
     * created by seeding / tinker on localhost. Both entry points abort even
     * if the routes are ever re-added by accident.
     */
    public function create(): Response
    {
        abort(404);
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request): RedirectResponse
    {
        abort(404);
    }
}
