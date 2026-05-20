<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tindahan Admin — Login</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Poppins', sans-serif; }
        body { min-height: 100vh; display: flex; background: #fdf8f3; }
        .left { flex: 1; background: linear-gradient(135deg, #3d2c1e 0%, #7a4a2a 60%, #e8601c 100%); display: flex; flex-direction: column; justify-content: center; padding: 60px 48px; color: white; }
        .left h1 { font-size: 36px; font-weight: 800; margin-bottom: 12px; }
        .left p { font-size: 16px; opacity: 0.85; margin-bottom: 40px; }
        .feature { background: rgba(255,255,255,0.12); padding: 14px 20px; border-radius: 12px; margin-bottom: 12px; font-size: 14px; font-weight: 500; }
        .right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; }
        .card { background: white; padding: 48px 40px; border-radius: 24px; box-shadow: 0 8px 40px rgba(0,0,0,0.08); width: 100%; max-width: 420px; }
        .card h2 { font-size: 26px; font-weight: 800; color: #2d2413; margin-bottom: 6px; }
        .card p { font-size: 14px; color: #888; margin-bottom: 28px; }
        label { display: block; font-size: 13px; font-weight: 600; color: #555; margin-bottom: 6px; margin-top: 16px; }
        input { display: block; width: 100%; padding: 13px 16px; border-radius: 12px; border: 1.5px solid #e8e0d8; font-size: 15px; outline: none; font-family: 'Poppins', sans-serif; color: #2d2413; background: #fdfaf7; }
        .btn { width: 100%; padding: 14px; background: #e8601c; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; margin-top: 24px; font-family: 'Poppins', sans-serif; }
        .error { background: #fff0f0; color: #cc0000; padding: 12px 16px; border-radius: 10px; font-size: 14px; margin-bottom: 16px; }
    </style>
</head>
<body>
    <div class="left">
        <h1>🛖 Tindahan Admin</h1>
        <p>Manage and moderate the Tindahan platform</p>
        <div class="feature">✅ Verify local businesses</div>
        <div class="feature">👥 Manage users</div>
        <div class="feature">⭐ Moderate reviews</div>
        <div class="feature">📊 View platform analytics</div>
    </div>
    <div class="right">
        <div class="card">
            <h2>Welcome back! 👋</h2>
            <p>Sign in to your admin account</p>

            @if($errors->any())
                <div class="error">{{ $errors->first() }}</div>
            @endif

            <form method="POST" action="/login">
                @csrf
                <label>Email</label>
                <input type="email" name="email" placeholder="admin@tindahan.com" required value="{{ old('email') }}">
                <label>Password</label>
                <input type="password" name="password" placeholder="••••••••" required>
                <button type="submit" class="btn">Login →</button>
            </form>
        </div>
    </div>
</body>
</html>