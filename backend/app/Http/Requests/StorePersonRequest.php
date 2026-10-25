<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePersonRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'first_name'        => ['required', 'string', 'max:100'],
            'last_name'         => ['required', 'string', 'max:100'],
            'phone'             => ['nullable', 'string', 'max:30'],
            'email'             => ['nullable', 'email', 'max:255', 'unique:people,email'],
            'is_active'         => ['boolean'],
            'notes'             => ['nullable', 'string'],
            'musical_role_ids'  => ['nullable', 'array'],
            'musical_role_ids.*'=> ['integer', 'exists:musical_roles,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'first_name.required'       => 'El nombre es obligatorio.',
            'last_name.required'        => 'El apellido es obligatorio.',
            'email.unique'              => 'Este correo ya está registrado.',
            'musical_role_ids.*.exists' => 'Una de las funciones seleccionadas no existe.',
        ];
    }
}
