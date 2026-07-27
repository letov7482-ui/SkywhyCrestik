using Godot;
using System;

public partial class PlayerController : CharacterBody3D
{
    private float walkSpeed = 3.5f;
    private float runSpeed = 6.0f;
    private float currentSpeed;
    private float gravity = 9.8f;

    private VirtualJoystick joystick;
    private SpotLight3D flashlight;
    private bool isRunning = false;

    public override void _Ready()
    {
        joystick = GetNode<VirtualJoystick>("/root/HorrorMap/UI/VirtualJoystick");
        flashlight = GetNode<SpotLight3D>("Camera3D/SpotLight3D");
        currentSpeed = walkSpeed;
    }

    public override void _PhysicsProcess(double delta)
    {
        Vector3 velocity = Velocity;

        // Применяем гравитацию, чтобы игрок не летал
        if (!IsOnFloor()) velocity.Y -= gravity * (float)delta;

        // Получаем вектор направления движения с нашего виртуального джойстика
        Vector2 moveInput = joystick.GetInputVector();
        Vector3 direction = new Vector3(moveInput.X, 0, moveInput.Y).Normalized();

        if (direction != Vector3.Zero)
        {
            velocity.X = direction.X * currentSpeed;
            velocity.Z = direction.Z * currentSpeed;
        }
        else
        {
            velocity.X = Mathf.MoveToward(Velocity.X, 0, currentSpeed);
            velocity.Z = Mathf.MoveToward(Velocity.Z, 0, currentSpeed);
        }

        Velocity = velocity;
        MoveAndSlide();
    }

    // Метод вызывается при нажатии кнопки "БЕГ" на экране Android
    public void OnRunButtonToggle(bool isPressed)
    {
        isRunning = isPressed;
        currentSpeed = isRunning ? runSpeed : walkSpeed;
        GD.Print(isRunning ? "Игрок побежал! Тратится выносливость." : "Игрок перешел на шаг.");
    }

    // Метод вызывается при нажатии кнопки "ФОНАРИК" на экране Android
    public void OnFlashlightButtonPressed()
    {
        flashlight.Visible = !flashlight.Visible;
        GD.Print(flashlight.Visible ? "Фонарик включен" : "Фонарик выключен в темноте!");
    }
}
