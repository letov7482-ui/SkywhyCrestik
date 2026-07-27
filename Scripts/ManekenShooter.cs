    private void SpawnNewManeken()
    {
        // БЕЗОПАСНЫЙ ФИКС: Создаем цилиндр-мишень прямо кодом
        var newManeken = new CsgCylinder3D();
        newManeken.Radius = 0.4f;
        newManeken.Height = 1.8f;
        
        float randomX = (float)GD.RandRange(-10, 10);
        float randomZ = (float)GD.RandRange(-5, -20);
        
        newManeken.Position = new Vector3(randomX, 0.9f, randomZ);
        newManeken.AddToGroup("manekens");
        
        // Создаем статическое тело для обработки попаданий луча (Raycast)
        var staticBody = new StaticBody3D();
        var collisionShape = new CollisionShape3D();
        var capsuleShape = new CapsuleShape3D();
        capsuleShape.Radius = 0.4f;
        capsuleShape.Height = 1.8f;
        collisionShape.Shape = capsuleShape;
        
        staticBody.AddChild(collisionShape);
        newManeken.AddChild(staticBody);
        staticBody.AddToGroup("manekens"); // Чтобы код луча понимал, что это цель

        AddChild(newManeken);
    }
