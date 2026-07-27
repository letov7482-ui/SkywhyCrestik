using Godot;
using System;

public partial class MonsterAI : CharacterBody3D
{
    private float patrolSpeed = 2.0f;
    private float chaseSpeed = 5.5f;
    private float currentSpeed;

    private Node3D playerNode;
    private PlayerController playerScript;
    private AudioManager audioManager;
    private HorrorMapController mapController;

    private Vector3 targetPoint;
    private bool isChasing = false;
    private float DetectionRadius = 15.0f;

    public override void _Ready()
    {
        playerNode = GetNode<Node3D>("/root/HorrorMap/Player");
        playerScript = playerNode as PlayerController;
        audioManager = GetNode<AudioManager>("/root/AudioManager");
        mapController = GetNode<HorrorMapController>("/root/HorrorMap");

        currentSpeed = patrolSpeed;
        GetNewPatrolPoint();
    }

    public override void _PhysicsProcess(double delta)
    {
        Vector3 velocity = Velocity;

        // Проверяем, слышит ли монстр игрока
        CheckForPlayerNoise();

        Vector3 targetDirection;

        if (isChasing)
        {
            // Фаза погони: бежим строго на координаты игрока
            targetDirection = (playerNode.GlobalPosition - GlobalPosition).Normalized();
            currentSpeed = chaseSpeed;
            
            // Если монстр подошел слишком близко — ловим игрока
            if (GlobalPosition.DistanceTo(playerNode.GlobalPosition) < 1.5f)
            {
                CatchPlayer();
            }
        }
        else
        {
            // Фаза патруля: идем к случайной точке заброшенного коридора
            targetDirection = (targetPoint - GlobalPosition).Normalized();
            currentSpeed = patrolSpeed;

            if (GlobalPosition.DistanceTo(targetPoint) < 1.0f)
            {
                GetNewPatrolPoint();
            }
        }

        velocity.X = targetDirection.X * currentSpeed;
        velocity.Z = targetDirection.Z * currentSpeed;
        Velocity = velocity;

        MoveAndSlide();
    }

    private void CheckForPlayerNoise()
    {
        float distanceToPlayer = GlobalPosition.DistanceTo(playerNode.GlobalPosition);

        // Если игрок слишком далеко, монстр его физически не услышит
        if (distanceToPlayer > DetectionRadius)
        {
            isChasing = false;
            return;
        }

        // Проверяем состояние кнопки БЕГ у игрока
        bool isPlayerRunning = (bool)playerScript.Get("isRunning");

        if (isPlayerRunning && distanceToPlayer <= DetectionRadius)
        {
            if (!isChasing)
            {
                GD.Print("Монстр услышал громкий топот бега! Началась погоня!");
                mapController.MakeFlashlightFlicker(); // Фонарик начинает жутко мигать
            }
            isChasing = true;
        }
        else if (distanceToPlayer < 4.0f)
        {
            // Если игрок подошел вплотную даже шагом, монстр его учует
            isChasing = true;
        }
    }

    private void GetNewPatrolPoint()
    {
        Random rand = new Random();
        float randomX = (float)rand.NextDouble() * 30f - 15f;
        float randomZ = (float)rand.NextDouble() * 30f - 15f;
        targetPoint = new Vector3(randomX, GlobalPosition.Y, randomZ);
    }

    private void CatchPlayer()
    {
        isChasing = false;
        audioManager.TriggerScreamer(); // Запуск крика и вибрации Android
        
        // Перезапускаем сцену хоррора через 2 секунды после смерти
        RestartGameDelay();
    }

    private async void RestartGameDelay()
    {
        SetPhysicsProcess(false); // Замораживаем монстра
        await ToSignal(GetTree().CreateTimer(2.5f), "timeout");
        GetTree().ChangeSceneToFile("res://Scenes/MainMenu.tscn");
    }
}
