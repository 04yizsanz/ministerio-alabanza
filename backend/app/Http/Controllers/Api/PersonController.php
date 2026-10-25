<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePersonRequest;
use App\Http\Requests\UpdatePersonRequest;
use App\Models\Person;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PersonController extends Controller
{
    /**
     * GET /api/people
     */
    public function index(Request $request): JsonResponse
    {
        $query = Person::with('musicalRoles');

        if ($search = $request->get('search')) {
            $query->search($search);
        }

        if ($request->has('active')) {
            $query->where('is_active', filter_var($request->get('active'), FILTER_VALIDATE_BOOLEAN));
        }

        // Filtrar por función musical
        if ($roleId = $request->get('role_id')) {
            $query->whereHas('musicalRoles', fn($q) => $q->where('musical_roles.id', $roleId));
        }

        $people = $query->orderBy('first_name')->orderBy('last_name')
                        ->paginate($request->get('per_page', 30));

        return response()->json($people);
    }

    /**
     * POST /api/people
     * Usamos una transacción porque creamos la persona Y sincronizamos
     * sus funciones musicales. Si una falla, se revierte todo.
     */
    public function store(StorePersonRequest $request): JsonResponse
    {
        $person = DB::transaction(function () use ($request) {
            $person = Person::create($request->safe()->except('musical_role_ids'));

            if ($request->filled('musical_role_ids')) {
                $person->musicalRoles()->sync($request->input('musical_role_ids'));
            }

            return $person;
        });

        $person->load('musicalRoles');

        return response()->json($person, 201);
    }

    /**
     * GET /api/people/{person}
     */
    public function show(Person $person): JsonResponse
    {
        $person->load('musicalRoles');
        return response()->json($person);
    }

    /**
     * PUT /api/people/{person}
     */
    public function update(UpdatePersonRequest $request, Person $person): JsonResponse
    {
        DB::transaction(function () use ($request, $person) {
            $person->update($request->safe()->except('musical_role_ids'));

            if ($request->has('musical_role_ids')) {
                $person->musicalRoles()->sync($request->input('musical_role_ids', []));
            }
        });

        $person->load('musicalRoles');

        return response()->json($person);
    }

    /**
     * DELETE /api/people/{person}
     * Solo desactiva — preserva el historial de programaciones.
     */
    public function destroy(Person $person): JsonResponse
    {
        $person->update(['is_active' => false]);

        return response()->json(['message' => 'Integrante desactivado correctamente.']);
    }

    /**
     * GET /api/people/all
     * Lista completa sin paginar, para selectores en formularios.
     */
    public function all(Request $request): JsonResponse
    {
        $people = Person::active()
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name']);

        return response()->json($people);
    }
}
