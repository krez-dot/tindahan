@extends('admin.layout')

@section('content')
<div class="page-header">
    <h1 class="page-title">⭐ Reviews</h1>
    <p class="page-sub">Moderate reviews across all businesses</p>
</div>

<div style="background: white; border-radius: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1px solid #f0e8df; overflow: hidden;">
    <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr style="background: #2d2413; color: white;">
                <th style="padding: 14px 20px; text-align: left; font-size: 13px;">Reviewer</th>
                <th style="padding: 14px 20px; text-align: left; font-size: 13px;">Business</th>
                <th style="padding: 14px 20px; text-align: left; font-size: 13px;">Rating</th>
                <th style="padding: 14px 20px; text-align: left; font-size: 13px;">Review</th>
                <th style="padding: 14px 20px; text-align: left; font-size: 13px;">Action</th>
            </tr>
        </thead>
        <tbody>
            @foreach($reviews as $r)
            <tr style="border-bottom: 1px solid #f0e8df;">
                <td style="padding: 14px 20px; font-weight: 600; font-size: 14px; color: #2d2413;">{{ $r->reviewer_name }}</td>
                <td style="padding: 14px 20px; font-size: 14px; color: #555;">{{ $r->business_name }}</td>
                <td style="padding: 14px 20px; font-size: 14px;">{{ str_repeat('⭐', $r->rating) }}</td>
                <td style="padding: 14px 20px; font-size: 13px; color: #888; max-width: 200px;">{{ $r->body }}</td>
                <td style="padding: 14px 20px;">
                    <form method="POST" action="/reviews/{{ $r->id }}" onsubmit="return confirm('Delete this review?')">
                        @csrf
                        @method('DELETE')
                        <button type="submit" style="background: #fff0f0; color: #cc0000; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-family: 'Poppins', sans-serif; font-weight: 600;">Delete</button>
                    </form>
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endsection