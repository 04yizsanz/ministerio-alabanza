<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePersonRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $personId = $this->route('person')?->id;

        return [
            'first_name'        => ['sometimes', 'required', 'string', 'max:100'],
            'last_name'         => ['sometimes', 'required', 'string', 'max:100'],
            'phone'             => ['nullable', 'string', 'max:30'],
            'email'             => ['nullable', 'email', 'max:255', "unique:people,email,{$personId}"],
            'is_active'         => ['boolean'],
            'notes'             => ['nullable', 'string'],
            'musical_role_ids'  => ['nullable', 'array'],
            'musical_role_ids.*'=> ['integer', 'exists:musical_roles,id'],
        ];
    }
}
