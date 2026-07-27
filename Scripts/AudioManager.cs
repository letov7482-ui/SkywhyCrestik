using Godot;
using System;

public partial class AudioManager : Node
{
    private AudioStreamPlayer backgroundMusic;
    private AudioStreamPlayer screamerSound;
    private AudioStreamPlayer gunShotSound;

    public override void _Ready()
    {
        // Создаем встроенные звуковые плееры, чтобы не искать файлы на диске
        backgroundMusic = new AudioStreamPlayer();
        screamerSound = new AudioStreamPlayer();
        gunShotSound = new AudioStreamPlayer();

        AddChild(backgroundMusic);
        AddChild(screamerSound);
        AddChild(gunShotSound);

        // Включаем фоновую музыку на повтор
        backgroundMusic.Bus = "Music";
        screamerSound.Bus = "SFX";
        gunShotSound.Bus = "SFX";
        
        PlayBackgroundHorrorAmbient();
    }

    public void PlayBackgroundHorrorAmbient()
    {
        // Здесь в реальной игре будет лежать файл .mp3 жуткого эмбиента
        GD.Print("Запущена фоновая музыка хоррора...");
        backgroundMusic.Play();
    }

    public void PlayShot()
    {
        GD.Print("Звук выстрела по манекену!");
        gunShotSound.Play();
    }

    public void TriggerScreamer()
    {
        GD.Print("¡¡¡ СКРИМЕР !!! Монстр орет на весь экран!");
        backgroundMusic.Stop(); // Выключаем музыку, чтобы крик пугал сильнее
        screamerSound.Play();
        
        // Вибрация телефона Redmi Note 12 для полного погружения
        Input.VibrateHandheld(1000); // Вибрировать 1 секунду
    }
}
