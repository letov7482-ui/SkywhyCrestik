    private void MakeMove(int cellId, int playerType)
    {
        board[cellId] = playerType;
        
        float xPos = (cellId % 3) * 2.0f - 2.0f;
        float zPos = (cellId / 3) * 2.0f - 2.0f;
        Vector3 spawnPos = new Vector3(xPos, 0.5f, zPos);

        // БЕЗОПАСНЫЙ ФИКС: Если реальных моделей нет, игра создаст куб или сферу, чтобы не вылетать!
        Node3D instance;
        if (playerType == 1)
        {
            var box = new CsgBox3D();
            box.Size = new Vector3(0.8f, 0.8f, 0.8f);
            var mat = new StandardMaterial3D();
            mat.AlbedoColor = new Color(0, 1, 0); // Зеленый куб вместо крестика
            box.MaterialOverride = mat;
            instance = box;
        }
        else
        {
            var sphere = new CsgSphere3D();
            sphere.Radius = 0.5f;
            var mat = new StandardMaterial3D();
            mat.AlbedoColor = new Color(1, 0, 0); // Красная сфера вместо нолика
            box.MaterialOverride = mat;
            instance = sphere;
        }

        instance.Position = spawnPos;
        AddChild(instance);
    }
