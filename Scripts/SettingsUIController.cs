using Godot;
using System;

public partial class SettingsUIController : Control
{
    // Используем базовый тип Node, чтобы компилятор не ругался на отсутствие типа
    private Node settingsManager;
    
    private Label fpsLabel;
    private Slider fpsSlider;
    private Slider soundSlider;
    private Slider musicSlider;

    public override void _Ready()
    {
        // Ищем объект настроек в корневом дереве игры
        settingsManager = GetNodeOrNull("/root/SettingsManager");

        fpsLabel = GetNodeOrNull<Label>("Panel/VBox/FPSLabel");
        fpsSlider = GetNodeOrNull<Slider>("Panel/VBox/FPSSlider");
        soundSlider = GetNodeOrNull<Slider>("Panel/VBox/SoundSlider");
        musicSlider = GetNodeOrNull<Slider>("Panel/VBox/MusicSlider");

        if (fpsSlider != null) fpsSlider.ValueChanged += OnFPSChanged;
    }

    private void OnFPSChanged(double value)
    {
        int fpsTarget = (int)value;
        if (fpsLabel != null) fpsLabel.Text = $"Лимит кадров (FPS): {fpsTarget}";
        
        // Вызываем метод безопасным способом через Call
        if (settingsManager != null) settingsManager.Call("SetGameFPS", fpsTarget);
    }

    public void OnLowGraphicsPressed()
    {
        if (settingsManager != null) settingsManager.Call("ChangeGraphicsQuality", 0);
        GD.Print("Игрок выбрал экономичный режим.");
    }

    public void OnUltraGraphicsPressed()
    {
        if (settingsManager != null) settingsManager.Call("ChangeGraphicsQuality", 2);
        GD.Print("Игрок включил ультра-графику.");
    }

    public void OnCloseSettingsPressed()
    {
        Visible = false; 
    }
}
