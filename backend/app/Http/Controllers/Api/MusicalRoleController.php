<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MusicalRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MusicalRoleController extends Controller
{
    /**
     * GET /api/musical-roles
     * Devuelve todas las funciones activas, ordenadas para la UI.
     */
    public function index(): JsonResponse
    {
        $roles = MusicalRole::active()
            ->orderBy('sort_order')
            ->get();

        return response()->json($roles);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'       => ['required', 'string', 'max:100', 'unique:musical_roles,name'],
            'category'   => ['required', 'in:music,tech,service'],
            'sort_order' => ['integer', 'min:0'],
        ]);

        $role = MusicalRole::create($data);

        return response()->json($role, 201);
    }

    public function update(Request $request, MusicalRole $musicalRole): JsonResponse
    {
        $data = $request->validate([
            'name'       => ['sometimes', 'required', 'string', 'max:100', "unique:musical_roles,name,{$musicalRole->id}"],
            'category'   => ['sometimes', 'required', 'in:music,tech,service'],
            'sort_order' => ['integer', 'min:0'],
            'is_active'  => ['boolean'],
        ]);

        $musicalRole->update($data);

        return response()->json($musicalRole);
    }

    public function destroy(MusicalRole $musicalRole): JsonResponse
    {
        $musicalRole->update(['is_active' => false]);
        return response()->json(['message' => 'Función desactivada.']);
    }
}
