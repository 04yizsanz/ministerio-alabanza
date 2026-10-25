<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSongRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'        => ['sometimes', 'required', 'string', 'max:255'],
            'artist'       => ['nullable', 'string', 'max:255'],
            'original_key' => ['nullable', 'string', 'max:10'],
            'bpm'          => ['nullable', 'integer', 'min:40', 'max:300'],
            'audio_url'    => ['nullable', 'url', 'max:500'],
            'notes'        => ['nullable', 'string'],
            'is_active'    => ['boolean'],
        ];
    }
}
