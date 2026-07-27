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
        // Ищем наш менеджер настроек в проекте
        settingsManager = GetNode<SettingsManager>("/root/SettingsManager");

        // Связываем элементы интерфейса
        fpsLabel = GetNode<Label>("Panel/VBox/FPSLabel");
        fpsSlider = GetNode<Slider>("Panel/VBox/FPSSlider");
        soundSlider = GetNode<Slider>("Panel/VBox/SoundSlider");
        musicSlider = GetNode<Slider>("Panel/VBox/MusicSlider");

        // Подключаем события изменения ползунков
        fpsSlider.ValueChanged += OnFPSChanged;
        soundSlider.ValueChanged += (val) => OnVolumeChanged("SFX", (float)val);
        musicSlider.ValueChanged += (val) => OnVolumeChanged("Music", (float)val);
    }

    private void OnFPSChanged(double value)
    {
        int fpsTarget = (int)value;
        fpsLabel.Text = $"Лимит кадров (FPS): {fpsTarget}";
        
        // Отправляем значение в менеджер, который проверит перегрев устройства
        settingsManager.SetGameFPS(fpsTarget);
    }

    private void OnVolumeChanged(string busName, float value)
    {
        settingsManager.SetVolume(busName, value);
    }

    public void OnLowGraphicsPressed()
    {
        settingsManager.ChangeGraphicsQuality(0); // Низкая графика
        GD.Print("Игрок выбрал экономичный режим.");
    }

    public void OnUltraGraphicsPressed()
    {
        settingsManager.ChangeGraphicsQuality(2); // Красивая графика
        GD.Print("Игрок включил ультра-графику.");
    }

    public void OnCloseSettingsPressed()
    {
        // Скрываем меню настроек и возвращаемся в игру
        Visible = false;
    }
}
