using Godot;
using System;
using System.Threading.Tasks;

public partial class IntroController : Control
{
    private Label introLabel;
    private Label loadingLabel;
    private int[] loadSteps = { 1, 2, 50, 75, 99, 100 };

    public override void _Ready()
    {
        introLabel = GetNode<Label>("SkywhyCrestikLabel");
        loadingLabel = GetNode<Label>("LoadingLabel");
        AnimateIntroAndLoad();
    }

    private async void AnimateIntroAndLoad()
    {
        introLabel.Modulate = new Color(1, 1, 1, 0);
        Tween tween = CreateTween();
        tween.TweenProperty(introLabel, "modulate:a", 1.0f, 2.0f); // Плавное появление текста
        
        await ToSignal(tween, "finished");
        await Task.Delay(1000); 

        foreach (int percent in loadSteps)
        {
            loadingLabel.Text = $"Загрузка: {percent}%";
            int delayTime = (percent == 50 || percent == 99) ? 1200 : 400; // Пауза на важных процентах
            await Task.Delay(delayTime);
        }

        GetTree().ChangeSceneToFile("res://Scenes/MainMenu.tscn"); // Переход в меню выбора режимов
    }
}
