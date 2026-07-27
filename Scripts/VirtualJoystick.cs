using Godot;
using System;

public partial class VirtualJoystick : Control
{
    private Vector2 joystickVector = Vector2.Zero;
    private bool isDragging = false;
    private Vector2 joystickCenter = Vector2.Zero;
    private float maxRadius = 80f; // Радиус хода джойстика на экране смартфона

    private Control joystickBackground;
    private Control joystickKnob; // Сама пипка джойстика

    public override void _Ready()
    {
        joystickBackground = GetNode<Control>("Background");
        joystickKnob = GetNode<Control>("Background/Knob");
        joystickCenter = joystickBackground.GlobalPosition + (joystickBackground.Size / 2);
    }

    public override void _Input(InputEvent @event)
    {
        if (@event is InputEventScreenTouch touchEvent)
        {
            // Если тапнули в зоне джойстика (левая нижняя часть экрана Android)
            if (touchEvent.Pressed && touchEvent.Position.DistanceTo(joystickCenter) < maxRadius * 2)
            {
                isDragging = true;
                UpdateJoystick(touchEvent.Position);
            }
            else if (!touchEvent.Pressed)
            {
                isDragging = false;
                joystickVector = Vector2.Zero;
                joystickKnob.Position = joystickBackground.Size / 2 - (joystickKnob.Size / 2); // Возврат в центр
            }
        }

        if (@event is InputEventScreenDrag dragEvent && isDragging)
        {
            UpdateJoystick(dragEvent.Position);
        }
    }

    private void UpdateJoystick(Vector2 touchPos)
    {
        Vector2 direction = touchPos - joystickCenter;
        if (direction.Length() > maxRadius)
        {
            direction = direction.Normalized() * maxRadius;
        }

        // Двигаем пипку джойстика вслед за пальцем
        joystickKnob.Position = (joystickBackground.Size / 2) + direction - (joystickKnob.Size / 2);
        
        // Переводим в вектор движения от -1 до 1 для персонажа
        joystickVector = direction / maxRadius;
    }

    public Vector2 GetInputVector()
    {
        return joystickVector;
    }
}
