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
        ApplyBaseMobileOptimization();
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

    private void ApplyBaseMobileOptimization()
    {
        // ФИКС: Правильный синтаксис отключения сглаживания для Godot 4
        GetViewport().ScreenSpaceAA = Viewport.ScreenSpaceAntiAliasing.Disabled;
    }

    public void CheckDevicePerformance()
    {
        // ФИКС: Принудительно конвертируем double в float через (float)
        float realFPS = (float)Engine.GetFramesPerSecond();
        
        if (realFPS < 25 && currentFPS > 30)
        {
            isOverheating = true;
            SetGameFPS(30); 
            ForceLowGraphics();
        }
    }

    public void ForceLowGraphics()
    {
        GetViewport().ScreenSpaceAA = Viewport.ScreenSpaceAntiAliasing.Disabled;
        GD.Print("Устройство нагрелось. Включены низкие настройки.");
    }

    public void ChangeGraphicsQuality(int level)
    {
        if (isOverheating && level > 1) return; 

        // ФИКС: Настройка мобильного сглаживания без ПК-эффектов под Godot 4
        switch(level)
        {
            case 0: GetViewport().ScreenSpaceAA = Viewport.ScreenSpaceAntiAliasing.Disabled; break; 
            case 1: GetViewport().ScreenSpaceAA = Viewport.ScreenSpaceAntiAliasing.Fxaa; break;     
            case 2: GetViewport().ScreenSpaceAA = Viewport.ScreenSpaceAntiAliasing.Fxaa; break; // Для мобилок FXAA - потолок безопасности     
        }
    }

    public void SetVolume(string busName, float value)
    {
        int busIndex = AudioServer.GetBusIndex(busName);
        AudioServer.SetBusVolumeDb(busIndex, Mathf.LinearToDb(value)); 
    }
}
