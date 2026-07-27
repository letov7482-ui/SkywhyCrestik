using Godot;
using System;

public partial class SettingsUIController : Control
{
    private SettingsManager settingsManager;
    
    private Label fpsLabel;
    private Slider fpsSlider;
    private Slider soundSlider;
    private Slider musicSlider;

    public override void _Ready()
    {
        // Безопасный поиск менеджера настроек в дереве сцены Godot
        settingsManager = GetNodeOrNull<SettingsManager>("/root/SettingsManager");

        // Связываем элементы интерфейса экрана смартфона
        fpsLabel = GetNode<Label>("Panel/VBox/FPSLabel");
        fpsSlider = GetNode<Slider>("Panel/VBox/FPSSlider");
        soundSlider = GetNode<Slider>("Panel/VBox/SoundSlider");
        musicSlider = GetNode<Slider>("Panel/VBox/MusicSlider");

        // Подключаем события изменения ползунков на экране Android
        if (fpsSlider != null) fpsSlider.ValueChanged += OnFPSChanged;
    }

    private void OnFPSChanged(double value)
    {
        int fpsTarget = (int)value;
        if (fpsLabel != null) fpsLabel.Text = $"Лимит кадров (FPS): {fpsTarget}";
        
        // Отправляем значение в менеджер для проверки перегрева Redmi
        if (settingsManager != null) settingsManager.SetGameFPS(fpsTarget);
    }

    public void OnLowGraphicsPressed()
    {
        if (settingsManager != null) settingsManager.ChangeGraphicsQuality(0); // Низкая графика
        GD.Print("Игрок выбрал экономичный режим.");
    }

    public void OnUltraGraphicsPressed()
    {
        if (settingsManager != null) settingsManager.ChangeGraphicsQuality(2); // Красивая графика
        GD.Print("Игрок включил ультра-графику.");
    }

    public void OnCloseSettingsPressed()
    {
        Visible = false; // Закрываем окно настроек
    }
}
