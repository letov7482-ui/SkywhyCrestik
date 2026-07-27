using Godot;
using System;

public partial class SettingsManager : Node
{
    private int defaultFPS = 60; 
    private int currentFPS;
    private bool isOverheating = false;

    public override void _Ready()
    {
        currentFPS = defaultFPS;
        Engine.MaxFps = currentFPS; 
    }

    public void SetGameFPS(int fpsValue)
    {
        currentFPS = Mathf.Clamp(fpsValue, 10, 120);
        
        if (isOverheating && currentFPS > 60)
        {
            currentFPS = 60;
        }
        
        Engine.MaxFps = currentFPS;
    }

    public void CheckDevicePerformance()
    {
        float realFPS = (float)Engine.GetFramesPerSecond();
        
        if (realFPS < 25 && currentFPS > 30)
        {
            isOverheating = true;
            SetGameFPS(30); 
            GD.Print("Устройство нагрелось. Переключаем на безопасный режим.");
        }
    }

    public void ChangeGraphicsQuality(int level)
    {
        // Временная заглушка метода для успешной сборки
        GD.Print($"Качество графики изменено на уровень: {level}");
    }

    public void SetVolume(string busName, float value)
    {
        int busIndex = AudioServer.GetBusIndex(busName);
        AudioServer.SetBusVolumeDb(busIndex, Mathf.LinearToDb(value)); 
    }
}
