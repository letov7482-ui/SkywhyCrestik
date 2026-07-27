using Godot;
using System;

public partial class MainMenuController : Control
{
    public void OnCrestikNolikiPressed()
    {
        // Запуск режима Крестики-Нолики 3D
        GetTree().ChangeSceneToFile("res://Scenes/CrestikNolikiGame.tscn");
    }

    public void OnShooterPressed()
    {
        // Запуск режима Стрелялка по манекенам
        GetTree().ChangeSceneToFile("res://Scenes/ManekenShooterGame.tscn");
    }
}
