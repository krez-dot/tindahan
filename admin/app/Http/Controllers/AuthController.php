<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function showLogin()
    {
        if (session('admin')) {
            return redirect('/dashboard');
        }
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = DB::table('users')
            ->where('email', $request->email)
            ->where('role', 'admin')
            ->first();

        if (!$user || !Hash::check($request->password, $user->password_hash)) {
            return back()->withErrors(['email' => 'Invalid credentials or not an admin.']);
        }

        session(['admin' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email]]);

        return redirect('/dashboard');
    }

    public function logout()
    {
        session()->forget('admin');
        return redirect('/login');
    }
}