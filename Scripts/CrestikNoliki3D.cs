using Godot;
using System;

public partial class CrestikNoliki3D : Node3D
{
    private int[] board = new int[9]; 
    private bool isPlayerTurn = true;
    private bool gameEnded = false;

    [Export] public PackedScene crestikModel; 
    [Export] public PackedScene nolikModel;    
    private Camera3D gameCamera;

    public override void _Ready()
    {
        gameCamera = GetNode<Camera3D>("Camera3D");
        ResetBoard();
    }

    public override void _Input(InputEvent @event)
    {
        if (gameEnded || !isPlayerTurn) return;

        if (@event is InputEventScreenTouch touchEvent && touchEvent.Pressed)
        {
            SelectCellByTouch(touchEvent.Position);
        }
    }

    private void SelectCellByTouch(Vector2 touchPosition)
    {
        var from = gameCamera.ProjectRayOrigin(touchPosition);
        var to = from + gameCamera.ProjectRayNormal(touchPosition) * 50f;
        var spaceState = GetWorld3D().DirectSpaceState;
        var query = PhysicsRayQueryParameters3D.Create(from, to);
        var result = spaceState.IntersectRay(query);

        if (result.Count > 0 && result["collider"].As<Node3D>().HasMeta("cell_id"))
        {
            int cellId = (int)result["collider"].As<Node3D>().GetMeta("cell_id");
            
            if (board[cellId] == 0) 
            {
                MakeMove(cellId, 1); 
                if (!CheckWin(1) && !CheckDraw())
                {
                    isPlayerTurn = false;
                    CPUMoveDelay(); 
                }
            }
        }
    }

    private async void CPUMoveDelay()
    {
        await ToSignal(GetTree().CreateTimer(0.8f), "timeout"); 
        
        System.Collections.Generic.List<int> freeCells = new System.Collections.Generic.List<int>();
        for (int i = 0; i < 9; i++) if (board[i] == 0) freeCells.Add(i);

        if (freeCells.Count > 0)
        {
            Random random = new Random();
            int randomCell = freeCells[random.Next(freeCells.Count)];
            MakeMove(randomCell, 2); 
            
            if (CheckWin(2))
            {
                TriggerMonsterScreamer(); 
            }
            else
            {
                isPlayerTurn = true;
            }
        }
    }

    private void MakeMove(int cellId, int playerType)
    {
        board[cellId] = playerType;
        
        float xPos = (cellId % 3) * 2.0f - 2.0f;
        float zPos = (cellId / 3) * 2.0f - 2.0f;
        Vector3 spawnPos = new Vector3(xPos, 0.5f, zPos);

        Node3D instance;
        if (playerType == 1)
        {
            var box = new CsgBox3D();
            box.Size = new Vector3(0.8f, 0.8f, 0.8f);
            var mat = new StandardMaterial3D();
            mat.AlbedoColor = new Color(0, 1, 0); 
            box.MaterialOverride = mat;
            instance = box;
        }
        else
        {
            var sphere = new CsgSphere3D();
            sphere.Radius = 0.5f;
            var mat = new StandardMaterial3D();
            mat.AlbedoColor = new Color(1, 0, 0); 
            sphere.MaterialOverride = mat;
            instance = sphere;
        }

        instance.Position = spawnPos;
        AddChild(instance);
    }

    private bool CheckWin(int p)
    {
        bool win = (board[0] == p && board[1] == p && board[2] == p) ||
                   (board[3] == p && board[4] == p && board[5] == p) ||
                   (board[6] == p && board[7] == p && board[8] == p) ||
                   (board[0] == p && board[3] == p && board[6] == p) ||
                   (board[1] == p && board[4] == p && board[7] == p) ||
                   (board[2] == p && board[5] == p && board[8] == p) ||
                   (board[0] == p && board[4] == p && board[8] == p) ||
                   (board[2] == p && board[4] == p && board[6] == p);
        if (win) gameEnded = true;
        return win;
    }

    private bool CheckDraw()
    {
        foreach (int cell in board) if (cell == 0) return false;
        gameEnded = true;
        return true;
    }

    private void TriggerMonsterScreamer()
    {
        GetNode<AudioManager>("/root/AudioManager").TriggerScreamer();
    }

    private void ResetBoard()
    {
        for (int i = 0; i < 9; i++) board[i] = 0;
        gameEnded = false;
        isPlayerTurn = true;
    }
}
