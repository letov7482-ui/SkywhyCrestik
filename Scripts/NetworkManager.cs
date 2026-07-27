using Godot;
using System;
using System.Collections.Generic;

// Симуляция сетевого менеджера Photon для мобильного Godot 4 (C#)
public partial class NetworkManager : Node
{
    private string serverAddress = "://photonengine.com"; // Европейский сервер
    private string appVersion = "1.0.0";
    
    private bool isConnected = false;
    private string currentRoomCode = "";
    
    public override void _Ready()
    {
        ConnectToPhotonCloud();
    }

    // 1. Подключение к облаку серверов
    public async void ConnectToPhotonCloud()
    {
        GD.Print("Подключение к Photon Cloud...");
        // Имитируем сетевую задержку подключения (пинга) на Android
        await ToSignal(GetTree().CreateTimer(1.5f), "timeout");
        
        isConnected = true;
        GD.Print("Успешно подключено к серверу skywhy crestik!");
    }

    // 2. Создание новой игровой комнаты
    public string CreateGameRoom()
    {
        if (!isConnected)
        {
            GD.Print("Ошибка: Нет подключения к интернету.");
            return null;
        }

        // Генерируем случайный 4-значный код для приглашения друзей
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        char[] stringChars = new char[4];

        for (int i = 0; i < stringChars.Length; i++)
        {
            stringChars[i] = chars[random.Next(chars.Length)];
        }

        currentRoomCode = new string(stringChars);
        GD.Print($"Комната создана! Передайте другу код: {currentRoomCode}");
        
        return currentRoomCode;
    }

    // 3. Подключение друга по коду комнаты
    public bool JoinRoomByCode(string code)
    {
        if (!isConnected) return false;

        string cleanCode = code.Trim().ToUpper();
        
        if (cleanCode.Length != 4)
        {
            GD.Print("Ошибка: Код должен состоять строго из 4 символов!");
            return false;
        }

        GD.Print($"Подключение к комнате {cleanCode}...");
        // Здесь происходит магия Photon: поиск комнаты в облаке и коннект игроков
        return true;
    }
}
