@extends('admin.layout')

@section('content')
<div class="page-header">
    <h1 class="page-title">📊 Dashboard</h1>
    <p class="page-sub">Welcome back, {{ session('admin')['name'] }}!</p>
</div>

<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px;">
    <div style="background: white; padding: 24px; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1px solid #f0e8df;">
        <p style="font-size: 13px; color: #aaa; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total Businesses</p>
        <p style="font-size: 36px; font-weight: 800; color: #e8601c; margin-top: 8px;">{{ $totalBusinesses }}</p>
    </div>
    <div style="background: white; padding: 24px; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1px solid #f0e8df;">
        <p style="font-size: 13px; color: #aaa; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total Users</p>
        <p style="font-size: 36px; font-weight: 800; color: #e8601c; margin-top: 8px;">{{ $totalUsers }}</p>
    </div>
    <div style="background: white; padding: 24px; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1px solid #f0e8df;">
        <p style="font-size: 13px; color: #aaa; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total Reviews</p>
        <p style="font-size: 36px; font-weight: 800; color: #e8601c; margin-top: 8px;">{{ $totalReviews }}</p>
    </div>
    <div style="background: white; padding: 24px; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1px solid #f0e8df;">
        <p style="font-size: 13px; color: #aaa; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Pending Verification</p>
        <p style="font-size: 36px; font-weight: 800; color: #e8601c; margin-top: 8px;">{{ $pendingVerification }}</p>
    </div>
</div>

<div style="background: white; padding: 24px; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1px solid #f0e8df;">
    <h2 style="font-size: 18px; font-weight: 700; color: #2d2413; margin-bottom: 16px;">Quick actions</h2>
    <div style="display: flex; gap: 12px;">
        <a href="/businesses" style="background: #e8601c; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">🏪 Manage Businesses</a>
        <a href="/users" style="background: #2d2413; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">👥 Manage Users</a>
        <a href="/reviews" style="background: #f0e8df; color: #2d2413; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px;">⭐ Moderate Reviews</a>
    </div>
</div>
@endsection