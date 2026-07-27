extends Control

var current_fps_limit: int = 60
var player_gender: String = "male"
var coins: int = 250

@onready var settings_menu = $SettingsMenu
@onready var case_shop = $CaseShop

func _ready() -> void:
	settings_menu.hide()
	case_shop.hide()
	_apply_performance_settings()

func open_settings() -> void:
	_hide_all()
	settings_menu.show()

func open_shop() -> void:
	_hide_all()
	case_shop.show()

func _hide_all() -> void:
	settings_menu.hide()
	case_shop.hide()

# Настройки кадров (FPS) для Redmi Note 12
func set_fps_mode(index: int) -> void:
	match index:
		0: current_fps_limit = 60 # Плавный режим
		1: current_fps_limit = 45 # Стабильный сбалансированный режим
		2: current_fps_limit = 30
	_apply_performance_settings()

func _apply_performance_settings() -> void:
	Engine.max_fps = current_fps_limit # Встроенная оптимизация Godot под мобильные чипы

# Смена скина на Женский от Midpoint
func change_character_gender(gender_name: String) -> void:
	player_gender = gender_name
	print("Midpoint: Выбран скин -> ", player_gender)

# Рулетка открытия кейсов в стиле PUBG / Free Fire
func buy_midpoint_case() -> void:
	if coins < 100:
		print("Недостаточно монет для прокрутки кейса!")
		return
		
	coins -= 100
	var drop_chance = randi() % 100
	
	if drop_chance < 15:
		print("🏆 ЭПИК! Выбит редкий женский скин персонажа!")
	elif drop_chance < 45:
		print("📦 РЕДКОЕ! Выбит кастомный темный плащ Midpoint")
	else:
		print("🔋 ОБЫЧНОЕ! Получены запасные батарейки для фонарика")

func launch_game_match() -> void:
	get_tree().change_scene_to_file("res://scenes/World.tscn")
