<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;

// Redirect root to dashboard or login
Route::get('/', function () {
    return redirect('/dashboard');
});

// Auth routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Admin routes (protected)
Route::middleware('auth.admin')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'index'])->name('dashboard');
    Route::get('/businesses', [AdminController::class, 'businesses'])->name('businesses');
    Route::post('/businesses/{id}/verify', [AdminController::class, 'verify'])->name('businesses.verify');
    Route::post('/businesses/{id}/unverify', [AdminController::class, 'unverify'])->name('businesses.unverify');
    Route::get('/users', [AdminController::class, 'users'])->name('users');
    Route::get('/reviews', [AdminController::class, 'reviews'])->name('reviews');
    Route::delete('/reviews/{id}', [AdminController::class, 'deleteReview'])->name('reviews.delete');
});