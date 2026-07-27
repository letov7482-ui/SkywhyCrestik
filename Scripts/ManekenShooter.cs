using Godot;
using System;

public partial class ManekenShooter : Node3D
{
    [Export] public PackedScene manekenPrefab; 
    private int score = 0;
    private Camera3D playerCamera;

    public override void _Ready()
    {
        playerCamera = GetNode<Camera3D>("Player/Camera3D");
        SpawnNewManeken();
    }

    public override void _Input(InputEvent @event)
    {
        if (@event is InputEventScreenTouch touchEvent && touchEvent.Pressed)
        {
            ShootRay(touchEvent.Position);
        }
    }

    private void ShootRay(Vector2 touchPosition)
    {
        var from = playerCamera.ProjectRayOrigin(touchPosition);
        var to = from + playerCamera.ProjectRayNormal(touchPosition) * 100f;
        
        var spaceState = GetWorld3D().DirectSpaceState;
        var query = PhysicsRayQueryParameters3D.Create(from, to);
        var result = spaceState.IntersectRay(query);

        if (result.Count > 0 && result["collider"].As<Node3D>().IsInGroup("manekens"))
        {
            result["collider"].As<Node3D>().QueueFree();
            score++;
            GetNode<AudioManager>("/root/AudioManager").PlayShot(); // Звук выстрела
            SpawnNewManeken(); 
        }
    }

    private void SpawnNewManeken()
    {
        if (manekenPrefab == null) return;
        
        Node3D newManeken = manekenPrefab.Instantiate<Node3D>();
        float randomX = (float)GD.RandRange(-10, 10);
        float randomZ = (float)GD.RandRange(-5, -20);
        
        newManeken.Position = new Vector3(randomX, 0, randomZ);
        newManeken.AddToGroup("manekens");
        AddChild(newManeken);
    }
}
