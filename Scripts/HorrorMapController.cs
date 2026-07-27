using Godot;
using System;

public partial class HorrorMapController : Node3D
{
    private SpotLight3D playerFlashlight;
    private Camera3D playerCamera;
    private float targetFlashlightEnergy = 1.5f;

    public override void _Ready()
    {
        playerCamera = GetNode<Camera3D>("Player/Camera3D");
        
        // Создаем и настраиваем фонарик игрока
        playerFlashlight = new SpotLight3D();
        playerFlashlight.SpotRange = 15.0f; // Дальность света
        playerFlashlight.SpotAngle = 35.0f; // Угол луча
        playerFlashlight.LightEnergy = targetFlashlightEnergy;
        playerFlashlight.ShadowEnabled = true; // Тени для атмосферы
        
        playerCamera.AddChild(playerFlashlight);
        
        CreateDarkAtmosphere();
    }

    private void CreateDarkAtmosphere()
    {
        // Полностью гасим глобальный свет на карте
        DirectionalLight3D globalLight = GetNodeOrNull<DirectionalLight3D>("GlobalLight");
        if (globalLight != null) globalLight.LightEnergy = 0.0f;

        // Включаем густой черный туман, чтобы игрок ничего не видел вдали
        WorldEnvironment env = GetNode<WorldEnvironment>("WorldEnvironment");
        if (env != null)
        {
            env.Environment.FogEnabled = true;
            env.Environment.FogLightColor = new Color(0, 0, 0);
            env.Environment.FogDensity = 0.15f; // Чем выше, тем гуще туман
        }
    }

    // Механика мигания фонарика (когда монстр рядом)
    public async void MakeFlashlightFlicker()
    {
        Random rand = new Random();
        for (int i = 0; i < 5; i++)
        {
            playerFlashlight.LightEnergy = 0.1f; // Почти погас
            await ToSignal(GetTree().CreateTimer((float)rand.NextDouble() * 0.2f), "timeout");
            playerFlashlight.LightEnergy = targetFlashlightEnergy; // Включился
            await ToSignal(GetTree().CreateTimer((float)rand.NextDouble() * 0.2f), "timeout");
        }
    }
}
