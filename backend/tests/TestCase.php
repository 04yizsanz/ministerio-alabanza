<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Prepara cada test para usar sesiones (necesario para Sanctum SPA).
     * Sin esto, `$request->session()` lanza un error en tests.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Habilitar manejo de sesiones en los tests de HTTP
        $this->withSession([]);
    }
}
