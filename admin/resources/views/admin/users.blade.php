@extends('admin.layout')

@section('content')
<div class="page-header">
    <h1 class="page-title">👥 Users</h1>
    <p class="page-sub">All registered users on Tindahan</p>
</div>

<div style="background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1px solid #f0e8df; overflow: hidden;">
    <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="background: #2d2413; color: white;">
                <th style="padding: 14px 20px; text-align: left; font-size: 13px;">Name</th>
                <th style="padding: 14px 20px; text-align: left; font-size: 13px;">Email</th>
                <th style="padding: 14px 20px; text-align: left; font-size: 13px;">Role</th>
                <th style="padding: 14px 20px; text-align: left; font-size: 13px;">Joined</th>
            </tr>
        </thead>
        <tbody>
            @foreach($users as $u)
            <tr style="border-bottom: 1px solid #f0e8df;">
                <td style="padding: 14px 20px; font-weight: 600; font-size: 14px; color: #2d2413;">{{ $u->name }}</td>
                <td style="padding: 14px 20px; font-size: 14px; color: #555;">{{ $u->email }}</td>
                <td style="padding: 14px 20px;">
                    <span style="background: {{ $u->role === 'owner' ? '#fff3ec' : ($u->role === 'admin' ? '#eaf3de' : '#f0e8df') }}; color: {{ $u->role === 'owner' ? '#e8601c' : ($u->role === 'admin' ? '#3b6d11' : '#2d2413') }}; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                        {{ ucfirst($u->role) }}
                    </span>
                </td>
                <td style="padding: 14px 20px; font-size: 13px; color: #888;">{{ \Carbon\Carbon::parse($u->created_at)->format('M d, Y') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endsection