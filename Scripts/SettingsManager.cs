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
        GetViewport().ScreenSpaceAA = Viewport.ScreenSpaceAAWithSubpixel.Disabled;
    }

    public void CheckDevicePerformance()
    {
        float realFPS = Engine.GetFramesPerSecond();
        
        if (realFPS < 25 && currentFPS > 30)
        {
            isOverheating = true;
            SetGameFPS(30); 
            ForceLowGraphics();
        }
    }

    public void ForceLowGraphics()
    {
        GetViewport().ScreenSpaceAA = Viewport.ScreenSpaceAAWithSubpixel.Disabled;
        GD.Print("Устройство нагрелось. Включены низкие настройки.");
    }

    public void ChangeGraphicsQuality(int level)
    {
        if (isOverheating && level > 1) return; 

        switch(level)
        {
            case 0: GetViewport().ScreenSpaceAA = Viewport.ScreenSpaceAAWithSubpixel.Disabled; break; 
            case 1: GetViewport().ScreenSpaceAA = Viewport.ScreenSpaceAAWithSubpixel.Fxaa; break;     
            case 2: GetViewport().ScreenSpaceAA = Viewport.ScreenSpaceAAWithSubpixel.Max; break;      
        }
    }

    public void SetVolume(string busName, float value)
    {
        int busIndex = AudioServer.GetBusIndex(busName);
        AudioServer.SetBusVolumeDb(busIndex, Mathf.LinearToDb(value)); 
    }
}
