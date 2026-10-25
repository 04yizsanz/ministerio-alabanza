<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCipherFileRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'file'          => [
                'required',
                'file',
                'max:10240',                                          // máximo 10 MB
                'mimes:pdf,jpg,jpeg,png,webp,doc,docx',              // tipos permitidos
            ],
            'key_signature' => ['nullable', 'string', 'max:10'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Debes seleccionar un archivo.',
            'file.max'      => 'El archivo no puede superar 10 MB.',
            'file.mimes'    => 'Solo se permiten archivos PDF, Word (doc/docx), JPG, PNG o WEBP.',
        ];
    }
}
