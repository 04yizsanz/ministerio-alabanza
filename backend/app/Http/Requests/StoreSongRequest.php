<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSongRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // solo usuarios autenticados (protegido por middleware)
    }

    public function rules(): array
    {
        return [
            'title'        => ['required', 'string', 'max:255'],
            'artist'       => ['nullable', 'string', 'max:255'],
            'original_key' => ['nullable', 'string', 'max:10'],
            'bpm'          => ['nullable', 'integer', 'min:40', 'max:300'],
            'audio_url'    => ['nullable', 'url', 'max:500'],
            'notes'        => ['nullable', 'string'],
            'is_active'    => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'El título de la canción es obligatorio.',
            'bpm.min'        => 'El BPM debe ser al menos 40.',
            'bpm.max'        => 'El BPM no puede superar 300.',
            'audio_url.url'  => 'El enlace de audio no es una URL válida.',
        ];
    }
}
