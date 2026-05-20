@extends('admin.layout')

@section('content')
<div class="page-header">
    <h1 class="page-title">🏪 Businesses</h1>
    <p class="page-sub">Verify and manage business listings</p>
</div>

<div style="background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1px solid #f0e8df; overflow: hidden;">
    <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="background: #2d2413; color: white;">
                <th style="padding: 14px 20px; text-align: left; font-size: 13px;">Business</th>
                <th style="padding: 14px 20px; text-align: left; font-size: 13px;">Owner</th>
                <th style="padding: 14px 20px; text-align: left; font-size: 13px;">Address</th>
                <th style="padding: 14px 20px; text-align: left; font-size: 13px;">Status</th>
                <th style="padding: 14px 20px; text-align: left; font-size: 13px;">Action</th>
            </tr>
        </thead>
        <tbody>
            @foreach($businesses as $b)
            <tr style="border-bottom: 1px solid #f0e8df;">
                <td style="padding: 14px 20px;">
                    <p style="font-weight: 600; font-size: 14px; color: #2d2413;">{{ $b->name }}</p>
                    <p style="font-size: 12px; color: #aaa;">{{ $b->phone }}</p>
                </td>
                <td style="padding: 14px 20px; font-size: 14px; color: #555;">{{ $b->owner_name }}</td>
                <td style="padding: 14px 20px; font-size: 13px; color: #888;">{{ $b->address }}</td>
                <td style="padding: 14px 20px;">
                    @if($b->is_verified)
                        <span style="background: #eaf3de; color: #3b6d11; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">✅ Verified</span>
                    @else
                        <span style="background: #fff0f0; color: #cc0000; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">⏳ Pending</span>
                    @endif
                </td>
                <td style="padding: 14px 20px;">
                    @if($b->is_verified)
                        <form method="POST" action="/businesses/{{ $b->id }}/unverify" style="display: inline;">
                            @csrf
                            <button type="submit" style="background: #fff0f0; color: #cc0000; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-family: 'Poppins', sans-serif; font-weight: 600;">Remove</button>
                        </form>
                    @else
                        <form method="POST" action="/businesses/{{ $b->id }}/verify" style="display: inline;">
                            @csrf
                            <button type="submit" style="background: #eaf3de; color: #3b6d11; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-family: 'Poppins', sans-serif; font-weight: 600;">✅ Verify</button>
                        </form>
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endsection