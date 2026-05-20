<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tindahan Admin</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Poppins', sans-serif; }
        body { display: flex; min-height: 100vh; background: #fdf8f3; }
        .sidebar { width: 240px; background: #2d2413; color: white; padding: 24px 0; position: fixed; height: 100vh; display: flex; flex-direction: column; }
        .sidebar-brand { padding: 0 24px 24px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .sidebar-brand h1 { font-size: 20px; font-weight: 800; color: white; }
        .sidebar-brand p { font-size: 12px; opacity: 0.6; margin-top: 2px; }
        .sidebar-nav { padding: 16px 0; flex: 1; }
        .nav-link { display: block; padding: 12px 24px; color: rgba(255,255,255,0.7); text-decoration: none; font-size: 14px; font-weight: 500; transition: all 0.2s; }
        .nav-link:hover, .nav-link.active { background: rgba(255,255,255,0.1); color: white; }
        .sidebar-footer { padding: 16px 24px; border-top: 1px solid rgba(255,255,255,0.1); }
        .admin-name { font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 8px; }
        .logout-btn { background: rgba(255,255,255,0.1); border: none; color: white; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-family: 'Poppins', sans-serif; width: 100%; }
        .main { margin-left: 240px; flex: 1; padding: 32px; }
        .page-header { margin-bottom: 28px; }
        .page-title { font-size: 24px; font-weight: 800; color: #2d2413; }
        .page-sub { font-size: 14px; color: #888; margin-top: 4px; }
        .alert-success { background: #eaf3de; color: #3b6d11; padding: 12px 16px; border-radius: 10px; margin-bottom: 20px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="sidebar">
        <div class="sidebar-brand">
            <h1>🛖 Tindahan</h1>
            <p>Admin Panel</p>
        </div>
        <nav class="sidebar-nav">
            <a href="/dashboard" class="nav-link {{ request()->is('dashboard') ? 'active' : '' }}">📊 Dashboard</a>
            <a href="/businesses" class="nav-link {{ request()->is('businesses') ? 'active' : '' }}">🏪 Businesses</a>
            <a href="/users" class="nav-link {{ request()->is('users') ? 'active' : '' }}">👥 Users</a>
            <a href="/reviews" class="nav-link {{ request()->is('reviews') ? 'active' : '' }}">⭐ Reviews</a>
        </nav>
        <div class="sidebar-footer">
            <p class="admin-name">👤 {{ session('admin')['name'] }}</p>
            <form method="POST" action="/logout">
                @csrf
                <button type="submit" class="logout-btn">Logout</button>
            </form>
        </div>
    </div>
    <div class="main">
        @if(session('success'))
            <div class="alert-success">✅ {{ session('success') }}</div>
        @endif
        @yield('content')
    </div>
</body>
</html>