<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function index()
    {
        $totalBusinesses = DB::table('businesses')->count();
        $totalUsers = DB::table('users')->count();
        $totalReviews = DB::table('reviews')->count();
        $pendingVerification = DB::table('businesses')->where('is_verified', false)->count();

        return view('admin.dashboard', compact(
            'totalBusinesses', 'totalUsers', 'totalReviews', 'pendingVerification'
        ));
    }

    public function businesses()
    {
        $businesses = DB::table('businesses')
            ->join('users', 'businesses.owner_id', '=', 'users.id')
            ->select('businesses.*', 'users.name as owner_name')
            ->orderBy('businesses.created_at', 'desc')
            ->get();

        return view('admin.businesses', compact('businesses'));
    }

    public function verify($id)
    {
        DB::table('businesses')->where('id', $id)->update(['is_verified' => true]);
        return back()->with('success', 'Business verified successfully!');
    }

    public function unverify($id)
    {
        DB::table('businesses')->where('id', $id)->update(['is_verified' => false]);
        return back()->with('success', 'Business unverified.');
    }

    public function users()
    {
        $users = DB::table('users')->orderBy('created_at', 'desc')->get();
        return view('admin.users', compact('users'));
    }

    public function reviews()
    {
        $reviews = DB::table('reviews')
            ->join('users', 'reviews.user_id', '=', 'users.id')
            ->join('businesses', 'reviews.business_id', '=', 'businesses.id')
            ->select('reviews.*', 'users.name as reviewer_name', 'businesses.name as business_name')
            ->orderBy('reviews.created_at', 'desc')
            ->get();

        return view('admin.reviews', compact('reviews'));
    }

    public function deleteReview($id)
    {
        DB::table('reviews')->where('id', $id)->delete();
        return back()->with('success', 'Review deleted.');
    }
}